import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PartnerBookings() {

    const email = localStorage.getItem("partnerEmail");
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (!email) return;

        fetch(`${API}/owner/bookings/${email}`)
            .then(r => r.json())
            .then(setRows);
    }, [email]);

    if (!email)
        return <div style={{ padding: 40 }}>Not logged in</div>;

    return (

        <div style={{ padding: 40 }}>

            <h2>Bookings</h2>

            {rows.length === 0 && <p>No bookings yet</p>}

            <div style={{
                display: "grid",
                gap: 14,
                marginTop: 20
            }}>

                {rows.map(b => (
                    <div key={b._id} style={{
                        background: "white",
                        padding: 18,
                        borderRadius: 10,
                        boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
                    }}>

                        <div><b>Guest:</b> {b.guestEmail}</div>
                        <div><b>Property:</b> {b.listingTitle || b.listingId}</div>
                        <div><b>Dates:</b> {b.startDate} → {b.endDate}</div>

                        <div style={{
                            marginTop: 6,
                            fontWeight: 600,
                            color: b.status === "paid" ? "green" : "orange"
                        }}>
                            {b.status}
                        </div>

                    </div>
                ))}

            </div>

        </div>

    );
}