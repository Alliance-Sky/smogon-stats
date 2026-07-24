import React from 'react';

export default function HeaderLogo({ theme }) {
  const isViolet = theme === 'violet';

  return (
    <div className={`brand-logo-container ${isViolet ? 'violet-theme' : 'scarlet-theme'}`}>
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
