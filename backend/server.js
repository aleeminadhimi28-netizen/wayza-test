import express from "express";

import bcrypt from "bcrypt";
import { MongoClient, ObjectId } from "mongodb";
import multer from "multer";
import path from "path";
import rateLimit from "express-rate-limit";
import { requireAuth } from "./middleware/auth.js";
import nodemailer from "nodemailer";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();

/* ---------------- ENV VALIDATION ---------------- */

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
if (!process.env.MONGO_URL) throw new Error("MONGO_URL is not configured");
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)
  throw new Error("Email credentials are not configured");

const SECRET = process.env.JWT_SECRET;
const MONGO_URL = process.env.MONGO_URL;

/* ---------------- MIDDLEWARE ---------------- */

app.use(helmet());

app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});

app.use(limiter);
app.use("/uploads", express.static("uploads"));

/* ---------------- NODEMAILER ---------------- */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ---------------- FILE UPLOAD ---------------- */

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/* ---------------- DB ---------------- */

const client = new MongoClient(MONGO_URL);
await client.connect();

console.log("Mongo connected");

const db = client.db();

const users = db.collection("users");
const listings = db.collection("listings");
const bookings = db.collection("bookings");
const partners = db.collection("partners");
const blockedDates = db.collection("blockedDates");
const reviews = db.collection("reviews");
const wishlists = db.collection("wishlists");
const owners = db.collection("owners");
const notifications = db.collection("notifications");

/* ---------------- INDEXES ---------------- */

await bookings.createIndex({ ownerEmail: 1 });
await bookings.createIndex({ status: 1 });
await bookings.createIndex({ listingId: 1 });
await bookings.createIndex({ checkIn: 1 });
await listings.createIndex({ ownerEmail: 1 });

/* ---------------- HEALTH ---------------- */

app.get("/", (_, res) => {
  res.json({ ok: true, status: "running" });
});

/* ---------------- AUTH ---------------- */

app.post("/signup", async (req, res, next) => {
  try {

    const { email, password, role } = req.body;

    if (!email || !password)
      return res.status(400).json({ ok: false });

    const exists = await users.findOne({ email });

    if (exists)
      return res.status(400).json({ ok: false });

    const hash = await bcrypt.hash(password, 10);

    await users.insertOne({
      email,
      password: hash,
      role: role || "guest",
      createdAt: new Date()
    });

    res.json({ ok: true });

  } catch (err) {
    next(err);
  }
});

app.post("/login", async (req, res, next) => {
  try {

    const { email, password } = req.body;

    const user = await users.findOne({ email });

    if (!user)
      return res.status(401).json({ ok: false });

    const ok = await bcrypt.compare(password, user.password);

    if (!ok)
      return res.status(401).json({ ok: false });

    const token = jwt.sign(
      { email: user.email, role: user.role },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      ok: true,
      data: { token, email: user.email, role: user.role }
    });

  } catch (err) {
    next(err);
  }
});

/* ---------------- LISTINGS ---------------- */

app.get("/listings", async (req, res, next) => {
  try {

    const rows = await listings.find().toArray();

    res.json({
      ok: true,
      rows
    });

  } catch (err) {
    next(err);
  }
});

app.get("/listings/:id", async (req, res, next) => {
  try {

    if (!ObjectId.isValid(req.params.id))
      return res.status(400).json({ ok: false });

    const listing = await listings.findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!listing)
      return res.status(404).json({ ok: false });

    res.json({
      ok: true,
      data: listing
    });

  } catch (err) {
    next(err);
  }
});

/* ---------------- ADD VARIANT ---------------- */

app.post("/listings/:id/variant", requireAuth, async (req, res, next) => {
  try {

    const { name, price, qty } = req.body;

    if (!name || !price || !qty)
      return res.status(400).json({ ok: false });

    if (!ObjectId.isValid(req.params.id))
      return res.status(400).json({ ok: false });

    await listings.updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $push: {
          variants: {
            name,
            price: Number(price),
            qty: Number(qty),
            available: true,
            createdAt: new Date()
          }
        }
      }
    );

    res.json({ ok: true });

  } catch (err) {
    next(err);
  }
});

/* ---------------- DELETE VARIANT ---------------- */

app.delete("/listing/:id/variant/:index", requireAuth, async (req, res, next) => {
  try {

    const { id, index } = req.params;

    await listings.updateOne(
      { _id: new ObjectId(id) },
      { $unset: { [`variants.${index}`]: 1 } }
    );

    await listings.updateOne(
      { _id: new ObjectId(id) },
      { $pull: { variants: null } }
    );

    res.json({ ok: true });

  } catch (err) {
    next(err);
  }
});

/* ---------------- UPDATE VARIANT ---------------- */

app.put("/listing/:id/variant/:index", requireAuth, async (req, res, next) => {
  try {

    const { id, index } = req.params;

    const updates = {};

    if (req.body.price !== undefined)
      updates[`variants.${index}.price`] = req.body.price;

    if (req.body.available !== undefined)
      updates[`variants.${index}.available`] = req.body.available;

    await listings.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    res.json({ ok: true });

  } catch (err) {
    next(err);
  }
});

/* ---------------- BOOKING AVAILABILITY ---------------- */

app.get("/bookings/:listingId", async (req, res, next) => {
  try {

    const rows = await bookings.find({
      listingId: req.params.listingId,
      status: { $in: ["pending", "paid"] }
    }).toArray();

    res.json(rows);

  } catch (err) {
    next(err);
  }
});

/* ---------------- CREATE BOOKING ---------------- */

app.post("/book", requireAuth, async (req, res) => {

  try {

    const {
      listingId,
      variantIndex,
      checkIn,
      checkOut,
      title,
      ownerEmail
    } = req.body;

    if (!listingId || !checkIn || !checkOut) {
      return res.status(400).json({
        ok: false,
        message: "Missing booking data"
      });
    }

    const listing = await listings.findOne({
      _id: new ObjectId(listingId)
    });

    if (!listing) {
      return res.status(404).json({
        ok: false,
        message: "Listing not found"
      });
    }

    const variant = listing.variants?.[variantIndex || 0];

    const nights = Math.ceil(
      (new Date(checkOut) - new Date(checkIn)) / 86400000
    );

    const pricePerNight = Number(variant?.price || 0);

    const baseAmount = pricePerNight * nights;
    const gst = Math.round(baseAmount * 0.12);
    const serviceFee = 99;

    const totalPrice = baseAmount + gst + serviceFee;

    const booking = await bookings.insertOne({
      listingId,
      variantIndex: variantIndex || 0,
      variantName: variant?.name,
      title,
      ownerEmail,
      guestEmail: req.user.email,
      checkIn,
      checkOut,
      nights,
      pricePerNight,
      totalPrice,
      status: "pending",
      createdAt: new Date()
    });

    res.json({
      ok: true,
      bookingId: booking.insertedId
    });

  } catch (err) {

    console.error("BOOK ERROR:", err);

    res.status(500).json({
      ok: false,
      message: "Booking failed"
    });

  }

});

/* ---------------- CONFIRM BOOKING ---------------- */

app.post("/confirm-booking", requireAuth, async (req, res, next) => {
  try {

    const { bookingId, paymentId } = req.body;

    await bookings.updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          status: "paid",
          paymentId
        }
      }
    );

    res.json({ ok: true });

  } catch (err) {
    next(err);
  }
});

/* ---------------- MY BOOKINGS ---------------- */

app.get("/my-bookings", requireAuth, async (req, res, next) => {
  try {

    const rows = await bookings.find({
      guestEmail: req.user.email,
      status: "paid"
    }).sort({ createdAt: -1 }).toArray();

    res.json({
      ok: true,
      data: rows
    });

  } catch (err) {
    next(err);
  }
});


/* ---------------- WISHLIST ---------------- */

app.get("/wishlist", requireAuth, async (req, res, next) => {
  try {

    const rows = await wishlists.find({
      email: req.user.email
    }).toArray();

    res.json({
      ok: true,
      data: rows
    });

  } catch (err) {
    next(err);
  }
});


/* ---------------- REVIEWS ---------------- */

app.get("/reviews/:listingId", async (req, res, next) => {
  try {

    const rows = await reviews.find({
      listingId: req.params.listingId
    }).toArray();

    res.json({
      ok: true,
      data: rows
    });

  } catch (err) {
    next(err);
  }
});
/* ---------------- TOGGLE WISHLIST ---------------- */

app.post("/wishlist/toggle", requireAuth, async (req, res, next) => {
  try {

    const { listingId, title } = req.body;
    const email = req.user.email;

    const existing = await wishlists.findOne({ email, listingId });

    if (existing) {

      await wishlists.deleteOne({ _id: existing._id });

      return res.json({
        ok: true,
        saved: false
      });

    } else {

      await wishlists.insertOne({
        email,
        listingId,
        title,
        createdAt: new Date()
      });

      return res.json({
        ok: true,
        saved: true
      });

    }

  } catch (err) {
    next(err);
  }
});
/* ---------------- GLOBAL ERROR HANDLER ---------------- */

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    ok: false,
    message: "Internal Server Error"
  });
});

/* ---------------- START SERVER ---------------- */

app.listen(5000, () => {
  console.log("Wayza backend running on http://localhost:5000");
});