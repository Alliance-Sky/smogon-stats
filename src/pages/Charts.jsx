import React from 'react';
import { useLocation } from 'wouter';

function Charts() {
  const [, setLocation] = useLocation();

  return (
    <div className="stats-page fade-in-data" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
        
        <div className="pokedex-tile" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyItems: 'stretch', justifyContent: 'space-between', height: '100%', contain: 'none', borderRadius: '12px' }}>
          <div>
            <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '14px', background: 'var(--primary-glow)', color: 'var(--primary)', marginBottom: '1.5rem' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <h3 style={{ fontSize: 'clamp(1.15rem, 4vw, 1.4rem)', fontWeight: 800, color: 'var(--text-color)', marginBottom: '0.75rem' }}>
              Format Stats Chart
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem', fontWeight: 500 }}>
              Visualize usage percentage distributions across all Pokémon in the selected format with interactive horizontal bar charts. Compare relative usage tiers and inspect format composition at a glance.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 700 }}>
                <span style={{ color: 'var(--primary)', fontWeight: 900 }}>✓</span> Full meta usage percentage distribution
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 700 }}>
                <span style={{ color: 'var(--primary)', fontWeight: 900 }}>✓</span> Sort by Usage, Leads %, and Viability ceiling
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 700 }}>
                <span style={{ color: 'var(--primary)', fontWeight: 900 }}>✓</span> Interactive hover tooltips &amp; tier breakdowns
              </li>
            </ul>
          </div>
          <button
            onClick={() => setLocation('/chart')}
            className="load-more-btn"
            style={{ width: '100%', padding: '0.9rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: 0 }}
          >
            <span>Open Format Chart</span>
            <span style={{ fontSize: '1.2rem', lineHeight: 0.5 }}>→</span>
          </button>
        </div>

        <div className="pokedex-tile" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyItems: 'stretch', justifyContent: 'space-between', height: '100%', contain: 'none', borderRadius: '12px' }}>
          <div>
            <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '14px', background: 'var(--accent-glow)', color: 'var(--accent)', marginBottom: '1.5rem' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3 style={{ fontSize: 'clamp(1.15rem, 4vw, 1.4rem)', fontWeight: 800, color: 'var(--text-color)', marginBottom: '0.75rem' }}>
              Trend Tracker Chart
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem', fontWeight: 500 }}>
              Track historical usage trajectory and meta evolution over time. Compare 1-month, 3-month, and 6-month timeframes to discover rising stars, declining threats, and long-term shifts.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 700 }}>
                <span style={{ color: 'var(--accent)', fontWeight: 900 }}>✓</span> Multi-month historical timeframe tracking
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 700 }}>
                <span style={{ color: 'var(--accent)', fontWeight: 900 }}>✓</span> Custom head-to-head trajectory comparison
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 700 }}>
                <span style={{ color: 'var(--accent)', fontWeight: 900 }}>✓</span> Discover rising stars and falling threats
              </li>
            </ul>
          </div>
          <button
            onClick={() => setLocation('/trend')}
            className="load-more-btn"
            style={{ width: '100%', padding: '0.9rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: 0 }}
          >
            <span>Open Trend Tracker</span>
            <span style={{ fontSize: '1.2rem', lineHeight: 0.5 }}>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Charts;
