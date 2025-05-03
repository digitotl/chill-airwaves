# 8. Key Services and Helpers

- **`AtcApiService.ts` (`src/app/services/`):** Builds ATC playlist URLs.

  - **`buildAtcPlaylist`:** Generates an array of direct CDN audio URLs based on the airport.
  - **`buildAtcUrl`:** Creates a single URL with the correct format pointing to the CDN.
  - **`getMostRecentTimeframe`:** Takes the current time and an offset parameter, returns a Date object representing the most recent 30-minute timeframe in the past. Used to determine the correct file name format (YYYY-MM-DD_HHMM) for ATC recordings.
  - **`formatTimeframeForFileName`:** Formats a Date object into the ATC file naming convention (YYYY-MM-DD_HHMM).
  - **`fetchAvailableFiles`:** Queries the R2 storage bucket for existing audio files for a given airport and returns direct CDN URLs.
  - **`buildAtcPlaylistFromAvailable`:** Attempts to build a playlist from actually available files in storage, with fallback to generated filenames.

- **`themeService.ts` (`src/app/services/`):** Applies visual themes by manipulating CSS variables (`applyTheme`).

- **`environmentService.ts` (`src/app/services/`):** Provides access to environment variables via the `electronAPI` exposed in `preload.ts`.

[Back to Architecture Overview](./00-ARCHITECTURE-OVERVIEW.md)
