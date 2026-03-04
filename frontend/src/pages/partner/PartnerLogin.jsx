import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PartnerLogin() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // ✅ AUTO REDIRECT IF ALREADY LOGGED IN
    useEffect(() => {
        const saved = localStorage.getItem("partnerEmail");
        if (saved) navigate("/partner-dashboard", { replace: true });
    }, [navigate]);

    async function login(e) {
        e.preventDefault();
        if (loading) return;

        try {
            setLoading(true);

            const r = await fetch(`${API}/partner/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await r.json();

            if (!data.ok) {
                alert("Login failed");
                setLoading(false);
                return;
            }

            // ✅ SAVE LOGIN
            localStorage.setItem("partnerEmail", data.email);

            // ✅ REDIRECT
            navigate("/partner-dashboard", { replace: true });

        } catch (err) {
            console.error(err);
            alert("Server error");
            setLoading(false);
        }
    }

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: 80
        }}>
            <form onSubmit={login} style={{
                width: 360,
                padding: 28,
                borderRadius: 12,
                background: "white",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
            }}>

                <h2 style={{ marginBottom: 20 }}>Partner Login</h2>

                <input
                    placeholder="Partner email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={input}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={input}
                />

                <button
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: 12,
                        background: "#1f6feb",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        fontWeight: 600,
                        cursor: "pointer"
                    }}
                >
                    {loading ? "Logging in..." : "Login to Partners Dashboard"}
                </button>

            </form>
        </div>
    );
}

const input = {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ddd",
    marginBottom: 14,
    fontSize: 15
};