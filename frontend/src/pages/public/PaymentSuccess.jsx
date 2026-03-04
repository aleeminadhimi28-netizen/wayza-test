import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { WayzaLayout } from "../../WayzaUI.jsx"
import { useAuth } from "../../AuthContext.jsx"

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PaymentSuccess() {

    const { token } = useAuth();
    const [params] = useSearchParams();

    useEffect(() => {

        const bookingId = params.get("bookingId");

        if (!bookingId || !token) return;

        fetch(`${API}/confirm-booking`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                bookingId,
                paymentId: "demo-payment"
            })
        });

    }, [token]);

    return (
        <WayzaLayout>
            <div style={{ padding: 40 }}>
                <h2>✅ Payment successful</h2>
                <p>Your booking has been confirmed.</p>

                <Link to="/my-bookings">
                    <button style={{
                        marginTop: 20,
                        padding: "10px 18px",
                        borderRadius: 8,
                        border: "none",
                        background: "#2563eb",
                        color: "white",
                        fontWeight: 600,
                        cursor: "pointer"
                    }}>
                        Go to My Bookings
                    </button>
                </Link>
            </div>
        </WayzaLayout>
    );
}