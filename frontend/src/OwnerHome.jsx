import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

export default function OwnerHome() {

    const { user } = useAuth();
    const navigate = useNavigate();

    const [listings, setListings] = useState([]);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {

        if (!user?.email) return;

        fetch(`${API}/owner/listings/${user.email}`)
            .then(r => r.json())
            .then(setListings);

        fetch(`${API}/owner/bookings/${user.email}`)
            .then(r => r.json())
            .then(setBookings);

    }, [user]);

    const earnings = bookings.reduce((s, b) => s + (b.price || 0), 0);

    return (

        <div style={{ padding: 40 }}>

            {/* HEADER */}
            <h1>Welcome back 👋</h1>
            <p style={{ color: "#6b7280", marginBottom: 30 }}>
                {user?.email}
            </p>

            {/* STATS */}
            <div style={grid4}>

                <Stat label="Properties" value={listings.length} />
                <Stat label="Bookings" value={bookings.length} />
                <Stat label="Total Earnings" value={`₹${earnings}`} />

            </div>

            {/* QUICK ACTIONS */}
            <h2 style={{ marginTop: 40 }}>Quick Actions</h2>

            <div style={grid4}>

                <Action label="➕ Add Property" onClick={() => navigate("/owner")} />
                <Action label="📋 Manage Properties" onClick={() => navigate("/owner-listings")} />
                <Action label="📅 View Bookings" onClick={() => navigate("/owner-bookings")} />
                <Action label="🗓 Calendar & Pricing" onClick={() => navigate("/owner-calendar")} />

            </div>

            {/* RECENT BOOKINGS */}
            <h2 style={{ marginTop: 40 }}>Recent Reservations</h2>

            <div style={card}>

                {bookings.length === 0 && (
                    <p style={{ color: "#6b7280" }}>No bookings yet</p>
                )}

                {bookings.slice(0, 3).map(b => (
                    <div key={b._id} style={bookingRow}>
                        <b>{b.title}</b>
                        <span>{b.guestEmail}</span>
                        <span>₹{b.price}</span>
                    </div>
                ))}

            </div>

        </div>
    );
}

/* ---------- SMALL COMPONENTS ---------- */

function Stat({ label, value }) {
    return (
        <div style={card}>
            <div style={{ color: "#6b7280", fontSize: 14 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
        </div>
    );
}

function Action({ label, onClick }) {
    return (
        <div style={action} onClick={onClick}>
            {label}
        </div>
    );
}

/* ---------- STYLES ---------- */

const grid4 = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
    gap: 20,
    marginTop: 15
};

const card = {
    background: "white",
    padding: 22,
    borderRadius: 14,
    boxShadow: "0 6px 24px rgba(0,0,0,0.05)"
};

const action = {
    ...card,
    cursor: "pointer",
    fontWeight: 600,
    textAlign: "center",
    transition: "0.2s"
};

const bookingRow = {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
    fontSize: 14
};