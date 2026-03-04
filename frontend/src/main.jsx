import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

/* ================= PUBLIC ================= */

import LandingPage from "./pages/public/LandingPage.jsx";
import Listings from "./pages/public/Listings.jsx";
import Login from "./pages/public/Login.jsx";
import Signup from "./pages/public/Signup.jsx";
import MyBookings from "./pages/public/MyBookings.jsx";
import ListingDetails from "./pages/public/ListingDetails.jsx";
import Booking from "./pages/public/Booking.jsx";
import Payment from "./pages/public/Payment.jsx";
import PaymentSuccess from "./pages/public/PaymentSuccess.jsx";
import Wishlist from "./pages/public/Wishlist.jsx";

/* ================= PARTNER ================= */

import PartnerLogin from "./pages/partner/PartnerLogin.jsx";
import PartnerOnboarding from "./pages/partner/PartnerOnboarding.jsx";
import PartnerLayout from "./layout/PartnerLayout.jsx";

import PartnerHome from "./pages/partner/PartnerDashboard.jsx";
import PartnerListings from "./pages/partner/PartnerListings.jsx";
import PartnerBookings from "./pages/partner/PartnerBookings.jsx";
import PartnerCreateProperty from "./pages/partner/PartnerCreateProperty.jsx";
import PartnerProperty from "./pages/partner/PartnerProperty.jsx";
import PartnerReviews from "./pages/partner/PartnerReviews.jsx";
import PartnerAnalytics from "./pages/partner/PartnerAnalytics.jsx";
import PartnerChat from "./pages/partner/PartnerChat.jsx";
import PartnerCalendar from "./pages/partner/PartnerCalendar.jsx";
import PartnerEarnings from "./pages/partner/PartnerEarnings.jsx";

/* ================= ADMIN ================= */

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

/* ================= CONTEXT ================= */

import { AuthProvider } from "./AuthContext.jsx";
import { ToastProvider } from "./ToastContext.jsx";

import "./index.css";

/* ================= ROUTES ================= */

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>

                {/* ===== PUBLIC ===== */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/listing/:id" element={<ListingDetails />} />
                <Route path="/booking/:id" element={<Booking />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/payment/:id" element={<Payment />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/wishlist" element={<Wishlist />} />

                {/* ===== PARTNER AUTH ===== */}
                <Route path="/partner-login" element={<PartnerLogin />} />
                <Route path="/partner-onboarding" element={<PartnerOnboarding />} />

                {/* ===== PARTNER DASHBOARD (NESTED) ===== */}
                <Route path="/partner" element={<PartnerLayout />}>

                    <Route index element={<PartnerHome />} />
                    <Route path="properties" element={<PartnerListings />} />
                    <Route path="calendar" element={<PartnerCalendar />} />
                    <Route path="earnings" element={<PartnerEarnings />} />
                    <Route path="reviews" element={<PartnerReviews />} />
                    <Route path="analytics" element={<PartnerAnalytics />} />
                    <Route path="chat" element={<PartnerChat />} />
                    <Route path="property/:id" element={<PartnerProperty />} />

                </Route>

                {/* ===== ADMIN ===== */}
                <Route path="/admin" element={<AdminDashboard />} />

            </Routes>
        </AnimatePresence>
    );
}

/* ================= APP ================= */

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <BrowserRouter>
                    <AnimatedRoutes />
                </BrowserRouter>
            </ToastProvider>
        </AuthProvider>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);