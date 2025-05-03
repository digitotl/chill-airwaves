# 10. Build and Packaging

- **Vite (`vite.*.config.ts`, `vite.base.config.ts`):** Used via `@electron-forge/plugin-vite` to bundle the TypeScript code for the main process, preload script, and renderer process separately.

- **Electron Forge (`forge.config.ts`, `package.json` scripts):**
  - `npm start` / `yarn start`: Runs the app in development mode with hot reloading.
  - `npm run package` / `yarn package`: Bundles the application code.
  - `npm run make` / `yarn make`: Creates distributable installers/packages (e.g., `.dmg`, `.exe`, `.deb`) for different operating systems based on the `makers` defined in `forge.config.ts`.
  - Configures Fuses (`FusesPlugin`) for enhanced security at package time.
  - Sets up protocol handlers (`protocols` in `packagerConfig`) for the packaged application.

[Back to Architecture Overview](./00-ARCHITECTURE-OVERVIEW.md)
