import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateItinerary = async (destination, vibe, listings) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are a professional travel architect for 'Wayza', a premium travel platform.
    Your task is to create a personalized 2-day itinerary for a traveler going to ${destination} with a "${vibe}" vibe.
    
    I will provide you with a list of available inventory (Stays, Vehicles, and Activities) in that location. 
    You MUST ONLY use the items provided in the list.
    
    Available Inventory:
    ${JSON.stringify(listings.map(l => ({
        id: l._id,
        title: l.title,
        category: l.category,
        price: l.price,
        description: l.description
    })))}

    Instructions:
    1. Select exactly ONE Stay (hotel).
    2. Select exactly ONE Vehicle (car/bike) if available.
    3. Select 2-3 Activities.
    4. Create a structured 2-day plan. 
    5. 'day 1' should focus on Arrival and Stay check-in.
    6. 'day 2' should focus on Exploration and Activities.
    7. Return the response in RAW JSON format only. No markdown, no backticks.
    
    JSON Structure:
    {
        "destination": "${destination}",
        "vibe": "${vibe}",
        "days": [
            {
                "day": 1,
                "title": "Day 1 Title",
                "items": [
                    { "time": "10:00 AM", "title": "Item Title", "desc": "Contextual description", "type": "hotel|vehicle|activity" }
                ]
            }
        ],
        "totalPrice": 0
    }
    
    Ensure 'totalPrice' is the sum of all selected items.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
        // Clean potential markdown from response
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanJson);
    } catch (e) {
        console.error("AI Response Parsing Error:", text);
        throw new Error("Failed to parse AI response");
    }
};

/**
 * Answer a specific question about a listing using AI context.
 */
export const answerListingQuery = async (query, listing) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are the 'Wayza Digital Concierge', an elite, helpful, and highly sophisticated AI assistant for a premium property called "${listing.title}".
    
    Context about the property:
    - Description: ${listing.description}
    - Location: ${listing.location}
    - Category: ${listing.category}
    - Price: ${listing.price} per night
    - Amenities: ${listing.amenities?.join(", ") || "WiFi, Breakfast, Security, Parking"}
    
    The guest is asking: "${query}"
    
    Instructions:
    1. Answer ONLY based on the context provided. If the information isn't there, say you'll check with the host.
    2. Maintain an ultra-luxurious, welcoming, and professional tone.
    3. Keep the answer concise (under 3 sentences).
    4. Use British English or International English.
    5. Do not make up facts.
    
    Your Response:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
};

/**
 * Generate a neighborhood vibe profile for a specific location.
 */
export const generateNeighborhoodVibe = async (location, category) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are a 'Wayza Vibe Architect'. 
    Create a luxury neighborhood profile for a property located in "${location}" which is a "${category}".
    
    Instructions:
    1. Return a 'vibeTitle' (e.g., "Bohemian Seclusion", "Azure Rhythm").
    2. Return a 'vibeDesc' (max 20 words, evocative and luxurious).
    3. Return 'hotspots': An array of 4 objects with { name, iconLabel, label }.
       - iconLabel MUST be one of: "Compass", "Coffee", "Waves", "Moon", "Utensils", "MapPin".
       - label should be the category (e.g., "Gourmet", "Nightlife", "Adventure").
    4. Return exactly in RAW JSON format. No markdown, no backticks.
    
    JSON Structure:
    {
        "vibeTitle": "...",
        "vibeDesc": "...",
        "hotspots": [
            { "name": "...", "iconLabel": "...", "label": "..." }
        ]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanJson);
    } catch (e) {
        console.error("Vibe Generation Error:", text);
        return {
            vibeTitle: "Coastal Rhapsody",
            vibeDesc: "A sanctuary where the rhythm of the waves meets the soul of contemporary luxury.",
            hotspots: [
                { name: "The Cliff Trail", iconLabel: "Compass", label: "Adventure" },
                { name: "Soul Food Cafe", iconLabel: "Coffee", label: "Gourmet" },
                { name: "Private Shore", iconLabel: "Waves", label: "Exclusive" },
                { name: "Luna Lounge", iconLabel: "Moon", label: "Nightlife" }
            ]
        };
    }
};
