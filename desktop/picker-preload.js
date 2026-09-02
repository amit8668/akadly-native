const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('picker', {
  onInit: (callback) => ipcRenderer.on('picker-init', (_event, data) => callback(data)),
  select: (id) => ipcRenderer.send('picker-selected', id),
  cancel: () => ipcRenderer.send('picker-selected', null),
});
