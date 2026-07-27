import React from 'react';

export default function Changelog() {
  const updates = [
    {
      version: 'v2.1.0',
      date: '27 July, 2026',
      title: 'Backend V3 & Performance Optimizations',
      changes: [
        'Migrated to highly optimized v3 API endpoints with targeted JSON micro-payloads',
        'Removed Web Worker for parsing movesets, reducing bundle size and CPU overhead',
        'Updated data sorting and payload generation to use native floats instead of expensive string formatting',
        'Implemented Schwartzian Transform in backend sorting logic for up to 34% faster payload delivery'
      ]
    },
    {
      version: 'v2.0.0',
      date: '26 July, 2026',
      title: 'Architectural Overhaul & UI Enhancements',
      changes: [
        'Migrated to TanStack React Query, Zustand, Wouter, and TanStack Table for ultra-fast performance',
        'Solved loading layout shifts and rebuilt data visualization with custom Chart.js plugins',
        'Implemented collapsible filter HUD on Stats page (closed by default)',
        'Added smooth scroll-to-top on filter/sorting changes and guaranteed full-height card layouts',
        'Eliminated font layout shifts (FOUT) using CSS font-display block rules'
      ]
    },
    {
      version: 'v1.1.0',
      date: 'July 24, 2026',
      title: 'Format Chart, Guide, & Performance Overhaul',
      changes: [
        'Added Format Chart tools with cross-month charts and format-stats API integration',
        'Added Guide page with metric definitions',
        'Added Meta button and panel with animated Skeleton loaders',
        'Implemented Lead usage % sorting and display',
        'Implemented infinite scroll pagination and container-level virtualization to prevent lag',
        'Optimized Expand/Collapse All buttons to work instantly without freezing the UI',
        'Eliminated micro-flickering and layout clipping issues using React startTransition',
        'Persisted state (current view, expanded cards, format options) in URL parameters'
      ]
    },
    {
      date: 'July 23, 2026',
      title: 'PostgreSQL API Migration',
      changes: [
        'Migrated frontend to use new PostgreSQL backend API endpoints for usage and viability data',
        'Synced period, format, rating, and sortBy state to URL search parameters',
        'Implemented skeleton loading UI with smooth list fade-in to prevent flashing',
        'Added viability sorting and ceiling limits'
      ]
    },
    {
      version: 'v1.0.0',
      date: 'July 22, 2026',
      title: 'Initial Release',
      changes: [
        'Launched the core Smogon Stats viewer with filtering by Generation, Format, and Rating',
        'Dense accordion list layout for stats cards, displaying moves, abilities, items, and teammates',
        'Added Expand/Collapse All buttons and sort options (Usage, Viability)',
        'Included dark mode ("Violet") and light mode ("Scarlet") out of the box'
      ]
    }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div className="timeline-container">
        {updates.map((update, index) => (
          <div className="timeline-item" key={update.title + index}>
            <div className="timeline-node"></div>
            <div>
              <div className="timeline-date">
                {update.date}
                {update.version && <span className="timeline-version">{update.version}</span>}
              </div>
              <div className="timeline-content">
                <h3>{update.title}</h3>
                <ul>
                  {update.changes.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
