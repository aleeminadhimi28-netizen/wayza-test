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
