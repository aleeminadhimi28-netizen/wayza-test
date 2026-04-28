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
}) {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const canonicalUrl = currentUrl?.split('?')[0] || currentUrl;
  const defaultImage =
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80';
  const metaImage = image || defaultImage;

  // Default Organization schema
  const defaultOrgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Wayzza',
    url: 'https://wayza-app.vercel.app',
    logo: 'https://wayza-app.vercel.app/logo.png',
    description: 'Curated sanctuaries and elite mobility for digital nomads in Varkala',
    sameAs: [
      'https://www.instagram.com/wayzza',
      'https://www.twitter.com/wayzza',
      'https://www.facebook.com/wayzza',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@wayzza.com',
    },
  };

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
          'Experience the ultimate digital nomad lifestyle. Verified luxury villas, Royal Enfield rentals, and hidden Varkala secrets. Curated for the modern explorer.'
        }
      />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />
      <meta name="keywords" content="luxury villas, Varkala, digital nomad, vacation rentals, Royal Enfield, experiences" />
      <meta name="author" content="Wayzza" />
      <meta name="theme-color" content="#059669" />

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
          'Access a verified collection of clifftop villas, high-performance rentals, and hidden local secrets in Varkala.'
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
