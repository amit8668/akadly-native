import { Terminal } from '@xterm/xterm';

export function createConsolePanel(container, transport) {
  container.innerHTML = `
    <div id="terminal" class="console-terminal"></div>
    <div class="console-actions">
      <button id="consoleStop">Stop running program</button>
      <button id="consoleSoftReset">Soft reset device</button>
      <button id="consoleClear">Clear terminal output</button>
    </div>
  `;

  const termContainer = container.querySelector('#terminal');
  const term = new Terminal({
    convertEol: true,
    fontSize: 13,
    theme: { background: '#0b0e0c', foreground: '#eaeaea' },
  });
  term.open(termContainer);
  term.writeln('Akadly console - connect to a device, then type to use the REPL.');

  term.onData((data) => {
    if (transport.isConnected) {
      transport.writeRaw(data);
    }
  });

  transport.addDataListener((text) => term.write(text));

  container.querySelector('#consoleStop').addEventListener('click', () => {
    if (transport.isConnected) transport.interrupt();
  });

  container.querySelector('#consoleSoftReset').addEventListener('click', () => {
    if (transport.isConnected) transport.softReset();
  });

  container.querySelector('#consoleClear').addEventListener('click', () => {
    term.clear();
  });

  return { term };
}
