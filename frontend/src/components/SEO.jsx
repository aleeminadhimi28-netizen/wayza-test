import { Helmet } from "react-helmet-async";

export default function SEO({ title, description, image, url, name = "Wayza", type = "website" }) {
  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const defaultImage = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80";
  const metaImage = image || defaultImage;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title ? `${title} | Wayza` : "Wayza | Escape the ordinary gracefully."}</title>
      <meta name="description" content={description || "Discover handpicked boutique hotels, luxury villas, and authentic local experiences around the globe."} />

      {/* Meta OpenGraph tags (for Facebook, WhatsApp, Instagram, LinkedIn, etc.) */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title ? `${title} | Wayza` : "Wayza"} />
      <meta property="og:description" content={description || "Discover handpicked boutique hotels and luxury experiences."} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={name} />

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title ? `${title} | Wayza` : "Wayza"} />
      <meta name="twitter:description" content={description || "Discover handpicked boutique hotels and luxury experiences."} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
}
