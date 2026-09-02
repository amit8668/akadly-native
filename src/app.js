import '../style/theme.css';
import { createWorkspace, generatePython, setWorkspaceBoard } from './blockly-setup.js';
import { boards, getBoard } from './boards/index.js';
import { SerialTransport } from './transport/serial.js';

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

boardSelect.addEventListener('change', () => {
  setWorkspaceBoard(workspace, getBoard(boardSelect.value));
});
transport.onData = (text) => log(`[raw] ${JSON.stringify(text)}\n`);

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
