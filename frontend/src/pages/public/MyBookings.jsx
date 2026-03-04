import { useEffect, useState } from "react";
import { WayzaLayout, WayzaCard } from "../../WayzaUI.jsx";
import { useAuth } from "../../AuthContext.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function MyBookings() {

    const { token } = useAuth();
    const realToken = token || localStorage.getItem("token");

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        if (!realToken) {
            setLoading(false);
            return;
        }

        async function load() {

            try {

                const res = await fetch(`${API}/my-bookings`, {
                    headers: {
                        Authorization: `Bearer ${realToken}`
                    }
                });

                const data = await res.json();

                console.log("MY BOOKINGS:", data);

                // ✅ FIXED: backend returns { ok:true, data:[...] }
                setRows(Array.isArray(data.data) ? data.data : []);

            } catch (err) {

                console.error("Booking load error:", err);
                setRows([]);

            } finally {
                setLoading(false);
            }
        }

        load();

    }, [realToken]);



    async function cancelBooking(id) {

        if (!window.confirm("Cancel this booking?")) return;

        const res = await fetch(`${API}/cancel-booking`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${realToken}`
            },
            body: JSON.stringify({ bookingId: id })
        });

        const data = await res.json();

        if (!data.ok) {
            alert(data.message || "Cannot cancel");
            return;
        }

        setRows(prev =>
            prev.map(b =>
                b._id === id ? { ...b, status: "cancelled" } : b
            )
        );
    }



    return (

        <WayzaLayout>

            <h2 style={{ marginBottom: 20 }}>My bookings</h2>

            {loading && <p>Loading...</p>}

            {!loading && rows.length === 0 && (
                <p>No bookings yet.</p>
            )}



            {!loading && rows.map(b => {

                const start = b.checkIn || b.startDate;
                const end = b.checkOut || b.endDate;

                const color =
                    b.status === "paid"
                        ? "#16a34a"
                        : b.status === "pending"
                            ? "#f59e0b"
                            : "#dc2626";

                const isFuture = start && new Date(start) > new Date();



                return (
                    <WayzaCard key={b._id} style={{ marginBottom: 18 }}>

                        <h3>{b.title || `Listing ${b.listingId}`}</h3>

                        <div>
                            📅 {start || "—"} → {end || "—"}
                        </div>

                        <div
                            style={{
                                marginTop: 6,
                                fontWeight: 700,
                                color
                            }}
                        >
                            Status: {b.status}
                        </div>



                        {b.status !== "cancelled" && isFuture && (
                            <button
                                onClick={() => cancelBooking(b._id)}
                                style={{
                                    marginTop: 10,
                                    padding: "8px 16px",
                                    border: "none",
                                    borderRadius: 8,
                                    background: "#ef4444",
                                    color: "white",
                                    cursor: "pointer",
                                    fontWeight: 600
                                }}
                            >
                                Cancel booking
                            </button>
                        )}

                    </WayzaCard>
                );
            })}

        </WayzaLayout>
    );
}