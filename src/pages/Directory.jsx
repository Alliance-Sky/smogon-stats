import React from 'react';
import SEO from '../components/SEO';
import { useQuery } from '@tanstack/react-query';
import { getMonths, getFormats } from '../utils/api';

export default function Directory() {
  const { data: months = [] } = useQuery({
    queryKey: ['months'],
    queryFn: getMonths
  });
  
  // Pick the most recent month to fetch formats
  const latestMonth = months.length > 0 ? months[0] : '2026-06';

  const { data: formatsObj = {} } = useQuery({
    queryKey: ['formats', latestMonth],
    queryFn: () => getFormats(latestMonth),
    enabled: !!latestMonth
  });

  const formats = Object.keys(formatsObj);
  const recentMonths = months.slice(0, 12); // Show top 12 recent months

  const formatName = (formatStr) => {
    if (!formatStr) return '';
    const match = formatStr.match(/^gen(10|[1-9])(.*)$/);
    if (match) {
      let name = match[2].toUpperCase();
      name = name.replace('RANDOMBATTLE', 'RANDOM BATTLE')
                 .replace('VGC', 'VGC ');
      return `[GEN ${match[1]}] ${name.trim()}`;
    }
    return formatStr.toUpperCase();
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": formats.map((format, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://smogonstats.eu.cc/?format=${format}`
    }))
  };

  return (
    <div className="stats-page fade-in-data" style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '2rem' }}>
      <SEO title="Stats Directory" description="Browse the most popular competitive Pokemon Showdown formats and historical months." url="/directory" schema={itemListSchema} />
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--text-color)', fontWeight: 800 }}>Stats Directory</h1>
      <p style={{ marginBottom: '2.5rem', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>
        Use this directory to quickly navigate to all competitive Pokémon formats and historical usage statistics.
      </p>
      
      {formats.length > 0 ? (
        formats.map(format => (
          <div key={format} className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--text-color)', fontWeight: 700 }}>
              <a href={`/?format=${format}`} style={{ color: 'inherit', textDecoration: 'none' }}>{formatName(format)}</a>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
              {recentMonths.map(month => (
                <a 
                  key={`${format}-${month}`} 
                  href={`/?period=${month}&format=${format}&rating=${formatsObj[format]?.[0] || '1500'}`}
                  style={{ 
                    padding: '0.5rem', 
                    borderRadius: '6px', 
                    background: 'var(--bg-secondary)', 
                    color: 'var(--primary)', 
                    textDecoration: 'none',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                >
                  {month}
                </a>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p>Loading directory data...</p>
      )}
    </div>
  );
}
