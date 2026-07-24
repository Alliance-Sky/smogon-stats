import React, { useState, useEffect } from 'react';

function Guide() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400); 
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="stats-page guide-page fade-in-data">
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div className="pulse-opacity" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="skeleton-block" style={{ width: '50%', height: '32px', borderRadius: '8px' }}></div>
            <div className="skeleton-block" style={{ width: '100%', height: '16px', borderRadius: '4px', marginTop: '10px' }}></div>
            <div className="skeleton-block" style={{ width: '90%', height: '16px', borderRadius: '4px' }}></div>
            
            <div style={{ marginTop: '30px' }}>
              <div className="skeleton-block" style={{ width: '30%', height: '24px', borderRadius: '6px', marginBottom: '15px' }}></div>
              <div className="skeleton-block" style={{ width: '95%', height: '16px', borderRadius: '4px', marginBottom: '10px' }}></div>
              <div className="skeleton-block" style={{ width: '85%', height: '16px', borderRadius: '4px', marginBottom: '10px' }}></div>
              <div className="skeleton-block" style={{ width: '90%', height: '16px', borderRadius: '4px' }}></div>
            </div>

            <div style={{ marginTop: '30px' }}>
              <div className="skeleton-block" style={{ width: '40%', height: '24px', borderRadius: '6px', marginBottom: '15px' }}></div>
              <div className="skeleton-block" style={{ width: '100%', height: '16px', borderRadius: '4px', marginBottom: '10px' }}></div>
              <div className="skeleton-block" style={{ width: '80%', height: '16px', borderRadius: '4px', marginBottom: '10px' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-page guide-page fade-in-data">
      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
          How to Read Smogon Stats
        </h2>
        
        <p style={{ marginBottom: '2rem', lineHeight: '1.6' }}>
          This guide explains the metrics, terminology, and playstyles used in Smogon statistics, helping you better understand the competitive Pokémon metagame data.
        </p>

        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>1. Filtering & Formats</h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Formats/Tiers:</strong> Competitive Pokémon is divided into tiers based on usage (e.g., OU, UU, RU, VGC). Generation (Gen 9, Gen 8) also dictates mechanics and available Pokémon.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Rating (Elo):</strong> The Elo rating filters matches. A rating of <code>0</code> includes all ladder matches, while ratings like <code>1695</code> or <code>1760</code> filter data to only include matches from top-level competitive players.
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>2. Primary Metrics</h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Usage (%):</strong> The percentage of teams in the selected format and rating that include a specific Pokémon.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Lead (%):</strong> How frequently a Pokémon is sent out as the very first Pokémon in a battle. High lead usage often indicates dedicated entry hazard setters.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Viability Ceiling:</strong> An estimation of a Pokémon's maximum potential in high-level play `[Top, Middle, Bottom]`, independent of its overall usage rate. It predicts performance based on win rates at high Elo.
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>3. Metagame Playstyles</h3>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            The <strong>Stalliness Scale</strong> determines if a metagame leans towards Offense or Stall. Playstyles are categorized by pacing and mechanics:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Offense / Hyperoffense:</strong> Fast-paced teams focused on dealing massive damage quickly and preventing the opponent from setting up.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Balance:</strong> A mix of offensive threats and defensive walls to handle a wide variety of situations.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Stall / Semistall:</strong> Defensive teams focused on surviving attacks and wearing down the opponent with passive damage (Toxic, hazards, etc.).</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Weatherless:</strong> Teams that do not rely on setting weather conditions (Sun, Rain, Sand, Snow).</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>VoltTurn:</strong> Teams relying on pivoting moves like Volt Switch and U-turn to maintain momentum and favorable matchups.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>4. Pokémon Details (Expanded View)</h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Top Spreads:</strong> Displays the Nature and Effort Values (EVs) commonly used. E.g., <code>Timid:252/0/0/0/4/252</code> means Timid nature, 252 HP, 0 Atk, 0 Def, 0 SpA, 4 SpD, 252 Spe.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Common Counters:</strong> Pokémon that statistically perform the best against the selected Pokémon by consistently forcing switches or scoring knockouts.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Common Teammates:</strong> Pokémon most frequently found on the same team as the selected Pokémon.</li>
          </ul>
        </section>

      </div>
    </div>
  );
}

export default Guide;
