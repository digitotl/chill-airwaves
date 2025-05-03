# 2. Core Technologies

- **Framework:** Electron (`electron`, `@electron-forge/cli`) v32.0.1
- **UI Library:** React (`react`, `react-dom`)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) with persistence (`redux-persist`)
- **Language:** TypeScript (`typescript`)
- **Styling:**
  - Tailwind CSS layers are imported via `@tailwind` directives in `src/index.css` (not via `@import` in SCSS).
  - Custom SCSS styles are kept in `src/index.scss` and imported alongside `index.css` in the renderer entry (`src/renderer.ts`).
  - This approach avoids Sass deprecation warnings and follows Tailwind and Sass best practices.
- **Animation:** Framer Motion (`framer-motion`)
- **Audio Visualization:** AudioMotion Analyzer (`audiomotion-analyzer`)
- **Build Tool:** Vite v5.0.12 (`vite`, `@electron-forge/plugin-vite`)
- **Packaging:** Electron Forge (`@electron-forge/cli`)
- **Routing:** React Router (`react-router-dom`)
- **Authentication:** Google OAuth (`@react-oauth/google`)
- **Notifications:** React Hot Toast (`react-hot-toast`)
- **Icons:** Phosphor Icons (`@phosphor-icons/react`)
- **Testing:** Directory structure suggests Jest-based testing

[Back to Architecture Overview](./00-ARCHITECTURE-OVERVIEW.md)
