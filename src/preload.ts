// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts


import { contextBridge, ipcRenderer } from 'electron';

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
});


