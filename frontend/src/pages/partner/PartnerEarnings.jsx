import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext.jsx";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";

const API = "http://localhost:5000";

export default function PartnerEarnings() {

    const { user } = useAuth();
    const [earnings, setEarnings] = useState(null);
    const [monthlyData, setMonthlyData] = useState([]);

    useEffect(() => {
        if (!user?.email) return;

        const token = localStorage.getItem("token");

        fetch(`${API}/partner/earnings`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(d => d.ok && setEarnings(d));

        fetch(`${API}/partner/monthly-revenue`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(d => d.ok && setMonthlyData(d.data));
    }, [user?.email]);

    return (
        <>
            <h3 style={{ marginBottom: 20 }}>Earnings Overview</h3>

            {monthlyData.length > 0 && (
                <div style={{ height: 300, marginBottom: 40, background: "white", padding: 20, borderRadius: 14 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={3} />
                            <Line type="monotone" dataKey="bookings" stroke="#22c55e" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {earnings && (
                <div style={{ background: "white", padding: 24, borderRadius: 14 }}>
                    <p><strong>Total Revenue:</strong> ₹{earnings.totalRevenue}</p>
                    <p><strong>Platform Fee:</strong> ₹{earnings.platformFee}</p>
                    <p><strong>Owner Payout:</strong> ₹{earnings.ownerPayout}</p>
                </div>
            )}
        </>
    );
}