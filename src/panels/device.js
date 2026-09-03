export function createDevicePanel(container) {
  container.innerHTML = `
    <div class="device-card">
      <h2 id="deviceName"></h2>
      <p id="deviceDescription"></p>
    </div>
  `;
  const nameEl = container.querySelector('#deviceName');
  const descEl = container.querySelector('#deviceDescription');

  return {
    setBoard(board) {
      nameEl.textContent = board.label;
      descEl.textContent = board.description || 'No description available for this board.';
    },
  };
}
