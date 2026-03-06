
import fetch from "node-fetch";

const API = "http://localhost:5000";

async function test() {
    try {
        const r = await fetch(`${API}/partner/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "partner@wayza.com", password: "password" })
        });
        const data = await r.json();
        console.log("Login Status:", r.status);
        console.log("Response:", data);
    } catch (err) {
        console.error("Error:", err.message);
    }
}

test();
