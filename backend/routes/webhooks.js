import express from "express";
import crypto from "crypto";
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";
import { getTransporter, guestBookingEmail, ownerBookingEmail } from "../utils/emailTemplates.js";

const router = express.Router();

// NOTE: We use express.raw() or a custom reader because Razorpay needs the raw body for signature verification
router.post("/razorpay", async (req, res, next) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) {
            console.error("WEBHOOK ERROR: RAZORPAY_WEBHOOK_SECRET not set");
            return res.status(500).json({ ok: false, message: "Webhook secret missing" });
        }

        const signature = req.headers["x-razorpay-signature"];
        const shasum = crypto.createHmac("sha256", secret);
        shasum.update(req.body); // req.body is already binary/string due to express.raw()
        const digest = shasum.digest("hex");

        if (digest !== signature) {
            return res.status(400).json({ ok: false, message: "Invalid signature" });
        }

        const payload = JSON.parse(req.body.toString());
        const event = payload.event;
        const eventId = payload.payload?.payment?.entity?.id || payload.event + "-" + Date.now();
        console.log(`[Webhook] Received Razorpay Event: ${event} | id: ${eventId}`);

        // ─── IDEMPOTENCY GUARD ───
        // Prevent duplicate processing if Razorpay retries the same webhook.
        // The `webhooks` collection has a unique index on `eventId` (set up in db.js).
        const db = getDB();
        try {
            await db.collection("webhooks").insertOne({ eventId, event, receivedAt: new Date() });
        } catch (dupErr) {
            if (dupErr.code === 11000) {
                console.log(`[Webhook] Duplicate event ${eventId} — already processed. Acking.`);
                return res.json({ status: "ok", duplicate: true });
            }
            throw dupErr;
        }

        if (event === "order.paid") {
            const { order_id, payment_id } = payload.payload.payment.entity;
            const bookings = db.collection("bookings");

            // Find the pending booking associated with this order
            // We'll need to store the order_id in the booking when it's created,
            // or search by receipt if available.
            // For now, let's look for a booking that was confirmed with this order_id.
            const booking = await bookings.findOne({ 
                status: "pending", 
                // We'll update the create-order route to store orderId in the booking object
                razorpayOrderId: order_id 
            });

            if (booking) {
                console.log(`[Webhook] Confirming booking ${booking._id} via webhook`);

                // ─── FINANCIAL SNAPSHOT (mirrors /confirm route — must stay in sync) ───
                const config = await db.collection("settings").findOne({ type: "financials" }) || { commissionRate: 0.10, serviceFee: 99, tcsRate: 0.01 };
                let commissionAmount;
                if (booking.platformCommissionAmount !== undefined) {
                    commissionAmount = booking.platformCommissionAmount;
                } else {
                    console.warn(`[FINANCIAL INTEGRITY] Webhook: Booking ${booking._id} missing frozen commission snapshot. Falling back to live calculation.`);
                    commissionAmount = (config.serviceFee || 99) + Math.round((booking.baseAmount || 0) * (config.commissionRate || 0.10));
                }
                // Platform absorbs the guest discount — partner earns pre-discount amount minus commission
                commissionAmount = commissionAmount - (booking.discountAmount || 0);
                
                // ─── TCS CALCULATION (1%) ───
                const tcsRate = config.tcsRate !== undefined ? config.tcsRate : 0.01;
                const tcsAmount = Math.round((booking.baseAmount || 0) * tcsRate);
                
                const netEarnings = (booking.totalPrice || 0) - commissionAmount - tcsAmount;
                // ─────────────────────────────────────────────────────────────────────

                const passcode = Math.floor(100000 + Math.random() * 900000).toString();
                const updateResult = await bookings.updateOne(
                    { _id: booking._id, status: "pending" },
                    {
                        $set: {
                            status: "paid",
                            paymentId: payment_id,
                            paidAt: new Date(),
                            checkInPasscode: passcode,
                            commissionAmount,
                            netEarnings,
                            tcsAmount, // Store TCS amount
                            payoutStatus: "pending"
                        }
                    }
                );

                if (updateResult.modifiedCount === 1) {
                    // Send Emails
                    const transporter = await getTransporter();
                    if (transporter) {
                        const emailData = {
                            guestEmail: booking.guestEmail,
                            ownerEmail: booking.ownerEmail,
                            bookingId: booking._id,
                            title: booking.title,
                            checkIn: booking.checkIn,
                            checkOut: booking.checkOut,
                            nights: booking.nights || 1,
                            totalPrice: booking.totalPrice || 0,
                            ownerPayout: netEarnings,
                            passcode
                        };
                        transporter.sendMail(guestBookingEmail(emailData)).catch(e => console.error("Webhook Guest Email Error:", e));
                        if (booking.ownerEmail) {
                            transporter.sendMail(ownerBookingEmail(emailData)).catch(e => console.error("Webhook Owner Email Error:", e));
                        }
                    }
                }
            }
        }

        res.json({ status: "ok" });
    } catch (err) {
        console.error("Webhook Processing Error:", err);
        res.status(500).json({ ok: false });
    }
});

export default router;
