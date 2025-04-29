# Chill Airwaves Application Architecture

This document provides a detailed outline of the Chill Airwaves application's architecture, data flow, and core functionalities.

## 1. Overview

Chill Airwaves is a cross-platform desktop application built with Electron. It provides a unique atmospheric audio experience by combining lo-fi/ambient music streams with real-time Air Traffic Control (ATC) communications from various airports worldwide. Users can select airports, control audio volumes independently, and customize the visual theme.

## 2. Core Technologies

- **Framework:** Electron (`electron`, `@electron-forge/cli`)
- **UI Library:** React (`react`, `react-dom`)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) with persistence (`redux-persist`)
- **Language:** TypeScript (`typescript`)
- **Styling:** Tailwind CSS (`tailwindcss`), PostCSS (`postcss`), SCSS (`sass`)
- **Animation:** Framer Motion (`framer-motion`)
- **Audio Visualization:** AudioMotion Analyzer (`audiomotion-analyzer`)
- **Build Tool:** Vite (`vite`, `@electron-forge/plugin-vite`)
- **Packaging:** Electron Forge (`@electron-forge/cli`)
- **Routing:** React Router (`react-router-dom`)
- **Testing:** (Add if present, e.g., Jest, React Testing Library)

## 3. Application Startup Flow

1.  **Electron Main Process Initialization (`src/main.ts`):**
    - The application starts by running the main Electron process script (`src/main.ts`).
    - It configures basic app settings, handles Squirrel startup events (Windows installer), and requests single instance lock.
    - Sets up application protocol `chill-airwaves://` using `app.setAsDefaultProtocolClient`.
    - Defines IPC handlers (`ipcMain.handle`) to respond to requests from the renderer process (e.g., `getEnv`, `open-external`, `verify-share`).
    - Registers a custom protocol handler `atc://` using `protocol.handle('atc', atcProtocolHandler)` which points to `src/protocols/atcProtocol.ts`.
    - Loads environment variables from `.env` using `dotenv`.
    - Installs React DevTools extension in development mode.
    - Listens for the `ready` event (`app.on('ready', createWindow)`).
2.  **Window Creation (`createWindow` in `src/main.ts`):**
    - Creates the main `BrowserWindow` instance with specific dimensions and web preferences.
    - Specifies the `preload` script: `preload: path.join(__dirname, 'preload.js')`.
    - Loads the frontend application:
      - In development: Loads the URL provided by the Vite dev server (`MAIN_WINDOW_VITE_DEV_SERVER_URL`).
      - In production: Loads the built `index.html` file (`mainWindow.loadFile(...)`).
    - Sets up handlers to open external links in the default system browser (`mainWindow.webContents.setWindowOpenHandler`, `mainWindow.webContents.on('will-navigate')`).
    - Opens DevTools (`mainWindow.webContents.openDevTools()`).
3.  **Preload Script Execution (`src/preload.ts`):**
    - Runs in a privileged context before the renderer's web content begins loading but after the DOM is available.
    - Uses `contextBridge.exposeInMainWorld('electronAPI', ...)` to securely expose specific Electron/Node.js functionalities to the renderer process. This includes:
      - `getEnv`: To fetch environment variables from the main process.
      - `getAtc`: (Potentially unused or legacy) Intended to get ATC data.
      - `shell.openExternal`: To open URLs externally.
      - `verifyShare`: To verify share links.
4.  **Renderer Process Initialization (`src/renderer.ts`):**
    - Entry point for the Vite-bundled frontend code.
    - Imports the main SCSS file (`./index.scss`) for global styles.
    - Imports and executes `./app/App.tsx`.
5.  **React Application Mount (`src/app/App.tsx`):**
    - Uses `createRoot` from `react-dom/client` to render the main React component (`<Main />`) into the `#root` div defined in `index.html`.
6.  **Main Component Setup (`src/app/components/Main.tsx`):**
    - Wraps the application in necessary providers:
      - `Provider store={store}`: Connects the app to the Redux store (`src/app/store/index.ts`).
      - `PersistGate`: Delays rendering until the persisted Redux state is retrieved.
      - `MusicProvider`: Provides music playback context (`src/app/context/MusicContext.tsx`).
      - `GoogleOAuthProvider`: (If `googleClientId` is fetched) For Google authentication.
      - `ModalProvider`: Manages modal dialogs (`src/app/context/ModalContext.tsx`).
      - `BrowserRouter`: Enables routing using React Router.
    - Fetches the `GOOGLE_CLIENT_ID` from the main process using `window.electronAPI.getEnv`.
    - Sets up application routes (`<Routes>`) - currently `/` maps to `<Player />` (likely `TestLayout.tsx` or similar) and `/auth` to `<Login />`.
    - Includes `<Toaster />` for displaying notifications (`react-hot-toast`).

## 4. State Management (Redux)

- **Store Configuration (`src/app/store/index.ts`):**
  - Configures the Redux store using `configureStore` from Redux Toolkit.
  - Combines reducers from different slices (`atcSlice`, `userPreferencesSlice`, `appSlice`).
  - Integrates `redux-persist` to save parts of the state (like user preferences) to local storage, making them persistent across app restarts. Uses `persistReducer` and `persistStore`.
  - Configures middleware, including `listenerMiddleware` for reacting to specific actions (e.g., applying themes) and default middleware (like `thunk`).
- **ATC Slice (`src/app/store/atc/atcSlice.ts`):**
  - Manages state related to ATC audio:
    - `selectedAirportIata`: The IATA code of the currently selected airport.
    - `atcPlaylist`: An object containing `tracks` (URLs) and `currentTrackIndex`.
  - **Reducers:**
    - `setSelectedAirportIata`: Updates the selected airport.
    - `setAtcPlaylist`: Sets the list of ATC audio track URLs.
    - `nextTrack`: Increments `currentTrackIndex` to play the next ATC track.
  - **Selectors:** Provide memoized functions to access parts of the ATC state (e.g., `getSelectedAirport`, `getCurrentAtcTrack`).
  - **Async Logic/Effects:** Uses `createListenerMiddleware` (`startAppListening`) to react to `setSelectedAirportIata`. When an airport is selected, it:
    - Finds the `Airport` object from `src/settings/liveatc.ts`.
    - Calls `AtcApiService.buildAtcPlaylist` (`src/app/services/atcApiService.ts`) to generate a list of ATC audio URLs (using the `atc://` protocol).
    - Dispatches `setAtcPlaylist` to update the store with the new playlist.
- **User Preferences Slice (`src/app/store/userPreferences/userPreferencesSlice.ts`):**
  - Manages user settings:
    - `selectedTheme`: The current visual theme object (`AppTheme`).
    - `likedAirportsIata`: Array of liked airport IATA codes.
    - `musicVolume`, `atcVolume`: Volume levels (0-1).
    - Streak-related state (`streakCount`, `lastVisitDate`, `sessionStartTime`).
  - **Reducers:** Simple state updates (e.g., `setSelectedTheme`, `setMusicVolume`, `addLikedAirport`).
  - **Effects:** Uses `startAppListening` to react to `setSelectedTheme`. When the theme changes, it calls `applyTheme` (`src/app/services/themeService.ts`) to update CSS variables on the root HTML element.
- **App State Slice (`src/app/store/appState/appSlice.ts`):**
  - Manages general application state like loading status, errors, etc.
  - Includes an `errors` array and reducers like `addError`, `clearErrors`.

## 5. ATC Audio Data Flow

1.  **Airport Selection (`src/app/components/radio/StationSelector.tsx` -> `SelectAirport.tsx`):**
    - User selects an airport from the list provided by `src/settings/liveatc.ts`.
    - The `onSelect` handler (passed down from `TestLayout.tsx` or similar) dispatches the `setSelectedAirportIata` action to the Redux store.
2.  **Playlist Generation (Redux Effect in `atcSlice.ts`):**
    - The listener middleware detects the `setSelectedAirportIata` action.
    - It calls `AtcApiService.buildAtcPlaylist`.
    - `buildAtcPlaylist` generates an array of URLs like `atc://ksfo/KSFO-Gnd2-MM-DD-YYYY-HHMMZ.mp3` based on the airport's ICAO, station path, and recent timestamps. The number of records is defined by `ATC_RECORDS_COUNT`.
    - The generated playlist (array of `atc://` URLs) is dispatched via `setAtcPlaylist`.
3.  **Audio Playback Request (`src/app/components/radio/Radar.tsx`):**
    - The `Radar` component gets the `currentAtcTrack` (a `atc://` URL) from the Redux store via the `getCurrentAtcTrack` selector.
    - It sets this URL as the `src` for its internal HTML `<audio>` element (`audioElementRef`).
4.  **Custom Protocol Handling (`src/protocols/atcProtocol.ts`):**
    - Electron's main process intercepts the request for the `atc://` URL because it was registered with `protocol.handle`.
    - The `atcProtocolHandler` function executes:
      - Extracts the remote file path (e.g., `ksfo/KSFO-Gnd2-...mp3`) from the `atc://` URL.
      - Constructs the actual remote URL using `ATC_BASE_URL` from environment variables (e.g., `https://liveatc.net/archive/...`).
      - **Caching:** Checks if the file exists in a local cache directory (`app.getPath('downloads')/chill-airwaves-cache`).
        - If cached: Reads the file from the cache (`fs.readFile`).
        - If not cached:
          - Downloads the MP3 file from the `remoteFileUrl` using Electron's `net.request`.
          - Saves the downloaded file to the cache directory (`fs.writeFile`).
      - **Silence Removal:** Processes the cached/downloaded MP3 file using `removeSilence` (`src/helpers/silenceRemover.ts`). This likely involves calling an external `ffmpeg` process to strip silent parts, making the ATC communication more concise. The processed file might be saved temporarily.
      - **Response:** Creates a `Response` object containing the processed audio data (likely read from the silence-removed file) with the correct `Content-Type: audio/mpeg` header.
5.  **Audio Playback & Visualization (`src/app/components/radio/Radar.tsx`, `AtcAnimation.tsx`):**
    - The renderer process receives the audio data stream from the main process via the custom protocol handler.
    - The `<audio>` element in `Radar.tsx` plays the ATC audio.
    - The `Radar` component handles audio events:
      - `onTrackEnd`, `onTrackError`: Dispatch `nextTrack` action to Redux to advance the playlist.
      - `onCanPlay`, `onLoadStart`: Update loading/playing states.
    - The `AtcAnimation` component (`src/app/components/radio/AtcAnimation.tsx`) is passed the `<audio>` element ref. It uses `AudioMotionAnalyzer` to create visualizations based on the ATC audio frequency data, configured via `src/settings/audioMotionAnalyzer.ts`.
    - Volume is controlled via `HiddenVolumeSlider.tsx` which updates the `<audio>` element's volume and dispatches `setAtcVolume` to the Redux store.

## 6. Music Audio Data Flow

- **Context (`src/app/context/MusicContext.tsx`):**
  - Manages the state and logic for music playback, likely using a YouTube player (potentially `react-youtube` or similar).
  - Provides state like `videoInfo`, `isPlaying`, `isBuffering`, `volume`.
  - Provides functions like `playTrack`, `pauseTrack`, `nextTrack`, `previousTrack`, `setVolume`.
- **Player Component (`src/app/components/musicPlayer/MusicPlayer.tsx`):**
  - Consumes the `MusicContext`.
  - Displays track information (`videoInfo`).
  - Provides UI controls (play/pause, next/prev buttons, volume slider) that call the corresponding functions from the context.
  - May include visualizations like `DancingBars.tsx`.
- **Volume Control:** The volume slider in `MusicPlayer.tsx` calls `setVolume` from the context and also dispatches `setMusicVolume` to the Redux store for persistence.

## 7. UI Components Breakdown

- **`Main.tsx`:** Top-level component, sets up providers and routing.
- **`TestLayout.tsx` (or similar Player component):** Main view container.
  - Integrates `StationSelector`, `Radar`, and `MusicPlayer`.
  - Connects to Redux to get state (`selectedAirport`, `currentAtcTrack`) and dispatch actions (`nextAtcTrack`, `setSelectedAirportIata`).
  - Connects to `MusicContext` for music control.
- **`StationSelector.tsx`:** Handles displaying the airport selection dropdown/modal.
  - Uses `SelectAirport.tsx` to render the list.
  - Manages modal visibility state.
- **`Radar.tsx`:** Displays ATC information and controls ATC playback.
  - Contains the core ATC `<audio>` element.
  - Integrates `ATCGridSquare` and `AtcAnimation` for visuals.
  - Shows airport details (IATA, city, country, local time via `LiveUTCClock`).
  - Includes the ATC volume control (`HiddenVolumeSlider`).
- **`MusicPlayer.tsx`:** Controls and displays music playback.
  - Shows track info, controls, volume slider.
  - Integrates `DancingBars` visualization.
- **Visual Components:**
  - `ATCGridBackground.tsx` / `ATCGridSquare.tsx`: Renders the static and animated radar grid visuals.
  - `AtcAnimation.tsx`: Renders the AudioMotionAnalyzer visualization for ATC.
  - `DancingBars.tsx`: Renders simple bar animations, likely for music.
  - `FadingImage.tsx`: Displays images with a fade-in effect.
  - `BackgroundImageOverlay.tsx`: Displays a background image.
- **Common Components (`src/app/components/common/`):** Reusable UI elements like sliders (`CustomRangeInput`, `HiddenVolumeSlider`), buttons, error boundaries (`ErrorBoundary.tsx`), etc.
- **Modals (`src/app/components/modals/`):** Components for modal dialogs (e.g., `Settings.tsx`). Managed via `ModalContext.tsx` and `useModal.tsx` hook.

## 8. Key Services and Helpers

- **`AtcApiService.ts` (`src/app/services/`):** Builds ATC playlist URLs.
- **`themeService.ts` (`src/app/services/`):** Applies visual themes by manipulating CSS variables (`applyTheme`).
- **`cacheService.ts` (`src/services/`):** (Used by `atcProtocolHandler`) Manages caching of downloaded ATC files in the user's downloads directory.
- **`environmentService.ts` (`src/app/services/`):** Provides access to environment variables via the `electronAPI` exposed in `preload.ts`.
- **`silenceRemover.ts` (`src/helpers/`):** (Used by `atcProtocolHandler`) Contains logic to invoke `ffmpeg` to remove silence from audio files.
- **`atcProtocol.ts` (`src/protocols/`):** Implements the custom `atc://` protocol handler for fetching, caching, and processing ATC audio.
- **`logger.ts` (`src/app/utils/`):** Simple utility for logging messages with levels and context.
- **Color Helpers (`src/helpers/`):** `lightenColor.ts`, `transparentColor.ts`.

## 9. Configuration and Settings

- **`liveatc.ts` (`src/settings/`):** Contains a static list of `Airport` objects, including their names, IATA/ICAO codes, locations, UTC offsets, and available ATC station paths.
- **`audioMotionAnalyzer.ts` (`src/settings/`):** Defines default configuration options (`AUDIO_MOTION_ANALYZER_SETTINGS`) for the `AudioMotionAnalyzer` instance used in `AtcAnimation.tsx`.
- **`.env`:** Stores environment-specific variables like `ATC_BASE_URL` and `GOOGLE_CLIENT_ID`. Accessed securely via `ipcMain` and `preload.ts`.
- **`tailwind.config.js`, `postcss.config.js`:** Configuration for Tailwind CSS and PostCSS. Themes are applied dynamically by setting CSS variables defined here (`--color-primary`, etc.).
- **`forge.config.ts`:** Configuration for Electron Forge, defining packaging options, makers (for different OS installers), and the Vite plugin setup for building main, preload, and renderer code.

## 10. Build and Packaging

- **Vite (`vite.*.config.ts`, `vite.base.config.ts`):** Used via `@electron-forge/plugin-vite` to bundle the TypeScript code for the main process, preload script, and renderer process separately.
- **Electron Forge (`forge.config.ts`, `package.json` scripts):**
  - `npm start` / `yarn start`: Runs the app in development mode with hot reloading.
  - `npm run package` / `yarn package`: Bundles the application code.
  - `npm run make` / `yarn make`: Creates distributable installers/packages (e.g., `.dmg`, `.exe`, `.deb`) for different operating systems based on the `makers` defined in `forge.config.ts`.
  - Configures Fuses (`FusesPlugin`) for enhanced security at package time.
  - Sets up protocol handlers (`protocols` in `packagerConfig`) for the packaged application.

## 11. Folder Structure (Summary)

- `src/app/components/`: React UI components
- `src/app/context/`: React context providers
- `src/app/store/`: Redux store and slices
- `src/app/services/`: App-level services (API, theme, environment)
- `src/services/`: Backend and cache services
- `src/helpers/`: Utility and helper functions
- `src/protocols/`: Custom protocol handlers
- `src/settings/`: Static configuration and settings
- `src/app/utils/`: Logging and error handling utilities
- `src/assets/`: Fonts and images

## 12. Error Handling

- Centralized in Redux app state slice (`errors` array, `addError`, `clearErrors` reducers).
- Error boundaries in React components (e.g., `ErrorBoundary.tsx`).
- Logging via `logger.ts` utility.

## 13. Testing and Quality Assurance

- The project uses a directory-based test structure with `__tests__` folders placed alongside the code they test
- This allows for easier maintenance and better organization of test files related to specific components or functionality
- Key test directories include:
  - `src/__tests__/`: Top-level tests for core application functionality
  - `src/app/context/__tests__/`: Tests for React context providers
  - `src/app/hooks/__tests__/`: Tests for custom React hooks
  - `src/helpers/__tests__/`: Tests for utility functions
  - `src/services/__tests__/`: Tests for backend services
- While there's no explicit Jest configuration visible, the structure suggests Jest is likely used as the testing framework
- Additional testing tools that would benefit the project:
  - React Testing Library for component tests
  - Mock Service Worker (MSW) for API mocking
  - Playwright or Spectron for end-to-end testing of the Electron application

## 14. Future Improvements / TODOs

- **Performance Optimization:**

  - Implement lazy loading for non-essential components to improve initial load time
  - Further optimize audio processing to reduce CPU usage during silence removal
  - Consider WebAssembly for audio processing tasks to improve performance

- **Feature Enhancements:**

  - Add support for additional ATC data sources beyond LiveATC
  - Implement user accounts with cloud synchronization of preferences
  - Add playlist creation/saving for favorite ATC stations
  - Introduce more visualization options for audio streams

- **Technical Debt:**

  - Rename `TestLayout.tsx` to a more appropriate name (e.g., `PlayerLayout.tsx`)
  - Increase test coverage, particularly for critical components and services
  - Complete migration of any remaining class components to functional components with hooks

- **Platform Improvements:**

  - Enhance mobile-friendly design for potential future web version
  - Add automatic updates mechanism for desktop application
  - Optimize ffmpeg integration with better error handling and progress reporting

- **Code Quality:**
  - Implement stricter TypeScript configurations
  - Set up continuous integration pipeline with automated tests
  - Document public API methods and interfaces
  - Establish consistent error handling strategy across main and renderer processes

---

**Note:** This document is intended to be a living reference. Please update as the architecture evolves.
