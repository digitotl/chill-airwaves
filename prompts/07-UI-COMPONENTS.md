# 7. UI Components Breakdown

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

[Back to Architecture Overview](./00-ARCHITECTURE-OVERVIEW.md)
