/**
 * Normalizes an image path to a full URL.
 * Handles: absolute URLs, relative upload paths, and missing images.
 *
 * @param {string|null|undefined} img - Raw image path from the API
 * @param {string} [fallback] - Optional custom fallback URL
 * @returns {string} Fully qualified image URL
 */
const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function fixImg(img, fallback = DEFAULT_FALLBACK) {
  if (!img) return fallback;
  if (img.startsWith('http')) return img;
  if (img.startsWith('uploads/')) return `${BASE}/${img}`;
  return `${BASE}/uploads/${img}`;
}
