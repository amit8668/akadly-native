const { contextBridge, ipcRenderer } = require('electron');

const CHANNEL_OPEN = 'device-picker:open';
const CHANNEL_CHOICE = 'device-picker:choice';

contextBridge.exposeInMainWorld('devicePicker', {
  onOpen(handler) {
    ipcRenderer.on(CHANNEL_OPEN, (_event, payload) => handler(payload));
  },
  choose(deviceId) {
    ipcRenderer.send(CHANNEL_CHOICE, deviceId);
  },
  dismiss() {
    ipcRenderer.send(CHANNEL_CHOICE, null);
  },
});
