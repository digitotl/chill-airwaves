# 5. ATC Audio Data Flow

1.  **Airport Selection (`src/app/components/radio/StationSelector.tsx` -> `SelectAirport.tsx`):**

    - User selects an airport from the list provided by `src/settings/liveatc.ts`.
    - The `onSelect` handler (passed down from `TestLayout.tsx` or similar) dispatches the `setSelectedAirportIata` action to the Redux store.

2.  **Playlist Generation (Redux Effect in `atcSlice.ts`):**

    - The listener middleware detects the `setSelectedAirportIata` action.
    - It first attempts to use `AtcApiService.buildAtcPlaylistFromAvailable`, which:
      - Makes a request to the R2 storage bucket using the S3-compatible list-objects API (`?list-type=2`)
      - Parses the XML response to extract available audio file names
      - Sorts them by name (reverse chronological order)
      - Creates direct URLs to the Cloudflare CDN
    - If the request fails or returns no files, it falls back to the original `AtcApiService.buildAtcPlaylist`, which:
      - Generates an array of direct CDN URLs based on the airport's ICAO, station path, and recent timestamps
      - The number of records is defined by `ATC_RECORDS_COUNT`
    - The generated playlist (array of direct CDN URLs) is dispatched via `setAtcPlaylist`.

3.  **ATC file listing (playlist generation) uses an IPC-based flow:**

    - The renderer calls `window.electronAPI.fetchAvailableAtcFiles` (exposed in `preload.ts`).
    - This triggers the `atc:fetchAvailableFiles` IPC handler in the main process (`src/main.ts`).
    - The handler calls `fetchAvailableAtcFilesFromR2` in `src/services/atcService.ts`, which fetches the file list from the R2 bucket using Node.js (no CORS).
    - The result is returned to the renderer, which builds the playlist URLs with the CDN base URL.
    - **Direct fetch from the renderer/browser is not used for R2 file listing due to CORS restrictions.**

4.  **Audio Playback Request (`src/app/components/radio/Radar.tsx`):**

    - The `Radar` component gets the `currentAtcTrack` (a direct CDN URL) from the Redux store via the `getCurrentAtcTrack` selector.
    - It maintains a reference to the previous source URL to avoid unnecessary reloading.
    - It tracks source changes via a useEffect and only updates the audio element's src attribute when it actually changes.
    - The component uses proper event handlers to manage the audio element lifecycle.

5.  **Direct Audio Streaming:**

    - The browser's `<audio>` element directly streams audio from the Cloudflare CDN URLs.
    - No custom protocol handling or proxying is needed.
    - The audio is loaded and played using standard web APIs without any intermediary proxying.

6.  **Audio Playback & Visualization (`src/app/components/radio/Radar.tsx`, `AtcAnimation.tsx`):**
    - The `<audio>` element in `Radar.tsx` plays the ATC audio directly from the CDN.
    - The `Radar` component handles audio events:
      - `onTrackEnd`, `onTrackError`: Dispatch `nextTrack` action to Redux to advance the playlist.
      - `onCanPlay`, `onLoadStart`: Update loading/playing states.
    - The `AtcAnimation` component (`src/app/components/radio/AtcAnimation.tsx`) is passed the `<audio>` element ref. It uses `AudioMotionAnalyzer` to create visualizations based on the ATC audio frequency data, configured via `src/settings/audioMotionAnalyzer.ts`.
    - Volume is controlled via `HiddenVolumeSlider.tsx` which updates the `<audio>` element's volume and dispatches `setAtcVolume` to the Redux store.

[Back to Architecture Overview](./00-ARCHITECTURE-OVERVIEW.md)
