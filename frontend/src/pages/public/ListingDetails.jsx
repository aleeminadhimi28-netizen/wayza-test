import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { WayzaLayout, WayzaCard, WayzaButton } from "../../WayzaUI.jsx";
import { useAuth } from "../../AuthContext.jsx";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MapView from "../../components/MapView.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ListingDetails() {

    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [listing, setListing] = useState(null);
    const [saved, setSaved] = useState(false);

    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);

    const [checkIn, setCheckIn] = useState(null);
    const [checkOut, setCheckOut] = useState(null);


    /* ---------------- IMAGE FIX ---------------- */

    const fixImg = (img) => {

        if (!img) return "https://picsum.photos/900/600";
        if (img.startsWith("http")) return img;
        if (img.startsWith("uploads/")) return `${API}/${img}`;

        return `${API}/uploads/${img}`;

    };


    /* ---------------- FETCH DATA ---------------- */

    useEffect(() => {

        fetch(`${API}/listings/${id}`)
            .then(r => r.json())
            .then(json => {

                const data = json.data || json;
                setListing(data);

            });

        const token = localStorage.getItem("token");

        if (token) {

            fetch(`${API}/wishlist`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(r => r.json())
                .then(json => {

                    const list = Array.isArray(json.data) ? json.data : [];
                    const found = list.some(x => x.listingId === id);
                    setSaved(found);

                });

        }

    }, [id]);


    /* ---------------- WISHLIST ---------------- */

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


    /* ---------------- BOOKING ---------------- */

    const handleReserve = () => {

        if (!user) {
            navigate("/login", { state: { from: location } });
            return;
        }

        navigate(`/booking/${id}`);

    };


    /* ---------------- LOADING ---------------- */

    if (!listing) {

        return (
            <WayzaLayout>
                <div style={{ padding: 40 }}>Loading...</div>
            </WayzaLayout>
        );

    }


    /* ---------------- IMAGES ---------------- */

    let images = (listing.images || []).map(fixImg);

    while (images.length < 5) {
        images.push(`https://picsum.photos/800/600?random=${images.length}`);
    }

    const next = () => setGalleryIndex((galleryIndex + 1) % images.length);
    const prev = () => setGalleryIndex((galleryIndex - 1 + images.length) % images.length);


    /* ---------------- PRICE CALC ---------------- */

    let nights = 0;

    if (checkIn && checkOut) {
        nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    }

    const totalPrice = nights * listing.price;


    /* ---------------- UI ---------------- */

    return (

        <WayzaLayout>

            <div style={{
                maxWidth: 1200,
                margin: "60px auto",
                padding: "0 20px"
            }}>

                <h1 style={{ fontSize: 34, fontWeight: 800 }}>
                    {listing.title}
                </h1>

                <div style={{ color: "#6b7280", marginTop: 6 }}>
                    📍 {listing.location}
                </div>


                {/* ⭐ IMAGE GALLERY */}

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr",
                    gridTemplateRows: "200px 200px",
                    gap: 10,
                    marginTop: 30,
                    position: "relative"
                }}>

                    <img
                        src={images[0]}
                        onClick={() => { setGalleryOpen(true); setGalleryIndex(0) }}
                        style={{
                            gridRow: "1 / span 2",
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 16,
                            cursor: "pointer"
                        }}
                    />

                    {images.slice(1, 5).map((img, i) => (

                        <img
                            key={i}
                            src={img}
                            onClick={() => { setGalleryOpen(true); setGalleryIndex(i + 1) }}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: 16,
                                cursor: "pointer"
                            }}
                        />

                    ))}

                    <button
                        onClick={() => { setGalleryOpen(true); setGalleryIndex(0) }}
                        style={{
                            position: "absolute",
                            bottom: 20,
                            right: 20,
                            background: "white",
                            border: "none",
                            padding: "10px 16px",
                            borderRadius: 10,
                            fontWeight: 600,
                            cursor: "pointer",
                            boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
                        }}
                    >
                        Show all photos
                    </button>

                </div>


                {/* ⭐ DATE PICKER */}

                <WayzaCard style={{ marginTop: 40 }}>

                    <h3>Select dates</h3>

                    <div style={{ display: "flex", gap: 20, marginTop: 20 }}>

                        <div>
                            <label>Check‑in</label>

                            <DatePicker
                                selected={checkIn}
                                onChange={(date) => setCheckIn(date)}
                                minDate={new Date()}
                                placeholderText="Select date"
                            />

                        </div>

                        <div>
                            <label>Check‑out</label>

                            <DatePicker
                                selected={checkOut}
                                onChange={(date) => setCheckOut(date)}
                                minDate={checkIn || new Date()}
                                placeholderText="Select date"
                            />

                        </div>

                    </div>

                    {nights > 0 && (

                        <div style={{ marginTop: 20, fontWeight: 600 }}>
                            {nights} nights × ₹{listing.price} = ₹{totalPrice}
                        </div>

                    )}

                </WayzaCard>


                {/* ⭐ MAP */}

                {/* ⭐ MAP */}

                <WayzaCard style={{ marginTop: 40 }}>

                    <h3>Location</h3>

                    <MapView
                        lat={listing?.lat || 8.7379}
                        lng={listing?.lng || 76.7163}
                        title={listing?.title}
                    />

                </WayzaCard>

                {/* ROOM */}

                <h2 style={{ marginTop: 40 }}>Select your room</h2>

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
                                King bed • Balcony • Free WiFi
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

            </div>


            {/* ⭐ FULLSCREEN GALLERY */}

            {galleryOpen && (

                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0,0,0,0.95)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999
                }}>

                    <button
                        onClick={() => setGalleryOpen(false)}
                        style={{
                            position: "absolute",
                            top: 30,
                            right: 40,
                            fontSize: 32,
                            background: "none",
                            border: "none",
                            color: "white",
                            cursor: "pointer"
                        }}
                    >
                        ✕
                    </button>

                    <button
                        onClick={prev}
                        style={{
                            position: "absolute",
                            left: 40,
                            fontSize: 40,
                            background: "none",
                            border: "none",
                            color: "white",
                            cursor: "pointer"
                        }}
                    >
                        ‹
                    </button>

                    <img
                        src={images[galleryIndex]}
                        style={{
                            maxWidth: "90%",
                            maxHeight: "90%",
                            borderRadius: 10
                        }}
                    />

                    <button
                        onClick={next}
                        style={{
                            position: "absolute",
                            right: 40,
                            fontSize: 40,
                            background: "none",
                            border: "none",
                            color: "white",
                            cursor: "pointer"
                        }}
                    >
                        ›
                    </button>

                </div>

            )}

        </WayzaLayout>

    );

}