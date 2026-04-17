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
        console.log(`[Webhook] Received Razorpay Event: ${event}`);

        if (event === "order.paid") {
            const { order_id, payment_id } = payload.payload.payment.entity;
            const db = getDB();
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
                
                // Logic identical to manual confirm
                const passcode = Math.floor(100000 + Math.random() * 900000).toString();
                await bookings.updateOne(
                    { _id: booking._id },
                    { 
                        $set: { 
                            status: "paid", 
                            paymentId: payment_id,
                            passcode,
                            paidAt: new Date() 
                        } 
                    }
                );

                // Send Emails
                const transporter = await getTransporter();
                if (transporter) {
                    transporter.sendMail(guestBookingEmail({
                        guestEmail: booking.guestEmail,
                        bookingId: booking._id,
                        title: booking.title,
                        checkIn: booking.checkIn,
                        checkOut: booking.checkOut,
                        passcode
                    })).catch(e => console.error("Webhook Guest Email Error:", e));

                    if (booking.ownerEmail) {
                        transporter.sendMail(ownerBookingEmail({
                            ownerEmail: booking.ownerEmail,
                            bookingId: booking._id,
                            title: booking.title,
                            guestEmail: booking.guestEmail
                        })).catch(e => console.error("Webhook Owner Email Error:", e));
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
