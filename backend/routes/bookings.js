import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { getTransporter, guestBookingEmail, ownerBookingEmail } from "../utils/emailTemplates.js";
import { sendWhatsAppAlert, formatWhatsAppBookingMsg } from "../utils/whatsapp.js";
import { z } from "zod";
// Removed static constants import here. Values are fetched dynamically now.

const bookSchema = z.object({
    listingId: z.string().min(1),
    variantIndex: z.number().int().min(0).optional(),
    checkIn: z.string().min(1),
    checkOut: z.string().min(1),
    title: z.string().optional(),
    ownerEmail: z.string().email().optional(),
    couponCode: z.string().optional()
});

const confirmSchema = z.object({
    bookingId: z.string().min(1),
    paymentId: z.string().optional()
});

const cancelSchema = z.object({
    bookingId: z.string().min(1)
});

const router = express.Router();

router.get("/my-bookings", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const bookings = db.collection("bookings");
        const rows = await bookings.find({ guestEmail: req.user.email }).sort({ createdAt: -1 }).toArray();
        res.json({ ok: true, data: rows });
    } catch (err) { next(err); }
});

router.get("/:listingId", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const bookings = db.collection("bookings");
        const rows = await bookings.find({
            listingId: req.params.listingId,
            status: { $in: ["pending", "paid"] }
        }).project({ guestEmail: 0 }).toArray();
        res.json(rows);
    } catch (err) { next(err); }
});

router.post("/book", requireAuth, async (req, res, next) => {
    try {
        const parsed = bookSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Invalid booking data", errors: parsed.error.flatten() });

        const db = getDB();
        const listings = db.collection("listings");
        const bookings = db.collection("bookings");
        const { listingId, variantIndex, checkIn, checkOut, title, ownerEmail, couponCode } = parsed.data;

        const listing = await listings.findOne({ _id: new ObjectId(listingId) });
        if (!listing) return res.status(404).json({ ok: false, message: "Listing not found" });
        if (!listing.approved) return res.status(403).json({ ok: false, message: "This property is pending approval and cannot be booked yet." });

        const variant = listing.variants?.[variantIndex || 0];
        const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000);
        const pricePerNight = Number(variant?.price || listing.price || 0);
        const baseAmount = pricePerNight * nights;
        const isVehicle = listing.category === "bike" || listing.category === "car";
        
        const config = await db.collection("settings").findOne({ type: "financials" }) || { gstRate: 0.12, serviceFee: 99, commissionRate: 0.10 };
        
        let discountAmount = 0;
        let appliedCouponCode = null;
        if (couponCode) {
            const coupon = await db.collection("coupons").findOne({ code: couponCode.toUpperCase(), isActive: true });
            if (coupon) {
                discountAmount = Math.round(baseAmount * coupon.discountPercentage);
                appliedCouponCode = coupon.code;
            } else {
                return res.status(400).json({ ok: false, message: "Invalid or inactive coupon code" });
            }
        }

        const discountedBaseAmount = baseAmount - discountAmount;
        const gst = isVehicle ? 0 : Math.round(discountedBaseAmount * config.gstRate);
        const serviceFee = config.serviceFee;
        const totalPrice = discountedBaseAmount + gst + serviceFee;

        // Old total price for commission calculation
        const unadjustedGst = isVehicle ? 0 : Math.round(baseAmount * config.gstRate);
        const unadjustedTotalPrice = baseAmount + unadjustedGst + serviceFee;
        
        // Freeze platform commission amount
        // Using unadjusted base amount or unadjusted total price depending on the old logic.
        // The old code in /confirm used: Math.round(totalPrice * config.commissionRate)
        const platformCommissionAmount = Math.round(unadjustedTotalPrice * config.commissionRate);

        // RACE CONDITION FIX: Check for overlapping bookings
        const conflictingBooking = await bookings.findOne({
            listingId,
            variantIndex: variantIndex || 0,
            status: { $in: ["pending", "paid"] },
            checkIn: { $lt: checkOut },
            checkOut: { $gt: checkIn }
        });

        if (conflictingBooking) {
            return res.status(409).json({ ok: false, message: "These dates are already booked. Please select different dates." });
        }

        const booking = await bookings.insertOne({
            listingId,
            variantIndex: variantIndex || 0,
            variantName: variant?.name,
            title,
            category: listing.category || "hotel",
            ownerEmail: ownerEmail || listing.ownerEmail,
            guestEmail: req.user.email,
            checkIn, checkOut, nights, pricePerNight,
            baseAmount, discountAmount, couponCode: appliedCouponCode,
            gst, serviceFee,
            totalPrice, 
            platformCommissionAmount, // Fixed commission
            status: "pending",
            createdAt: new Date()
        });

        res.json({ ok: true, bookingId: booking.insertedId });
    } catch (err) { next(err); }
});

router.post("/confirm", requireAuth, async (req, res, next) => {
    try {
        const parsed = confirmSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Invalid confirmation data", errors: parsed.error.flatten() });

        const db = getDB();
        const bookings = db.collection("bookings");
        const transporter = getTransporter();

        const { bookingId, paymentId } = parsed.data;
        if (!ObjectId.isValid(bookingId))
            return res.status(400).json({ ok: false, message: "Invalid booking ID" });

        const booking = await bookings.findOne({ _id: new ObjectId(bookingId) });
        if (!booking) return res.status(404).json({ ok: false, message: "Booking not found" });

        const totalPrice = booking.totalPrice || 0;
        const config = await db.collection("settings").findOne({ type: "financials" }) || { commissionRate: 0.10 };
        
        // Use the frozen platformCommissionAmount if available, to protect Wayza's revenue despite discounts.
        const commissionAmount = booking.platformCommissionAmount !== undefined 
            ? booking.platformCommissionAmount 
            : Math.round(totalPrice * config.commissionRate);
            
        // Because of discount, netEarnings can be smaller. The discount is fully absorbed by the partner.
        // Wait, discount on booking reduces totalPrice.
        // Therefore netEarnings = totalPrice - commissionAmount; 
        // This implicitly means the partner takes the full hit because totalPrice is smaller by discountAmount, 
        // but commissionAmount didn't decrease.
        const netEarnings = totalPrice - commissionAmount;

        const passcode = Math.floor(100000 + Math.random() * 900000).toString();

        await bookings.updateOne(
            { _id: new ObjectId(bookingId) },
            {
                $set: {
                    status: "paid",
                    paymentId,
                    paidAt: new Date(),
                    commissionAmount,
                    netEarnings,
                    payoutStatus: "pending",
                    checkInPasscode: passcode
                }
            }
        );

        if (booking && transporter) {
            const ownerPayout = netEarnings; // Payout accurately reflects absorption of discount
            const emailData = {
                guestEmail: booking.guestEmail,
                ownerEmail: booking.ownerEmail,
                title: booking.title || "Your booking",
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                nights: booking.nights || 1,
                totalPrice: booking.totalPrice || 0,
                ownerPayout,
                bookingId: bookingId.toString()
            };

            Promise.all([
                transporter.sendMail(guestBookingEmail(emailData)).catch(e => console.error("Guest email error:", e)),
                booking.ownerEmail
                    ? transporter.sendMail(ownerBookingEmail(emailData)).catch(e => console.error("Owner email error:", e))
                    : Promise.resolve()
            ]);

            // WhatsApp Alert for Owner
            (async () => {
                try {
                    const owner = await db.collection("users").findOne({ email: booking.ownerEmail });
                    if (owner?.phone) {
                        const message = formatWhatsAppBookingMsg(emailData);
                        await sendWhatsAppAlert(owner.phone, message, [
                            { title: "View Booking" }
                        ]);
                    }
                } catch (e) { console.error("WhatsApp error:", e); }
            })();
        }

        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.post("/cancel", requireAuth, async (req, res, next) => {
    try {
        const parsed = cancelSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Invalid cancellation data", errors: parsed.error.flatten() });

        const db = getDB();
        const bookings = db.collection("bookings");
        const { bookingId } = parsed.data;
        if (!ObjectId.isValid(bookingId))
            return res.status(400).json({ ok: false, message: "Invalid booking ID" });

        const booking = await bookings.findOne({ _id: new ObjectId(bookingId) });
        if (!booking) return res.status(404).json({ ok: false, message: "Booking not found" });

        const allowed = booking.guestEmail === req.user.email || booking.ownerEmail === req.user.email;
        if (!allowed) return res.status(403).json({ ok: false, message: "Not authorized to cancel this booking" });

        if (new Date(booking.checkIn) <= new Date())
            return res.status(400).json({ ok: false, message: "Cannot cancel past bookings" });

        const updates = { status: "cancelled", cancelledAt: new Date() };
        if (booking.status === "paid") {
            updates.refundStatus = "pending";
            updates.payoutStatus = null;
        }

        await bookings.updateOne(
            { _id: new ObjectId(bookingId) },
            { $set: updates }
        );

        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.patch("/:id/check-in", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const bookings = db.collection("bookings");
        const { id } = req.params;
        const { passcode } = req.body;

        if (!ObjectId.isValid(id)) return res.status(400).json({ ok: false, message: "Invalid ID" });

        const booking = await bookings.findOne({ _id: new ObjectId(id) });
        if (!booking) return res.status(404).json({ ok: false, message: "Booking not found" });

        // Security: Only owner can check in
        if (booking.ownerEmail !== req.user.email && req.user.role !== "admin") {
            return res.status(403).json({ ok: false, message: "Not authorized" });
        }

        if (booking.status !== "paid") {
            return res.status(400).json({ ok: false, message: `Cannot check in from status: ${booking.status}` });
        }

        // Optional passcode verification
        if (passcode && booking.checkInPasscode !== passcode) {
            return res.status(400).json({ ok: false, message: "Invalid verification passcode" });
        }

        await bookings.updateOne({ _id: new ObjectId(id) }, { $set: { status: "arrived", checkedInAt: new Date() } });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.patch("/:id/check-out", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const bookings = db.collection("bookings");
        const { id } = req.params;

        if (!ObjectId.isValid(id)) return res.status(400).json({ ok: false, message: "Invalid ID" });

        const booking = await bookings.findOne({ _id: new ObjectId(id) });
        if (!booking) return res.status(404).json({ ok: false, message: "Booking not found" });

        if (booking.ownerEmail !== req.user.email && req.user.role !== "admin") {
            return res.status(403).json({ ok: false, message: "Not authorized" });
        }

        if (booking.status !== "arrived") {
            return res.status(400).json({ ok: false, message: "Guest has not checked in yet" });
        }

        await bookings.updateOne({ _id: new ObjectId(id) }, { $set: { status: "departed", checkedOutAt: new Date() } });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

export default router;
