export function createFilesPanel(container, transport) {
  container.innerHTML = `
    <div class="files-toolbar">
      <button id="filesRefresh">Refresh</button>
    </div>
    <ul id="filesList" class="files-list"></ul>
    <div class="files-editor">
      <input id="fileNameInput" type="text" placeholder="filename.py" />
      <textarea id="fileContentInput" placeholder="file contents..." rows="8"></textarea>
      <button id="fileSaveBtn">Save to device</button>
    </div>
    <pre id="filesStatus" class="files-status"></pre>
  `;

  const listEl = container.querySelector('#filesList');
  const statusEl = container.querySelector('#filesStatus');
  const nameInput = container.querySelector('#fileNameInput');
  const contentInput = container.querySelector('#fileContentInput');

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
            contentInput.value = content;
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
      await transport.writeFile(filename, contentInput.value);
      setStatus(`Saved ${filename}.`);
      refresh();
    } catch (err) {
      setStatus(`[error] ${err.message}`);
    }
  });

  return { refresh };
}
