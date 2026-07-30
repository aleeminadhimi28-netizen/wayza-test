/**
 * @module prerender
 * @description Build-time static prerendering script for Wayzza public pages.
 *
 * Runs after `vite build` in `npm run build`.
 * Takes the generated `dist/index.html` and creates static HTML files for key public routes:
 *   - /listings
 *   - /experiences
 *   - /packages
 *   - /ai-trip-planner
 *   - /about
 *   - /faq
 *   - /privacy
 *   - /terms
 *   - /compliance
 *
 * Each generated index.html includes route-targeted title tags, meta descriptions,
 * OpenGraph attributes, structured JSON-LD data, and semantic fallback content.
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');
const BASE_HTML_PATH = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(BASE_HTML_PATH)) {
  console.error('❌ Error: dist/index.html not found. Run vite build first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(BASE_HTML_PATH, 'utf8');

// Configuration for static public pages
const routes = [
  {
    path: 'listings',
    title: 'Luxury Clifftop Villas & Vehicle Rentals in Varkala | Wayzza Stays',
    description: 'Browse verified ocean-view villas, luxury cliff resorts, and Royal Enfield rentals in Varkala, Kerala. Transparent pricing, instant confirmation & verified hosts.',
    heading: 'Curated Stays & Mobility in Varkala',
    content: 'Discover hand-picked clifftop villas, private pool resorts, and high-performance Royal Enfield motorcycles in Varkala North Cliff. Book directly with zero hidden fees.',
    keywords: 'Varkala villas, Varkala Cliff stays, Royal Enfield rental Varkala, ocean view resort Varkala, luxury stay Kerala',
  },
  {
    path: 'experiences',
    pathName: 'experiences',
    title: 'Authentic Local Experiences & Cliff Adventures in Varkala | Wayzza',
    description: 'Explore curated Varkala experiences: cliff yoga, sunset kayaking, ayurvedic wellness sessions, surf lessons, and seafood culinary tours.',
    heading: 'Exclusive Varkala Experiences',
    content: 'Immerse yourself in authentic Kerala culture. From early morning cliff yoga overlooking the Arabian Sea to guided backwater kayaking in Kapill.',
    keywords: 'Varkala cliff yoga, surf lessons Varkala, Kapill backwater kayaking, Ayurveda Varkala, Kerala cultural tours',
  },
  {
    path: 'packages',
    title: 'Curated Varkala Vacation Packages & Workation Stays | Wayzza',
    description: 'All-inclusive Varkala holiday packages combining luxury villa stays, Royal Enfield rentals, airport transfers, and private cliff experiences.',
    heading: 'Bespoke Varkala Travel Packages',
    content: 'Seamless getaway packages crafted for digital nomads, couples, and premium travelers seeking the best of Varkala Beach and Cliff.',
    keywords: 'Varkala vacation package, Varkala workation, Kerala luxury packages, Varkala honeymoon package',
  },
  {
    path: 'ai-trip-planner',
    title: 'AI Varkala Trip Planner — Custom Itineraries in Seconds | Wayzza',
    description: 'Plan your ultimate Varkala trip with AI. Instant personalized itineraries matching your budget, stay preferences, and travel style.',
    heading: 'AI-Powered Varkala Itinerary Generator',
    content: 'Tell our AI your travel dates and preferences to get a custom day-by-day plan for staying, dining, riding, and exploring Varkala.',
    keywords: 'Varkala trip planner, AI travel itinerary Kerala, plan Varkala holiday, Varkala travel guide',
  },
  {
    path: 'about',
    title: 'About Wayzza — Varkala’s Premier Luxury Travel & Mobility Platform',
    description: 'Learn about Wayzza’s mission to elevate luxury travel in Varkala through verified clifftop sanctuaries and premium Royal Enfield rentals.',
    heading: 'Redefining Luxury Travel in Varkala',
    content: 'Wayzza is a boutique travel brand dedicated to curating extraordinary stays and high-end mobility experiences along Kerala’s iconic cliffs.',
    keywords: 'About Wayzza, Wayzza Varkala, luxury travel Kerala, Varkala villa booking brand',
  },
  {
    path: 'faq',
    title: 'Frequently Asked Questions — Stays, Bike Rentals & Bookings | Wayzza',
    description: 'Find answers to common questions about booking villas, Royal Enfield rental policies, check-in, payments, and cancellations in Varkala.',
    heading: 'Wayzza Support & FAQ',
    content: 'Everything you need to know about booking with Wayzza: payment security, rental security deposits, check-in instructions, and host verification.',
    keywords: 'Wayzza FAQ, Varkala bike rental rules, villa booking cancellation Varkala, Wayzza support',
  },
  {
    path: 'privacy',
    title: 'Privacy Policy | Wayzza Luxury Travel Varkala',
    description: 'Wayzza’s privacy policy details how we collect, protect, and handle your data with enterprise-grade encryption and strict privacy standards.',
    heading: 'Privacy Policy',
    content: 'Your privacy is paramount. Read how Wayzza safeguards user identity, payment transactions, and personal details.',
    keywords: 'Wayzza privacy policy, data security Wayzza',
  },
  {
    path: 'terms',
    title: 'Terms of Service | Wayzza',
    description: 'Review the terms and conditions for booking clifftop villas, renting motorcycles, and utilizing Wayzza services in Varkala, Kerala.',
    heading: 'Terms of Service',
    content: 'Official terms governing property bookings, rental vehicle usage, user responsibilities, and cancellation policies on Wayzza.',
    keywords: 'Wayzza terms of service, Varkala rental contract terms',
  },
  {
    path: 'compliance',
    title: 'Data Compliance & Trust | Wayzza',
    description: 'Learn about Wayzza’s data protection protocols, security standards, host verification guidelines, and compliance frameworks.',
    heading: 'Data Compliance & Security',
    content: 'Wayzza adheres to robust security standards, double-submit CSRF protection, secure cookie auth, and verified host checks.',
    keywords: 'Wayzza security compliance, verified stays Varkala',
  },
];

async function runPrerender() {
  console.log('🚀 Starting static & dynamic route prerendering...');
  let generatedCount = 0;

  // 1. Prerender core static public pages
  routes.forEach((route) => {
    const routeDir = path.join(DIST_DIR, route.path);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }

    let html = baseHtml;
    html = html.replace(/<title>.*?<\/title>/i, `<title>${route.title}</title>`);
    html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${route.description}" />`);
    if (route.keywords) {
      html = html.replace(/<meta name="keywords" content=".*?" \/>/i, `<meta name="keywords" content="${route.keywords}" />`);
    }
    html = html.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${route.title}" />`);
    html = html.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${route.description}" />`);
    html = html.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${route.title}" />`);
    html = html.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${route.description}" />`);

    const prerenderedBlock = `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;color:#f0fdf4;">
        <h1 style="font-size:1.8rem;font-weight:800;color:#34d399;margin-bottom:0.75rem;">${route.heading}</h1>
        <p style="font-size:1rem;line-height:1.7;color:rgba(255,255,255,0.8);">${route.content}</p>
      </article>
    `;
    html = html.replace('</noscript>', `${prerenderedBlock}\n  </noscript>`);

    const targetFilePath = path.join(routeDir, 'index.html');
    fs.writeFileSync(targetFilePath, html, 'utf8');
    generatedCount++;
    console.log(`  ✅ Generated: dist/${route.path}/index.html`);
  });

  // 2. Fetch live listings & prerender dynamic /listing/:id pages if API is reachable
  try {
    const fetch = (await import('node-fetch')).default || globalThis.fetch;
    const apiUrl = process.env.VITE_API_URL || 'https://api.wayzza.live/api/v1';
    const res = await fetch(`${apiUrl}/listings?limit=50`);
    if (res.ok) {
      const data = await res.json();
      const listings = data.listings || data.data || (Array.isArray(data) ? data : []);
      if (Array.isArray(listings) && listings.length > 0) {
        listings.forEach((listing) => {
          if (!listing._id) return;
          const listingDir = path.join(DIST_DIR, 'listing', listing._id);
          if (!fs.existsSync(listingDir)) {
            fs.mkdirSync(listingDir, { recursive: true });
          }

          let html = baseHtml;
          const title = `${listing.title} | Wayzza Varkala`;
          const desc = listing.description ? listing.description.slice(0, 160) : `Book ${listing.title} in Varkala, Kerala on Wayzza.`;
          
          html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
          html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${desc}" />`);
          html = html.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${title}" />`);
          html = html.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${desc}" />`);

          const targetFilePath = path.join(listingDir, 'index.html');
          fs.writeFileSync(targetFilePath, html, 'utf8');
          generatedCount++;
          console.log(`  ✅ Generated dynamic listing: dist/listing/${listing._id}/index.html`);
        });
      }
    }
  } catch (apiErr) {
    console.log('ℹ️ Dynamic listing prerendering skipped (API offline at build time).');
  }

  console.log(`✨ Successfully prerendered ${generatedCount} total static & dynamic pages.`);
}

runPrerender();
