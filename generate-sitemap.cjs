const fs = require('fs');
const path = require('path');

// Configuration
const DOMAIN = 'https://wayzza.live';
const API_URL = 'https://api.wayzza.live/api/v1'; // Production API
const PUBLIC_DIR = path.join(__dirname, 'frontend', 'public');
const SITEMAP_PATH = path.join(PUBLIC_DIR, 'sitemap.xml');

// Static routes with their priority and changefreq
const staticRoutes = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/listings', priority: '0.9', changefreq: 'daily' },
  { url: '/experiences', priority: '0.9', changefreq: 'weekly' },
  { url: '/explore-map', priority: '0.8', changefreq: 'weekly' },
  { url: '/about', priority: '0.7', changefreq: 'monthly' },
  { url: '/privacy', priority: '0.3', changefreq: 'monthly' },
  { url: '/terms', priority: '0.3', changefreq: 'monthly' },
  { url: '/compliance', priority: '0.3', changefreq: 'monthly' },
  { url: '/support', priority: '0.7', changefreq: 'weekly' },
];

async function generateSitemap() {
  console.log('🚀 Starting sitemap generation...');
  const lastmod = new Date().toISOString().split('T')[0];

  try {
    // 1. Fetch dynamic listings
    console.log(`📡 Fetching listings from ${API_URL}/listings...`);
    const response = await fetch(`${API_URL}/listings`);
    const data = await response.json();
    const listings = Array.isArray(data.rows) ? data.rows : (Array.isArray(data) ? data : []);

    console.log(`✅ Found ${listings.length} listings.`);

    // 2. Build XML entries
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add Static Routes
    staticRoutes.forEach(route => {
      xml += '  <url>\n';
      xml += `    <loc>${DOMAIN}${route.url}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    // Add Dynamic Listing Routes
    listings.forEach(listing => {
      xml += '  <url>\n';
      xml += `    <loc>${DOMAIN}/listings/${listing._id}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    // 3. Write to file
    if (!fs.existsSync(PUBLIC_DIR)) {
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }
    fs.writeFileSync(SITEMAP_PATH, xml);
    console.log(`✨ Sitemap successfully generated at: ${SITEMAP_PATH}`);

  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    process.exit(1);
  }
}

generateSitemap();
