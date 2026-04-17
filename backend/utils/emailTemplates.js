import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

let transporter = null;
let testAccount = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: process.env.SMTP_PORT || 465,
        secure: process.env.SMTP_SECURE === "false" ? false : true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

export const getTransporter = async () => {
    if (transporter) return transporter;
    
    // Provide a FREE Ethereal setup automatically if no credentials are given
    if (!testAccount) {
        testAccount = await nodemailer.createTestAccount();
        console.log("------------------------------------------");
        console.log("FREE OTP/EMAIL SETUP: Created Ethereal Account");
        console.log("Email:", testAccount.user);
        console.log("Pass:", testAccount.pass);
        console.log("Emails sent will be mock emails loggable via URLs.");
        console.log("------------------------------------------");
    }
    
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });
};

export const guestBookingEmail = (data) => {
    const { guestEmail, title, checkIn, checkOut, nights, totalPrice, bookingId } = data;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const year = new Date().getFullYear();
    const guestName = guestEmail.split("@")[0];
    const nightsText = nights !== 1 ? "nights" : "night";

    const html = `<div style='font-family:system-ui;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px;border-radius:20px;'>
    <div style='background:linear-gradient(135deg,#1e3a8a,#2563eb);border-radius:16px;padding:32px;text-align:center;margin-bottom:28px;'>
    <h1 style='color:white;margin:0;font-size:28px;'>Wayza</h1>
    <p style='color:rgba(255,255,255,0.85);margin-top:8px;font-size:15px;'>Your booking is confirmed!</p>
    </div>
    <p style='color:#374151;font-size:16px;margin-bottom:24px;'>Hi <strong>${guestName}</strong>, your booking is confirmed!</p>
    <div style='background:white;border-radius:16px;padding:24px;margin-bottom:24px;border:1px solid #e5e7eb;'>
    <h2 style='margin:0 0 20px;color:#1e3a8a;font-size:20px;'>Booking Summary</h2>
    <table style='width:100%;border-collapse:collapse;'>
    <tr style='border-bottom:1px solid #f3f4f6;'><td style='padding:12px 0;color:#6b7280;font-size:14px;'>Property</td><td style='padding:12px 0;font-weight:700;text-align:right;'>${title}</td></tr>
    <tr style='border-bottom:1px solid #f3f4f6;'><td style='padding:12px 0;color:#6b7280;font-size:14px;'>Check-in</td><td style='padding:12px 0;font-weight:600;text-align:right;'>${checkIn}</td></tr>
    <tr style='border-bottom:1px solid #f3f4f6;'><td style='padding:12px 0;color:#6b7280;font-size:14px;'>Check-out</td><td style='padding:12px 0;font-weight:600;text-align:right;'>${checkOut}</td></tr>
    <tr style='border-bottom:1px solid #f3f4f6;'><td style='padding:12px 0;color:#6b7280;font-size:14px;'>Duration</td><td style='padding:12px 0;font-weight:600;text-align:right;'>${nights} ${nightsText}</td></tr>
    <tr style='border-bottom:1px solid #f3f4f6;'><td style='padding:12px 0;color:#6b7280;font-size:14px;'>Booking ID</td><td style='padding:12px 0;color:#9ca3af;font-size:13px;text-align:right;'>${bookingId}</td></tr>
    <tr><td style='padding:14px 0 0;font-weight:700;font-size:16px;'>Total Paid</td><td style='padding:14px 0 0;font-weight:800;color:#2563eb;font-size:20px;text-align:right;'>Rs.${totalPrice}</td></tr>
    </table></div>
    <div style='text-align:center;margin-bottom:28px;'>
    <a href='${frontendUrl}/my-bookings' style='display:inline-block;padding:14px 32px;background:#2563eb;color:white;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;'>View My Bookings</a>
    </div>
    <p style='color:#9ca3af;font-size:12px;text-align:center;'>Need help? Contact support@wayza.com<br>© ${year} Wayza</p>
    </div>`;

    return {
        from: `"Wayza" <${process.env.SMTP_FROM || process.env.EMAIL_USER}>`,
        to: guestEmail,
        subject: "Booking Confirmed — " + title,
        html
    };
};

export const ownerBookingEmail = (data) => {
    const { ownerEmail, guestEmail, title, checkIn, checkOut, nights, totalPrice, ownerPayout } = data;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const year = new Date().getFullYear();
    const nightsText = nights !== 1 ? "nights" : "night";

    const html = `<div style='font-family:system-ui;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px;border-radius:20px;'>
    <div style='background:linear-gradient(135deg,#064e3b,#059669);border-radius:16px;padding:32px;text-align:center;margin-bottom:28px;'>
    <h1 style='color:white;margin:0;font-size:28px;'>Wayza Partner</h1>
    <p style='color:rgba(255,255,255,0.85);margin-top:8px;font-size:15px;'>You have a new booking!</p>
    </div>
    <p style='color:#374151;font-size:16px;margin-bottom:24px;'>A guest has booked <strong>${title}</strong>.</p>
    <div style='background:white;border-radius:16px;padding:24px;margin-bottom:24px;border:1px solid #e5e7eb;'>
    <h2 style='margin:0 0 20px;color:#064e3b;font-size:20px;'>Reservation Details</h2>
    <table style='width:100%;border-collapse:collapse;'>
    <tr style='border-bottom:1px solid #f3f4f6;'><td style='padding:12px 0;color:#6b7280;font-size:14px;'>Guest</td><td style='padding:12px 0;font-weight:700;text-align:right;'>${guestEmail}</td></tr>
    <tr style='border-bottom:1px solid #f3f4f6;'><td style='padding:12px 0;color:#6b7280;font-size:14px;'>Property</td><td style='padding:12px 0;font-weight:700;text-align:right;'>${title}</td></tr>
    <tr style='border-bottom:1px solid #f3f4f6;'><td style='padding:12px 0;color:#6b7280;font-size:14px;'>Check-in</td><td style='padding:12px 0;font-weight:600;text-align:right;'>${checkIn}</td></tr>
    <tr style='border-bottom:1px solid #f3f4f6;'><td style='padding:12px 0;color:#6b7280;font-size:14px;'>Check-out</td><td style='padding:12px 0;font-weight:600;text-align:right;'>${checkOut}</td></tr>
    <tr style='border-bottom:1px solid #f3f4f6;'><td style='padding:12px 0;color:#6b7280;font-size:14px;'>Duration</td><td style='padding:12px 0;font-weight:600;text-align:right;'>${nights} ${nightsText}</td></tr>
    <tr style='border-bottom:1px solid #f3f4f6;'><td style='padding:12px 0;color:#6b7280;font-size:14px;'>Total Value</td><td style='padding:12px 0;font-weight:700;text-align:right;'>Rs.${totalPrice}</td></tr>
    <tr><td style='padding:14px 0 0;color:#059669;font-weight:700;font-size:16px;'>Your Payout (90%)</td><td style='padding:14px 0 0;font-weight:800;color:#059669;font-size:20px;text-align:right;'>Rs.${ownerPayout}</td></tr>
    </table></div>
    <div style='text-align:center;margin-bottom:28px;'>
    <a href='${frontendUrl}/partner' style='display:inline-block;padding:14px 32px;background:#059669;color:white;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;'>View Dashboard</a>
    </div>
    <p style='color:#9ca3af;font-size:12px;text-align:center;'>© ${year} Wayza Partner Program</p>
    </div>`;

    return {
        from: `"Wayza" <${process.env.SMTP_FROM || process.env.EMAIL_USER}>`,
        to: ownerEmail,
        subject: "New Booking — " + title,
        html
    };
};
export const payoutSettledEmail = ({ ownerEmail, amount, bookingTitle }) => {
    const year = new Date().getFullYear();
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const html = `<div style='font-family:system-ui;max-width:560px;margin:0 auto;background:#f0fdf4;padding:32px;border-radius:20px;'>
    <div style='background:linear-gradient(135deg,#064e3b,#10b981);border-radius:16px;padding:32px;text-align:center;margin-bottom:28px;'>
    <h1 style='color:white;margin:0;font-size:28px;'>Wayza Partner</h1>
    <p style='color:rgba(255,255,255,0.85);margin-top:8px;font-size:15px;'>Your payout has been processed!</p>
    </div>
    <div style='background:white;border-radius:16px;padding:24px;margin-bottom:24px;border:1px solid #d1fae5;'>
    <h2 style='margin:0 0 16px;color:#064e3b;font-size:20px;'>Payout Confirmed</h2>
    <table style='width:100%;border-collapse:collapse;'>
    <tr style='border-bottom:1px solid #f3f4f6;'><td style='padding:12px 0;color:#6b7280;font-size:14px;'>Property</td><td style='padding:12px 0;font-weight:700;text-align:right;'>${bookingTitle}</td></tr>
    <tr><td style='padding:14px 0 0;color:#059669;font-weight:700;font-size:16px;'>Amount Transferred</td><td style='padding:14px 0 0;font-weight:800;color:#059669;font-size:22px;text-align:right;'>₹${Number(amount).toLocaleString()}</td></tr>
    </table></div>
    <div style='text-align:center;margin-bottom:28px;'>
    <a href='${frontendUrl}/partner/wallet' style='display:inline-block;padding:14px 32px;background:#059669;color:white;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;'>View Wallet</a>
    </div>
    <p style='color:#9ca3af;font-size:12px;text-align:center;'>© ${year} Wayza Partner Program</p>
    </div>`;
    return { from: `"Wayza" <${process.env.SMTP_FROM || process.env.EMAIL_USER}>`, to: ownerEmail, subject: "Payout Processed — ₹" + Number(amount).toLocaleString(), html };
};

export const withdrawalStatusEmail = ({ ownerEmail, amount, status, reason }) => {
    const year = new Date().getFullYear();
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const approved = status === "approved" || status === "completed";
    const color = approved ? "#059669" : "#dc2626";
    const bg = approved ? "linear-gradient(135deg,#064e3b,#10b981)" : "linear-gradient(135deg,#7f1d1d,#ef4444)";
    const html = `<div style='font-family:system-ui;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px;border-radius:20px;'>
    <div style='background:${bg};border-radius:16px;padding:32px;text-align:center;margin-bottom:28px;'>
    <h1 style='color:white;margin:0;font-size:28px;'>Wayza Partner</h1>
    <p style='color:rgba(255,255,255,0.85);margin-top:8px;font-size:15px;'>Withdrawal ${approved ? "Approved" : "Update"}</p>
    </div>
    <div style='background:white;border-radius:16px;padding:24px;margin-bottom:24px;border:1px solid #e5e7eb;'>
    <table style='width:100%;border-collapse:collapse;'>
    <tr style='border-bottom:1px solid #f3f4f6;'><td style='padding:12px 0;color:#6b7280;font-size:14px;'>Requested Amount</td><td style='padding:12px 0;font-weight:700;text-align:right;'>₹${Number(amount).toLocaleString()}</td></tr>
    <tr style='border-bottom:1px solid #f3f4f6;'><td style='padding:12px 0;color:#6b7280;font-size:14px;'>Status</td><td style='padding:12px 0;font-weight:800;color:${color};text-align:right;text-transform:uppercase;'>${status}</td></tr>
    ${reason ? `<tr><td style='padding:12px 0;color:#6b7280;font-size:14px;'>Note</td><td style='padding:12px 0;font-size:13px;text-align:right;'>${reason}</td></tr>` : ""}
    </table></div>
    <div style='text-align:center;margin-bottom:28px;'>
    <a href='${frontendUrl}/partner/wallet' style='display:inline-block;padding:14px 32px;background:${color};color:white;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;'>View Wallet</a>
    </div>
    <p style='color:#9ca3af;font-size:12px;text-align:center;'>© ${year} Wayza Partner Program</p>
    </div>`;
    return { from: `"Wayza" <${process.env.SMTP_FROM || process.env.EMAIL_USER}>`, to: ownerEmail, subject: `Withdrawal ${approved ? "Approved" : "Update"} — ₹${Number(amount).toLocaleString()}`, html };
};
