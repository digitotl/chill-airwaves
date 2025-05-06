# 3. Application Startup Flow

1.  **Electron Main Process Initialization (`src/main.ts`):**

    - The application starts by running the main Electron process script (`src/main.ts`).
    - It configures basic app settings and loads environment variables from `.env` using `dotenv`.
    - Defines utility functions like `getAssetPath()` and `getIconPath()` to handle different paths in development vs production.
    - Sets custom dock icon for macOS in development mode.
    - Sets up application protocol `chill-airwaves://` using `app.setAsDefaultProtocolClient`.
    - Handles Squirrel startup events (Windows installer) and requests single instance lock.
    - Registers an `icon://` protocol for accessing SVG icons.
    - Sets up IPC handlers for communication with renderer process:
      - `get-downloads-path`: Provides the system downloads directory path.
      - `open-external`: Opens URLs in the default browser.
      - `verify-share`: Validates sharing links.
      - `atc:fetchAvailableFiles`: Fetches available ATC files from the R2 bucket.
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
      - `getAtc`: To access ATC data.
      - `shell.openExternal`: To open URLs in the default system browser.
      - `verifyShare`: To verify and validate share links.
      - `fetchAvailableAtcFiles`: To fetch available ATC files from the main process.

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
      - `HashRouter`: Enables React Router with hash-based routing (better compatibility with Electron).
    - Defines routes for the application:
      - Root path (`/`): Renders the `Player` component.
      - Auth path (`/auth`): Renders the `Login` component.
    - Configures `Toaster` for notifications with custom styling.

[Back to Architecture Overview](./00-ARCHITECTURE-OVERVIEW.md)
