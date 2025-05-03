# 14. Future Improvements / TODOs

- **Performance Optimization:**

  - Implement dynamic loading for audio visualization components to reduce initial render time
  - Implement client-side caching strategy for frequently visited airports (Note: Server-side caching via CDN is assumed, but client-side could still be beneficial)
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
  - Increase unit test coverage, particularly for audio visualization components
  - Consolidate duplicate volume control components
  - Refactor the MusicContext to use Redux or the React Context API more effectively

- **Platform Improvements:**

  - Add auto-update functionality via Electron's update mechanisms
  - Add macOS-specific Touch Bar controls
  - Improve startup performance on slower systems
  - Implement support for system media controls

- **Code Quality:**
  - Add comprehensive TypeScript interfaces for all data structures
  - Implement a stricter ESLint configuration
  - Set up GitHub Actions for CI/CD
  - Create comprehensive API documentation for context and service functions
  - Establish consistent error handling with standardized error types

[Back to Architecture Overview](./00-ARCHITECTURE-OVERVIEW.md)
