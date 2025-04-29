# Chill Airwaves Application Architecture

This document provides a detailed outline of the Chill Airwaves application's architecture, data flow, and core functionalities.

## 1. Overview

Chill Airwaves is a cross-platform desktop application built with Electron. It provides a unique atmospheric audio experience by combining lo-fi/ambient music streams with real-time Air Traffic Control (ATC) communications from various airports worldwide. Users can select airports, control audio volumes independently, and customize the visual theme.

## 2. Core Technologies

- **Framework:** Electron (`electron`, `@electron-forge/cli`) v32.0.1
- **UI Library:** React (`react`, `react-dom`)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) with persistence (`redux-persist`)
- **Language:** TypeScript (`typescript`)
- **Styling:** Tailwind CSS (`tailwindcss`), PostCSS (`postcss`), SCSS (`sass`)
- **Animation:** Framer Motion (`framer-motion`)
- **Audio Visualization:** AudioMotion Analyzer (`audiomotion-analyzer`)
- **Build Tool:** Vite v5.0.12 (`vite`, `@electron-forge/plugin-vite`)
- **Packaging:** Electron Forge (`@electron-forge/cli`)
- **Routing:** React Router (`react-router-dom`)
- **Audio Processing:** FFmpeg (`fluent-ffmpeg`, `@ffmpeg-installer/ffmpeg`)
- **Authentication:** Google OAuth (`@react-oauth/google`)
- **Notifications:** React Hot Toast (`react-hot-toast`)
- **Icons:** Phosphor Icons (`@phosphor-icons/react`)
- **Testing:** Directory structure suggests Jest-based testing

## 3. Application Startup Flow

1.  **Electron Main Process Initialization (`src/main.ts`):**
    - The application starts by running the main Electron process script (`src/main.ts`).
    - It configures basic app settings and loads environment variables from `.env` using `dotenv`.
    - Sets up FFmpeg path using `ffmpeg.setFfmpegPath(ffmpegInstaller.path)`.
    - Defines utility functions like `getAssetPath()` and `getIconPath()` to handle different paths in development vs production.
    - Sets custom dock icon for macOS in development mode.
    - Sets up application protocol `chill-airwaves://` using `app.setAsDefaultProtocolClient`.
    - Handles Squirrel startup events (Windows installer) and requests single instance lock.
    - Registers a custom protocol handler `atc://` using `protocol.handle('atc', atcProtocolHandler)`.
    - Registers an `icon://` protocol for accessing SVG icons.
    - Sets up IPC handlers for communication with renderer process:
      - `getEnv`: Returns environment variables to the renderer.
      - `get-downloads-path`: Provides the system downloads directory path.
      - `open-external`: Opens URLs in the default browser.
      - `verify-share`: Validates sharing links.
    - Installs React and Redux DevTools in development mode.
    - Listens for the `ready`, `window-all-closed`, `activate`, and `open-url` events.
2.  **Window Creation (`createWindow` in `src/main.ts`):**
    - Creates the main `BrowserWindow` instance with specific dimensions and web preferences:
      - Width: 1280px, Height: 620px (with minimum sizes set)
      - Icon path based on the platform (macOS, Windows, Linux)
      - Preload script specified as `preload: path.join(__dirname, 'preload.js')`
    - Loads the frontend application:
      - In development: Loads from Vite dev server URL (`MAIN_WINDOW_VITE_DEV_SERVER_URL`).
      - In production: Loads the built `index.html` file (`mainWindow.loadFile(...)`).
    - Sets up handlers to intercept navigation:
      - `setWindowOpenHandler`: Opens external URLs in the default browser.
      - `will-navigate` event listener: Checks if URLs are internal or external.
    - Opens DevTools for development purposes.
3.  **Preload Script Execution (`src/preload.ts`):**
    - Runs in a privileged context before the renderer process loads.
    - Uses `contextBridge.exposeInMainWorld('electronAPI', ...)` to securely expose specific Electron/Node.js functionalities to the renderer process:
      - `getEnv`: To fetch environment variables from the main process.
      - `getAtc`: To access ATC data.
      - `shell.openExternal`: To open URLs in the default system browser.
      - `verifyShare`: To verify and validate share links.
4.  **Renderer Process Initialization (`src/renderer.ts`):**
    - Entry point for the Vite-bundled frontend code.
    - Imports the main SCSS file (`./index.scss`) for global styles.
    - Imports `./app/App` to start React application.
    - Contains no functionality beyond initializing the application.
5.  **React Application Mount (`src/app/App.tsx`):**
    - Uses `createRoot` from `react-dom/client` to render the main React component (`<Main />`) into the `#root` div defined in `index.html`.
6.  **Main Component Setup (`src/app/components/Main.tsx`):**
    - Initializes state for downloads path, Google client ID, and loading state.
    - Makes API calls to the electron main process to retrieve environment variables.
    - Sets a timeout to control the initial loading/splashscreen duration.
    - Wraps the application in necessary providers:
      - `Provider store={store}`: Connects to Redux store.
      - `PersistGate`: Delays rendering until persisted state is retrieved.
      - `MusicProvider`: Provides context for music playback.
      - `GoogleOAuthProvider`: Configures Google authentication when client ID is available.
      - `ModalProvider`: Manages modal dialogs.
      - `BrowserRouter`: Enables React Router.
    - Defines routes for the application:
      - Root path (`/`): Renders the `Player` component.
      - Auth path (`/auth`): Renders the `Login` component.
    - Configures `Toaster` for notifications with custom styling.

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
      - Constructs the actual remote URL using `ATC_BASE_URL` from environment variables (e.g., `https://cdn.example.com/ksfo/KSFO-Gnd2-...mp3`).
      - **Proxying:** Directly fetches the audio file from the `remoteFileUrl` using Electron's `net.fetch`. No local caching or silence removal is performed.
      - **Response:** Returns the `Response` object obtained from `net.fetch`. Electron handles streaming the audio data to the renderer process.
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
- **`screens/Player.tsx`:** Main application view intended to replace the older `TestLayout.tsx` (migration noted in TODOs).
  - Integrates `StationSelector`, `Radar`, and `MusicPlayer`.
  - Connects to Redux to get state (`selectedAirport`, `currentAtcTrack`) and dispatch actions.
  - Connects to `MusicContext` for music control.
  - Includes streak counter integration via `useStreakCounter` hook.
  - Integrates advertisement banners through `BannerAd` component.
- **`screens/Splashscreen.tsx`:** Animated application startup screen.
  - Uses Framer Motion for SVG path animations to display the app logo.
  - Handles fade-out transitions.
- **`screens/Login.tsx`:** Authentication screen for user login.
- **`StationSelector.tsx`:** Handles displaying the airport selection dropdown/modal.
  - Uses `SelectAirport.tsx` to render the list.
  - Manages modal visibility state.
- **`radio/Radar.tsx`:** Displays ATC information and controls ATC playback.
  - Contains the core ATC `<audio>` element.
  - Integrates `ATCGridSquare` and `AtcAnimation` for visuals.
  - Shows airport details (IATA, city, country, local time via `LiveUTCClock`).
  - Includes the ATC volume control (`HiddenVolumeSlider`).
- **`musicPlayer/MusicPlayer.tsx`:** Controls and displays music playback.
  - Shows track info, controls, volume slider.
  - Integrates `DancingBars` visualization.
  - Includes `VinylRecord` animated component for visual flair.
  - Implements `ScrollingContainer` for text overflow animation.
  - Provides social media links to music sources (YouTube, Spotify).
- **Visual Components:**
  - `ATCGridBackground.tsx` / `ATCGridSquare.tsx`: Renders the static and animated radar grid visuals.
  - `AtcAnimation.tsx`: Renders the AudioMotionAnalyzer visualization for ATC.
  - `DancingBars.tsx`: Renders simple bar animations for music visualization.
  - `FadingImage.tsx`: Displays images with a fade-in effect.
  - `BackgroundImageOverlay.tsx`: Displays a background image.
  - `SoundWaves.tsx`: Audio visualization component.
- **Common Components (`src/app/components/common/`):** Reusable UI elements like:
  - `CustomRangeInput.tsx` / `HiddenVolumeSlider.tsx`: Volume control components.
  - `AnimatedTextLine.tsx`: Text with animation capabilities.
  - `ErrorBoundary.tsx`: React error boundary for fault tolerance.
  - `FacebookShare.tsx`: Social sharing functionality.
  - `BannerAd.tsx`: Advertisement integration component.
  - `StreakCounter.tsx`: Component to display user usage streak.
- **Modals (`src/app/components/modals/`):** Components for modal dialogs:
  - `Settings.tsx`: Application settings modal.
  - `Share.tsx`: Sharing options modal.

## 8. Key Services and Helpers

- **`AtcApiService.ts` (`src/app/services/`):** Builds ATC playlist URLs.
- **`themeService.ts` (`src/app/services/`):** Applies visual themes by manipulating CSS variables (`applyTheme`).
- **`environmentService.ts` (`src/app/services/`):** Provides access to environment variables via the `electronAPI` exposed in `preload.ts`.
- **`atcProtocol.ts` (`src/protocols/`):** Implements the custom `atc://` protocol handler. It now directly proxies requests for ATC audio to the configured `ATC_BASE_URL`.

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

- **Redux-Based Error Management**:

  - Centralized in Redux app state slice with an `errors` array and actions like `addError` and `clearErrors`.
  - Allows consistent error tracking and display across the application.

- **React Error Boundaries**:
  - Implementation in `ErrorBoundary.tsx` to catch and handle React component rendering errors.
  - Prevents entire application crashes when a component fails.
- **Logging System**:

  - Structured logger via `logger.ts` utility with support for different log levels (`DEBUG`, `INFO`, `WARN`, `ERROR`).
  - Provides context-based logging for better debugging capabilities.

- **YouTube-Specific Error Handling**:

  - `youtubeErrorHandler.ts` for handling YouTube API and player-specific errors.
  - Maps error codes to meaningful messages and recovery actions.

- **Network Error Management**:

  - Graceful fallbacks when ATC audio streams fail to load.
  - Automatic playlist advancement on errors via `onTrackError` handlers.

- **Input Validation**:
  - Client-side validation for user inputs and share links via `verifyShare` helper.

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

  - Implement dynamic loading for audio visualization components to reduce initial render time
  - Implement client-side caching strategy for frequently visited airports (Note: Server-side caching via CDN is assumed, but client-side could still be beneficial)
  - Further optimize silence detection/removal algorithm (Note: Currently removed from `atcProtocolHandler`, may need re-evaluation if required)
  - Implement a background worker for audio processing tasks

- **Feature Enhancements:**

  - Add support for additional ATC data sources beyond LiveATC
  - Complete implementation of user accounts with OAuth integration
  - Add playlist creation and sharing for favorite ATC stations
  - Implement night mode theme transitions based on user's local time
  - Add keyboard shortcuts for common actions
  - Implement customizable audio equalization settings

- **Technical Debt:**

  - Complete the migration from `TestLayout.tsx` to `Player.tsx` (update all references)
  - Increase unit test coverage, particularly for audio processing components
  - Consolidate duplicate volume control components
  - Refactor the MusicContext to use Redux or the React Context API more effectively

- **Platform Improvements:**

  - Add auto-update functionality via Electron's update mechanisms
  - Improve cross-platform ffmpeg integration with better error handling
  - Add macOS-specific Touch Bar controls
  - Improve startup performance on slower systems
  - Implement support for system media controls

- **Code Quality:**
  - Add comprehensive TypeScript interfaces for all data structures
  - Implement a stricter ESLint configuration
  - Set up GitHub Actions for CI/CD
  - Create comprehensive API documentation for context and service functions
  - Establish consistent error handling with standardized error types

---

**Note:** This document is intended to be a living reference. Please update as the architecture evolves.
