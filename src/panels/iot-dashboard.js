export function createIotDashboardPanel(container, dataBus) {
  const tiles = new Map(); // name -> tile element

  const hint = document.createElement('p');
  hint.className = 'iot-hint';
  hint.textContent = 'Widgets appear automatically as your program sends "plot" data.';
  container.appendChild(hint);

  function getTile(name) {
    if (tiles.has(name)) return tiles.get(name);
    if (hint.parentNode) hint.remove();
    const tile = document.createElement('div');
    tile.className = 'iot-tile';
    tile.innerHTML = `<div class="iot-tile-name"></div><div class="iot-tile-value"></div>`;
    container.appendChild(tile);
    tiles.set(name, tile);
    tile.querySelector('.iot-tile-name').textContent = name;
    return tile;
  }

  dataBus.onData((name, value) => {
    const tile = getTile(name);
    tile.querySelector('.iot-tile-value').textContent = value;
  });
}
