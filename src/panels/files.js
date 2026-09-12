import { EditorView, basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';

export function createFilesPanel(container, transport) {
  container.innerHTML = `
    <div class="files-toolbar">
      <button id="filesRefresh">Refresh</button>
      <button id="loadGeneratedCodeBtn">Open generated Python code</button>
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

  async function refresh() {
    if (!transport.isConnected) {
      setStatus('Connect to a device first.');
      return;
    }
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

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = async () => {
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
    if (!transport.isConnected) {
      setStatus('Connect to a device first.');
      return;
    }
    setStatus(`Writing ${filename}...`);
    try {
      await transport.writeFile(filename, getContent());
      setStatus(`Saved ${filename}.`);
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
