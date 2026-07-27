import React from 'react';

export default function HeaderLogo({ onClick }) {
  return (
    <div 
      className="brand-logo-container"
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
