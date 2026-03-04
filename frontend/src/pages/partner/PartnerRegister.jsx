import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

export default function PartnerRegister() {

    const [businessName, setBusinessName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [type, setType] = useState("hotel");

    const navigate = useNavigate();

    async function submit() {

        const res = await fetch(`${API}/partner/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                businessName, email, password, type
            })
        });

        const data = await res.json();

        if (data.ok) {
            alert("Registered! Login now");
            navigate("/partner-login");
        } else alert(data.msg || "Failed");

    }

    return (
        <div style={{ padding: 40, maxWidth: 420 }}>
            <h2>Partner Registration</h2>

            <input placeholder="Business Name"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)} />

            <br /><br />

            <input placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)} />

            <br /><br />

            <input type="password" placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)} />

            <br /><br />

            <select value={type} onChange={e => setType(e.target.value)}>
                <option value="hotel">Hotel</option>
                <option value="bike">Bike Rental</option>
                <option value="car">Car Rental</option>
                <option value="mixed">Mixed</option>
            </select>

            <br /><br />

            <button onClick={submit}>Register</button>

        </div>
    );
}