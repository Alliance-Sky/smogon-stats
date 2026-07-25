import React from 'react';

export default function Changelog() {
  const updates = [
    {
      version: 'v2.0.0',
      date: '26 July, 2026',
      title: 'Architectural Overhaul & Performance Rewrite',
      changes: [
        'Migrated to TanStack React Query for intelligent client-side caching and API orchestration',
        'Implemented TanStack React Table for ultra-fast, headless rendering of the main stats table',
        'Adopted Zustand for zero-boilerplate global state management',
        'Swapped traditional routing for Wouter to drastically reduce bundle size',
        'Solved loading layout shifts with a highly optimized 300ms caching delay logic',
        'Rebuilt the data visualization engine with custom Chart.js plugins to solve layout and formatting edge cases'
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
