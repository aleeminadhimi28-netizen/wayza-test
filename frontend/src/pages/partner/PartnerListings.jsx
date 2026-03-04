import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PartnerListings() {

    const { user } = useAuth();
    const navigate = useNavigate();

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        if (!user?.email) return;

        fetch(`${API}/owner/listings/${user.email}`)
            .then(r => r.json())
            .then(data => {

                if (Array.isArray(data))
                    setRows(data);
                else
                    setRows([]);

                setLoading(false);

            })
            .catch(() => {
                setRows([]);
                setLoading(false);
            });

    }, [user?.email]);

    return (
        <div style={{ padding: 40, fontFamily: "system-ui" }}>

            <h1>Your Properties</h1>

            {loading && <p style={{ marginTop: 20 }}>Loading properties...</p>}

            {!loading && rows.length === 0 && (
                <p style={{ marginTop: 20, color: "#64748b" }}>
                    No properties yet.
                </p>
            )}

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                gap: 18,
                marginTop: 20
            }}>

                {rows.map(p => (

                    <div
                        key={p._id}
                        style={{
                            background: "white",
                            padding: 20,
                            borderRadius: 14,
                            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                            cursor: "pointer"
                        }}
                        onClick={() => navigate(`/partner/property/${p._id}`)}
                    >
                        <h3>{p.title}</h3>

                        <div style={{ color: "#6b7280", fontSize: 13 }}>
                            {p.category || "Property"}
                        </div>

                        <div style={{ marginTop: 10, fontSize: 13 }}>
                            Variants: {p.variants?.length || 0}
                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}