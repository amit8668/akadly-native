export function createDevicePanel(container) {
  container.innerHTML = `
    <div class="device-card">
      <h2 id="deviceName"></h2>
      <img id="devicePinout" alt="" hidden />
      <p id="deviceDescription"></p>
    </div>
  `;
  const nameEl = container.querySelector('#deviceName');
  const descEl = container.querySelector('#deviceDescription');
  const pinoutEl = container.querySelector('#devicePinout');

  return {
    setBoard(board) {
      nameEl.textContent = board.label;
      descEl.textContent = board.description || 'No description available for this board.';
      if (board.pinout) {
        pinoutEl.src = board.pinout;
        pinoutEl.alt = `${board.label} pinout diagram`;
        pinoutEl.hidden = false;
      } else {
        pinoutEl.hidden = true;
      }
    },
  };
}
