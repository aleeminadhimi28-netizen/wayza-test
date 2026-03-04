import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext.jsx";
import { useToast } from "../../ToastContext.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ================= STYLES ================= */

const input = {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    marginTop: 6,
    fontSize: 14
};

const btn = {
    marginTop: 30,
    width: "100%",
    padding: 16,
    background: "#0b1324",
    color: "white",
    border: "none",
    borderRadius: 14,
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer"
};

const row = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
    fontSize: 14
};

const divider = {
    height: 1,
    background: "#e5e7eb",
    margin: "14px 0"
};

export default function Booking() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [listing, setListing] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [blocked, setBlocked] = useState([]);
    const [loading, setLoading] = useState(true);
    const todayStr = new Date().toISOString().split("T")[0];
    const minStay = 1;


    /* ================= FETCH ================= */

    useEffect(() => {
        if (!id) return;

        Promise.all([
            fetch(`${API}/listings/${id}`).then(r => r.json()),
            fetch(`${API}/bookings/${id}`).then(r => r.json())
        ])
            .then(([listingData, blockedData]) => {
                setListing(listingData || null);
                setBlocked(Array.isArray(blockedData) ? blockedData : []);
                setLoading(false);
            })
            .catch(() => {
                setListing(null);
                setBlocked([]);
                setLoading(false);
            });
    }, [id]);

    /* ================= BLOCK CHECK ================= */

    function isBlocked(start, end) {
        if (!start || !end) return false;

        const s = new Date(start);
        const e = new Date(end);

        return blocked.some(b => {
            if (b.status === "cancelled") return false;
            const bs = new Date(b.checkIn);
            const be = new Date(b.checkOut);
            return s < be && e > bs;
        });
    }

    /* ================= PRICE LOGIC ================= */

    const pricePerNight = listing?.price || 0;

    const nights =
        startDate && endDate
            ? Math.max(
                0,
                Math.ceil(
                    (new Date(endDate) - new Date(startDate)) / 86400000
                )
            )
            : 0;

    const baseAmount = nights * pricePerNight;
    const gst = Math.round(baseAmount * 0.12);
    const serviceFee = nights > 0 ? 99 : 0;
    const totalAmount = baseAmount + gst + serviceFee;
    const stayInvalid = nights > 0 && nights < minStay;
    const blockedDates = isBlocked(startDate, endDate);

    /* ================= RESERVE ================= */

    async function reserve() {
        if (!user?.email) {
            showToast("Please login first", "error");
            navigate("/login");
            return;
        }

        if (!startDate || !endDate) {
            showToast("Select dates first", "error");
            return;
        }
        if (stayInvalid) {
            showToast(`Minimum stay is ${minStay} night`, "error");
            return;
        }
        if (blockedDates || stayInvalid) {
            showToast("Selected dates unavailable", "error");
            return;
        }

        const token = localStorage.getItem("token");

        const res = await fetch(`${API}/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                listingId: id,
                title: listing?.title,
                ownerEmail: listing?.ownerEmail,
                checkIn: startDate,
                checkOut: endDate
            })
        });

        const data = await res.json();

        if (!data.ok) {
            showToast(data.message || "Booking failed", "error");
            return;
        }

        navigate(`/payment/${data.bookingId}`, {
            state: {
                bookingId: data.bookingId,
                price: totalAmount,
                title: listing?.title,
                nights
            }
        });
    }

    /* ================= UI ================= */

    if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
    if (!listing) return <div style={{ padding: 40 }}>Listing not found</div>;

    return (
        <div style={{ background: "#f3f4f6", minHeight: "100vh" }}>
            <div
                style={{
                    maxWidth: 1100,
                    margin: "60px auto",
                    padding: "0 20px",
                    display: "grid",
                    gridTemplateColumns: "1.6fr 1.4fr",
                    gap: 60
                }}
            >
                {/* LEFT COLUMN */}
                <div
                    style={{
                        background: "white",
                        padding: 32,
                        borderRadius: 20,
                        boxShadow: "0 25px 70px rgba(0,0,0,0.08)"
                    }}
                >
                    <h2>{listing.title}</h2>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 30 }}>
                        ₹{pricePerNight} / night
                    </div>

                    <div style={{ display: "flex", gap: 20 }}>
                        <div style={{ flex: 1 }}>
                            <label>Check-in</label>
                            <input
                                type="date"
                                min={todayStr}
                                value={startDate}
                                onChange={e => {
                                    const newStart = e.target.value;
                                    setStartDate(newStart);

                                    // Auto reset checkout if invalid
                                    if (endDate && newStart >= endDate) {
                                        setEndDate("");
                                    }
                                }}
                                style={input}
                            />
                        </div>

                        <div style={{ flex: 1 }}>
                            <label>Check-out</label>
                            <input
                                type="date"
                                min={startDate || todayStr}
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                style={input}
                            />
                        </div>
                    </div>

                    {blockedDates && (
                        <div style={{ marginTop: 14, color: "#dc2626", fontWeight: 600 }}>
                            ⚠ These dates are already booked
                        </div>
                    )}

                    <button
                        onClick={reserve}
                        disabled={blockedDates}
                        style={{
                            ...btn,
                            opacity: blockedDates ? 0.6 : 1
                        }}
                    >
                        Continue to Payment
                    </button>
                </div>

                {/* RIGHT COLUMN */}
                <div style={{ position: "sticky", top: 120 }}>
                    <div
                        style={{
                            background: "white",
                            padding: 28,
                            borderRadius: 20,
                            boxShadow: "0 25px 70px rgba(0,0,0,0.1)"
                        }}
                    >
                        <div
                            style={{
                                height: 80,
                                background: "#f3f4f6",
                                borderRadius: 12,
                                marginBottom: 14
                            }}
                        />

                        <h3>{listing.title}</h3>

                        <div style={{ marginTop: 10, fontSize: 14, color: "#6b7280" }}>
                            ₹{pricePerNight} per night
                        </div>

                        {nights > 0 ? (
                            <div style={{ marginTop: 20 }}>
                                <Row
                                    left={`₹${pricePerNight} × ${nights} night${nights > 1 ? "s" : ""}`}
                                    right={`₹${baseAmount}`}
                                />
                                <Row left="GST (12%)" right={`₹${gst}`} />
                                <Row left="Service fee" right={`₹${serviceFee}`} />

                                <div style={divider} />

                                <Row
                                    left={<strong>Total</strong>}
                                    right={<strong>₹{totalAmount}</strong>}
                                />
                            </div>
                        ) : (
                            <div
                                style={{
                                    marginTop: 20,
                                    padding: 16,
                                    borderRadius: 12,
                                    background: "#f8fafc",
                                    fontSize: 14,
                                    color: "#6b7280"
                                }}
                            >
                                Select your dates to see total price
                            </div>
                        )}

                        {/* Trust Section */}
                        <div
                            style={{
                                marginTop: 20,
                                paddingTop: 18,
                                borderTop: "1px solid #e5e7eb",
                                fontSize: 13,
                                color: "#6b7280",
                                lineHeight: 1.7
                            }}
                        >
                            ✔ Free cancellation <br />
                            ✔ Secure payment <br />
                            ✔ Instant confirmation
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    function Row({ left, right }) {
        return (
            <div style={row}>
                <div>{left}</div>
                <div>{right}</div>
            </div>
        );
    }
}