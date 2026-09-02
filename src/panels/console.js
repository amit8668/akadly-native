import { Terminal } from '@xterm/xterm';

export function createConsolePanel(container, transport) {
  const term = new Terminal({
    convertEol: true,
    fontSize: 13,
    theme: { background: '#0b0e0c', foreground: '#eaeaea' },
  });
  term.open(container);
  term.writeln('Akadly console - connect to a device, then type to use the REPL.');

  term.onData((data) => {
    if (transport.isConnected) {
      transport.writeRaw(data);
    }
  });

  transport.addDataListener((text) => term.write(text));

  return { term };
}
