/**
 * @module og
 * @description Dynamic Open Graph snapshot route for listing detail pages.
 *
 * Serves a minimal, pure-HTML page (no JS) for /api/v1/og/:id that contains:
 *   - Correct <title> with the listing name + Wayzza branding
 *   - Full Open Graph meta tags (image, price, description)
 *   - JSON-LD LodgingBusiness / Product schema
 *   - A "View Full Listing" link redirecting to the real SPA page
 *
 * Used by Vercel Edge rewrites to serve bots that request /listing/:id.
 * Bot detection (User-Agent matching) happens in vercel.json rewrites.
 *
 * Because this route is purely for crawlers / link-preview bots, it:
 *   - Has no auth requirement
 *   - Is rate-limited to 60 req/min via the global limiter (already applied in server.js)
 *   - Caches the response for 1 hour via Cache-Control
 */
import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

const router = express.Router();

const SITE_URL = "https://wayzza.live";
const DEFAULT_IMG = `${SITE_URL}/images/varkala_hero.webp`;

/**
 * Escape HTML to prevent XSS in server-rendered attributes/text.
 */
function esc(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/**
 * Pick the best image URL from a listing document.
 */
function pickImage(listing) {
    const img = listing.images?.[0] || listing.image || DEFAULT_IMG;
    if (!img) return DEFAULT_IMG;
    if (img.startsWith("http")) return img;
    return `${SITE_URL}/${img.replace(/^\//, "")}`;
}

/**
 * Format a price in INR for display.
 */
function formatPrice(price) {
    if (!price || isNaN(price)) return null;
    return `₹${Number(price).toLocaleString("en-IN")} / night`;
}

/**
 * Build a minimal JSON-LD schema for the listing based on its category.
 */
function buildSchema(listing, url, imageUrl) {
    const isVehicle = ["car", "bike", "scooter", "vehicle"].includes(
        (listing.category || "").toLowerCase()
    );

    if (isVehicle) {
        return JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": url,
            name: listing.title,
            description: listing.description || `${listing.title} available for rent in Varkala, Kerala.`,
            image: imageUrl,
            brand: { "@type": "Brand", name: "Wayzza" },
            offers: listing.price
                ? {
                      "@type": "Offer",
                      priceCurrency: "INR",
                      price: listing.price,
                      availability: "https://schema.org/InStock",
                      url,
                  }
                : undefined,
        });
    }

    // Default: LodgingBusiness for villas / hotels
    return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LodgingBusiness",
        "@id": url,
        name: listing.title,
        description:
            listing.description ||
            `Premium ${listing.category || "villa"} in ${listing.location || "Varkala"}, Kerala — curated by Wayzza.`,
        image: imageUrl,
        url,
        address: {
            "@type": "PostalAddress",
            addressLocality: listing.location || "Varkala",
            addressRegion: "Kerala",
            addressCountry: "IN",
        },
        geo: listing.latitude && listing.longitude
            ? {
                  "@type": "GeoCoordinates",
                  latitude: listing.latitude,
                  longitude: listing.longitude,
              }
            : undefined,
        priceRange: listing.price ? `₹${listing.price}` : "₹₹₹",
        aggregateRating:
            listing.avgRating && listing.reviewCount
                ? {
                      "@type": "AggregateRating",
                      ratingValue: listing.avgRating,
                      reviewCount: listing.reviewCount,
                  }
                : undefined,
        amenityFeature: (listing.amenities || []).slice(0, 10).map((a) => ({
            "@type": "LocationFeatureSpecification",
            name: a,
            value: true,
        })),
    });
}

/**
 * GET /api/v1/og/:id
 *
 * Returns a minimal static HTML page for the given listing ID.
 * Intended for crawler / bot consumption only.
 */
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).send("Invalid listing ID");
        }

        const db = getDB();
        const listing = await db
            .collection("listings")
            .findOne(
                { _id: new ObjectId(id), approved: true },
                {
                    projection: {
                        title: 1,
                        description: 1,
                        image: 1,
                        images: 1,
                        price: 1,
                        location: 1,
                        category: 1,
                        latitude: 1,
                        longitude: 1,
                        amenities: 1,
                        avgRating: 1,
                        reviewCount: 1,
                    },
                }
            );

        if (!listing) {
            return res.status(404).send("Listing not found");
        }

        const listingUrl = `${SITE_URL}/listing/${id}`;
        const imageUrl = pickImage(listing);
        const priceDisplay = formatPrice(listing.price);
        const titleEsc = esc(listing.title);
        const descRaw =
            listing.description ||
            `Premium ${listing.category || "villa"} in ${listing.location || "Varkala"}, Kerala — curated by Wayzza.`;
        const descEsc = esc(descRaw.slice(0, 300));
        const locationEsc = esc(listing.location || "Varkala, Kerala");
        const schemaJson = buildSchema(listing, listingUrl, imageUrl);

        const ogTitle = `${titleEsc} — Wayzza Varkala`;
        const ogDesc = priceDisplay ? `${priceDisplay} · ${descEsc}` : descEsc;

        // Cache for 1 hour — bots don't need real-time pricing
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
        res.setHeader("X-Robots-Tag", "index, follow");

        res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${ogTitle}</title>
  <meta name="description" content="${ogDesc}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="canonical" href="${esc(listingUrl)}" />

  <!-- Open Graph -->
  <meta property="og:type" content="product" />
  <meta property="og:url" content="${esc(listingUrl)}" />
  <meta property="og:title" content="${ogTitle}" />
  <meta property="og:description" content="${ogDesc}" />
  <meta property="og:image" content="${esc(imageUrl)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Wayzza" />
  <meta property="og:locale" content="en_IN" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${ogTitle}" />
  <meta name="twitter:description" content="${ogDesc}" />
  <meta name="twitter:image" content="${esc(imageUrl)}" />
  <meta name="twitter:site" content="@wayzza" />

  <!-- Geo -->
  <meta name="geo.region" content="IN-KL" />
  <meta name="geo.placename" content="${locationEsc}" />

  <!-- JSON-LD Schema -->
  <script type="application/ld+json">${schemaJson}</script>

  <!-- Instant redirect to the full React SPA (only runs in real browsers, not bots) -->
  <noscript><meta http-equiv="refresh" content="0; url=${esc(listingUrl)}" /></noscript>

  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0a1f14;color:#f0fdf4;font-family:system-ui,-apple-system,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center}
    .logo{font-size:1.1rem;font-weight:900;letter-spacing:-.03em;color:#fff;margin-bottom:2rem;opacity:.6}
    .logo span{color:#34d399}
    img.listing-img{width:100%;max-width:560px;aspect-ratio:16/9;object-fit:cover;border-radius:1rem;margin-bottom:1.5rem;box-shadow:0 20px 60px rgba(0,0,0,.5)}
    h1{font-size:clamp(1.3rem,4vw,2rem);font-weight:900;line-height:1.2;margin-bottom:.5rem}
    .location{color:rgba(255,255,255,.5);font-size:.9rem;margin-bottom:.75rem}
    .price{font-size:1.1rem;font-weight:700;color:#34d399;margin-bottom:1.5rem}
    .desc{color:rgba(255,255,255,.65);font-size:.95rem;line-height:1.7;max-width:500px;margin:0 auto 2rem}
    a.cta{display:inline-block;background:#34d399;color:#0a1f14;font-weight:700;padding:.875rem 2rem;border-radius:999px;text-decoration:none;font-size:1rem}
    a.cta:hover{opacity:.9}
  </style>
  <script>
    // Real browsers: redirect to the full SPA immediately
    window.location.replace("${esc(listingUrl)}");
  </script>
</head>
<body>
  <div class="logo">Wayzza<span>.</span></div>
  <img class="listing-img" src="${esc(imageUrl)}" alt="${titleEsc}" loading="eager" />
  <h1>${titleEsc}</h1>
  <p class="location">📍 ${locationEsc}</p>
  ${priceDisplay ? `<p class="price">${esc(priceDisplay)}</p>` : ""}
  <p class="desc">${descEsc}</p>
  <a class="cta" href="${esc(listingUrl)}">View Full Listing →</a>
</body>
</html>`);
    } catch (err) {
        next(err);
    }
});

export default router;
