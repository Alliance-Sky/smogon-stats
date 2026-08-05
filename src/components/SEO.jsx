import React from 'react';
import Helmet from 'preact-helmet';

export default function SEO({ title, description, url, ogType = 'website', schema }) {
  const siteUrl = 'https://smogonstats.eu.cc';
  const canonicalUrl = url ? `${siteUrl}${url}` : siteUrl;
  const pageTitle = title ? `${title} | Smogon Stats` : 'Pokemon Showdown Usage Stats';
  const pageDescription = description || 'View historical Pokemon Showdown usage statistics from 2014 to present.';
  const defaultImage = `${siteUrl}/og-image.png`;

  const schemas = Array.isArray(schema) ? schema : schema ? [schema] : [];

  return (
    <Helmet
      title={pageTitle}
      meta={[
        { name: 'description', content: pageDescription },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:title', content: pageTitle },
        { property: 'og:description', content: pageDescription },
        { property: 'og:type', content: ogType },
        { property: 'og:url', content: canonicalUrl },
        { property: 'og:image', content: defaultImage },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: pageTitle },
        { name: 'twitter:description', content: pageDescription },
        { name: 'twitter:image', content: defaultImage }
      ]}
      link={[
        { rel: 'canonical', href: canonicalUrl }
      ]}
      script={schemas.map((s, i) => ({ type: 'application/ld+json', innerHTML: JSON.stringify(s) }))}
    />
  );
}
