import { app, BrowserWindow, dialog, ipcMain, protocol, shell } from 'electron';
import path from 'path';
import os from 'os';
import { config } from "dotenv";
import installExtension, { REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import fs from 'fs';
import { verifyShare } from './helpers/verifyShare';
import { fetchAvailableAtcFilesFromR2 } from './services/atcService';
import { atcProtocolHandler } from './protocols/atcProtocol';
import { cdnProtocolHandler } from './protocols/cdnProtocol';

config({ path: '.env' });

// Keep a global reference of the window object to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

const getAssetPath = () => {
  if (app.isPackaged) {
    // In production, use the path relative to the executable
    return path.join(process.resourcesPath, 'assets');
  } else {
    // In development, use the path relative to the project root
    return path.join(__dirname, '..', '..', 'src', 'assets');
  }
};

const getIconPath = () => {
  if (app.isPackaged) {
    // In production, use the path relative to the resources
    return path.join(process.resourcesPath, 'icons', 'icons');
  } else {
    // In development, use the path relative to the project root
    return path.join(__dirname, '..', '..', 'icons', 'icons');
  }
};

// For macOS dock icon in development
if (process.platform === 'darwin' && !app.isPackaged) {
  try {
    const iconPath = path.join(__dirname, '..', '..', 'icons', 'icons', 'png', '512x512.png');
    console.log('Setting dock icon path:', iconPath);

    if (fs.existsSync(iconPath)) {
      app.dock?.setIcon(iconPath);
    } else {
      console.error(`Icon not found at path: ${iconPath}`);
    }
  } catch (error) {
    console.error('Failed to set dock icon:', error);
  }
}

const isMac = os.platform() === "darwin";
const isWindows = os.platform() === "win32";
const isLinux = os.platform() === "linux";

const APP_PROTOCOL = 'chill-airwaves';

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(APP_PROTOCOL, process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient(APP_PROTOCOL)
}


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Don't create a new window if one already exists
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    return;
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 620,
    minWidth: 728,
    minHeight: 620,
    icon: path.join(getIconPath(), os.platform() === 'darwin' ? 'mac/icon.icns' : os.platform() === 'win32' ? 'win/icon.ico' : 'png/512x512.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Intercept navigation events and open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Open all external URLs in the default browser
    shell.openExternal(url);
    return { action: 'deny' }; // Prevent opening in Electron
  });

  // Handle will-navigate events for ad iframes
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Parse the URL to check if it's external
    try {
      const urlObj = new URL(url);

      // Consider internal navigation if:
      // 1. It's a development server URL
      // 2. It's localhost/127.0.0.1
      // 3. It's a file:// URL (local file in the app)
      // 4. It's using the app's custom protocol
      const isInternalNavigation =
        (MAIN_WINDOW_VITE_DEV_SERVER_URL && url.startsWith(MAIN_WINDOW_VITE_DEV_SERVER_URL)) ||
        urlObj.hostname === 'localhost' ||
        urlObj.hostname === '127.0.0.1' ||
        urlObj.protocol === 'file:' ||
        urlObj.protocol === `${APP_PROTOCOL}:`;

      // If it's not internal navigation, open in external browser
      if (!isInternalNavigation) {
        event.preventDefault();
        shell.openExternal(url);
      }
    } catch (error) {
      // If URL parsing fails, assume it's internal and allow navigation
      console.log('Error parsing URL:', error);
    }
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Cleanup when window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  ipcMain.handle('get-downloads-path', () => {
    return path.join(app.getPath('downloads'));
  });

  ipcMain.handle('open-external', async (_, url) => {
    return shell.openExternal(url);
  });

  ipcMain.handle('verify-share', verifyShare);

  ipcMain.handle('atc:fetchAvailableFiles', async (_event, { stationPath }) => {
    return fetchAvailableAtcFilesFromR2(stationPath);
  });

  const gotTheLock = app.requestSingleInstanceLock()

  if (!gotTheLock) {
    app.quit()
  } else if (isWindows || isLinux) {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
      // the commandLine is array of strings in which last element is deep link url
      dialog.showErrorBox('Welcome Back', `You arrived from: ${commandLine.pop()}`)
    })
  }

  ipcMain.handle('getEnv', (_, key: string) => {
    console.log(process.env[key]);
    return process.env[key];
  });

  // Register protocol handlers
  protocol.handle('atc', atcProtocolHandler);
  protocol.handle('cdn', cdnProtocolHandler);

  protocol.handle('icon', async (request) => {
    const url = new URL(request.url);
    const iconName = url.hostname;
    const iconPath = path.join(getAssetPath(), 'phosphor-icons', 'SVGs', 'bold', iconName);

    console.log(`Attempting to load icon: ${iconPath}`);

    if (fs.existsSync(iconPath)) {
      try {
        const data = await fs.promises.readFile(iconPath);
        console.log(`Successfully read icon file: ${iconPath}`);
        return new Response(data, {
          headers: {
            'Content-Type': 'image/svg+xml',
          }
        });
      } catch (error) {
        console.error(`Error reading icon file: ${iconPath}`, error);
        return new Response(`Error reading icon file: ${error.message}`, { status: 500 });
      }
    } else {
      console.error(`Icon not found: ${iconPath}`);
      return new Response('Icon not found', { status: 404 });
    }
  })

  installExtension(REDUX_DEVTOOLS)
    .then((name) => console.log(`Added Extension: ${name}`))
    .catch((err) => console.log('An error occurred: ', err));

  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension: ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
// Handle the protocol. In this case, we choose to show an Error Box.
app.on('open-url', (event, url) => {
  dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
})