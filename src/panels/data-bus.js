// Buffers raw serial chunks into lines and picks out our own simple
// "#DATA:<name>:<value>" protocol (emitted by the databoard_plot block).
// Shared by the Databoard and IOT panels so both can react to the same
// live stream regardless of how the program on the device was started.

export class DataBus {
  constructor() {
    this._lineBuffer = '';
    this._listeners = [];
  }

  feed(text) {
    this._lineBuffer += text;
    const lines = this._lineBuffer.split(/\r?\n/);
    this._lineBuffer = lines.pop(); // last chunk may be an incomplete line

    for (const line of lines) {
      // Not anchored to the start of the line: MicroPython's raw-REPL "OK"
      // acknowledgment has no newline separating it from the program's own
      // first line of output, so the first real line often arrives as
      // "OK#DATA:...".
      const match = /#DATA:([^:]*):(-?[\d.]+)/.exec(line);
      if (match) {
        const name = match[1];
        const value = Number(match[2]);
        if (!Number.isNaN(value)) {
          this._listeners.forEach((fn) => fn(name, value));
        }
      }
    }
  }

  onData(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter((f) => f !== fn);
    };
  }
}
