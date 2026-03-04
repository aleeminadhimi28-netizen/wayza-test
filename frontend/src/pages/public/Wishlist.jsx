import { useEffect, useState } from "react";
import { WayzaLayout, WayzaCard } from "../../WayzaUI.jsx";
import { useAuth } from "../../AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Wishlist() {

    const { token } = useAuth();
    const realToken = token || localStorage.getItem("token");
    const navigate = useNavigate();

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const fixImg = (img) => {
        if (!img) return "https://picsum.photos/400/300";
        if (img.startsWith("http")) return img;
        return `${API}/uploads/${img}`;
    };

    async function load() {

        try {

            const res = await fetch(`${API}/wishlist`, {
                headers: {
                    Authorization: `Bearer ${realToken}`
                }
            });

            const data = await res.json();

            // ✅ FIX: backend returns { ok:true, data:[...] }
            const saved = Array.isArray(data.data) ? data.data : [];

            const detailed = await Promise.all(
                saved.map(async (s) => {

                    const r = await fetch(`${API}/listings/${s.listingId}`);
                    const listing = await r.json();

                    return listing?.data
                        ? { ...listing.data, savedId: s._id }
                        : null;

                })
            );

            setRows(detailed.filter(Boolean));

        } catch (err) {

            console.error("Wishlist load error:", err);
            setRows([]);

        } finally {

            setLoading(false);

        }
    }

    useEffect(() => {

        if (realToken) load();
        else setLoading(false);

    }, []);


    async function toggle(listingId) {

        await fetch(`${API}/wishlist/toggle`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${realToken}`
            },
            body: JSON.stringify({ listingId })
        });

        // remove instantly from UI
        setRows((r) => r.filter((x) => x._id !== listingId));
    }



    return (

        <WayzaLayout>

            <h2 style={{ marginBottom: 20 }}>❤️ Saved homes</h2>

            {loading && <p>Loading...</p>}

            {!loading && rows.length === 0 && (
                <p>No saved homes yet.</p>
            )}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
                    gap: 20
                }}
            >

                {rows.map((l) => (

                    <WayzaCard
                        key={l._id}
                        style={{ padding: 0, overflow: "hidden" }}
                    >

                        <div style={{ position: "relative" }}>

                            <img
                                src={fixImg(l.image)}
                                style={{
                                    width: "100%",
                                    height: 200,
                                    objectFit: "cover"
                                }}
                                onClick={() =>
                                    navigate(`/listing/${l._id}`)
                                }
                            />

                            {/* REMOVE HEART */}

                            <div
                                onClick={() => toggle(l._id)}
                                style={{
                                    position: "absolute",
                                    top: 12,
                                    right: 12,
                                    background: "white",
                                    width: 38,
                                    height: 38,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    fontSize: 20,
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                                }}
                            >
                                ❤️
                            </div>

                        </div>

                        <div style={{ padding: 16 }}>

                            <div style={{ fontWeight: 700 }}>
                                {l.title}
                            </div>

                            <div
                                style={{
                                    color: "#666",
                                    fontSize: 14
                                }}
                            >
                                {l.location}
                            </div>

                            <div
                                style={{
                                    marginTop: 8,
                                    fontWeight: 700
                                }}
                            >
                                ₹{l.price}
                            </div>

                        </div>

                    </WayzaCard>

                ))}

            </div>

        </WayzaLayout>

    );
}