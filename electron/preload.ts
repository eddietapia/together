import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  reviewSubmission: (id: string) => ipcRenderer.send('tray:review', id),
  openApp: () => ipcRenderer.send('tray:open-app'),
  shareSubmission: (title: string) => ipcRenderer.send('tray:share', title),
  closeTray: () => ipcRenderer.send('tray:close'),
  onNavigateToSubmission: (callback: (id: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, id: string) => callback(id);
    ipcRenderer.on('navigate:submission', handler);
    return () => ipcRenderer.removeListener('navigate:submission', handler);
  },
});
