import React, { useEffect, useState } from "react";
import { WayzaLayout, WayzaHotelItem } from "../../WayzaUI.jsx";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function LandingPage() {
    const navigate = useNavigate();

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [tab, setTab] = useState("hotels");
    const [search, setSearch] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(2);
    const [showGuests, setShowGuests] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [hover, setHover] = useState(false);

    const premiumField = {
        flex: 1,
        minWidth: 150,
        padding: 18,
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        background: "#fafafa",
        fontSize: 15
    };

    const fixImg = (img) => {
        if (!img) return "https://picsum.photos/400/300";
        if (img.startsWith("http")) return img;
        return `${API}/uploads/${img}`;
    };

    useEffect(() => {
        fetch(`${API}/listings`)
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data)) setListings(data);
                else setListings([]);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (search) params.set("location", search);
        if (checkIn) params.set("start", checkIn);
        if (checkOut) params.set("end", checkOut);
        if (guests) params.set("guests", guests);
        navigate(`/listings?${params.toString()}`);
    };

    const filtered = listings.filter((l) => {
        const title = (l.title || "").toLowerCase();
        const location = (l.location || "").toLowerCase();
        const q = search.toLowerCase();
        return title.includes(q) || location.includes(q);
    });

    const varkalaSpots = [
        {
            name: "Varkala Cliff",
            description: "Famous red cliffs overlooking the Arabian Sea.",
            image:
                "https://images.unsplash.com/photo-1596402184320-417e7178b2cd"
        },
        {
            name: "Varkala Beach",
            description: "Golden sands and sunset views.",
            image:
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
        },
        {
            name: "Janardanaswamy Temple",
            description: "Historic temple over 2000 years old.",
            image:
                "https://images.unsplash.com/photo-1609947017136-9daf32a5eb16"
        },
        {
            name: "Kappil Beach",
            description: "Where backwaters meet the sea.",
            image:
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
        }
    ];

    const footerTitle = {
        fontSize: 16,
        fontWeight: 700,
        marginBottom: 18,
        color: "white"
    };

    const footerList = {
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        opacity: 0.75,
        cursor: "pointer"
    };

    return (
        <WayzaLayout>

            {/* ================= HERO ================= */}
            <section
                style={{
                    position: "relative",
                    background: `
            linear-gradient(rgba(11,18,32,0.55), rgba(30,58,138,0.75)),
            url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e")
          `,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: "fixed",
                    padding: "200px 20px 260px",
                    textAlign: "center",
                    color: "white",
                    borderBottomLeftRadius: 60,
                    borderBottomRightRadius: 60,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {/* Glow */}
                <div
                    style={{
                        position: "absolute",
                        width: 600,
                        height: 600,
                        background:
                            "radial-gradient(circle,rgba(59,130,246,0.25),transparent 70%)",
                        top: -200,
                        right: -200,
                        filter: "blur(60px)"
                    }}
                />

                <h1 style={{ fontSize: 64, fontWeight: 800 }}>
                    Discover your next escape
                </h1>
                <p style={{ fontSize: 20, opacity: 0.9 }}>
                    Hotels, bikes, cars & experiences — all in one place.
                </p>
            </section>

            {/* ================= FLOATING SEARCH ================= */}
            <div
                style={{
                    maxWidth: 1100,
                    margin: "-160px auto 60px",
                    padding: "0 20px",
                    position: "relative",
                    zIndex: 10
                }}
            >
                <div
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    style={{
                        background: "rgba(255,255,255,0.95)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 30,
                        padding: 40,
                        transition: "0.3s",
                        boxShadow: hover
                            ? "0 50px 120px rgba(0,0,0,0.25)"
                            : "0 30px 80px rgba(0,0,0,0.18)"
                    }}
                >
                    {/* Tabs */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 30 }}>
                        {["hotels", "bikes", "cars"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                style={{
                                    padding: "10px 26px",
                                    borderRadius: 40,
                                    border: "none",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    background: tab === t ? "#1e3a8a" : "#f3f4f6",
                                    color: tab === t ? "white" : "#334155"
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Fields */}
                    <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
                        <input
                            placeholder={`Search ${tab} location`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ ...premiumField, flex: 2 }}
                        />
                        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} style={premiumField} />
                        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={premiumField} />

                        {/* Guest Selector */}
                        <div style={{ position: "relative", flex: 1 }}>
                            <div
                                onClick={() => setShowGuests(!showGuests)}
                                style={{ ...premiumField, cursor: "pointer" }}
                            >
                                {guests} Guests ▾
                            </div>

                            {showGuests && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 70,
                                        width: "100%",
                                        background: "white",
                                        padding: 15,
                                        borderRadius: 12,
                                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <button onClick={() => setGuests(Math.max(1, guests - 1))}>−</button>
                                        <strong>{guests}</strong>
                                        <button onClick={() => setGuests(guests + 1)}>+</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSearch}
                            style={{
                                padding: "18px 35px",
                                borderRadius: 18,
                                background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                                color: "white",
                                border: "none",
                                fontWeight: 700,
                                cursor: "pointer"
                            }}
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* ================= MAP TOGGLE ================= */}
            <div style={{ textAlign: "center", marginTop: 40 }}>
                <button
                    onClick={() => setShowMap(!showMap)}
                    style={{
                        padding: "10px 22px",
                        borderRadius: 10,
                        border: "1px solid #ddd",
                        cursor: "pointer",
                        background: "white",
                        fontWeight: 600
                    }}
                >
                    {showMap ? "Hide map" : "Show map"}
                </button>
            </div>

            {showMap && (
                <div
                    style={{
                        height: 400,
                        margin: 30,
                        background: "#e5e7eb",
                        borderRadius: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    Map placeholder
                </div>
            )}
            {/* ================= EXPLORE VARKALA ================= */}

            <section
                style={{
                    background: "#f8fafc",
                    padding: "100px 20px",
                }}
            >
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <h2
                        style={{
                            fontSize: 44,
                            fontWeight: 800,
                            marginBottom: 12
                        }}
                    >
                        Explore Varkala
                    </h2>

                    <p
                        style={{
                            color: "#6b7280",
                            marginBottom: 50,
                            fontSize: 16
                        }}
                    >
                        Discover the most iconic spots around Varkala.
                    </p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                            gap: 28
                        }}
                    >
                        {[
                            {
                                name: "Varkala Cliff",
                                description: "Famous red cliffs overlooking the Arabian Sea.",
                                image:
                                    "https://images.unsplash.com/photo-1596402184320-417e7178b2cd"
                            },
                            {
                                name: "Varkala Beach",
                                description: "Golden sands and stunning sunset views.",
                                image:
                                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
                            },
                            {
                                name: "Janardanaswamy Temple",
                                description: "Historic temple dating back over 2000 years.",
                                image:
                                    "https://images.unsplash.com/photo-1609947017136-9daf32a5eb16"
                            },
                            {
                                name: "Kappil Beach",
                                description: "A serene beach where backwaters meet the sea.",
                                image:
                                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
                            }
                        ].map((spot, i) => (
                            <div
                                key={i}
                                onClick={() => navigate(`/listings?location=${spot.name}`)}
                                style={{
                                    position: "relative",
                                    height: 320,
                                    borderRadius: 24,
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    transition: "0.4s ease",
                                    boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = "translateY(-8px)";
                                    e.currentTarget.style.boxShadow =
                                        "0 35px 80px rgba(0,0,0,0.25)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow =
                                        "0 20px 60px rgba(0,0,0,0.15)";
                                }}
                            >
                                <img
                                    src={spot.image}
                                    alt={spot.name}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover"
                                    }}
                                />

                                {/* Gradient Overlay */}
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        background:
                                            "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.1))"
                                    }}
                                />

                                {/* Text */}
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: 22,
                                        left: 22,
                                        color: "white"
                                    }}
                                >
                                    <h3
                                        style={{
                                            fontSize: 22,
                                            fontWeight: 700,
                                            marginBottom: 6
                                        }}
                                    >
                                        {spot.name}
                                    </h3>

                                    <p
                                        style={{
                                            fontSize: 14,
                                            opacity: 0.85
                                        }}
                                    >
                                        {spot.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* ================= LISTINGS ================= */}
            <section style={{ maxWidth: 1100, margin: "80px auto", padding: "0 20px" }}>
                {loading && <p>Loading listings...</p>}
                {!loading &&
                    filtered.map((l) => (
                        <WayzaHotelItem
                            key={l._id}
                            hotel={{
                                id: l._id,
                                name: l.title,
                                location: l.location || "Varkala",
                                price: l.price,
                                image: fixImg(l.image)
                            }}
                        />
                    ))}
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="bg-gray-900 text-gray-300 mt-24">

                <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">

                    {/* Brand */}
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">
                            Wayza
                        </h3>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Discover the best stays, beaches, and experiences in Varkala.
                            Your next escape starts here.
                        </p>
                    </div>

                    {/* Explore */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Explore</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="hover:text-white cursor-pointer transition">Hotels</li>
                            <li className="hover:text-white cursor-pointer transition">Rent Bikes</li>
                            <li className="hover:text-white cursor-pointer transition">Rent Cars</li>
                            <li className="hover:text-white cursor-pointer transition">Activities</li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="hover:text-white cursor-pointer transition">About</li>
                            <li className="hover:text-white cursor-pointer transition">Careers</li>
                            <li className="hover:text-white cursor-pointer transition">Partners</li>
                            <li className="hover:text-white cursor-pointer transition">Contact</li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="hover:text-white cursor-pointer transition">Help Center</li>
                            <li className="hover:text-white cursor-pointer transition">Booking Policy</li>
                            <li className="hover:text-white cursor-pointer transition">Cancellation</li>
                            <li className="hover:text-white cursor-pointer transition">Privacy Policy</li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 text-center py-6 text-sm text-gray-500">
                    © {new Date().getFullYear()} Wayza. Built for Varkala.
                </div>

            </footer>

        </WayzaLayout>
    );
}