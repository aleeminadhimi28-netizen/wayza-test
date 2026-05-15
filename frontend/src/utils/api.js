export const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = `${BASE_URL}/api/v1`;
let memoryCSRFToken = null;

/**
 * Read the CSRF token from the csrf_token cookie
 */
function getCSRFToken() {
  if (memoryCSRFToken) return memoryCSRFToken;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Fetch a fresh CSRF token from the server (sets the cookie automatically)
 */
let csrfPromise = null;
let csrfTokenExpiry = 0;
const CSRF_TTL_MS = 23 * 60 * 60 * 1000; // 23h — refresh before the 24h cookie expires

async function ensureCSRFToken() {
  // Re-fetch if the promise hasn't been set or the token is about to expire
  if (csrfPromise && Date.now() < csrfTokenExpiry) return csrfPromise;

  csrfPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/csrf-token`, { credentials: 'include' });
      const data = await res.json();
      if (data.ok && data.csrfToken) {
        memoryCSRFToken = data.csrfToken;
        csrfTokenExpiry = Date.now() + CSRF_TTL_MS;
        return data.csrfToken;
      }
    } catch {
      // Non-critical — CSRF only enforced in production
    }
    return null;
  })();

  return csrfPromise;
}

/**
 * Call this on logout to force a fresh CSRF token on the next mutating request.
 */
export function clearCSRFToken() {
  csrfPromise = null;
  csrfTokenExpiry = 0;
  memoryCSRFToken = null;
}

// Fetch CSRF token on module load
ensureCSRFToken();

const customFetch = async (url, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const isMutating = !['GET', 'HEAD', 'OPTIONS'].includes(method);

  // Attach CSRF token header on mutating requests
  if (isMutating) {
    await ensureCSRFToken();
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      options.headers = {
        ...options.headers,
        'X-CSRF-Token': csrfToken,
      };
    }
  }

  return fetch(url, { ...options, credentials: 'include' });
};

const getAuthHeaders = () => {
  // Using cookies for authentication, no need for localStorage tokens
  return {};
};

export const api = {
  // Auth
  login: (credentials) =>
    customFetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then((r) => r.json()),

  signup: (data) =>
    customFetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  googleAuth: (credential) =>
    customFetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    }).then((r) => r.json()),

  logout: () =>
    customFetch(`${API_URL}/auth/logout`, {
      method: 'POST',
    }).then((r) => {
      clearCSRFToken(); // Invalidate cached token so next session fetches a fresh one
      return r.json();
    }),

  getProfile: () =>
    customFetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  updateProfile: (data) =>
    customFetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  forgotPassword: (email) =>
    customFetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then((r) => r.json()),

  resetPassword: (data) =>
    customFetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  sendOTP: (email) =>
    customFetch(`${API_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then((r) => r.json()),

  verifyOTP: (data) =>
    customFetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // 2FA
  setup2FA: () =>
    customFetch(`${API_URL}/auth/2fa/setup`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  enable2FA: (token) =>
    customFetch(`${API_URL}/auth/2fa/enable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ token }),
    }).then((r) => r.json()),

  disable2FA: (token) =>
    customFetch(`${API_URL}/auth/2fa/disable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ token }),
    }).then((r) => r.json()),

  verify2FA: (data) =>
    customFetch(`${API_URL}/auth/2fa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // Listings
  getListings: (params) => {
    const query = new URLSearchParams(params).toString();
    return customFetch(`${API_URL}/listings?${query}`).then((r) => r.json());
  },
  getListing: (id) =>
    customFetch(`${API_URL}/listings/${id}`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  createListing: (data) =>
    customFetch(`${API_URL}/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  deleteListing: (id) =>
    customFetch(`${API_URL}/listings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  updateListing: (id, data) =>
    customFetch(`${API_URL}/listings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // Variants
  addVariant: (id, data) =>
    customFetch(`${API_URL}/listings/${id}/variant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updateVariant: (id, index, data) =>
    customFetch(`${API_URL}/listings/${id}/variant/${index}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  deleteVariant: (id, index) =>
    customFetch(`${API_URL}/listings/${id}/variant/${index}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  // Bookings
  book: (data) =>
    customFetch(`${API_URL}/bookings/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  bookListing: (data) => api.book(data),

  confirmBooking: (data) =>
    customFetch(`${API_URL}/bookings/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  createRazorpayOrder: (bookingId) =>
    customFetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ bookingId }),
    }).then((r) => r.json()),

  cancelBooking: (data) =>
    customFetch(`${API_URL}/bookings/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  getMyBookings: () =>
    customFetch(`${API_URL}/bookings/my-bookings`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  getListingBookings: (id) =>
    customFetch(`${API_URL}/bookings/${id}`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),
  getBookedDates: (id) => api.getListingBookings(id),

  checkIn: (id, data) =>
    customFetch(`${API_URL}/bookings/${id}/check-in`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data || {}),
    }).then((r) => r.json()),

  checkOut: (id) =>
    customFetch(`${API_URL}/bookings/${id}/check-out`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  // Partner
  partnerLogin: (credentials) =>
    customFetch(`${API_URL}/partner/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then((r) => r.json()),

  partnerRegister: (data) =>
    customFetch(`${API_URL}/partner/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  partnerStatus: () =>
    customFetch(`${API_URL}/partner/status`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  partnerOnboard: (data) =>
    customFetch(`${API_URL}/partner/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  getPartnerEarnings: () =>
    customFetch(`${API_URL}/partner/earnings`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  getPartnerMonthlyRevenue: () =>
    customFetch(`${API_URL}/partner/monthly-revenue`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  getOwnerListings: (email) =>
    customFetch(`${API_URL}/partner/listings/${email}`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  getPartnerBookings: () =>
    customFetch(`${API_URL}/partner/bookings`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  getPartnerWallet: () =>
    customFetch(`${API_URL}/partner/wallet`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  savePartnerWallet: (data) =>
    customFetch(`${API_URL}/partner/wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  requestWithdrawal: (amount) =>
    customFetch(`${API_URL}/partner/wallet/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ amount }),
    }).then((r) => r.json()),

  getWithdrawals: () =>
    customFetch(`${API_URL}/partner/wallet/requests`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  // Alias used by PartnerWallet
  getWithdrawalRequests: () =>
    customFetch(`${API_URL}/partner/wallet/requests`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  getCalendarSettings: () =>
    customFetch(`${API_URL}/partner/calendar-settings`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  // Admin
  adminLogin: (credentials) =>
    customFetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then((r) => r.json()),

  adminStats: () =>
    customFetch(`${API_URL}/admin/stats`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  adminUsers: () =>
    customFetch(`${API_URL}/admin/users`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  adminPartners: () =>
    customFetch(`${API_URL}/admin/partners`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  adminCreatePartner: (data) =>
    customFetch(`${API_URL}/admin/partners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  adminDeleteUser: (email) =>
    customFetch(`${API_URL}/admin/users/${email}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  adminDeletePartner: (email) =>
    customFetch(`${API_URL}/admin/partners/${email}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  adminApprovePartner: (email) =>
    customFetch(`${API_URL}/admin/partners/${email}/approve`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  adminListings: () =>
    customFetch(`${API_URL}/admin/listings`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  adminDeleteListing: (id) =>
    customFetch(`${API_URL}/admin/listings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  adminApproveListing: (id, approved) =>
    customFetch(`${API_URL}/admin/listings/${id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ approved }),
    }).then((r) => r.json()),

  adminMuteUser: (email, muted) =>
    customFetch(`${API_URL}/admin/users/${email}/mute`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ muted }),
    }).then((r) => r.json()),

  adminBookings: () =>
    customFetch(`${API_URL}/admin/bookings`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  adminUpdatePayoutStatus: (id, status) =>
    customFetch(`${API_URL}/admin/bookings/${id}/payout`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status }),
    }).then((r) => r.json()),

  adminGetWithdrawals: () =>
    customFetch(`${API_URL}/admin/withdrawals`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  adminUpdateWithdrawal: (id, status, reason) =>
    customFetch(`${API_URL}/admin/withdrawals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status, reason }),
    }).then((r) => r.json()),

  adminGetCoupons: () =>
    customFetch(`${API_URL}/admin/coupons`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  adminGetLogs: () =>
    customFetch(`${API_URL}/admin/logs`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  adminCreateCoupon: (data) =>
    customFetch(`${API_URL}/admin/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  adminDeleteCoupon: (id) =>
    customFetch(`${API_URL}/admin/coupons/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  // Misc
  validateCoupon: (code) =>
    customFetch(`${API_URL}/misc/validate-coupon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ code }),
    }).then((r) => r.json()),
  getReviews: (id) => customFetch(`${API_URL}/misc/reviews/${id}`).then((r) => r.json()),

  postReview: (data) =>
    customFetch(`${API_URL}/misc/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  getWishlist: () =>
    customFetch(`${API_URL}/misc/wishlist`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  toggleWishlist: (data) =>
    customFetch(`${API_URL}/misc/wishlist/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // AI Trip Planner
  generateTrip: (data) =>
    customFetch(`${API_URL}/misc/trip-planner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // Communication
  getChat: (bookingId) =>
    customFetch(`${API_URL}/comm/chat/${bookingId}`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  sendChat: (bookingId, message) =>
    customFetch(`${API_URL}/comm/chat/${bookingId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ message }),
    }).then((r) => r.json()),

  getNotifications: () =>
    customFetch(`${API_URL}/comm/notifications`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  markNotificationsRead: () =>
    customFetch(`${API_URL}/comm/notifications/read`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  getSupportTickets: () =>
    customFetch(`${API_URL}/comm/support-tickets`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  createSupportTicket: (data) =>
    customFetch(`${API_URL}/comm/support-tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  replyToTicket: (id, data) =>
    customFetch(`${API_URL}/comm/support-tickets/${id}/reply`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  deleteTicket: (id) =>
    customFetch(`${API_URL}/comm/support-tickets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  // Misc
  getPlatformConfig: () => customFetch(`${API_URL}/misc/config`).then((r) => r.json()),
  updatePlatformConfig: (data) =>
    customFetch(`${API_URL}/admin/config`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  subscribeNewsletter: (email) =>
    customFetch(`${API_URL}/misc/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then((r) => r.json()),

  // Upload (directly returns path)
  uploadImage: (formData) =>
    customFetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    }).then((r) => r.json()),
};
