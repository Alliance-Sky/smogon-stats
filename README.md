# smogonstats.eu.cc

A Pokemon Showdown usage stats viewer built with React and Vite.

## Features

- **Interactive Data Browsing**: View and filter Pokémon Showdown usage stats across different months, competitive formats (e.g., Gen 9 OU, Random Battles), and rating baselines.
- **Detailed Pokémon Stats**: Expand any Pokémon to see detailed breakdowns of their top Moves, Spreads, Items, and Abilities.
- **Scarlet / Violet Theming**: Features a dynamic theme toggle between Scarlet (light) and Violet (dark) aesthetics, defaulting to your system's color scheme preference.
- **Noise Reduction**: Automatically filters out Pokémon and detailed stats (moves, items, spreads, abilities) that have exactly `0.00000000%` usage to provide a cleaner viewing experience while still including Pokémon with `<0.01%` usage.
- **Dynamic Sprites**: Automatically fetches and displays centered Pokémon HOME sprites directly from Pokémon Showdown.
- **Performance & Caching**: Leverages the browser Cache API and Web Workers to efficiently fetch, parse, and cache Smogon's raw data files without blocking the main UI thread.

## Development

To start the development server:
```bash
npm install
npm run dev
```

## Build

To build the project for production:
```bash
npm run build
```

## Deployment

This project is configured to deploy directly to Cloudflare using the modern Workers with Static Assets (via Wrangler).

## Credits

- **[Smogon](https://www.smogon.com/stats/)**: For providing the raw competitive Pokémon usage statistics data.
- **[Pokémon Showdown](https://play.pokemonshowdown.com/sprites/)**: For the Pokémon sprite assets used in the application.
- **[React](https://react.dev/)** & **[Vite](https://vitejs.dev/)**: For the frontend framework and build tooling.

## License

This project is licensed under the [MIT License](LICENSE).
