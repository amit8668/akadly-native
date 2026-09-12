import { EditorView, basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import ssd1306Driver from '../drivers/ssd1306.py?raw';

const DRIVERS = {
  'ssd1306.py': ssd1306Driver,
};

export function createFilesPanel(container, transport) {
  container.innerHTML = `
    <div class="files-toolbar">
      <button id="filesRefresh">Refresh</button>
      <button id="loadGeneratedCodeBtn">Open generated Python code</button>
      <button id="fileUploadBtn">Upload from computer</button>
      <input id="fileUploadInput" type="file" hidden />
      <button id="installSsd1306Btn">Install SSD1306 driver</button>
    </div>
    <ul id="filesList" class="files-list"></ul>
    <div class="files-editor">
      <input id="fileNameInput" type="text" placeholder="filename.py" />
      <div id="fileEditor" class="files-code-editor"></div>
      <button id="fileSaveBtn">Save to device</button>
    </div>
    <pre id="filesStatus" class="files-status"></pre>
  `;

  const listEl = container.querySelector('#filesList');
  const statusEl = container.querySelector('#filesStatus');
  const nameInput = container.querySelector('#fileNameInput');
  const editorEl = container.querySelector('#fileEditor');
  const uploadInput = container.querySelector('#fileUploadInput');

  const editor = new EditorView({
    doc: '',
    extensions: [basicSetup, python()],
    parent: editorEl,
  });

  function getContent() {
    return editor.state.doc.toString();
  }

  function setContent(text) {
    editor.dispatch({
      changes: { from: 0, to: editor.state.doc.length, insert: text },
    });
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function requireConnected() {
    if (!transport.isConnected) {
      setStatus('Connect to a device first.');
      return false;
    }
    return true;
  }

  /** Trigger a browser download of device file content, saved under its own filename. */
  function downloadToComputer(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function refresh() {
    if (!requireConnected()) return;
    setStatus('Listing files...');
    try {
      const files = await transport.listFiles();
      listEl.innerHTML = '';
      files.forEach((filename) => {
        const li = document.createElement('li');

        const nameSpan = document.createElement('span');
        nameSpan.textContent = filename;
        li.appendChild(nameSpan);

        const openBtn = document.createElement('button');
        openBtn.textContent = 'Open';
        openBtn.onclick = async () => {
          setStatus(`Reading ${filename}...`);
          try {
            const content = await transport.readFile(filename);
            nameInput.value = filename;
            setContent(content);
            setStatus(`Loaded ${filename}.`);
          } catch (err) {
            setStatus(`[error] ${err.message}`);
          }
        };
        li.appendChild(openBtn);

        const runBtn = document.createElement('button');
        runBtn.textContent = 'Run';
        runBtn.onclick = async () => {
          setStatus(`Running ${filename}...`);
          try {
            const { stdout, stderr } = await transport.runFile(filename);
            setStatus(`--- running ${filename} ---\n${stdout}${stderr ? `\n[error]\n${stderr}` : ''}`);
          } catch (err) {
            setStatus(`[error] ${err.message}`);
          }
        };
        li.appendChild(runBtn);

        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download';
        downloadBtn.onclick = async () => {
          setStatus(`Downloading ${filename}...`);
          try {
            const content = await transport.readFile(filename);
            downloadToComputer(filename, content);
            setStatus(`Downloaded ${filename}.`);
          } catch (err) {
            setStatus(`[error] ${err.message}`);
          }
        };
        li.appendChild(downloadBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = async () => {
          if (!confirm(`Delete ${filename} from the device?`)) {
            setStatus(`Delete cancelled for ${filename}.`);
            return;
          }
          setStatus(`Deleting ${filename}...`);
          try {
            await transport.deleteFile(filename);
            setStatus(`Deleted ${filename}.`);
            refresh();
          } catch (err) {
            setStatus(`[error] ${err.message}`);
          }
        };
        li.appendChild(deleteBtn);

        listEl.appendChild(li);
      });
      setStatus(`${files.length} file(s).`);
    } catch (err) {
      setStatus(`[error] ${err.message}`);
    }
  }

  container.querySelector('#filesRefresh').addEventListener('click', refresh);
  container.querySelector('#fileSaveBtn').addEventListener('click', async () => {
    const filename = nameInput.value.trim();
    if (!filename) {
      setStatus('Enter a filename first.');
      return;
    }
    if (!requireConnected()) return;
    setStatus(`Writing ${filename}...`);
    try {
      await transport.writeFile(filename, getContent());
      setStatus(`Saved ${filename}.`);
      refresh();
    } catch (err) {
      setStatus(`[error] ${err.message}`);
    }
  });

  // Upload from computer: pick a local file, load it into the editor for
  // review, same as opening a device file - "Save to device" then writes it.
  container.querySelector('#fileUploadBtn').addEventListener('click', () => {
    uploadInput.click();
  });
  uploadInput.addEventListener('change', async () => {
    const file = uploadInput.files[0];
    if (!file) return;
    const content = await file.text();
    nameInput.value = file.name;
    setContent(content);
    setStatus(`Loaded ${file.name} from your computer - click "Save to device" to upload it.`);
    uploadInput.value = '';
  });

  container.querySelector('#installSsd1306Btn').addEventListener('click', async () => {
    if (!requireConnected()) return;
    setStatus('Installing ssd1306.py...');
    try {
      await transport.writeFile('ssd1306.py', DRIVERS['ssd1306.py']);
      setStatus('Installed ssd1306.py. The OLED blocks should work now.');
      refresh();
    } catch (err) {
      setStatus(`[error] ${err.message}`);
    }
  });

  return {
    refresh,
    // Load the current workspace's generated code into the editor, so it can
    // be reviewed, hand-edited, and saved to the device like any other file.
    loadCode(code, filename) {
      nameInput.value = filename;
      setContent(code);
      setStatus(`Loaded ${filename} from the current blocks.`);
    },
  };
}
