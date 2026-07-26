import React, { useState } from 'react';

export default function ControlsContainer({ children, label = "Filter & Display Controls", defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="glass-panel collapsible-hud-container">
      <div 
        className="controls-header" 
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-color)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <span style={{ color: 'var(--primary)', fontSize: '1.1rem', lineHeight: 1 }}>⚙</span>
          <span>{label}</span>
        </div>
        <div 
          className="expand-icon" 
          style={{ 
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', 
            color: expanded ? 'var(--primary)' : 'var(--text-muted)' 
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      <div className={`controls-grid fade-in-data ${expanded ? 'is-expanded' : 'is-collapsed'}`}>
        {children}
      </div>
    </div>
  );
}
