import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PartnerOnboarding() {

    const navigate = useNavigate();

    const [email, setEmail] = useState(null);
    const [step, setStep] = useState(1);

    const [businessName, setBusinessName] = useState("");
    const [category, setCategory] = useState("hotel");
    const [location, setLocation] = useState("");

    const [listingName, setListingName] = useState("");
    const [price, setPrice] = useState("");

    // ensure logged in partner
    useEffect(() => {

        const storedEmail = localStorage.getItem("email");
        const role = localStorage.getItem("role");

        if (!storedEmail || role !== "partner") {
            navigate("/partner-login", { replace: true });
        } else {
            setEmail(storedEmail);
        }

    }, [navigate]);

    async function finishOnboarding() {

        if (!email) return;

        if (!businessName || !location) {
            alert("Please fill business info");
            return;
        }

        if (listingName && (!price || Number(price) <= 0)) {
            alert("Enter valid price");
            return;
        }

        try {

            const res = await fetch(`${API}/partner/onboard`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    businessName,
                    category,
                    location,
                    firstListing: listingName
                        ? {
                            title: listingName,
                            price: Number(price)
                        }
                        : null
                })
            });

            if (!res.ok) throw new Error();

            navigate("/partner-dashboard", { replace: true });

        } catch (err) {
            console.error(err);
            alert("Onboarding failed");
        }
    }

    if (!email) return null;

    return (

        <div style={{
            minHeight: "100vh",
            background: "#f6f8fc",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "system-ui"
        }}>

            <div style={{
                width: 520,
                background: "white",
                padding: 40,
                borderRadius: 18,
                boxShadow: "0 20px 50px rgba(0,0,0,0.08)"
            }}>

                <Progress step={step} />

                {step === 1 && (
                    <>
                        <h2>Welcome Partner 👋</h2>
                        <p style={{ color: "#6b7280" }}>Let’s set up your business</p>

                        <Input label="Business name" value={businessName} onChange={setBusinessName} />

                        <Select label="Business type"
                            value={category}
                            onChange={setCategory}
                            options={[
                                ["hotel", "Hotel / Rooms"],
                                ["vehicle", "Bike / Car Rental"],
                                ["mixed", "Mixed Services"]
                            ]}
                        />

                        <Nav next={() => setStep(2)} />
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2>Business Location</h2>

                        <Input label="City / Area" value={location} onChange={setLocation} />

                        <Nav back={() => setStep(1)} next={() => setStep(3)} />
                    </>
                )}

                {step === 3 && (
                    <>
                        <h2>Add your first listing</h2>
                        <p style={{ color: "#6b7280" }}>You can add more later</p>

                        <Input label="Listing name" value={listingName} onChange={setListingName} />
                        <Input label="Price" value={price} onChange={setPrice} />

                        <Nav back={() => setStep(2)} next={() => setStep(4)} />
                    </>
                )}

                {step === 4 && (
                    <>
                        <h2>You're ready 🎉</h2>
                        <p style={{ color: "#6b7280" }}>
                            Your partner account is set up.
                        </p>

                        <button onClick={finishOnboarding} style={primaryBtn}>
                            Go to Dashboard
                        </button>
                    </>
                )}

            </div>

        </div>
    );
}

/* UI helpers remain same */

function Progress({ step }) {
    return (
        <div style={{ display: "flex", gap: 8, marginBottom: 30 }}>
            {[1, 2, 3, 4].map(i => (
                <div key={i}
                    style={{
                        flex: 1,
                        height: 6,
                        borderRadius: 10,
                        background: i <= step ? "#111827" : "#e5e7eb"
                    }}
                />
            ))}
        </div>
    );
}

function Input({ label, value, onChange }) {
    return (
        <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 14, marginBottom: 6 }}>{label}</div>
            <input value={value} onChange={e => onChange(e.target.value)} style={inputStyle} />
        </div>
    );
}

function Select({ label, value, onChange, options }) {
    return (
        <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 14, marginBottom: 6 }}>{label}</div>
            <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
                {options.map(o => (
                    <option key={o[0]} value={o[0]}>{o[1]}</option>
                ))}
            </select>
        </div>
    );
}

function Nav({ back, next }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            {back && <button onClick={back} style={secondaryBtn}>Back</button>}
            {next && <button onClick={next} style={primaryBtn}>Continue</button>}
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    fontSize: 15
};

const primaryBtn = {
    padding: "12px 18px",
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600
};

const secondaryBtn = {
    padding: "12px 18px",
    background: "#f3f4f6",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600
};