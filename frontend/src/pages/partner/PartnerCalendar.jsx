import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext.jsx";

const API = "http://localhost:5000";

export default function PartnerCalendar() {

    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        if (!user?.email) return;

        const token = localStorage.getItem("token");

        fetch(`${API}/owner/bookings`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(d => setBookings(Array.isArray(d) ? d : []));
    }, [user?.email]);

    return (
        <>
            <h3 style={{ marginBottom: 20 }}>Booking Calendar</h3>
            <div style={{ background: "white", padding: 24, borderRadius: 14 }}>
                {bookings.length === 0 && <p>No bookings yet.</p>}
                {bookings.map(b => (
                    <div key={b._id} style={{ marginBottom: 10 }}>
                        {b.title} → {b.checkIn} to {b.checkOut}
                    </div>
                ))}
            </div>
        </>
    );
}