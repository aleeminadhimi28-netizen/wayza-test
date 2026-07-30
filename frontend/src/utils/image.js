/**
 * @module image
 * @description Advanced image utility supporting CDN auto-formatting, WebP optimization,
 * responsive srcset generation, and reliable fallbacks.
 */

import { BASE_URL } from './api.js';

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80';

/**
 * Normalizes an image path to a full URL.
 * Handles: absolute URLs, relative upload paths, Unsplash URLs, and missing images.
 *
 * @param {string|null|undefined} img - Raw image path from the API
 * @param {string} [fallback] - Optional custom fallback URL
 * @returns {string} Fully qualified image URL
 */
export function fixImg(img, fallback = DEFAULT_FALLBACK) {
  if (!img) return fallback;
  if (img.startsWith('http://') || img.startsWith('https://')) {
    // Auto-optimize Unsplash URLs for WebP & quality
    if (img.includes('images.unsplash.com') && !img.includes('auto=format')) {
      return `${img}&auto=format&fit=crop&q=80`;
    }
    return img;
  }
  if (img.startsWith('/images/')) return img;
  if (img.startsWith('/uploads/')) return `${BASE_URL}${img}`;
  if (img.startsWith('uploads/')) return `${BASE_URL}/${img}`;
  return `${BASE_URL}/uploads/${img}`;
}

/**
 * Generates an optimized CDN image URL with width & quality parameters.
 *
 * @param {string} img - Image URL
 * @param {number} [width=800] - Desired width
 * @param {number} [quality=80] - Desired quality percentage
 * @returns {string} Optimized URL
 */
export function getOptimizedImg(img, width = 800, quality = 80) {
  const url = fixImg(img);
  if (url.includes('images.unsplash.com')) {
    const cleanUrl = url.split('?')[0];
    return `${cleanUrl}?auto=format&fit=crop&w=${width}&q=${quality}`;
  }
  if (url.includes('res.cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},q_${quality},f_auto/`);
  }
  return url;
}

/**
 * Generates responsive srcset string for <img> tags.
 *
 * @param {string} img - Image URL
 * @returns {string} srcset string for 400w, 800w, 1200w
 */
export function getSrcSet(img) {
  const url = fixImg(img);
  if (url.includes('images.unsplash.com')) {
    const cleanUrl = url.split('?')[0];
    return `${cleanUrl}?auto=format&fit=crop&w=400&q=75 400w, ${cleanUrl}?auto=format&fit=crop&w=800&q=80 800w, ${cleanUrl}?auto=format&fit=crop&w=1200&q=85 1200w`;
  }
  return `${url} 1x`;
}
