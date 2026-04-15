import { Helmet } from 'react-helmet-async';

/**
 * Reusable SEO component.
 * Place inside any page/layout to set meta tags dynamically.
 *
 * @param {string} title        - Page title (appended with site name)
 * @param {string} description  - Meta description (150–160 chars recommended)
 * @param {string} image        - Absolute URL to OG share image
 * @param {string} url          - Canonical URL of the current page
 * @param {string} type         - OG type (default: "website")
 */
export default function SEO({
  title = 'FlowLean — Online VSM Builder',
  description = 'FlowLean is a free online Value Stream Mapping (VSM) tool for Lean Manufacturing teams. Visualize process flows, calculate Lead Time, VA Ratio, and identify waste in real time.',
  image = 'https://flow-lean.com/og-image.png',
  url = 'https://flow-lean.com/',
  type = 'website',
}) {
  const fullTitle = title.includes('FlowLean') ? title : `${title} | FlowLean`;

  return (
    <Helmet>
      {/* ── Primary Meta ── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content="Online Value Stream Mapping Tool, Lean Manufacturing Software, VSM Builder, Process Flow Efficiency, Value Stream Map, Lean VSM, Flow Efficiency, Lead Time Calculator, Waste Elimination, Continuous Improvement"
      />
      <meta name="author" content="FlowLean" />
      <link rel="canonical" href={url} />

      {/* ── Open Graph (Facebook / LinkedIn) ── */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="FlowLean" />
      <meta property="og:locale" content="en_US" />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@flowlean" />

      {/* ── Structured Data (JSON-LD) ── */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'FlowLean',
          url: 'https://flow-lean.com/',
          description,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'All',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          keywords:
            'Value Stream Mapping, Lean Manufacturing, Process Flow, VSM Builder, Lean Software',
        })}
      </script>
    </Helmet>
  );
}
