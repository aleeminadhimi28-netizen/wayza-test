import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

// =======================
// LAYOUT + NAVBAR
// =======================
export function WayzaLayout({ children }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const boxRef = useRef(null);

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClick(e) {
            if (boxRef.current && !boxRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div style={{ background: "#ffffff", minHeight: "100vh" }}>

            {/* NAVBAR */}
            <div
                className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm"
            >
                <div
                    className="max-w-7xl mx-auto px-8 flex items-center justify-between py-4 text-gray-800"
                >

                    {/* Logo */}
                    <Link
                        to="/"
                        className="text-2xl font-bold text-blue-700"
                    >
                        Wayza
                    </Link>

                    {/* Center Menu */}
                    <div className="hidden md:flex gap-8 font-medium text-gray-800">
                        <Link to="/">Hotels</Link>
                        <Link to="/">Rent Bikes</Link>
                        <Link to="/">Rent Cars</Link>
                        <Link to="/">Activities</Link>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {!user ? (
                            <>
                                <Link to="/login" className="text-blue-600 font-semibold">
                                    Sign in
                                </Link>

                                <Link
                                    to="/signup"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                                >
                                    Create account
                                </Link>
                            </>
                        ) : (
                            <div ref={boxRef} className="relative">

                                {/* Avatar */}
                                <button
                                    onClick={() => setOpen(prev => !prev)}
                                    className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold hover:bg-blue-700 transition"
                                >
                                    {user.email.charAt(0).toUpperCase()}
                                </button>

                                {/* Dropdown */}
                                {open && (
                                    <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">

                                        <div className="px-5 py-3 text-sm text-gray-500 border-b bg-gray-50 rounded-t-xl">
                                            {user.email}
                                        </div>

                                        <Link
                                            to="/my-bookings"
                                            onClick={() => setOpen(false)}
                                            className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            My Bookings
                                        </Link>

                                        <Link
                                            to="/wishlist"
                                            onClick={() => setOpen(false)}
                                            className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            Wishlist
                                        </Link>

                                        <Link
                                            to="/profile"
                                            onClick={() => setOpen(false)}
                                            className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            My Profile
                                        </Link>

                                        <div className="border-t border-gray-200" />

                                        <button
                                            onClick={() => {
                                                logout();
                                                setOpen(false);
                                                navigate("/");
                                            }}
                                            className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-xl"
                                        >
                                            Logout
                                        </button>

                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* PAGE CONTENT */}
            <div style={{ paddingTop: "110px" }}>
                {children}
            </div>

        </div>
    );
}

// =======================
// CARD
// =======================
export function WayzaCard({ children, style }) {
    return (
        <div
            style={{
                background: "white",
                borderRadius: 12,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                padding: 20,
                ...style
            }}
        >
            {children}
        </div>
    );
}

// =======================
// BUTTON
// =======================
export function WayzaButton({ children, onClick, full }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "12px 18px",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
                width: full ? "100%" : "auto"
            }}
        >
            {children}
        </button>
    );
}

// =======================
// INPUT
// =======================
export function WayzaInput({
    value,
    onChange,
    placeholder,
    type = "text"
}) {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{
                width: "100%",
                padding: "12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                fontSize: 15,
                marginTop: 6,
                marginBottom: 14
            }}
        />
    );
}

// =======================
// HOTEL ITEM
// =======================
export function WayzaHotelItem({ hotel }) {
    return (
        <Link
            to={`/listing/${hotel.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
        >
            <WayzaCard
                style={{
                    display: "flex",
                    gap: 18,
                    marginBottom: 18,
                    alignItems: "center"
                }}
            >
                <img
                    src={hotel.image}
                    alt={hotel.name}
                    style={{
                        width: 160,
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 10
                    }}
                />

                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>
                        {hotel.name}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: 14 }}>
                        {hotel.location}
                    </div>
                </div>

                <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>
                        ₹{hotel.price}
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>
                        per night
                    </div>
                </div>
            </WayzaCard>
        </Link>
    );
}