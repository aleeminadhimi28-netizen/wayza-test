import React, { lazy, Suspense } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import VerificationSpinner from './components/VerificationSpinner.jsx';
import { CurrencyProvider } from './CurrencyContext.jsx';
import { AuthProvider } from './AuthContext.jsx';
import { ToastProvider } from './ToastContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

// Initialize PostHog
if (typeof window !== 'undefined') {
  const phKey = import.meta.env.VITE_POSTHOG_KEY;
  const phHost = import.meta.env.VITE_POSTHOG_HOST;

  if (phKey && phKey !== 'your_posthog_project_api_key_here') {
    posthog.init(phKey, {
      api_host: phHost || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // We'll handle this manually or let autocapture deal with it
    });
  }
}

/* ================= PUBLIC ================= */
const LandingPage = lazy(() => import('./pages/public/LandingPage.jsx'));
const Listings = lazy(() => import('./pages/public/Listings.jsx'));
const Login = lazy(() => import('./pages/public/Login.jsx'));
const Signup = lazy(() => import('./pages/public/Signup.jsx'));
const MyBookings = lazy(() => import('./pages/public/MyBookings.jsx'));
const ListingDetails = lazy(() => import('./pages/public/ListingDetails.jsx'));
const Booking = lazy(() => import('./pages/public/Booking.jsx'));
const Payment = lazy(() => import('./pages/public/Payment.jsx'));
const PaymentSuccess = lazy(() => import('./pages/public/PaymentSuccess.jsx'));
const Wishlist = lazy(() => import('./pages/public/Wishlist.jsx'));
const SearchMap = lazy(() => import('./pages/public/SearchMap.jsx'));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/public/ResetPassword.jsx'));
const Profile = lazy(() => import('./pages/public/Profile.jsx'));
const BookingSuccess = lazy(() => import('./pages/public/BookingSuccess.jsx'));
const GuestChat = lazy(() => import('./pages/public/GuestChat.jsx'));
const NotFound = lazy(() => import('./pages/public/NotFound.jsx'));
const StaticPages = lazy(() => import('./pages/public/StaticPages.jsx'));
const CustomerSupport = lazy(() => import('./pages/public/CustomerSupport.jsx'));
const ExploreMap = lazy(() => import('./pages/public/ExploreMap.jsx'));
const AITripPlanner = lazy(() => import('./pages/public/AITripPlanner.jsx'));
const Experiences = lazy(() => import('./pages/public/Experiences.jsx'));

const PrivacyPolicy = lazy(() =>
  import('./pages/public/StaticPages.jsx').then((m) => ({ default: m.PrivacyPolicy }))
);
const TermsOfService = lazy(() =>
  import('./pages/public/StaticPages.jsx').then((m) => ({ default: m.TermsOfService }))
);
const AboutUs = lazy(() =>
  import('./pages/public/StaticPages.jsx').then((m) => ({ default: m.AboutUs }))
);

/* ================= PARTNER ================= */
const PartnerLogin = lazy(() => import('./pages/partner/PartnerLogin.jsx'));
const PartnerOnboarding = lazy(() => import('./pages/partner/PartnerOnboarding.jsx'));
const PartnerLayout = lazy(() => import('./layout/PartnerLayout.jsx'));
const PartnerHome = lazy(() => import('./pages/partner/PartnerDashboard.jsx'));
const PartnerListings = lazy(() => import('./pages/partner/PartnerListings.jsx'));
const PartnerBookings = lazy(() => import('./pages/partner/PartnerBookings.jsx'));
const PartnerCreateProperty = lazy(() => import('./pages/partner/PartnerCreateProperty.jsx'));
const PartnerProperty = lazy(() => import('./pages/partner/PartnerProperty.jsx'));
const PartnerReviews = lazy(() => import('./pages/partner/PartnerReviews.jsx'));
const PartnerAnalytics = lazy(() => import('./pages/partner/PartnerAnalytics.jsx'));
const PartnerChat = lazy(() => import('./pages/partner/PartnerChat.jsx'));
const PartnerCalendar = lazy(() => import('./pages/partner/PartnerCalendar.jsx'));
const PartnerEarnings = lazy(() => import('./pages/partner/PartnerEarnings.jsx'));
const PartnerWallet = lazy(() => import('./pages/partner/PartnerWallet.jsx'));
const PartnerRegister = lazy(() => import('./pages/partner/PartnerRegister.jsx'));

/* ================= ADMIN ================= */
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin.jsx'));

/* ================= GUARDS ================= */
import AuthGuard from './AuthGuard.jsx';
import PartnerGuard from './pages/partner/PartnerGuard.jsx';
import AdminGuard from './AdminGuard.jsx';

import 'leaflet/dist/leaflet.css';
import './utils/fixLeafletIcon';
import './index.css';

function AppContent() {
  const location = useLocation();
  return (
    <Suspense
      fallback={
        <VerificationSpinner message="Synchronizing Gateway..." subtext="Loading Portal Modules" />
      }
    >
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/payment/:id" element={<Payment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route
            path="/my-bookings"
            element={
              <AuthGuard>
                <MyBookings />
              </AuthGuard>
            }
          />
          <Route
            path="/wishlist"
            element={
              <AuthGuard>
                <Wishlist />
              </AuthGuard>
            }
          />
          <Route path="/map-search" element={<SearchMap />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/profile"
            element={
              <AuthGuard>
                <Profile />
              </AuthGuard>
            }
          />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route
            path="/guest-chat"
            element={
              <AuthGuard>
                <GuestChat />
              </AuthGuard>
            }
          />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route
            path="/support"
            element={
              <AuthGuard>
                <CustomerSupport />
              </AuthGuard>
            }
          />
          <Route path="/explore-map" element={<ExploreMap />} />
          <Route path="/ai-trip-planner" element={<AITripPlanner />} />
          <Route path="/experiences" element={<Experiences />} />
          <Route path="/partner-login" element={<PartnerLogin />} />
          <Route path="/partner-onboarding" element={<PartnerOnboarding />} />
          <Route path="/partner-register" element={<PartnerRegister />} />
          <Route
            path="/partner"
            element={
              <PartnerGuard>
                <PartnerLayout />
              </PartnerGuard>
            }
          >
            <Route index element={<PartnerHome />} />
            <Route path="properties" element={<PartnerListings />} />
            <Route path="bookings" element={<PartnerBookings />} />
            <Route path="create" element={<PartnerCreateProperty />} />
            <Route path="calendar" element={<PartnerCalendar />} />
            <Route path="earnings" element={<PartnerEarnings />} />
            <Route path="reviews" element={<PartnerReviews />} />
            <Route path="analytics" element={<PartnerAnalytics />} />
            <Route path="chat" element={<PartnerChat />} />
            <Route path="wallet" element={<PartnerWallet />} />
            <Route path="property/:id" element={<PartnerProperty />} />
          </Route>
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            }
          />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

function Root() {
  return (
    <PostHogProvider client={posthog}>
      <HelmetProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <AuthProvider>
              <CurrencyProvider>
                <ToastProvider>
                  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                    <AppContent />
                  </GoogleOAuthProvider>
                </ToastProvider>
              </CurrencyProvider>
            </AuthProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </HelmetProvider>
    </PostHogProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
