/**
 * Wayzza WhatsApp Notification Service (Simulation)
 * In a real production environment, you would use the Meta WhatsApp Business API or Twilio.
 */

export async function sendWhatsAppAlert(phone, message, buttons = []) {
    // 1. In production, you would call:
    // const response = await fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', { ... })

    console.log(`[WHATSAPP ALERT] To: ${phone}`);
    console.log(`[MESSAGE]: ${message}`);
    if (buttons.length > 0) {
        console.log(`[INTERACTIVE BUTTONS]: ${buttons.map(b => b.title).join(' | ')}`);
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

