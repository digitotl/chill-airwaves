# 9. Configuration and Settings

- **`liveatc.ts` (`src/settings/`):** Contains a static list of `Airport` objects, including their names, IATA/ICAO codes, locations, UTC offsets, and available ATC station paths.

- **`audioMotionAnalyzer.ts` (`src/settings/`):** Defines default configuration options (`AUDIO_MOTION_ANALYZER_SETTINGS`) for the `AudioMotionAnalyzer` instance used in `AtcAnimation.tsx`.

- **`.env`:** Stores environment-specific variables like `VITE_CLOUDFLARE_CDN_URL` and `VITE_GOOGLE_CLIENT_ID`. Accessed securely via `ipcMain` and `preload.ts`.

- **`tailwind.config.js`, `postcss.config.js`:** Configuration for Tailwind CSS and PostCSS. Themes are applied dynamically by setting CSS variables defined here (`--color-primary`, etc.).

- **`forge.config.ts`:** Configuration for Electron Forge, defining packaging options, makers (for different OS installers), and the Vite plugin setup for building main, preload, and renderer code.

[Back to Architecture Overview](./00-ARCHITECTURE-OVERVIEW.md)
