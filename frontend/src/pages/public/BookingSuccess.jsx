import { useLocation, useNavigate } from "react-router-dom";
import { WayzaLayout, WayzaCard, WayzaButton } from "../../WayzaUI.jsx"

export default function BookingSuccess() {

    const { state } = useLocation();
    const navigate = useNavigate();

    if (!state) {
        return (
            <WayzaLayout>
                <div style={{ padding: 40 }}>No booking info</div>
            </WayzaLayout>
        );
    }

    const { bookingId, title, price, startDate, endDate } = state;

    return (
        <WayzaLayout>

            <div style={{
                maxWidth: 620,
                margin: "60px auto"
            }}>

                <WayzaCard>

                    <h2 style={{ color: "#16a34a" }}>
                        ✅ Booking Confirmed
                    </h2>

                    <div style={{ marginTop: 20 }}>

                        <p><b>Booking ID:</b> {bookingId}</p>
                        <p><b>Property:</b> {title}</p>
                        <p><b>Dates:</b> {startDate} → {endDate}</p>
                        <p><b>Total Paid:</b> ₹{price}</p>
                        <p><b>Status:</b> Paid</p>

                    </div>

                    <WayzaButton
                        full
                        style={{ marginTop: 20 }}
                        onClick={() => navigate("/")}
                    >
                        Back to home
                    </WayzaButton>

                </WayzaCard>

            </div>

        </WayzaLayout>
    );
}