import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/v1';

async function testEndpoint(name, url, options = {}) {
  const start = Date.now();
  try {
    const res = await fetch(url, options);
    const ms = Date.now() - start;
    let data;
    try {
      data = await res.json();
    } catch {
      data = { rawText: await res.text() };
    }
    return { name, url, status: res.status, ok: res.ok, ms, data };
  } catch (err) {
    return { name, url, status: 0, ok: false, ms: Date.now() - start, error: err.message };
  }
}

async function runSuite() {
  console.log('=== WAYZZA API HEALTH & DIAGNOSTIC SUITE ===\n');

  const publicEndpoints = [
    { name: 'Health Check', url: `${BASE_URL}/health` },
    { name: 'CSRF Token', url: `${BASE_URL}/auth/csrf-token` },
    { name: 'Platform Financial Config', url: `${BASE_URL}/misc/config` },
    { name: 'Getaway / Promo Banner Offer', url: `${BASE_URL}/misc/promo-offer` },
    { name: 'Trending Listings (Hotels)', url: `${BASE_URL}/listings/trending?limit=8&category=hotel` },
    { name: 'Trending Listings (Bikes)', url: `${BASE_URL}/listings/trending?limit=8&category=bike` },
    { name: 'Trending Listings (Cars)', url: `${BASE_URL}/listings/trending?limit=8&category=car` },
    { name: 'Listings Search / Browse', url: `${BASE_URL}/listings?category=hotel&limit=10` },
    { name: 'Tour Packages', url: `${BASE_URL}/packages` },
    { name: 'Neighborhood Vibe AI/Fallback', url: `${BASE_URL}/misc/neighborhood-vibe?location=Varkala` },
  ];

  const results = [];

  for (const ep of publicEndpoints) {
    const res = await testEndpoint(ep.name, ep.url);
    results.push(res);
    const symbol = res.ok ? '✅' : '❌';
    console.log(`${symbol} [${res.status}] ${res.name} (${res.ms}ms) -> ${res.url}`);
    if (!res.ok) {
      console.log('   Error Details:', res.data || res.error);
    }
  }

  console.log('\n=== SUMMARY ===');
  const passed = results.filter((r) => r.ok).length;
  console.log(`Passed: ${passed}/${results.length}`);
}

runSuite();
