# 5. ATC Audio Data Flow

1.  **Airport Selection (`src/app/components/radio/StationSelector.tsx` -> `SelectAirport.tsx`):**

    - User selects an airport from the list provided by `src/settings/liveatc.ts`.
    - The `onSelect` handler (passed down from `TestLayout.tsx` or similar) dispatches the `setSelectedAirportIata` action to the Redux store.

2.  **Playlist Generation (Redux Effect in `atcSlice.ts`):**

    - The listener middleware detects the `setSelectedAirportIata` action.
    - It first attempts to use `AtcApiService.buildAtcPlaylistFromAvailable`, which:
      - Makes a request to the R2 storage bucket using AWS SDK S3 client
      - Retrieves a list of available files from the bucket
      - Sorts them by name (reverse chronological order)
      - Creates direct URLs to the Cloudflare CDN
    - If the request fails or returns no files, it falls back to the original `AtcApiService.buildAtcPlaylist`, which:
      - Generates an array of direct CDN URLs based on the airport's ICAO, station path, and recent timestamps
      - The number of records is defined by `ATC_RECORDS_COUNT`
    - The generated playlist (array of direct CDN URLs) is dispatched via `setAtcPlaylist`.

3.  **ATC file listing (playlist generation) uses an IPC-based flow:**

    - The renderer calls `window.electronAPI.fetchAvailableAtcFiles` with the station path (exposed in `preload.ts`).
    - This triggers the `atc:fetchAvailableFiles` IPC handler in the main process (`src/main.ts`).
    - The handler calls `fetchAvailableAtcFilesFromR2` in `src/services/atcService.ts` with just the station path parameter.
    - The `fetchAvailableAtcFilesFromR2` function uses AWS SDK S3 client to connect to Cloudflare R2:
      - It gets connection details (endpoint, credentials, bucket name) from environment variables
      - Creates an S3 client configured for Cloudflare R2
      - Uses ListObjectsV2Command to retrieve objects with the station path as prefix
      - Filters for .mp3 files and returns them sorted in reverse chronological order
    - The result is returned to the renderer, which builds the complete playlist URLs by combining the CDN base URL with the station path and file names.
    - **Direct fetch from the renderer/browser is not used for R2 file listing due to CORS restrictions.**

4.  **Protocol Handlers for Audio Content:**

    - The application provides two protocol handlers for accessing remote content:
      - `atc://` protocol: Accesses ATC audio content from Cloudflare R2 CDN
        - `atc:///path/to/file.mp3`: Direct retrieval from Cloudflare R2 CDN (VITE_CLOUDFLARE_CDN_URL)
      - `cdn://` protocol: General purpose CDN access for any asset stored in the R2 storage. Maps `cdn://path/file.ext` to the Cloudflare R2 CDN URL.
    - Both protocols are registered and handled in the main process using Electron's `protocol.handle()` method.
    - The handlers use Electron's `net.fetch()` to bypass CORS restrictions when accessing the remote sources.
    - Protocol handlers are defined in `src/protocols/atcProtocol.ts` and `src/protocols/cdnProtocol.ts`.

5.  **Audio Playback Request (`src/app/components/radio/Radar.tsx`):**

    - The `Radar` component gets the `currentAtcTrack` (a direct CDN URL) from the Redux store via the `getCurrentAtcTrack` selector.
    - It maintains a reference to the previous source URL to avoid unnecessary reloading.
    - It tracks source changes via a useEffect and only updates the audio element's src attribute when it actually changes.
    - The component uses proper event handlers to manage the audio element lifecycle.

6.  **Direct Audio Streaming:**

    - The browser's `<audio>` element directly streams audio from the Cloudflare CDN URLs.
    - Alternatively, custom protocol URLs (`atc://` or `cdn://`) can be used for accessing content through the protocol handlers.
    - The audio is loaded and played using standard web APIs, with protocol handlers providing proxied access when needed.

7.  **Audio Playback & Visualization (`src/app/components/radio/Radar.tsx`, `AtcAnimation.tsx`):**
    - The `<audio>` element in `Radar.tsx` plays the ATC audio directly from the CDN.
    - The `Radar` component handles audio events:
      - `onTrackEnd`, `onTrackError`: Dispatch `nextTrack` action to Redux to advance the playlist.
      - `onCanPlay`, `onLoadStart`: Update loading/playing states.
    - The `AtcAnimation` component (`src/app/components/radio/AtcAnimation.tsx`) is passed the `<audio>` element ref. It uses `AudioMotionAnalyzer` to create visualizations based on the ATC audio frequency data, configured via `src/settings/audioMotionAnalyzer.ts`.
    - Volume is controlled via `HiddenVolumeSlider.tsx` which updates the `<audio>` element's volume and dispatches `setAtcVolume` to the Redux store.

[Back to Architecture Overview](./00-ARCHITECTURE-OVERVIEW.md)
