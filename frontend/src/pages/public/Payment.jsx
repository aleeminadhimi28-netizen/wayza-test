import { useParams, useNavigate, useLocation } from "react-router-dom";
import { WayzaLayout, WayzaButton } from "../../WayzaUI.jsx"
import { useAuth } from "../../AuthContext.jsx"

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Payment() {

    const { id: bookingId } = useParams();   // ✅ FIXED
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useAuth();

    const realToken = token || localStorage.getItem("token");

    const price = location.state?.price || 0;
    const title = location.state?.title || "Booking";

    async function handlePayment() {

        if (!bookingId) {
            alert("Invalid booking");
            return;
        }

        try {

            const res = await fetch(`${API}/confirm-booking`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${realToken}`
                },
                body: JSON.stringify({
                    bookingId,
                    paymentId: "mock-" + Date.now()
                })
            });

            const data = await res.json();

            if (!data.ok) {
                alert(data.message || "Payment failed");
                return;
            }

            navigate("/payment-success");

        } catch (err) {
            console.error(err);
            alert("Payment error");
        }
    }

    return (
        <WayzaLayout>

            <div style={{
                maxWidth: 420,
                margin: "60px auto",
                background: "white",
                padding: 30,
                borderRadius: 16,
                boxShadow: "0 20px 60px rgba(0,0,0,0.1)"
            }}>

                <h2>Payment</h2>

                <p style={{ marginTop: 20, fontWeight: 600 }}>
                    {title}
                </p>

                <div style={{
                    fontSize: 26,
                    fontWeight: 700,
                    marginTop: 10
                }}>
                    ₹{price}
                </div>

                <WayzaButton
                    full
                    style={{ marginTop: 24 }}
                    onClick={handlePayment}
                >
                    Pay Now
                </WayzaButton>

            </div>

        </WayzaLayout>
    );
}