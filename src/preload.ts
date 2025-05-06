// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts


import { contextBridge, ipcRenderer } from 'electron';

// Expose environment variables to the renderer process
const exposeEnv = () => {
  // In production, these would be replaced by vite at build time
  // In development, they're available via import.meta.env
  const env = {};
  // Include all your VITE_ variables here
  ['VITE_ASSETS_SERVER_URL',
    'VITE_CLOUDFLARE_CDN_URL',
    'VITE_CLOUDFLARE_API_URL',
    'VITE_CLOUDFLARE_ACCESS_KEY_ID',
    'VITE_CLOUDFLARE_SECRET_ACCESS_KEY',
    'VITE_CLOUDFLARE_BUCKET_NAME',
    'VITE_YOUTUBE_PLAYLIST_ID',
    'VITE_GOOGLE_CLIENT_ID',
    'VITE_LIVE_ATC_URL'].forEach(key => {
      // This will be replaced by the actual values at build time
      env[key] = import.meta.env[key] || process.env[key];
    });
  return env;
};

contextBridge.exposeInMainWorld('electronAPI', {
  getAtc: (icao: string) => ipcRenderer.invoke('getAtc', icao),
  shell: {
    openExternal: (url: string) => {
      return ipcRenderer.invoke('open-external', url);
    }
  },
  verifyShare: (url: string) => ipcRenderer.invoke('verify-share', url),
  fetchAvailableAtcFiles: (stationPath: string) =>
    ipcRenderer.invoke('atc:fetchAvailableFiles', { stationPath }),
  // Expose environment variables to the renderer process
  env: exposeEnv()
});


