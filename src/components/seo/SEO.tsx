import { Helmet } from 'react-helmet-async';

interface Props {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  og?: {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
  };
}

const SITE_NAME = 'Voltify';
const DEFAULT_DESCRIPTION = 'Voltify — Ihr persönlicher Solar-Konfigurator. Berechnen Sie die Wirtschaftlichkeit Ihrer Photovoltaik-Anlage in wenigen Minuten.';
const DEFAULT_OG_IMAGE = '/images/og-default.jpg';
const SITE_URL = 'https://voltify.de';

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  noindex = false,
  og,
}: Props) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  const ogTitle = og?.title ?? title ?? SITE_NAME;
  const ogDescription = og?.description ?? description;
  const ogImage = og?.image ?? DEFAULT_OG_IMAGE;
  const ogType = og?.type ?? 'website';

  return (
    <Helmet>
      {/* Basis Meta-Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}

      {/* Canonical */}
      {canonical && <link rel="canonical" href={`${SITE_URL}${canonical}`} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={`${SITE_URL}${ogImage}`} />
      <meta property="og:type" content={ogType} />
      {canonical && <meta property="og:url" content={`${SITE_URL}${canonical}`} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={`${SITE_URL}${ogImage}`} />

      {/* Strukturierte Daten — Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Voltify GmbH',
          url: SITE_URL,
          logo: `${SITE_URL}/images/logo.png`,
          sameAs: [
            'https://www.linkedin.com/company/voltify',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+49-89-12345678',
            contactType: 'customer service',
            availableLanguage: ['German'],
          },
        })}
      </script>
    </Helmet>
  );
}
