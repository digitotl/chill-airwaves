# 9. Configuration and Settings

- **`liveatc.ts` (`src/settings/`):** Contains a static list of `Airport` objects, including their names, IATA/ICAO codes, locations, UTC offsets, and available ATC station paths.

- **`audioMotionAnalyzer.ts` (`src/settings/`):** Defines default configuration options (`AUDIO_MOTION_ANALYZER_SETTINGS`) for the `AudioMotionAnalyzer` instance used in `AtcAnimation.tsx`.

- **`.env`:** Stores environment-specific variables like `VITE_CLOUDFLARE_CDN_URL` and `VITE_GOOGLE_CLIENT_ID`. Accessed securely via environment variable handling system.

  - **Environment Variable Handling:** The application uses a secure mechanism to access environment variables:

    - In main process: A `getEnvVar()` utility function handles access to environment variables in both development and production builds.
    - In development: Uses Vite's `import.meta.env`
    - In production: Falls back to `process.env` for variables that are replaced during build

  - **Environment Validation:** The app performs validation of required environment variables on startup and displays a dialog if any are missing.
  - **Required Variables:**
    - `VITE_ASSETS_SERVER_URL`
    - `VITE_CLOUDFLARE_CDN_URL`
    - `VITE_CLOUDFLARE_API_URL`
    - `VITE_CLOUDFLARE_ACCESS_KEY_ID`
    - `VITE_CLOUDFLARE_SECRET_ACCESS_KEY`
    - `VITE_CLOUDFLARE_BUCKET_NAME`
    - `VITE_YOUTUBE_PLAYLIST_ID`
    - `VITE_GOOGLE_CLIENT_ID`
    - `VITE_LIVE_ATC_URL`

- **Development/Production Environment Controls:**

  - **DevTools Access:**

    - Automatically opens in development mode for debugging (`!app.isPackaged`)
    - Completely restricted in production through multiple mechanisms:
      - DevTools disabled in WebPreferences
      - DevTools menu items removed from View menu
      - Force-close of DevTools if opened through alternative means
      - Keyboard shortcuts disabled
    - This ensures end users cannot inspect or modify the application in production

  - **Environment Validation:** The app performs validation of required environment variables on startup and displays a dialog if any are missing.

- **`tailwind.config.js`, `postcss.config.js`:** Configuration for Tailwind CSS and PostCSS. Themes are applied dynamically by setting CSS variables defined here (`--color-primary`, etc.).

- **`forge.config.ts`:** Configuration for Electron Forge, defining packaging options, makers (for different OS installers), and the Vite plugin setup for building main, preload, and renderer code.

[Back to Architecture Overview](./00-ARCHITECTURE-OVERVIEW.md)
