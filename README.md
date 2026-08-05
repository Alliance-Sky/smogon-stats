# [smogonstats.eu.cc](https://smogonstats.eu.cc)

A Pokémon Showdown usage stats viewer, analytics dashboard, and trend tracker.

---

## User Guide

### Overview

[smogonstats.eu.cc](https://smogonstats.eu.cc) lets competitive Pokémon players browse historical Pokémon Showdown usage stats, moveset details, viability tiers, battle volume data, and metagame trends across generations and formats.

### Features

- Usage Stats and Ratings: Filter ladder data by generation, format (Gen 9 OU, VGC, Random Battles, etc.), and rating baselines (such as 0, 1500, 1695, 1825 for Gen 9 OU; 0, 1100, 1300, 1500 for Random Battles).
- Trend Tracker: Graph usage trajectories over 6, 12, or 24 months for single or multiple Pokémon. For each format, Trend Tracker uses only the top 2 highest rating baselines (such as 1695 and 1825 for Gen 9 OU) to focus on top-tier play.
- Format Stats: Compare total battle count, battles per minute or hour, and estimated queue wait times across formats and months.
- Moveset Details: Expand any Pokémon card to inspect top moves, abilities, items, EV spreads, common teammates, and counters.
- Viability Tiers: Categorizes Pokémon into S (93+), A (91-92), B (88-90), C (84-87), D (<84), and N (unranked) tiers using top 1% ladder ceiling statistics.
- Metagame and Lead Metrics: Sort by Lead usage % and check metagame playstyles on the Stalliness Scale (Offense, Balance, Stall, VoltTurn, Weatherless).
- Guide and Changelog: In-app documentation explaining metrics and playstyles, plus a full project changelog.
- Themes and URL State: Switch between Light and Dark themes. Active period, format, rating, and expanded cards save in the URL.

---

## Technical and Self-Hosting Guide

### Tech Stack

- Frontend: Preact 10 (with preact/compat aliasing) and Vite 8.
- Static Site Generation (SSG): prerender.js runs after the build to generate pre-rendered HTML files for static routes (/ , /guide, /changelog, /charts, /trend, /chart), inline critical CSS, and preload fonts.
- Data and State: TanStack React Query v5 (caching and sync), Zustand v5 (global state), Wouter v3 (routing), and TanStack React Table v8.
- Charts: Chart.js v4 and react-chartjs-2.
- Backend: Fetches data from PostgreSQL endpoints via the v3 API (`api.smogonstats.eu.cc`).

### Directory Layout

```text
smogon-stats/
├── public/              Static assets and favicons
├── src/
│   ├── components/      UI components (FormatTools, TrendTracker, HeaderLogo, etc.)
│   ├── hooks/           React Query hooks (useStats)
│   ├── pages/           Route views (Stats, Charts, Guide, Changelog)
│   ├── utils/           API client (api.js) and Chart setup
│   ├── App.jsx          Main layout and router
│   ├── store.js         Zustand store
│   ├── entry-client.jsx Client hydration entrypoint
│   └── entry-server.jsx SSR entrypoint
├── index.html           HTML template
├── prerender.js         SSG script
├── vite.config.js       Vite config
└── wrangler.jsonc       Cloudflare Workers config
```

### Self-Hosting

#### Backend Requirement (proxy-api)

The frontend requires a separate backend service, [proxy-api](https://github.com/Alliance-Sky/proxy-api) (located outside this repository), to serve usage stats and process Smogon data into PostgreSQL.

To set up the backend:
1. Clone and build `proxy-api` (requires Go 1.20+ and PostgreSQL).
2. Set up your PostgreSQL database (`DATABASE_URL`) and run `make populate` to parse and import Smogon statistics.
3. Start the API server with `make run` or systemd (`proxy-api.service`). By default, it listens on port `9000`.

#### Required Configuration Changes

When self-hosting, update the API endpoints in both frontend and backend repositories:

1. Frontend (`smogon-stats`):
   - Edit `src/utils/api.js` and update `PRIMARY_API` and `LOCAL_API` to point to your backend API URL (e.g. `http://localhost:9000` or `https://api.yourdomain.com`).
   - If deploying to Cloudflare Workers, update the custom domain route in `wrangler.jsonc`.

2. Backend (`proxy-api`):
   - Ensure CORS headers in `proxy-api` allow requests from your frontend domain.
   - Set the `PORT` and `DATABASE_URL` environment variables to match your server environment.

#### Prerequisites

- Node.js 18+
- npm 9+

#### Setup and Development

```bash
git clone https://github.com/Alliance-Sky/smogon-stats.git
cd smogon-stats
npm install
npm run dev
```

The dev server runs on `http://localhost:10000`.

#### Build and Preview

```bash
npm run build
npm run preview
```

#### Deploy

Deploy to Cloudflare Workers with Static Assets using Wrangler:

```bash
npm run deploy
```

---

## Credits

- Smogon: For compiling raw Pokémon Showdown usage data.
- Pokémon Showdown: For battle platform data and sprite assets.
- Preact, TanStack, and Zustand: Open-source libraries used in the project.

## License

This project is licensed under the [MIT License](LICENSE).
