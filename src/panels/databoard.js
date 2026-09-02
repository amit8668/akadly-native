const MAX_POINTS = 200;
const COLOURS = ['#e0975a', '#5ab0e0', '#8ae05a', '#e05a9c', '#c7a8ff'];

export function createDataboardPanel(canvas, dataBus) {
  const ctx = canvas.getContext('2d');
  const series = new Map(); // name -> number[]

  function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (series.size === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '13px sans-serif';
      ctx.fillText('Waiting for data ("plot" block output)...', 12, 20);
      return;
    }

    let min = Infinity;
    let max = -Infinity;
    for (const points of series.values()) {
      for (const v of points) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    if (min === max) {
      min -= 1;
      max += 1;
    }
    const pad = 20;
    const plotHeight = canvas.height - pad * 2;
    const plotWidth = canvas.width - pad * 2;

    let colourIndex = 0;
    let legendY = 14;
    for (const [name, points] of series.entries()) {
      const colour = COLOURS[colourIndex % COLOURS.length];
      colourIndex++;

      ctx.strokeStyle = colour;
      ctx.lineWidth = 2;
      ctx.beginPath();
      points.forEach((v, i) => {
        const x = pad + (i / (MAX_POINTS - 1)) * plotWidth;
        const y = pad + plotHeight - ((v - min) / (max - min)) * plotHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      ctx.fillStyle = colour;
      ctx.font = '12px sans-serif';
      ctx.fillText(`${name}: ${points[points.length - 1]}`, canvas.width - 160, legendY);
      legendY += 16;
    }
  }

  dataBus.onData((name, value) => {
    if (!series.has(name)) series.set(name, []);
    const points = series.get(name);
    points.push(value);
    if (points.length > MAX_POINTS) points.shift();
    draw();
  });

  draw();

  return {
    // Call when the panel becomes visible - the canvas has zero size
    // while its tab is display:none, so it must be re-measured on show.
    resize() {
      resize();
      draw();
    },
  };
}
