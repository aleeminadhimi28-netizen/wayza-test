import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { MongoClient, ObjectId } from "mongodb";
import multer from "multer";
import path from "path";
import rateLimit from "express-rate-limit";
import { requireAuth } from "./middleware/auth.js";
import nodemailer from "nodemailer";

const app = express();

/* ---------------- MIDDLEWARE ---------------- */

app.use(cors({ origin: "*" }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);
app.use("/uploads", express.static("uploads"));

/* ---------------- ENV CHECK ---------------- */

if (!process.env.JWT_SECRET) {
  console.warn("⚠ Using fallback JWT secret (development only)");
}

const SECRET = process.env.JWT_SECRET || "wayza-dev-secret";

/* ---------------- NODEMAILER ---------------- */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "yourgmail@gmail.com",
    pass: process.env.EMAIL_PASS || "your_app_password"
  }
});

/* ---------------- UPLOAD CONFIG ---------------- */

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/* ---------------- DB CONNECTION ---------------- */

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wayza";
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

/* ---------------- INDEXES ---------------- */

await bookings.createIndex({ ownerEmail: 1 });
await bookings.createIndex({ status: 1 });
await bookings.createIndex({ listingId: 1 });
await bookings.createIndex({ checkIn: 1 });
await listings.createIndex({ ownerEmail: 1 });

/* ---------------- HEALTH ---------------- */

app.get("/", (_, res) =>
  res.json({ ok: true, data: { status: "running" } })
);

/* ---------------- AUTH ROUTES ---------------- */

app.post("/signup", async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password)
      return res.status(400).json({ ok: false, message: "Missing fields" });

    const exists = await users.findOne({ email });
    if (exists)
      return res.status(400).json({ ok: false, message: "User exists" });

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
      return res.status(401).json({ ok: false, message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(401).json({ ok: false, message: "Invalid credentials" });

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

/* ---------------- PARTNER ANALYTICS ---------------- */

app.get("/partner/monthly-revenue", requireAuth, async (req, res, next) => {
  try {
    const partnerEmail = req.user.email;

    const revenueData = await bookings.aggregate([
      {
        $match: {
          ownerEmail: partnerEmail,
          status: "paid"
        }
      },
      {
        $group: {
          _id: { $month: "$checkIn" },
          revenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    const months = [
      "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const formatted = revenueData.map(item => ({
      month: months[item._id],
      revenue: item.revenue
    }));

    res.json({ ok: true, data: formatted });

  } catch (err) {
    next(err);
  }
});

app.get("/partner/dashboard-summary", requireAuth, async (req, res, next) => {
  try {
    const partnerEmail = req.user.email;

    const ownerBookings = await bookings.find({
      ownerEmail: partnerEmail
    }).sort({ createdAt: -1 }).toArray();

    const paid = ownerBookings.filter(b => b.status === "paid");

    const totalRevenue = paid.reduce(
      (sum, b) => sum + (b.totalPrice || 0),
      0
    );

    const monthlyRevenue = await bookings.aggregate([
      {
        $match: {
          ownerEmail: partnerEmail,
          status: "paid"
        }
      },
      {
        $group: {
          _id: { $month: "$checkIn" },
          revenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    res.json({
      ok: true,
      data: {
        kpis: {
          totalRevenue,
          totalBookings: ownerBookings.length,
          pending: ownerBookings.filter(b => b.status === "pending").length,
          cancelled: ownerBookings.filter(b => b.status === "cancelled").length
        },
        monthlyRevenue,
        recentBookings: ownerBookings.slice(0, 5)
      }
    });

  } catch (err) {
    next(err);
  }
});

/* ---------------- GLOBAL ERROR HANDLER ---------------- */

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({
    ok: false,
    message: err.message || "Internal Server Error"
  });
});

/* ---------------- START SERVER ---------------- */

app.listen(5000, () =>
  console.log("Wayza backend running on http://localhost:5000")
);