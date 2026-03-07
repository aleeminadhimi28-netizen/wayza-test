const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BASE_URL}/api/v1`;

const customFetch = (url, options = {}) => {
    return fetch(url, { ...options, credentials: 'include' });
};

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
};

export const api = {
    // Auth
    login: (credentials) => customFetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
    }).then(r => r.json()),

    signup: (data) => customFetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    logout: () => customFetch(`${API_URL}/auth/logout`, {
        method: "POST"
    }).then(r => r.json()),

    getProfile: () => customFetch(`${API_URL}/auth/me`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    updateProfile: (data) => customFetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    forgotPassword: (email) => customFetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    }).then(r => r.json()),

    resetPassword: (data) => customFetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    // Listings
    getListings: (params) => {
        const query = new URLSearchParams(params).toString();
        return customFetch(`${API_URL}/listings?${query}`).then(r => r.json());
    },
    getListing: (id) => customFetch(`${API_URL}/listings/${id}`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    createListing: (data) => customFetch(`${API_URL}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    deleteListing: (id) => customFetch(`${API_URL}/listings/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    }).then(r => r.json()),

    // Variants
    addVariant: (id, data) => customFetch(`${API_URL}/listings/${id}/variant`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    updateVariant: (id, index, data) => customFetch(`${API_URL}/listings/${id}/variant/${index}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    deleteVariant: (id, index) => customFetch(`${API_URL}/listings/${id}/variant/${index}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    }).then(r => r.json()),

    // Bookings
    book: (data) => customFetch(`${API_URL}/bookings/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    confirmBooking: (data) => customFetch(`${API_URL}/bookings/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    cancelBooking: (data) => customFetch(`${API_URL}/bookings/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    getMyBookings: () => customFetch(`${API_URL}/bookings/my-bookings`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    getListingBookings: (id) => customFetch(`${API_URL}/bookings/${id}`).then(r => r.json()),

    // Partner
    partnerLogin: (credentials) => customFetch(`${API_URL}/partner/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
    }).then(r => r.json()),

    partnerRegister: (data) => customFetch(`${API_URL}/partner/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    partnerStatus: (email) => customFetch(`${API_URL}/partner/status/${email}`).then(r => r.json()),

    partnerOnboard: (data) => customFetch(`${API_URL}/partner/onboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    getPartnerEarnings: () => customFetch(`${API_URL}/partner/earnings`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    getPartnerMonthlyRevenue: () => customFetch(`${API_URL}/partner/monthly-revenue`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    getOwnerListings: (email) => customFetch(`${API_URL}/partner/listings/${email}`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    getPartnerBookings: () => customFetch(`${API_URL}/partner/bookings`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    getPartnerWallet: () => customFetch(`${API_URL}/partner/wallet`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    savePartnerWallet: (data) => customFetch(`${API_URL}/partner/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    requestWithdrawal: (amount) => customFetch(`${API_URL}/partner/wallet/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ amount })
    }).then(r => r.json()),

    getWithdrawals: () => customFetch(`${API_URL}/partner/wallet/requests`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),
    getCalendarSettings: () => customFetch(`${API_URL}/partner/calendar-settings`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    // Admin
    adminLogin: (credentials) => customFetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
    }).then(r => r.json()),

    adminStats: () => customFetch(`${API_URL}/admin/stats`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    adminUsers: () => customFetch(`${API_URL}/admin/users`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    adminPartners: () => customFetch(`${API_URL}/admin/partners`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    adminDeleteUser: (email) => customFetch(`${API_URL}/admin/users/${email}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    }).then(r => r.json()),

    adminDeletePartner: (email) => customFetch(`${API_URL}/admin/partners/${email}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    }).then(r => r.json()),

    adminListings: () => customFetch(`${API_URL}/admin/listings`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    adminDeleteListing: (id) => customFetch(`${API_URL}/admin/listings/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    }).then(r => r.json()),

    adminApproveListing: (id, approved) => customFetch(`${API_URL}/admin/listings/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ approved })
    }).then(r => r.json()),

    adminMuteUser: (email, muted) => customFetch(`${API_URL}/admin/users/${email}/mute`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ muted })
    }).then(r => r.json()),

    adminBookings: () => customFetch(`${API_URL}/admin/bookings`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    adminUpdatePayoutStatus: (id, status) => customFetch(`${API_URL}/admin/bookings/${id}/payout`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status })
    }).then(r => r.json()),

    adminGetWithdrawals: () => customFetch(`${API_URL}/admin/withdrawals`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    adminUpdateWithdrawal: (id, status, reason) => customFetch(`${API_URL}/admin/withdrawals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status, reason })
    }).then(r => r.json()),

    // Misc
    getReviews: (id) => customFetch(`${API_URL}/misc/reviews/${id}`).then(r => r.json()),

    postReview: (data) => customFetch(`${API_URL}/misc/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    getWishlist: () => customFetch(`${API_URL}/misc/wishlist`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    toggleWishlist: (data) => customFetch(`${API_URL}/misc/wishlist/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    // Communication
    getChat: (bookingId) => customFetch(`${API_URL}/comm/chat/${bookingId}`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    sendChat: (bookingId, message) => customFetch(`${API_URL}/comm/chat/${bookingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ message })
    }).then(r => r.json()),

    getNotifications: () => customFetch(`${API_URL}/comm/notifications`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    markNotificationsRead: () => customFetch(`${API_URL}/comm/notifications/read`, {
        method: "POST",
        headers: getAuthHeaders()
    }).then(r => r.json()),

    getSupportTickets: () => customFetch(`${API_URL}/comm/support-tickets`, {
        headers: getAuthHeaders()
    }).then(r => r.json()),

    createSupportTicket: (data) => customFetch(`${API_URL}/comm/support-tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    replyToTicket: (id, data) => customFetch(`${API_URL}/comm/support-tickets/${id}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    deleteTicket: (id) => customFetch(`${API_URL}/comm/support-tickets/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    }).then(r => r.json()),

    // Upload (directly returns path)
    uploadImage: (formData) => customFetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData
    }).then(r => r.json())
};
