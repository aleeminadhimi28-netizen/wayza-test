const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BASE_URL}/api/v1`;

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
};

export const api = {
    // Auth
    login: (credentials) => fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
    }).then(r => r.json()),

    signup: (data) => fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    getProfile: () => fetch(`${API_URL}/auth/profile`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    updateProfile: (data) => fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    forgotPassword: (email) => fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    }).then(r => r.json()),

    resetPassword: (data) => fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    // Listings
    getListings: (params) => {
        const query = new URLSearchParams(params).toString();
        return fetch(`${API_URL}/listings?${query}`).then(r => r.json());
    },
    getListing: (id) => fetch(`${API_URL}/listings/${id}`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    createListing: (data) => fetch(`${API_URL}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    deleteListing: (id) => fetch(`${API_URL}/listings/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    }).then(r => r.json()),

    // Variants
    addVariant: (id, data) => fetch(`${API_URL}/listings/${id}/variant`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    updateVariant: (id, index, data) => fetch(`${API_URL}/listings/${id}/variant/${index}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    deleteVariant: (id, index) => fetch(`${API_URL}/listings/${id}/variant/${index}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    }).then(r => r.json()),

    // Bookings
    book: (data) => fetch(`${API_URL}/bookings/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    confirmBooking: (data) => fetch(`${API_URL}/bookings/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    cancelBooking: (data) => fetch(`${API_URL}/bookings/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    getMyBookings: () => fetch(`${API_URL}/bookings/my-bookings`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    getListingBookings: (id) => fetch(`${API_URL}/bookings/${id}`).then(r => r.json()),

    // Partner
    partnerLogin: (credentials) => fetch(`${API_URL}/partner/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
    }).then(r => r.json()),

    partnerRegister: (data) => fetch(`${API_URL}/partner/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    partnerStatus: (email) => fetch(`${API_URL}/partner/status/${email}`).then(r => r.json()),

    partnerOnboard: (data) => fetch(`${API_URL}/partner/onboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    getPartnerEarnings: () => fetch(`${API_URL}/partner/earnings`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    getPartnerMonthlyRevenue: () => fetch(`${API_URL}/partner/monthly-revenue`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    getOwnerListings: (email) => fetch(`${API_URL}/partner/listings/${email}`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    getPartnerBookings: () => fetch(`${API_URL}/partner/bookings`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    getPartnerWallet: () => fetch(`${API_URL}/partner/wallet`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    savePartnerWallet: (data) => fetch(`${API_URL}/partner/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    requestWithdrawal: (amount) => fetch(`${API_URL}/partner/wallet/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ amount })
    }).then(r => r.json()),

    getWithdrawalRequests: () => fetch(`${API_URL}/partner/wallet/requests`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    // Admin
    adminLogin: (credentials) => fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
    }).then(r => r.json()),

    adminStats: () => fetch(`${API_URL}/admin/stats`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    adminUsers: () => fetch(`${API_URL}/admin/users`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    adminPartners: () => fetch(`${API_URL}/admin/partners`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    adminDeleteUser: (email) => fetch(`${API_URL}/admin/users/${email}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    }).then(r => r.json()),

    adminDeletePartner: (email) => fetch(`${API_URL}/admin/partners/${email}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    }).then(r => r.json()),

    adminListings: () => fetch(`${API_URL}/admin/listings`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    adminDeleteListing: (id) => fetch(`${API_URL}/admin/listings/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    }).then(r => r.json()),

    adminApproveListing: (id, approved) => fetch(`${API_URL}/admin/listings/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ approved })
    }).then(r => r.json()),

    adminMuteUser: (email, muted) => fetch(`${API_URL}/admin/users/${email}/mute`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ muted })
    }).then(r => r.json()),

    adminBookings: () => fetch(`${API_URL}/admin/bookings`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    adminUpdatePayoutStatus: (id, status) => fetch(`${API_URL}/admin/bookings/${id}/payout`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status })
    }).then(r => r.json()),

    adminGetWithdrawals: () => fetch(`${API_URL}/admin/withdrawals`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    adminUpdateWithdrawal: (id, status, reason) => fetch(`${API_URL}/admin/withdrawals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status, reason })
    }).then(r => r.json()),

    // Misc
    getReviews: (id) => fetch(`${API_URL}/misc/reviews/${id}`).then(r => r.json()),

    postReview: (data) => fetch(`${API_URL}/misc/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    getWishlist: () => fetch(`${API_URL}/misc/wishlist`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    toggleWishlist: (data) => fetch(`${API_URL}/misc/wishlist/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    // Communication
    getChat: (bookingId) => fetch(`${API_URL}/comm/chat/${bookingId}`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    sendChat: (bookingId, message) => fetch(`${API_URL}/comm/chat/${bookingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ message })
    }).then(r => r.json()),

    getNotifications: () => fetch(`${API_URL}/comm/notifications`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    markNotificationsRead: () => fetch(`${API_URL}/comm/notifications/read`, {
        method: "POST",
        headers: getAuthHeaders()
    }).then(r => r.json()),

    getSupportTickets: () => fetch(`${API_URL}/comm/support-tickets`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    createSupportTicket: (data) => fetch(`${API_URL}/comm/support-tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    replyToTicket: (id, data) => fetch(`${API_URL}/comm/support-tickets/${id}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    deleteTicket: (id) => fetch(`${API_URL}/comm/support-tickets/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    }).then(r => r.json()),

    // Upload (directly returns path)
    uploadImage: (formData) => fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData
    }).then(r => r.json())
};
