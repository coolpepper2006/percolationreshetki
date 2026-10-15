class CanvasView {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.palette = [
      "#58a6ff", "#3fb950", "#d29922", "#a371f7",
      "#db61a2", "#39c5cf", "#f0883e", "#7ee787",
      "#ff7b72", "#79c0ff", "#56d364", "#e3b341",
    ];
  }

  render({ grid, cluster }, { onlySpanning = false } = {}) {
    const L = grid.L;
    const cellSize = Math.max(2, Math.floor(600 / L));
    const size = L * cellSize;
    this.canvas.width = size;
    this.canvas.height = size;

    this.ctx.fillStyle = "#0d1117";
    this.ctx.fillRect(0, 0, size, size);

    const img = this.ctx.createImageData(size, size);
    const data = img.data;
    const spanningId = cluster.spanningId;
    const only = onlySpanning && spanningId >= 0;

    for (let y = 0; y < L; y++) {
      for (let x = 0; x < L; x++) {
        const idx = y * L + x;
        let r = 13, g = 17, b = 23;

        if (grid.cells[idx] === 1) {
          const isSpan = cluster.labels[idx] === spanningId;
          if (only && !isSpan) {
            // пропускаем
          } else if (isSpan) {
            r = 255; g = 77; b = 77;
          } else {
            const c = this.palette[cluster.labels[idx] % this.palette.length];
            r = parseInt(c.slice(1, 3), 16);
            g = parseInt(c.slice(3, 5), 16);
            b = parseInt(c.slice(5, 7), 16);
          }
        }

        for (let dy = 0; dy < cellSize; dy++) {
          for (let dx = 0; dx < cellSize; dx++) {
            const px = ((y * cellSize + dy) * size + (x * cellSize + dx)) * 4;
            data[px] = r; data[px + 1] = g; data[px + 2] = b; data[px + 3] = 255;
          }
        }
      }
    }
    this.ctx.putImageData(img, 0, 0);
    this._drawGrid(L, cellSize, size);
  }

  // --- Плавная пошаговая анимация заполнения всей решётки ---
  animate({ grid, cluster }, order, onDone) {
    const L = grid.L;
    const cellSize = Math.max(2, Math.floor(600 / L));
    const size = L * cellSize;
    this.canvas.width = size;
    this.canvas.height = size;
    const ctx = this.ctx;
    const img = ctx.createImageData(size, size);
    const data = img.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 13; data[i + 1] = 17; data[i + 2] = 23; data[i + 3] = 255;
    }
    // Пустые клетки видны с самого начала, занятые появляются по одной.
    for (let idx = 0; idx < L * L; idx++) {
      if (grid.cells[idx] === 0) this._paint(data, size, cellSize, idx % L, Math.floor(idx / L), 30, 35, 45);
    }
    ctx.putImageData(img, 0, 0);
    this._drawGrid(L, cellSize, size);

    let step = 0;
    const total = order.length;
    const delay = L >= 25 ? 9 : L >= 15 ? 15 : 24;
    const drawCell = (idx, progress) => {
      const x = idx % L;
      const y = Math.floor(idx / L);
      const isSpan = cluster.spanningId >= 0 && cluster.labels[idx] === cluster.spanningId;
      // Голубые клетки показывают фронт роста; сквозной кластер вспыхивает коралловым.
      const color = isSpan ? [255, 82, 105] : [74, 178, 255];
      this._paint(data, size, cellSize, x, y, color[0], color[1], color[2]);
    };
    const frame = () => {
      const batch = L >= 25 ? 2 : 1;
      for (let k = 0; k < batch && step < total; k++, step++) drawCell(order[step], step / Math.max(1, total));
      ctx.putImageData(img, 0, 0);
      this._drawGrid(L, cellSize, size);
      if (step < total) setTimeout(() => requestAnimationFrame(frame), delay);
      else {
        // Финальный кадр — все клетки видны одновременно.
        if (onDone) onDone();
      }
    };
    requestAnimationFrame(frame);
  }

  _drawGrid(L, cellSize, size) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "rgba(76, 96, 130, 0.38)";
    ctx.lineWidth = L > 20 ? 0.65 : 1;
    for (let i = 0; i <= L; i++) {
      const p = i * cellSize + 0.5;
      ctx.moveTo(p, 0); ctx.lineTo(p, size);
      ctx.moveTo(0, p); ctx.lineTo(size, p);
    }
    ctx.stroke();
    ctx.restore();
  }

  _paint(data, size, cellSize, x, y, r, g, b) {
    for (let dy = 0; dy < cellSize; dy++) {
      for (let dx = 0; dx < cellSize; dx++) {
        const px = ((y * cellSize + dy) * size + (x * cellSize + dx)) * 4;
        data[px] = r; data[px + 1] = g; data[px + 2] = b; data[px + 3] = 255;
      }
    }
  }

  exportPNG(filename) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = this.canvas.toDataURL("image/png");
    link.click();
  }
}


export default CanvasView;
