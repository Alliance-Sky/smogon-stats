# smogonstats.eu.cc

A Pokémon Showdown usage stats viewer and analytics dashboard built with React, Vite, and Cloudflare Workers.

## Features

- **Interactive Competitive Analytics**: Browse and filter historical Pokémon Showdown usage statistics across generations, competitive formats (e.g., Gen 9 OU, VGC, Random Battles), and Elo rating baselines (0, 1500, 1695, 1760+).
- **Comprehensive Charts & Trend Tracking**: Dedicated Charts dashboard featuring cross-month Format Stats comparisons and a Trend Tracker to visualize metagame shifts over time.
- **In-Depth Pokémon Breakdowns**: Expand any Pokémon card to inspect detailed competitive metrics, including Top Moves, Abilities, Items, EV Spreads, Common Teammates, and Counters/Checks.
- **Viability Ceiling & Lead Metrics**: Sort and evaluate Pokémon by total Usage %, Viability Ceiling (Top, Middle, Bottom tiers), and Lead usage percentages.
- **Minimalist Design**: Clean typography (Outfit Variable font), high-end glassmorphism panels, and a responsive layout with custom Scarlet (light) and Violet (dark) color themes.
- **Zero-Flicker & Shift-Free UX**: Optimized rendering engine with CSS font-display block rules, smooth scroll-to-top navigation, and stable layout dimensions to eliminate FOUT and layout shifts.
- **URL State Persistence**: Deep-linking support that preserves active view, selected period, format, rating baseline, and expanded cards in URL search parameters.
- **Dedicated Guide & Documentation**: Built-in reference guide explaining Smogon terminology, rating filters, primary metrics, and metagame playstyles (Stalliness scale, Offense, Balance, VoltTurn).

## Architecture & Technology Stack

- **Frontend Framework**: React 18 with Vite and Rolldown bundling.
- **Data Management & Caching**: TanStack React Query for API caching, deduplication, and background synchronization.
- **State Management**: Zustand for lightweight, zero-boilerplate global state orchestration.
- **High-Speed Rendering**: TanStack React Table for headless, virtualized list processing with native Float64 numeric sorting.
- **Client-Side Routing**: Wouter for minimal bundle footprint.
- **Data Visualization**: Chart.js and react-chartjs-2 with custom plugins for advanced responsive charting.
- **Backend Integration**: Connected to PostgreSQL database endpoints via the highly optimized proxy-api v3, utilizing targeted micro-payloads for detailed data lookups.

## Development

To start the development server locally:

```bash
npm install
npm run dev
```

## Build

To create an optimized production build:

```bash
npm run build
```

## Deployment

This project is configured for edge deployment on Cloudflare using Workers with Static Assets (via Wrangler):

```bash
npm run deploy
```

## Credits

- **[Smogon](https://www.smogon.com/stats/)**: For compiling and providing raw competitive Pokémon usage statistics.
- **[Pokémon Showdown](https://play.pokemonshowdown.com/sprites/)**: For competitive battle platform data and sprite assets.
- **[TanStack](https://tanstack.com/)** & **[Zustand](https://docs.pmnd.rs/zustand)**: For modern React query caching and state architecture.

## License

This project is licensed under the [MIT License](LICENSE).
