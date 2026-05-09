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
  googleVerification = 'VwzE_N_T2z_X_k_z_V_z_v_z_V_z_v_z_V_z_v_z_V_z_v_z_V_z_v',
}) {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const canonicalUrl = currentUrl?.split('?')[0] || currentUrl;
  const defaultImage =
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80';
  const metaImage = image || defaultImage;

  // Default Organization & LocalBusiness schema
  const defaultOrgSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Wayzza',
    url: 'https://wayzza.live',
    logo: 'https://wayzza.live/logo.png',
    image: defaultImage,
    description: 'Curated sanctuaries and elite mobility for digital nomads in Varkala, Kerala.',
    telephone: '+91-WAYZZA-001',
    priceRange: '₹₹₹',
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
    sameAs: [
      'https://www.instagram.com/wayzza',
      'https://www.twitter.com/wayzza',
      'https://www.facebook.com/wayzza',
    ],
  };

  // Author Schema (EEAT)
  const authorSchema = author
    ? {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: author.name || 'Wayzza Concierge',
        jobTitle: author.role || 'Varkala Specialist',
        description: author.bio || 'Local expert and curator of premium Varkala experiences.',
        image: author.image || 'https://www.wayzza.live/team/expert.jpg',
      }
    : null;

  // FAQ Schema
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

  // Breadcrumb schema
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

  const allSchemas = [defaultOrgSchema];
  if (breadcrumbSchema) allSchemas.push(breadcrumbSchema);
  if (authorSchema) allSchemas.push(authorSchema);
  if (faqSchema) allSchemas.push(faqSchema);
  if (schema) allSchemas.push(schema);

  const schemaJson = allSchemas.length === 1 ? allSchemas[0] : allSchemas;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title ? `${title} | Wayzza` : 'Wayzza | Curated Sanctuaries'}</title>
      <meta
        name="description"
        content={
          description ||
          'Discover the finest Varkala clifftop villas, premium Royal Enfield rentals, and exclusive local secrets. Verified sanctuaries curated for digital nomads and modern explorers in Varkala, Kerala.'
        }
      />
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />
      <meta
        name="keywords"
        content="Varkala luxury villas, Varkala Cliff stays, Varkala beach rentals, digital nomad Varkala, Royal Enfield rental Varkala, Kerala backwater experiences, Varkala tourism, luxury mobility Varkala, clifftop sanctuaries, verified stays Varkala, Varkala workation, premium concierge Varkala"
      />
      <meta name="author" content="Wayzza" />
      <meta name="theme-color" content="#059669" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      {googleVerification && (
        /* GSC Verification */
        <meta name="google-site-verification" content={googleVerification} />
      )}

      {/* Meta OpenGraph tags */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta
        property="og:title"
        content={title ? `${title} | Wayzza` : 'Wayzza | Curated Sanctuaries & Elite Mobility'}
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

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta
        name="twitter:title"
        content={title ? `${title} | Wayzza` : 'Wayzza | Curated Sanctuaries'}
      />
      <meta
        name="twitter:description"
        content={description || 'Verified luxury villas and authentic local experiences.'}
      />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:site" content="@wayzza" />

      {/* JSON-LD Schema Markup */}
      <script type="application/ld+json">{JSON.stringify(schemaJson)}</script>
    </Helmet>
  );
}
