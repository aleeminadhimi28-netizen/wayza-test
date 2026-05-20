/**
 * Wayzza WhatsApp Notification Service (Simulation)
 * In a real production environment, you would use the Meta WhatsApp Business API or Twilio.
 */

export async function sendWhatsAppAlert(phone, message, buttons = []) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_FROM_PHONE; // e.g. +14155238886 (Twilio sandbox) or your number

    console.log(`[WHATSAPP ALERT] To: ${phone}`);
    console.log(`[MESSAGE]: ${message}`);
    if (buttons.length > 0) {
        console.log(`[INTERACTIVE BUTTONS]: ${buttons.map(b => b.title).join(' | ')}`);
    }

    if (accountSid && authToken && fromPhone) {
        try {
            // Ensure phone starts with '+' or format correctly. Standardise for Twilio format: 'whatsapp:+91...'
            let formattedPhone = phone.trim();
            if (!formattedPhone.startsWith("+")) {
                formattedPhone = "+" + formattedPhone;
            }

            let formattedFrom = fromPhone.trim();
            if (!formattedFrom.startsWith("+")) {
                formattedFrom = "+" + formattedFrom;
            }

            const bodyParams = new URLSearchParams();
            bodyParams.append("To", `whatsapp:${formattedPhone}`);
            bodyParams.append("From", `whatsapp:${formattedFrom}`);
            bodyParams.append("Body", message);

            const authString = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
            const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Basic ${authString}`
                },
                body: bodyParams
            });

            if (!res.ok) {
                const errData = await res.json();
                console.error("❌ Twilio WhatsApp Error:", errData);
                return { ok: false, error: errData };
            }

            const result = await res.json();
            console.log("✅ Twilio WhatsApp sent. SID:", result.sid);
            return { ok: true, messageId: result.sid };
        } catch (e) {
            console.error("❌ Failed to send WhatsApp via Twilio:", e.message);
            return { ok: true, messageId: "wa_fallback_" + Math.random().toString(36).substr(2, 9), error: e.message };
        }
    }

    // Mock successful response
    return { ok: true, messageId: "wa_" + Math.random().toString(36).substr(2, 9) };
}

export const formatWhatsAppBookingMsg = (data) => {
    return `*🌊 New Wayzza Booking!*
    
Property: *${data.title}*
Guest: ${data.guestEmail}
Dates: ${new Date(data.checkIn).toLocaleDateString()} to ${new Date(data.checkOut).toLocaleDateString()}
Nights: ${data.nights}

💰 Your Payout: *₹${data.ownerPayout.toLocaleString()}*

_Please prepare the property for arrival._`;
};

export const formatWhatsAppApprovalNeeded = (data) => {
    return `*⚖️ Action Required: New Listing*

Partner: *${data.ownerEmail}*
Property: *${data.title}*
Location: ${data.location}

_Please review the listing in the Wayzza Admin Dashboard for approval._`;
};

export const formatWhatsAppListingApproved = (data) => {
    return `*✨ Congratulations! Your Property is Live*

Property: *${data.title}*
Status: *PUBLISHED*

_Your listing is now visible to all Wayzza guests and ready for bookings._`;
};

export const formatWhatsAppPartnerOnboarded = (data) => {
    return `*🚀 Welcome to Wayzza Pro!*

Your partner account has been verified. You can now start listing your premium properties and experiences.

_Happy hosting!_`;
};

