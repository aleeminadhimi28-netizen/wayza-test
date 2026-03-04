import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { WayzaLayout, WayzaCard, WayzaButton } from "../../WayzaUI.jsx";
import { useAuth } from "../../AuthContext.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ListingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [listing, setListing] = useState(null);
    const [mainImage, setMainImage] = useState("");
    const [reviews, setReviews] = useState([]);
    const [avg, setAvg] = useState(0);
    const [saved, setSaved] = useState(false);

    const fixImg = (img) => {
        if (!img) return "";
        if (img.startsWith("http")) return img;
        return `${API}/${img}`;
    };

    useEffect(() => {
        fetch(`${API}/listings/${id}`)
            .then(res => res.json())
            .then(data => {
                setListing(data);
                if (data.images && data.images.length > 0) {
                    setMainImage(fixImg(data.images[0]));
                } else {
                    setMainImage("https://picsum.photos/900/600");
                }
            });

        fetch(`${API}/reviews/${id}`)
            .then(r => r.json())
            .then(d => {
                setReviews(d.reviews || []);
                setAvg(d.average || 0);
            });

        const token = localStorage.getItem("token");
        if (token) {
            fetch(`${API}/wishlist`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(r => r.json())
                .then(list => {
                    const found = list.some(w => w.listingId === id);
                    setSaved(found);
                });
        }
    }, [id]);

    const toggleWishlist = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login", { state: { from: location } });
            return;
        }

        const res = await fetch(`${API}/wishlist/toggle`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ listingId: id })
        });

        const data = await res.json();
        setSaved(data.saved);
    };

    const handleReserve = () => {
        if (!user) {
            navigate("/login", { state: { from: location } });
            return;
        }
        navigate(`/booking/${id}`);
    };

    if (!listing) {
        return (
            <WayzaLayout>
                <div style={{ padding: 40 }}>Loading...</div>
            </WayzaLayout>
        );
    }

    const amenities = listing.amenities?.length
        ? listing.amenities
        : ["Free WiFi", "Parking", "Air conditioning", "24h reception"];

    return (
        <WayzaLayout>
            <div
                style={{
                    maxWidth: 1200,
                    margin: "60px auto",
                    padding: "0 20px",
                    display: "grid",
                    gridTemplateColumns: "minmax(0,1fr) 380px",
                    gap: 60
                }}
            >

                {/* ================= LEFT COLUMN ================= */}
                <div>

                    {/* TITLE */}
                    <h1 style={{ fontSize: 34, fontWeight: 800 }}>
                        {listing.title}
                    </h1>

                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginTop: 8,
                        fontSize: 14,
                        color: "#6b7280"
                    }}>
                        📍 {listing.location}
                        <span>•</span>
                        <span>{reviews.length} reviews</span>
                        <div style={{
                            background: "#2563eb",
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: 8,
                            fontWeight: 700
                        }}>
                            {Number(avg).toFixed(1)}
                        </div>
                    </div>

                    {/* SECTION NAV */}
                    <div
                        style={{
                            display: "flex",
                            gap: 30,
                            marginTop: 24,
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#6b7280",
                            paddingBottom: 16,
                            borderBottom: "1px solid #e5e7eb"
                        }}
                    >
                        <span style={{ cursor: "pointer" }}>Overview</span>
                        <span style={{ cursor: "pointer" }}>Rooms</span>
                        <span style={{ cursor: "pointer" }}>Amenities</span>
                        <span style={{ cursor: "pointer" }}>Reviews</span>
                    </div>
                    <div
                        style={{
                            height: 1,
                            background: "#f1f5f9",
                            marginTop: 24
                        }}
                    />
                    {/* IMAGE GRID */}
                    {/* IMAGE GRID */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr",
                            gap: 12,
                            marginTop: 30,
                            position: "relative"
                        }}
                    >
                        {/* MAIN IMAGE */}
                        <img
                            src={mainImage || "https://picsum.photos/900/600"}
                            onError={(e) => {
                                e.target.src = "https://picsum.photos/900/600";
                            }}
                            style={{
                                width: "100%",
                                height: 420,
                                objectFit: "cover",
                                borderRadius: 20,
                                background: "#f3f4f6"
                            }}
                        />

                        {/* SIDE IMAGES */}
                        <div style={{ display: "grid", gap: 12 }}>
                            {(listing.images?.slice(1, 3) || []).map((img, i) => {
                                const src = fixImg(img);
                                return (
                                    <img
                                        key={i}
                                        src={src}
                                        onClick={() => setMainImage(src)}
                                        onError={(e) => {
                                            e.target.src = "https://picsum.photos/400/300";
                                        }}
                                        style={{
                                            width: "100%",
                                            height: 204,
                                            objectFit: "cover",
                                            borderRadius: 20,
                                            cursor: "pointer",
                                            background: "#f3f4f6"
                                        }}
                                    />
                                );
                            })}
                        </div>

                        {/* WISHLIST */}
                        <button
                            onClick={toggleWishlist}
                            style={{
                                position: "absolute",
                                top: 20,
                                right: 20,
                                width: 48,
                                height: 48,
                                borderRadius: "50%",
                                border: "none",
                                background: "white",
                                fontSize: 22,
                                cursor: "pointer",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
                            }}
                        >
                            {saved ? "❤️" : "🤍"}
                        </button>
                    </div>

                    {/* FEATURE PILLS */}
                    <div style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                        marginTop: 20
                    }}>
                        {[
                            "Free cancellation",
                            "Pay at hotel",
                            "Non-smoking",
                            "King bed",
                            "Balcony"
                        ].map((f, i) => (
                            <div key={i} style={{
                                padding: "8px 14px",
                                borderRadius: 999,
                                background: "#eef2ff",
                                color: "#1d4ed8",
                                fontSize: 13,
                                fontWeight: 600
                            }}>
                                {f}
                            </div>
                        ))}
                    </div>

                    {/* HIGHLIGHTS */}
                    <WayzaCard style={{ marginTop: 60 }}>
                        <h3>Highlights</h3>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
                            gap: 16,
                            marginTop: 20
                        }}>
                            {[
                                "Professional guest services",
                                "Rated highly by couples",
                                "Excellent room comfort",
                                "Highly rated by families",
                                "Great location"
                            ].map((item, i) => (
                                <div key={i} style={{
                                    background: "#f8fafc",
                                    padding: 14,
                                    borderRadius: 12,
                                    fontSize: 14
                                }}>
                                    ✔ {item}
                                </div>
                            ))}
                        </div>
                    </WayzaCard>

                    {/* REVIEW BREAKDOWN */}
                    <WayzaCard style={{ marginTop: 60 }}>
                        <h3>Guest Reviews</h3>
                        {[
                            { label: "Cleanliness", value: 4.8 },
                            { label: "Location", value: 4.9 },
                            { label: "Service", value: 4.7 },
                            { label: "Value", value: 4.6 }
                        ].map((item, i) => (
                            <div key={i} style={{ marginTop: 18 }}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: 14,
                                    marginBottom: 6
                                }}>
                                    <span>{item.label}</span>
                                    <strong>{item.value}</strong>
                                </div>
                                <div style={{
                                    height: 6,
                                    background: "#e5e7eb",
                                    borderRadius: 999
                                }}>
                                    <div style={{
                                        width: `${(item.value / 5) * 100}%`,
                                        height: "100%",
                                        background: "#2563eb",
                                        borderRadius: 999
                                    }} />
                                </div>
                            </div>
                        ))}
                    </WayzaCard>
                    <div
                        style={{
                            height: 1,
                            background: "linear-gradient(to right, transparent, #e5e7eb, transparent)",
                            margin: "70px 0"
                        }}
                    />
                    {/* ABOUT */}
                    <WayzaCard style={{ marginTop: 60 }}>
                        <h3>About this property</h3>
                        <p style={{ marginTop: 14, lineHeight: 1.7 }}>
                            {listing.description}
                        </p>
                    </WayzaCard>
                    <div
                        style={{
                            height: 1,
                            background: "linear-gradient(to right, transparent, #e5e7eb, transparent)",
                            margin: "70px 0"
                        }}
                    />
                    {/* AMENITIES */}
                    <WayzaCard style={{ marginTop: 60 }}>
                        <h3>Amenities</h3>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
                            gap: 14,
                            marginTop: 20
                        }}>
                            {amenities.map((a, i) => (
                                <div key={i} style={{
                                    background: "#f3f4f6",
                                    padding: "12px 14px",
                                    borderRadius: 10,
                                    fontSize: 14
                                }}>
                                    ✓ {a}
                                </div>
                            ))}
                        </div>
                    </WayzaCard>
                    <div
                        style={{
                            height: 1,
                            background: "linear-gradient(to right, transparent, #e5e7eb, transparent)",
                            margin: "70px 0"
                        }}
                    />
                    {/* ROOMS */}
                    <h2 style={{ marginTop: 60 }}>Select your room</h2>

                    <WayzaCard style={{ marginTop: 20 }}>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr 1fr",
                            alignItems: "center",
                            gap: 20
                        }}>
                            <div>
                                <strong>Deluxe Room</strong>
                                <div style={{ fontSize: 13, color: "#6b7280" }}>
                                    King bed • 28m² • Balcony • Free WiFi
                                </div>
                            </div>

                            <div style={{ fontWeight: 700 }}>
                                ₹{listing.price}
                            </div>

                            <WayzaButton onClick={handleReserve}>
                                Reserve
                            </WayzaButton>
                        </div>
                    </WayzaCard>
                    <div
                        style={{
                            height: 1,
                            background: "linear-gradient(to right, transparent, #e5e7eb, transparent)",
                            margin: "70px 0"
                        }}
                    />
                    {/* POLICIES */}
                    <WayzaCard style={{ marginTop: 60 }}>
                        <h3>Property Policies</h3>
                        <div style={{ marginTop: 14, fontSize: 14 }}>
                            ✔ Check-in: 2:00 PM – 11:00 PM <br />
                            ✔ Check-out: Before 12:00 PM <br />
                            ✔ No smoking <br />
                            ✔ Pets not allowed
                        </div>
                    </WayzaCard>
                    <div
                        style={{
                            height: 1,
                            background: "linear-gradient(to right, transparent, #e5e7eb, transparent)",
                            margin: "70px 0"
                        }}
                    />
                    {/* HOST */}
                    <WayzaCard style={{ marginTop: 60 }}>
                        <h3>Host</h3>
                        <div style={{ marginTop: 12 }}>
                            <strong>Verified Host</strong>
                            <div style={{ fontSize: 13, color: "#6b7280" }}>
                                Joined in 2024
                            </div>
                        </div>
                    </WayzaCard>

                </div>

                {/* ================= RIGHT BOOKING CARD ================= */}
                <div style={{ position: "sticky", top: 120 }}>
                    <div style={{
                        background: "white",
                        borderRadius: 24,
                        padding: 36,
                        boxShadow: "0 40px 100px rgba(0,0,0,0.12)"
                    }}>

                        <div style={{ fontSize: 13, fontWeight: 700, color: "#ef4444" }}>
                            🔥 20% OFF Today
                        </div>

                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginTop: 8
                        }}>
                            <span style={{
                                fontSize: 16,
                                textDecoration: "line-through",
                                color: "#9ca3af"
                            }}>
                                ₹{listing.price + 700}
                            </span>

                            <span style={{
                                background: "#dc2626",
                                color: "white",
                                fontSize: 12,
                                padding: "4px 8px",
                                borderRadius: 6,
                                fontWeight: 600
                            }}>
                                SAVE ₹700
                            </span>
                        </div>

                        <div style={{
                            fontSize: 36,
                            fontWeight: 800,
                            marginTop: 6
                        }}>
                            ₹{listing.price}
                            <span style={{ fontSize: 14, color: "#6b7280" }}>
                                {" "} / night
                            </span>
                        </div>

                        <div style={{
                            marginTop: 14,
                            background: "#fff7ed",
                            padding: 14,
                            borderRadius: 14,
                            fontSize: 13,
                            color: "#92400e"
                        }}>
                            ⚡ Only 1 room left at this price!
                        </div>

                        <WayzaButton
                            full
                            onClick={handleReserve}
                            style={{
                                marginTop: 24,
                                fontWeight: 700,
                                fontSize: 16,
                                padding: "16px 0",
                                borderRadius: 14
                            }}
                        >
                            Reserve Now – Free Cancellation
                        </WayzaButton>

                        <div style={{
                            marginTop: 18,
                            fontSize: 12,
                            textAlign: "center",
                            color: "#6b7280"
                        }}>
                            ✔ Free cancellation <br />
                            ✔ No prepayment required <br />
                            ✔ Verified property
                        </div>

                    </div>
                </div>

            </div>
        </WayzaLayout>
    );
}