# 12. Error Handling

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

[Back to Architecture Overview](./00-ARCHITECTURE-OVERVIEW.md)
