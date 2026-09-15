const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

const CHANNEL_OPEN = 'device-picker:open';
const CHANNEL_CHOICE = 'device-picker:choice';

const MAIN_WINDOW_SIZE = { width: 1400, height: 900 };
const PICKER_WINDOW_SIZE = { width: 480, height: 360 };

// This project is a Vite app: its source uses bare module imports (e.g.
// "blockly/core") that only resolve through Vite's own bundler, so the
// desktop shell always serves the *built* dist/ output, never raw src/ -
// run `npm run build` before packaging or launching this.
const staticRoot = app.isPackaged
  ? path.join(process.resourcesPath, 'app')
  : path.join(__dirname, '..', 'dist');

const contentTypeByExt = new Map([
  ['.html', 'text/html'],
  ['.js', 'text/javascript'],
  ['.css', 'text/css'],
  ['.json', 'application/json'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.ico', 'image/x-icon'],
  ['.py', 'text/plain'],
  ['.xml', 'application/xml'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.ttf', 'font/ttf'],
  ['.wasm', 'application/wasm'],
  ['.map', 'application/json'],
]);

function resolveRequestedFile(requestUrl) {
  const urlPath = decodeURIComponent(requestUrl.split('?')[0]);
  const relative = urlPath === '/' ? '/index.html' : urlPath;
  return path.normalize(path.join(staticRoot, relative));
}

// Served over http://localhost rather than file:// - under Chromium,
// file:// blocks cross-origin fetch() of local files, and both the
// OTA/Remote-Access iframes and the editor's own asset loading need
// ordinary fetch()/XHR to work.
function launchStaticServer() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.join(staticRoot, 'index.html'))) {
      reject(new Error(`No build found at ${staticRoot} - run "npm run build" first.`));
      return;
    }

    const server = http.createServer((request, response) => {
      const filePath = resolveRequestedFile(request.url);
      if (!filePath.startsWith(staticRoot)) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
      }

      fs.readFile(filePath, (err, contents) => {
        if (err) {
          response.writeHead(404);
          response.end('Not found');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const contentType = contentTypeByExt.get(ext) || 'application/octet-stream';
        response.writeHead(200, { 'Content-Type': contentType });
        response.end(contents);
      });
    });

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

class DevicePickerManager {
  constructor() {
    this.window = null;
    this.pendingChoice = null;

    ipcMain.on(CHANNEL_CHOICE, (_event, deviceId) => {
      this._settle(deviceId);
      if (this.window) this.window.close();
    });
  }

  _settle(deviceId) {
    if (!this.pendingChoice) return;
    const resolve = this.pendingChoice;
    this.pendingChoice = null;
    resolve(deviceId);
  }

  ask(title, items) {
    return new Promise((resolve) => {
      this.pendingChoice = resolve;

      this.window = new BrowserWindow({
        ...PICKER_WINDOW_SIZE,
        title,
        parent: BrowserWindow.getFocusedWindow() || undefined,
        modal: true,
        resizable: false,
        minimizable: false,
        maximizable: false,
        webPreferences: {
          preload: path.join(__dirname, 'picker-preload.js'),
          contextIsolation: true,
          nodeIntegration: false,
        },
      });
      this.window.setMenuBarVisibility(false);
      this.window.loadFile(path.join(__dirname, 'picker.html'));
      this.window.webContents.once('did-finish-load', () => {
        this.window.webContents.send(CHANNEL_OPEN, { title, items });
      });
      this.window.on('closed', () => {
        this.window = null;
        this._settle(null);
      });
    });
  }
}

function buildMainWindow(port) {
  const win = new BrowserWindow({
    ...MAIN_WINDOW_SIZE,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.loadURL(`http://127.0.0.1:${port}/index.html`);
  return win;
}

function describePort(port) {
  const parts = [port.displayName || port.portName || port.portId];
  if (port.vendorId) parts.push(`(VID:${port.vendorId} PID:${port.productId})`);
  return parts.join(' ');
}

async function pickFromList(picker, title, list, toItem) {
  if (list.length === 0) return '';
  if (list.length === 1) return toItem(list[0]).id;
  const items = list.map(toItem);
  const chosen = await picker.ask(title, items);
  return chosen || '';
}

app.whenReady().then(async () => {
  let server;
  try {
    server = await launchStaticServer();
  } catch (err) {
    console.error(err.message);
    app.quit();
    return;
  }
  const port = server.address().port;
  const picker = new DevicePickerManager();
  const ses = session.defaultSession;

  ses.on('select-serial-port', async (event, portList, _webContents, callback) => {
    event.preventDefault();
    const choice = await pickFromList(picker, 'Select a serial port', portList, (p) => ({
      id: p.portId,
      label: describePort(p),
    }));
    callback(choice);
  });

  ses.on('select-bluetooth-device', async (event, deviceList, callback) => {
    event.preventDefault();
    const choice = await pickFromList(picker, 'Select a Bluetooth device', deviceList, (d) => ({
      id: d.deviceId,
      label: d.deviceName || d.deviceId,
    }));
    callback(choice);
  });

  ses.setPermissionCheckHandler((_webContents, permission) =>
    permission === 'serial' || permission === 'bluetooth'
  );

  ses.setDevicePermissionHandler((details) =>
    details.deviceType === 'serial' || details.deviceType === 'bluetooth'
  );

  buildMainWindow(port);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) buildMainWindow(port);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
