# 4. State Management (Redux)

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
    - Calls `AtcApiService.buildAtcPlaylist` (`src/app/services/atcApiService.ts`) to generate a list of ATC audio URLs (using direct CDN URLs).
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

[Back to Architecture Overview](./00-ARCHITECTURE-OVERVIEW.md)
