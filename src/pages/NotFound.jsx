import React from 'react';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <div className="stats-page fade-in-data" style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '4rem 2rem', textAlign: 'center' }}>
      <SEO title="Page Not Found" description="The page you are looking for does not exist." url="/404" />
      <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', color: 'var(--text-color)', fontWeight: 800 }}>404 Not Found</h1>
      <p style={{ marginBottom: '2.5rem', color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1.6 }}>
        Oops! The page or format you are looking for does not exist.
      </p>
      <a href="/" style={{
        display: 'inline-block',
        padding: '0.8rem 1.5rem',
        borderRadius: '8px',
        backgroundColor: 'var(--primary)',
        color: 'white',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '1.1rem'
      }}>
        Return to Home
      </a>
    </div>
  );
}
