import '../style/theme.css';
import './theme-toggle.js';
import '@xterm/xterm/css/xterm.css';
import { createWorkspace, generatePython, setWorkspaceBoard } from './blockly-setup.js';
import { boards, getBoard } from './boards/index.js';
import { SerialTransport } from './transport/serial.js';
import { createDevicePanel } from './panels/device.js';
import { createConsolePanel } from './panels/console.js';
import { createFilesPanel } from './panels/files.js';

const workspaceEl = document.getElementById('workspace');
const boardSelect = document.getElementById('boardSelect');
const connectBtn = document.getElementById('connectBtn');
const runBtn = document.getElementById('runBtn');
const outputEl = document.getElementById('output');
const codePreviewEl = document.getElementById('codePreview');

boards.forEach((board) => {
  const option = document.createElement('option');
  option.value = board.id;
  option.textContent = board.label;
  boardSelect.appendChild(option);
});

const workspace = createWorkspace(workspaceEl, boards[0]);
const transport = new SerialTransport();
const devicePanel = createDevicePanel(document.getElementById('panel-device'));
devicePanel.setBoard(boards[0]);

boardSelect.addEventListener('change', () => {
  const board = getBoard(boardSelect.value);
  setWorkspaceBoard(workspace, board);
  devicePanel.setBoard(board);
});

function log(text) {
  outputEl.textContent += text;
  outputEl.scrollTop = outputEl.scrollHeight;
}

function updateCodePreview() {
  codePreviewEl.textContent = generatePython(workspace) || '# (empty program)';
}

workspace.addChangeListener(() => updateCodePreview());
updateCodePreview();

connectBtn.addEventListener('click', async () => {
  if (transport.isConnected) {
    await transport.disconnect();
    connectBtn.textContent = 'Connect';
    runBtn.disabled = true;
    log('\n[disconnected]\n');
    return;
  }
  try {
    await transport.connect();
    connectBtn.textContent = 'Disconnect';
    runBtn.disabled = false;
    log('[connected]\n');
    filesPanel.refresh();
  } catch (err) {
    log(`\n[connect failed] ${err.message}\n`);
  }
});

runBtn.addEventListener('click', async () => {
  const code = generatePython(workspace);
  log(`\n>>> running program (${code.length} chars)\n`);
  try {
    const { stdout, stderr } = await transport.runCode(code);
    if (stdout) log(stdout);
    if (stderr) log(`\n[error]\n${stderr}`);
  } catch (err) {
    log(`\n[run failed] ${err.message}\n`);
  }
});

// --- Tabs -------------------------------------------------------------

const tabs = document.querySelectorAll('.tab');
const panels = {
  blocks: document.getElementById('panel-blocks'),
  console: document.getElementById('panel-console'),
  files: document.getElementById('panel-files'),
  device: document.getElementById('panel-device'),
  ota: document.getElementById('panel-ota'),
  terminal: document.getElementById('panel-terminal'),
};

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    Object.values(panels).forEach((p) => p.classList.remove('active'));
    panels[tab.dataset.tab].classList.add('active');
  });
});

// --- Console / Files panels ---------------------------------------------

createConsolePanel(panels.console, transport);
const filesPanel = createFilesPanel(panels.files, transport);

document.getElementById('loadGeneratedCodeBtn').addEventListener('click', () => {
  filesPanel.loadCode(generatePython(workspace), 'workspace.py');
});
