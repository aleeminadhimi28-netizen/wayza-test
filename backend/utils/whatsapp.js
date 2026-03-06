/**
 * Wayza WhatsApp Notification Service (Simulation)
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
    return `*🌊 New Wayza Booking!*
    
Property: *${data.title}*
Guest: ${data.guestEmail}
Dates: ${new Date(data.checkIn).toLocaleDateString()} to ${new Date(data.checkOut).toLocaleDateString()}
Nights: ${data.nights}

💰 Your Payout: *₹${data.ownerPayout.toLocaleString()}*

_Please prepare the property for arrival._`;
};
