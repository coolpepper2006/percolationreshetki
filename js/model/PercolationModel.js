import Grid from './Grid.js';
import Cluster from './Cluster.js';
import Statistics from './Statistics.js';



class PercolationModel {
  constructor({ L = 100, p = 0.5 } = {}) {
    this.L = L;
    this.p = p;
    this.grid = null;
    this.cluster = null;
    this.stats = null;
    this._listeners = [];
    this.PC = 0.5927; // порог для квадратной решётки
  }

  subscribe(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter(f => f !== fn);
    };
  }

  _emit() {
    const payload = this.snapshot();
    this._listeners.forEach(fn => fn(payload));
  }

  snapshot() {
    return {
      L: this.L,
      p: this.p,
      pc: this.PC,
      grid: this.grid,
      cluster: this.cluster,
      stats: this.stats ? this.stats.toObject() : null,
    };
  }

  setP(p) {
    this.p = Math.max(0, Math.min(1, p));
    this.regenerate();
  }

  setL(L) {
    this.L = L;
    this.regenerate();
  }

  regenerate() {
    this.grid = new Grid(this.L, this.p);
    this.cluster = new Cluster(this.grid);
    this.stats = new Statistics(this.grid, this.cluster);
    this._emit();
  }

  // --- Порядок обхода кластера для анимации ---
  getGrowthOrder(startIdx) {
    const grid = this.grid;
    if (!grid || grid.cells[startIdx] === 0) return [];

    const L = grid.L;
    const visited = new Uint8Array(L * L);
    const order = [];
    const queue = [startIdx];
    visited[startIdx] = 1;

    while (queue.length) {
      const idx = queue.shift();
      order.push(idx);
      const nb = grid.neighbors(idx);
      for (let k = 0; k < nb.length; k++) {
        const n = nb[k];
        if (grid.cells[n] === 1 && !visited[n]) {
          visited[n] = 1;
          queue.push(n);
        }
      }
    }
    return order;
  }

  // --- Кривая P∞(p) ---
  computeCurve(trials = 30, steps = 20) {
    const points = [];
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      let spanning = 0;
      for (let t = 0; t < trials; t++) {
        const grid = new Grid(50, p);
        const cluster = new Cluster(grid);
        if (cluster.spanningId >= 0) spanning++;
      }
      points.push({ p, pinf: spanning / trials });
    }
    return points;
  }

  // --- Автопоиск p_c методом бисекции ---
  estimatePc(trials = 30) {
    let lo = 0, hi = 1;
    for (let iter = 0; iter < 15; iter++) {
      const mid = (lo + hi) / 2;
      let spanning = 0;
      for (let t = 0; t < trials; t++) {
        const grid = new Grid(50, mid);
        const cluster = new Cluster(grid);
        if (cluster.spanningId >= 0) spanning++;
      }
      if (spanning / trials > 0.5) hi = mid;
      else lo = mid;
    }
    return (lo + hi) / 2;
  }
}


export default PercolationModel;
