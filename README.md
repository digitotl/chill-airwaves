# Chill Airwaves

A desktop application that combines lo-fi/ambient music with real-time air traffic control communications to create a unique atmospheric audio experience. Perfect for enhancing focus, relaxation, and productivity.

![Chill Airwaves Screenshot](https://placeholder-for-app-screenshot.png)

## Features

- **Dual Audio Streams**: Listen to lo-fi music alongside real air traffic control communications
- **Airport Selection**: Choose from multiple airports around the world to listen to their ATC feeds
- **Music Player**: Full-featured music controls (play, pause, skip tracks) with volume adjustment
- **Audio Visualizations**: Visual radar display and audio waveform visualization
- **Independent Volume Control**: Adjust music and ATC volumes separately
- **Visual Themes**: Customize the appearance with different color themes
- **Minimalist UI**: Clean, distraction-free interface with sleek animations
- **Desktop App**: Built with Electron for cross-platform compatibility

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/chill-airwaves.git
   cd chill-airwaves
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following content:

   ```dotenv
   # Base URL for the ATC audio stream CDN
   CLOUDFLARE_CDN_URL=https://your-cloudflare-r2-public-url/
   # Your Google Client ID for authentication
   GOOGLE_CLIENT_ID=your-google-client-id
   ```

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

### Building for Production

```bash
npm run make
# or
yarn make
```

This will create platform-specific distributables in the `out` directory.

## Usage

1. **Start the App**: Launch Chill Airwaves from your applications folder
2. **Select an Airport**: Choose an airport from the dropdown to connect to its ATC feed
3. **Adjust Volume**: Use the sliders to set your preferred levels for music and ATC
4. **Music Controls**: Play, pause, skip tracks using the control buttons
5. **Customization**: Access the settings menu to change themes or other preferences

## Architecture

Chill Airwaves is built with the following technologies:

- **Electron**: Cross-platform desktop application framework
- **React**: UI library for building the interface
- **Redux**: State management with persistent storage
- **TypeScript**: Type safety throughout the codebase
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Framer Motion**: Animation library for smooth UI transitions
- **Audio Motion Analyzer**: Audio visualization
- **Cloud CDN**: Streams pre-processed ATC audio files directly

The application features a dual-stream audio system:

1. **Music Stream**: YouTube-based lo-fi/ambient music
2. **ATC Stream**: Air traffic control communications streamed from Cloud CDN

## Project Structure

- `/src/app/components`: React components for the UI
- `/src/app/context`: Context providers for music and ATC
- `/src/app/store`: Redux store configuration and slices
- `/src/protocols`: Protocol handlers for custom URL schemes
- `/src/services`: Backend services for audio processing
- `/src/helpers`: Utility functions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [LiveATC](https://www.liveatc.net/) for inspiration on air traffic control audio
- [Electron Forge](https://www.electronforge.io/) for Electron application development
- [React Redux](https://react-redux.js.org/) for state management
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Tailwind CSS](https://tailwindcss.com/) for styling
