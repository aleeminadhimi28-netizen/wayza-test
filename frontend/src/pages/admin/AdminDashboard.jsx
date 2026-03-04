import { useEffect, useState } from "react";

const API = "http://localhost:5000";

export default function AdminDashboard() {

    const [stats, setStats] = useState(null);

    useEffect(() => {

        const token = localStorage.getItem("token");

        fetch(`${API}/admin/stats`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(r => r.json())
            .then(d => d.ok ? setStats(d) : setStats(null));

    }, []);

    if (!stats) return <div style={{ padding: 40 }}>Loading...</div>;

    return (
        <div style={{ padding: 40, fontFamily: "system-ui" }}>
            <h1>🏢 Admin Dashboard</h1>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                gap: 20,
                marginTop: 30
            }}>

                <Card title="Total Users" value={stats.totalUsers} />
                <Card title="Total Partners" value={stats.totalPartners} />
                <Card title="Total Listings" value={stats.totalListings} />
                <Card title="Total Bookings" value={stats.totalBookings} />
                <Card title="Total Revenue" value={`₹${stats.totalRevenue}`} />
                <Card title="Platform Commission" value={`₹${stats.platformCommission}`} />

            </div>

        </div>
    );
}

function Card({ title, value }) {
    return (
        <div style={{
            background: "white",
            padding: 24,
            borderRadius: 14,
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
        }}>
            <div style={{ color: "#6b7280", fontSize: 14 }}>
                {title}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>
                {value}
            </div>
        </div>
    );
}