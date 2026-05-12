import { Helmet } from 'react-helmet-async';

export default function SEO({
  title,
  description,
  image,
  url,
  name = 'Wayzza',
  type = 'website',
  schema = null,
  breadcrumb = null,
  author = null,
  faq = null,
  howTo = null,
  qa = null,
  speakable = null,
  noindex = false,
  googleVerification = 'VwzE_N_T2z_X_k_z_V_z_v_z_V_z_v_z_V_z_v_z_V_z_v_z_V_z_v',
}) {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  // Force Apex domain for canonicals to avoid www/apex split authority
  const canonicalUrl = (currentUrl?.split('?')[0] || currentUrl).replace('www.', '');
  const defaultImage = 'https://wayzza.live/og-image.png';
  const metaImage = image || defaultImage;

  // ── GEO: WebSite schema (Sitelinks Searchbox + entity anchor) ──
  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://wayzza.live/#website',
    name: 'Wayzza',
    alternateName: 'Wayzza Varkala',
    url: 'https://wayzza.live',
    description:
      'Wayzza is a premium curated booking platform for clifftop villas, Royal Enfield rentals, car hire, and authentic local experiences in Varkala, Kerala, India.',
    inLanguage: 'en-IN',
    publisher: {
      '@type': 'Organization',
      '@id': 'https://wayzza.live/#organization',
      name: 'Wayzza',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://wayzza.live/listings?location={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // ── Default Organization & LocalBusiness schema (enriched for GEO) ──
  const defaultOrgSchema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'LodgingBusiness', 'TravelAgency'],
    '@id': 'https://wayzza.live/#organization',
    name: 'Wayzza',
    alternateName: 'Wayzza Varkala',
    foundingDate: '2024',
    slogan: 'Escape the ordinary. Gracefully.',
    url: 'https://wayzza.live',
    logo: 'https://wayzza.live/favicon.svg',
    image: defaultImage,
    description:
      'Wayzza is a curated booking platform for premium clifftop villas, Royal Enfield bike rentals, luxury cars, and authentic local experiences in Varkala, Kerala, India.',
    telephone: '+91 80892 22444',
    email: 'stay@wayzza.live',
    priceRange: '₹₹₹',
    currenciesAccepted: 'INR, USD, EUR, GBP, AED',
    paymentAccepted: 'Cash, Credit Card, UPI, Net Banking',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Varkala North Cliff',
      addressLocality: 'Varkala',
      addressRegion: 'Kerala',
      postalCode: '695141',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '8.7379',
      longitude: '76.7163',
    },
    areaServed: [
      { '@type': 'Place', name: 'Varkala, Kerala, India' },
      { '@type': 'Place', name: 'Edava, Kerala, India' },
      { '@type': 'Place', name: 'Odayam, Kerala, India' },
    ],
    knowsAbout: [
      'Varkala',
      'Varkala Cliff',
      'Kerala Tourism',
      'Luxury Clifftop Villas',
      'Royal Enfield Motorcycle Rentals',
      'Digital Nomad Travel',
      'Premium Stays in India',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Wayzza Experiences',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Clifftop Villas',
          description: 'Verified premium villas with ocean views on the Varkala Cliff.',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Royal Enfield Rentals',
          description: 'Curated fleet of Royal Enfield motorcycles for exploring Kerala.',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Luxury Car Rentals',
          description: 'Self-drive and chauffeur car hire in Varkala and surrounding areas.',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Local Experiences',
          description: 'Hand-curated secret spots, surf lessons, ayurvedic sessions, and more.',
        },
      ],
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
    ],
    sameAs: [
      'https://www.instagram.com/wayzza',
      'https://www.twitter.com/wayzza',
      'https://www.facebook.com/wayzza',
    ],
  };

  // ── Author / EEAT Schema ──
  const authorSchema = author
    ? {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: author.name || 'Wayzza Concierge',
        jobTitle: author.role || 'Varkala Specialist',
        description: author.bio || 'Local expert and curator of premium Varkala experiences.',
        image: author.image || 'https://wayzza.live/team/expert.jpg',
        worksFor: {
          '@type': 'Organization',
          name: 'Wayzza',
          url: 'https://wayzza.live',
        },
        knowsAbout: ['Varkala', 'Kerala Tourism', 'Luxury Stays', 'Bike Rentals'],
      }
    : null;

  // ── FAQ Schema (AEO: directly answers user questions) ──
  const faqSchema = faq
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((q) => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer,
          },
        })),
      }
    : null;

  // ── Q&A Schema (AEO: community-style Q&A signals) ──
  const qaSchema = qa
    ? {
        '@context': 'https://schema.org',
        '@type': 'QAPage',
        mainEntity: {
          '@type': 'Question',
          name: qa.question,
          text: qa.question,
          answerCount: qa.answers?.length || 1,
          acceptedAnswer: {
            '@type': 'Answer',
            text: qa.answers?.[0] || qa.answer,
            upvoteCount: 10,
            author: {
              '@type': 'Organization',
              name: 'Wayzza',
            },
          },
        },
      }
    : null;

  // ── HowTo Schema (AEO: step-by-step instructions) ──
  const howToSchema = howTo
    ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: howTo.name,
        description: howTo.description,
        totalTime: howTo.totalTime || 'PT5M',
        step: howTo.steps.map((s, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: s.name,
          text: s.text,
          url: s.url || canonicalUrl,
        })),
      }
    : null;

  // ── Speakable Schema (AEO: voice assistants & AI Overviews) ──
  const speakableSchema = speakable
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title || 'Wayzza | Premium Varkala Stays & Luxury Mobility',
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: speakable.cssSelectors || ['.speakable-summary', 'h1', '.hero-description'],
        },
        url: canonicalUrl,
      }
    : null;

  // ── Breadcrumb schema ──
  const breadcrumbSchema = breadcrumb
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumb.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }
    : null;

  // ── Compose all schemas ──
  const allSchemas = [webSiteSchema, defaultOrgSchema];
  if (breadcrumbSchema) allSchemas.push(breadcrumbSchema);
  if (authorSchema) allSchemas.push(authorSchema);
  if (faqSchema) allSchemas.push(faqSchema);
  if (qaSchema) allSchemas.push(qaSchema);
  if (howToSchema) allSchemas.push(howToSchema);
  if (speakableSchema) allSchemas.push(speakableSchema);
  if (schema) allSchemas.push(schema);

  const schemaJson = allSchemas.length === 1 ? allSchemas[0] : allSchemas;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>
        {title ? `Wayzza | ${title}` : 'Wayzza | Premium Varkala Stays & Luxury Mobility'}
      </title>
      <meta
        name="description"
        content={
          description ||
          'Discover the finest Varkala clifftop villas, premium Royal Enfield rentals, and exclusive local secrets. Verified sanctuaries curated for digital nomads and modern explorers in Varkala, Kerala.'
        }
      />
      <meta
        name="robots"
        content={
          noindex
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        }
      />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />
      <meta
        name="keywords"
        content="Varkala luxury villas, Varkala Cliff stays, Varkala beach rentals, digital nomad Varkala, Royal Enfield rental Varkala, Kerala backwater experiences, Varkala tourism, luxury mobility Varkala, clifftop sanctuaries, verified stays Varkala, Varkala workation, premium concierge Varkala"
      />
      <meta name="author" content="Wayzza" />

      {/* ── AEO: AI Crawlers & LLM Permissions ── */}
      <meta name="googlebot" content="index, follow, max-snippet:-1" />
      <meta name="bingbot" content="index, follow, max-snippet:-1" />
      <meta name="perplexity-bot" content="index, follow" />
      <meta name="claude-web" content="index, follow" />
      <meta name="gptbot" content="index, follow" />
      <meta name="oai-searchbot" content="index, follow" />

      {/* ── Geo meta tags ── */}
      <meta name="geo.region" content="IN-KL" />
      <meta name="geo.placename" content="Varkala" />
      <meta name="geo.position" content="8.7379;76.7163" />
      <meta name="ICBM" content="8.7379, 76.7163" />

      {/* ── PWA / App meta ── */}
      <meta name="theme-color" content="#059669" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {googleVerification && <meta name="google-site-verification" content={googleVerification} />}

      {/* ── OpenGraph tags ── */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta
        property="og:title"
        content={title ? `Wayzza | ${title}` : 'Wayzza | Premium Varkala Stays & Luxury Mobility'}
      />
      <meta
        property="og:description"
        content={
          description ||
          'Access a verified collection of premium clifftop villas, high-performance mobility, and hidden local secrets in the heart of Varkala.'
        }
      />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={name} />
      <meta property="og:locale" content="en_IN" />

      {/* ── Twitter / X tags ── */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta
        name="twitter:title"
        content={title ? `Wayzza | ${title}` : 'Wayzza | Premium Varkala Stays & Luxury Mobility'}
      />
      <meta
        name="twitter:description"
        content={description || 'Verified luxury villas and authentic local experiences.'}
      />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:site" content="@wayzza" />

      {/* ── JSON-LD Schema Markup (AEO) ── */}
      <script type="application/ld+json">{JSON.stringify(schemaJson)}</script>
    </Helmet>
  );
}
