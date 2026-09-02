const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

// Unlike a plain static site, this project is a Vite app: its source uses
// bare module imports (e.g. "blockly/core") that only resolve through
// Vite's bundler. So the desktop app always serves the *built* output
// (dist/), not raw source - run `npm run build` in the project root before
// packaging or running this in dev.
const APP_ROOT = app.isPackaged
  ? path.join(process.resourcesPath, 'app')
  : path.join(__dirname, '..', 'dist');

const MIME_TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.py': 'text/plain', '.xml': 'application/xml',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.wasm': 'application/wasm', '.map': 'application/json',
};

// Serve over http://localhost instead of file:// - same reason as the
// Akadly (BIPES-fork) desktop app: file:// blocks cross-origin fetch of
// local files under Chromium, and the OTA/Remote Access iframes and the
// editor's own asset loading both rely on normal fetch()/XHR.
function startLocalServer() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.join(APP_ROOT, 'index.html'))) {
      reject(new Error(
        `No build found at ${APP_ROOT}. Run "npm run build" in the project root first.`
      ));
      return;
    }
    const server = http.createServer((req, res) => {
      let reqPath = decodeURIComponent(req.url.split('?')[0]);
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.normalize(path.join(APP_ROOT, reqPath));
      if (!filePath.startsWith(APP_ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}

let pickerWindow = null;
let pickerResolve = null;

function openPicker(title, items) {
  return new Promise((resolve) => {
    pickerResolve = resolve;
    pickerWindow = new BrowserWindow({
      width: 480,
      height: 360,
      parent: BrowserWindow.getFocusedWindow() || undefined,
      modal: true,
      resizable: false,
      minimizable: false,
      maximizable: false,
      title,
      webPreferences: {
        preload: path.join(__dirname, 'picker-preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });
    pickerWindow.setMenuBarVisibility(false);
    pickerWindow.loadFile(path.join(__dirname, 'picker.html'));
    pickerWindow.webContents.once('did-finish-load', () => {
      pickerWindow.webContents.send('picker-init', { title, items });
    });
    pickerWindow.on('closed', () => {
      pickerWindow = null;
      if (pickerResolve) {
        pickerResolve(null);
        pickerResolve = null;
      }
    });
  });
}

ipcMain.on('picker-selected', (event, id) => {
  if (pickerResolve) {
    pickerResolve(id);
    pickerResolve = null;
  }
  if (pickerWindow) pickerWindow.close();
});

function createWindow(serverPort) {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.loadURL(`http://127.0.0.1:${serverPort}/index.html`);
  return win;
}

app.whenReady().then(async () => {
  let server;
  try {
    server = await startLocalServer();
  } catch (err) {
    console.error(err.message);
    app.quit();
    return;
  }
  const port = server.address().port;

  const ses = session.defaultSession;

  ses.on('select-serial-port', async (event, portList, webContents, callback) => {
    event.preventDefault();
    if (portList.length === 0) {
      callback('');
      return;
    }
    if (portList.length === 1) {
      callback(portList[0].portId);
      return;
    }
    const items = portList.map((p) => ({
      id: p.portId,
      label: `${p.displayName || p.portName || p.portId}${p.vendorId ? ` (VID:${p.vendorId} PID:${p.productId})` : ''}`,
    }));
    const chosen = await openPicker('Select a serial port', items);
    callback(chosen || '');
  });

  ses.on('select-bluetooth-device', async (event, deviceList, callback) => {
    event.preventDefault();
    if (deviceList.length === 0) {
      callback('');
      return;
    }
    if (deviceList.length === 1) {
      callback(deviceList[0].deviceId);
      return;
    }
    const items = deviceList.map((d) => ({ id: d.deviceId, label: d.deviceName || d.deviceId }));
    const chosen = await openPicker('Select a Bluetooth device', items);
    callback(chosen || '');
  });

  ses.setPermissionCheckHandler((_webContents, permission) => {
    return permission === 'serial' || permission === 'bluetooth';
  });

  ses.setDevicePermissionHandler((details) => {
    return details.deviceType === 'serial' || details.deviceType === 'bluetooth';
  });

  createWindow(port);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(port);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
