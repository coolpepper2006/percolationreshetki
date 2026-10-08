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
  }

  // --- Анимация роста кластера ---
  animate({ grid, cluster }, order, onDone) {
    const L = grid.L;
    const cellSize = Math.max(2, Math.floor(600 / L));
    const size = L * cellSize;
    this.canvas.width = size;
    this.canvas.height = size;

    const ctx = this.ctx;
    const img = ctx.createImageData(size, size);
    const data = img.data;

    // фон + пустые узлы
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 13; data[i + 1] = 17; data[i + 2] = 23; data[i + 3] = 255;
    }
    for (let idx = 0; idx < L * L; idx++) {
      if (grid.cells[idx] === 0) {
        this._paint(data, size, cellSize, idx % L, (idx / L) | 0, 30, 35, 45);
      }
    }
    ctx.putImageData(img, 0, 0);

    let step = 0;
    const total = order.length;
    const chunk = Math.max(1, Math.floor(total / 120));
    const self = this;

    function frame() {
      for (let k = 0; k < chunk && step < total; k++, step++) {
        const idx = order[step];
        const x = idx % L;
        const y = (idx / L) | 0;
        const isSpan = cluster.labels[idx] === cluster.spanningId;
        const r = isSpan ? 255 : 88;
        const g = isSpan ? 77  : 166;
        const b = isSpan ? 77  : 255;
        self._paint(data, size, cellSize, x, y, r, g, b);
      }
      ctx.putImageData(img, 0, 0);
      if (step < total) requestAnimationFrame(frame);
      else if (onDone) onDone();
    }
    requestAnimationFrame(frame);
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