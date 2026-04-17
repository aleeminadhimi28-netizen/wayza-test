import express from "express";
import Razorpay from "razorpay";
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/create-order", requireAuth, async (req, res, next) => {
    try {
        const { bookingId } = req.body;
        if (!bookingId || !ObjectId.isValid(bookingId)) {
            return res.status(400).json({ ok: false, message: "Invalid booking ID" });
        }

        const db = getDB();
        const booking = await db.collection("bookings").findOne({ _id: new ObjectId(bookingId) });

        if (!booking) {
            return res.status(404).json({ ok: false, message: "Booking not found" });
        }

        if (booking.status !== "pending") {
            return res.status(400).json({ ok: false, message: "Booking is already processed or cancelled" });
        }

        const options = {
            amount: Math.round(booking.totalPrice * 100), // Razorpay amount is in paise (₹1 = 100 paise)
            currency: "INR",
            receipt: `rcpt_${bookingId.slice(-8)}`,
        };

        const order = await razorpay.orders.create(options);

        res.json({
            ok: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (err) {
        console.error("Razorpay Order Error:", err);
        next(err);
    }
});

export default router;
