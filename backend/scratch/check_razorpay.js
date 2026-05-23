import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch"; // Native fetch is available in Node 18+, but let's just use native fetch directly since it's global

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

console.log("Checking Razorpay credentials:");
console.log("Key ID:", keyId);
console.log("Key Secret length:", keySecret ? keySecret.length : 0);

if (!keyId || !keySecret) {
  console.error("Error: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set in environment.");
  process.exit(1);
}

const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

async function checkMethods() {
  try {
    const response = await fetch("https://api.razorpay.com/v1/methods", {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    console.log("HTTP Status:", response.status);
    const data = await response.json();
    if (response.ok) {
      console.log("API Response OK. Configured methods:");
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error("API Response Error:", data);
    }
  } catch (err) {
    console.error("Error fetching methods:", err);
  }
}

checkMethods();
