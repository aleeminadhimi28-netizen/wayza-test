

const BASE_URL = 'http://localhost:5000/api/v1';

async function runTest() {
    let cookieStr = '';

    console.log("1. Partner Login...");
    const loginRes = await fetch(`${BASE_URL}/partner/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'partner@wayza.com', password: 'password' })
    });
    const loginData = await loginRes.json();
    console.log("Login Res:", loginData);
    if (!loginData.ok) return console.error("Login failed");

    // Extract cookie
    const cookies = loginRes.headers.getSetCookie();
    if (cookies && cookies.length > 0) {
        cookieStr = cookies.map(c => c.split(';')[0]).join('; ');
    }
    console.log("Cookie string parsed:", cookieStr);

    console.log("\n2. Check Status...");
    const statusRes = await fetch(`${BASE_URL}/partner/status/partner@wayza.com`);
    const statusData = await statusRes.json();
    console.log("Status Res:", statusData);

    console.log("\n3. Create Property...");
    const listingRes = await fetch(`${BASE_URL}/listings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieStr,
            'Authorization': `Bearer ${loginData.token || ''}` // Handle both just in case
        },
        body: JSON.stringify({
            title: "Varkala Cliff Villa",
            location: "Varkala Cliff, Kerala",
            price: 4500,
            description: "A premium villa overlooking the Arabian Sea.",
            category: "hotel",
            images: [],
            image: ""
        })
    });
    const listingData = await listingRes.json();
    console.log("Create Listing Res:", listingData);
    if (!listingData.ok) return console.error("Listing creation failed");

    const listingId = listingData.id;

    console.log("\n4. Add Variant 1...");
    const var1Res = await fetch(`${BASE_URL}/listings/${listingId}/variant`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieStr,
            'Authorization': `Bearer ${loginData.token || ''}`
        },
        body: JSON.stringify({
            name: 'Standard Room',
            type: 'Stay',
            price: 4500,
            qty: 2,
            desc: 'Comfortable room with garden view.',
            available: true
        })
    });
    console.log("Variant 1 Res:", await var1Res.json());

    console.log("\n5. Get Listing Details to Verify...");
    const getRes = await fetch(`${BASE_URL}/listings/${listingId}`, {
        headers: {
            'Cookie': cookieStr,
            'Authorization': `Bearer ${loginData.token || ''}`
        }
    });
    const getDetails = await getRes.json();
    console.log("Listing Details:", JSON.stringify(getDetails, null, 2));

    console.log("\nTests Finished Successfully!");
}

runTest().catch(console.error);
