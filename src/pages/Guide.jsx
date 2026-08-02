import React from 'react';

function Guide() {
  return (
    <div className="stats-page guide-page fade-in-data">
      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>1. Filtering & Formats</h3>
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
          <h3 style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>2. Primary Metrics</h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Usage (%):</strong> The percentage of teams in the selected format and rating that include a specific Pokémon.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Lead (%):</strong> How frequently a Pokémon is sent out as the very first Pokémon in a battle. High lead usage often indicates dedicated entry hazard setters.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Viability Tiers (S, A, B, C, D, N):</strong> An estimation of a Pokémon's maximum potential in high-level play, independent of its overall usage rate. While Smogon's official Viability Rankings are manually curated by the community on forums, we calculate these tiers programmatically using the "Top 1%" ceiling metric from ladder statistics.
              <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li><strong>S Tier (≥ 93):</strong> The absolute elite meta-definers (Top ~5%).</li>
                <li><strong>A Tier (91 - 92):</strong> Excellent and highly viable choices (Next ~20%).</li>
                <li><strong>B Tier (88 - 90):</strong> Solid performers forming the core of the metagame (Next ~20%).</li>
                <li><strong>C Tier (84 - 87):</strong> Niche or situational picks (Next ~35%).</li>
                <li><strong>D Tier (&lt; 84):</strong> Fringe choices that are generally outclassed (Bottom ~20%).</li>
                <li><strong>N Tier:</strong> Unranked. Pokémon with insufficient high-level ladder data to calculate a reliable ceiling.</li>
              </ul>
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>3. Metagame Playstyles</h3>
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
          <h3 style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>4. Pokémon Details (Expanded View)</h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Top Spreads:</strong> Displays the Nature and Effort Values (EVs) commonly used. E.g., <code>Timid:252/0/0/0/4/252</code> means Timid nature, 252 HP, 0 Atk, 0 Def, 0 SpA, 4 SpD, 252 Spe.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Common Counters:</strong> Pokémon that statistically perform the best against the selected Pokémon by consistently forcing switches or scoring knockouts.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Common Teammates:</strong> Pokémon most frequently found on the same team as the selected Pokémon.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>5. Trend Tracker</h3>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            The Trend Tracker is an advanced historical analysis tool that lets you visualize meta shifts over time.
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Historical Tracking:</strong> See how a Pokémon's usage percentage has evolved over the past 6, 12, or 24 months.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Multi-Comparison:</strong> Type and add multiple Pokémon to the chart to compare their usage trends head-to-head.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Rating Baselines:</strong> The Trend Tracker strictly curates data from the top 2 highest rating brackets for each format to ensure you are analyzing true top-tier competitive trends.</li>
          </ul>
        </section>

      </div>
    </div>
  );
}

export default Guide;
