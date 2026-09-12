// Web Serial transport implementing MicroPython's "raw REPL" protocol.
// Protocol reference: this is MicroPython's own documented raw-REPL mode
// (the same one pyboard.py/mpremote/ampy use) - not borrowed from any
// third-party project's implementation.
//
//   Ctrl-C (\x03)  interrupt any running program
//   Ctrl-A (\x01)  enter raw REPL -> device replies "raw REPL; CTRL-B to exit\r\n>"
//   <code> + Ctrl-D (\x04)  submit code for execution
//     device replies "OK" then stdout, then \x04, then stderr, then \x04
//   Ctrl-B (\x02)  exit raw REPL back to the friendly/interactive REPL

const CTRL_A = '\x01';
const CTRL_B = '\x02';
const CTRL_C = '\x03';
const CTRL_D = '\x04';

export class SerialTransport {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.readableClosed = null;
    this.connected = false;
    this._dataListeners = [];
  }

  /** Subscribe to every raw chunk read from the device. Returns an unsubscribe function. */
  addDataListener(fn) {
    this._dataListeners.push(fn);
    return () => {
      this._dataListeners = this._dataListeners.filter((f) => f !== fn);
    };
  }

  get isConnected() {
    return this.connected;
  }

  async connect(options = {}) {
    if (!('serial' in navigator)) {
      throw new Error('Web Serial is not available in this browser/app.');
    }
    this.port = await navigator.serial.requestPort();
    await this.port.open({ baudRate: options.baudRate || 115200 });
    this.writer = this.port.writable.getWriter();
    this._startReading();
    this.connected = true;

    // Opening the port toggles DTR/RTS on most USB-serial adapters, which
    // resets many ESP32/ESP8266 boards into their ROM bootloader + a fresh
    // MicroPython boot. Give that boot sequence time to finish, then throw
    // away whatever noise it printed so the raw-REPL handshake in runCode()
    // starts from a clean buffer instead of racing the boot banner.
    await new Promise((r) => setTimeout(r, 1500));
    this._buffer = '';
  }

  async disconnect() {
    this.connected = false;
    try {
      if (this.reader) {
        await this.reader.cancel();
      }
    } catch (_) { /* already closed */ }
    try {
      if (this.writer) {
        this.writer.releaseLock();
      }
    } catch (_) { /* noop */ }
    try {
      if (this.readableClosed) await this.readableClosed;
    } catch (_) { /* noop */ }
    try {
      if (this.port) await this.port.close();
    } catch (_) { /* noop */ }
    this.port = null;
    this.reader = null;
    this.writer = null;
  }

  _startReading() {
    const decoder = new TextDecoder();
    this._buffer = '';
    this._waiters = [];
    this.reader = this.port.readable.getReader();
    this.readableClosed = (async () => {
      try {
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          this._buffer += text;
          this._dataListeners.forEach((fn) => fn(text));
          this._flushWaiters();
        }
      } catch (_) {
        // port closed/disconnected
      }
    })();
  }

  _flushWaiters() {
    this._waiters = this._waiters.filter((w) => {
      const idx = this._buffer.indexOf(w.marker);
      if (idx !== -1) {
        const consumed = this._buffer.slice(0, idx);
        this._buffer = this._buffer.slice(idx + w.marker.length);
        w.resolve(consumed);
        return false;
      }
      return true;
    });
  }

  _waitFor(marker, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const idx = this._buffer.indexOf(marker);
      if (idx !== -1) {
        const consumed = this._buffer.slice(0, idx);
        this._buffer = this._buffer.slice(idx + marker.length);
        resolve(consumed);
        return;
      }
      const waiter = { marker, resolve };
      this._waiters.push(waiter);
      setTimeout(() => {
        const i = this._waiters.indexOf(waiter);
        if (i !== -1) {
          this._waiters.splice(i, 1);
          reject(new Error(`Timed out waiting for ${JSON.stringify(marker)}. Buffer so far: ${JSON.stringify(this._buffer)}`));
        }
      }, timeoutMs);
    });
  }

  async _write(str) {
    await this.writer.write(new TextEncoder().encode(str));
  }

  /** Interrupt whatever program is currently running (Ctrl-C). */
  async interrupt() {
    await this._write(CTRL_C);
  }

  /**
   * Soft-reset the board (same as pressing Ctrl-D at the friendly REPL
   * prompt) - re-runs boot.py/main.py from scratch. Interrupts first so
   * the Ctrl-D lands at an idle prompt rather than mid-program.
   */
  async softReset() {
    await this._write(CTRL_C);
    await new Promise((r) => setTimeout(r, 100));
    await this._write(CTRL_D);
  }

  /** Send raw bytes/text straight to the device (used by the interactive console). */
  async writeRaw(str) {
    await this._write(str);
  }

  /**
   * Run a MicroPython program via raw REPL and return { stdout, stderr }.
   * Interrupts whatever was running first.
   */
  async runCode(code) {
    this._buffer = ''; // discard anything the device printed while idle
    this._waiters = [];
    await this._write(CTRL_C);
    await new Promise((r) => setTimeout(r, 100));
    await this._write(CTRL_C); // a second interrupt in case the first landed mid-line
    await this._write(CTRL_A);
    await this._waitFor('raw REPL; CTRL-B to exit\r\n>');

    // Entering raw REPL performs a soft reset, which re-runs boot.py (and
    // whatever it does - WiFi connect, watchdog arm, etc.) before we get a
    // chance to submit the real program. Interrupt that and drain its
    // output first, so it can't race or falsely match the OK/\x04 markers
    // used to detect our own program's completion below.
    await new Promise((r) => setTimeout(r, 300));
    await this._write(CTRL_C);
    await new Promise((r) => setTimeout(r, 300));
    this._buffer = '';

    await this._write(code + CTRL_D);
    await this._waitFor('OK');

    const stdout = await this._waitFor('\x04');
    const stderr = await this._waitFor('\x04');

    await this._write(CTRL_B); // back to friendly REPL

    return { stdout, stderr };
  }

  /** List filenames on the device filesystem. */
  async listFiles() {
    const { stdout, stderr } = await this.runCode('import os\nprint(os.listdir())');
    if (stderr) throw new Error(stderr);
    // stdout is a Python list repr, e.g. "['a.py', 'main.py']\r\n" - close
    // enough to JSON after normalizing quotes for typical filenames.
    const jsonish = stdout.trim().replace(/'/g, '"');
    return JSON.parse(jsonish);
  }

  /** Read a text file's full contents from the device. */
  async readFile(filename) {
    const code = `f = open(${JSON.stringify(filename)}, 'r')\nprint(f.read())\nf.close()`;
    const { stdout, stderr } = await this.runCode(code);
    if (stderr) throw new Error(stderr);
    return stdout;
  }

  /** Write text content to a file on the device (overwrites). */
  async writeFile(filename, content) {
    const code =
      `f = open(${JSON.stringify(filename)}, 'w')\n` +
      `f.write(${JSON.stringify(content)})\n` +
      `f.close()`;
    const { stderr } = await this.runCode(code);
    if (stderr) throw new Error(stderr);
  }

  /** Delete a file from the device filesystem. */
  async deleteFile(filename) {
    const code = `import os\nos.remove(${JSON.stringify(filename)})`;
    const { stderr } = await this.runCode(code);
    if (stderr) throw new Error(stderr);
  }

  /** Execute a file already on the device, in place - not the current workspace's code. */
  async runFile(filename) {
    const code = `exec(open(${JSON.stringify(filename)}).read(), globals())`;
    return this.runCode(code);
  }
}
