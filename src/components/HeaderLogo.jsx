import React from 'react';

export default function HeaderLogo({ theme, onClick }) {
  return (
    <div 
      className={`brand-logo-container ${theme}-theme`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="brand-text-group">
        <div className="brand-title">
          <span className="brand-main">SMOGON</span>
          <span className="brand-sub">STATS</span>
        </div>
        <span className="brand-mascot-tag">Competitive Pokémon Analytics</span>
      </div>
    </div>
  );
}
