import Grid from './Grid.js';
import Cluster from './Cluster.js';
import Statistics from './Statistics.js';



class PercolationModel {
  constructor({ L = 30, p = 0.5, lattice = 'square', seed = Math.floor(Math.random() * 0xffffffff) } = {}) {
    this.L = Math.max(2, Math.min(30, Math.trunc(Number(L) || 30)));
    this.p = p;
    this.lattice = lattice;
    this.seed = Number(seed) >>> 0;
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
      lattice: this.lattice,
      seed: this.seed,
      pc: this.PC,
      grid: this.grid,
      cluster: this.cluster,
      stats: this.stats ? this.stats.toObject() : null,
    };
  }

  setLattice(type) { this.lattice = type; this.regenerate(); }

  setP(p) {
    this.p = Math.max(0, Math.min(1, p));
    this.regenerate();
  }

  setL(L) {
    this.L = Math.max(2, Math.min(30, Math.trunc(Number(L) || 30)));
    this.regenerate();
  }

  regenerate({ newSeed = false } = {}) {
    if (newSeed) this.seed = (this.seed + 1) >>> 0;
    this.grid = new Grid(this.L, this.p, this.lattice, this.seed);
    this.cluster = new Cluster(this.grid);
    this.stats = new Statistics(this.grid, this.cluster);
    this._emit();
  }

  // Единый контракт обхода: сначала занятые компоненты, затем пустые узлы.
  getGrowthOrder() {
    const grid = this.grid;
    if (!grid) return [];
    const seen = new Uint8Array(grid.cells.length), order = [];
    for (let seed = 0; seed < grid.cells.length; seed++) {
      if (grid.cells[seed] !== 1 || seen[seed]) continue;
      const queue = [seed]; seen[seed] = 1;
      for (let head = 0; head < queue.length; head++) {
        const idx = queue[head]; order.push(idx);
        for (const n of grid.neighbors(idx)) if (grid.cells[n] === 1 && !seen[n]) { seen[n] = 1; queue.push(n); }
      }
    }
    for (let i = 0; i < grid.cells.length; i++) if (grid.cells[i] === 0) order.push(i);
    return order;
  }

  toSnapshot() {
    const s = this.snapshot();
    return { schemaVersion: 1, createdAt: new Date().toISOString(),
      model: { L: s.L, p: s.p, lattice: s.lattice, seed: s.seed },
      observables: { ...s.stats, note: 'Single realization; crossing probability is estimated separately.' },
      cells: Array.from(s.grid.cells), edges: s.grid.edges.map(edge => edge.slice()),
      clusterLabels: Array.from(s.cluster.labels) };
  }

  // Конечномерная вероятность вертикального пересечения R_L(p), не параметр порядка P∞.
  // Интервал Уилсона показывает биномиальную статистическую неопределённость.
  computeCurve(trials = 200, steps = 20, L = this.L) {
    const points = [];
    const nTrials = Math.max(1, Math.trunc(trials));
    const size = Math.max(2, Math.min(30, Math.trunc(L)));
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      let crossings = 0;
      for (let t = 0; t < nTrials; t++) {
        const trialSeed = (this.seed + i * 1000003 + t * 9176) >>> 0;
        const grid = new Grid(size, p, this.lattice, trialSeed);
        const cluster = new Cluster(grid);
        // Только верх-низ: не смешиваем два направления в одном событии.
        let vertical = false;
        for (let id = 0; id < cluster.numClusters; id++) {
          if (cluster.touchesTop[id] && cluster.touchesBottom[id]) { vertical = true; break; }
        }
        if (vertical) crossings++;
      }
      const estimate = crossings / nTrials;
      const z = 1.96;
      const denom = 1 + z * z / nTrials;
      const center = (estimate + z * z / (2 * nTrials)) / denom;
      const half = z * Math.sqrt((estimate * (1 - estimate) / nTrials) + z * z / (4 * nTrials * nTrials)) / denom;
      points.push({ L: size, p, trials: nTrials, spanning_count: crossings, std_error: Math.sqrt(estimate * (1 - estimate) / nTrials), seed: this.seed, value: estimate, low: Math.max(0, center - half), high: Math.min(1, center + half) });
    }
    return points;
  }

  // Это p, при котором оценённая вероятность вертикального пересечения близка к 0.5
  // для конечного L, а не истинный критический порог бесконечной решётки.
  estimateFiniteSizeP50(trials = 200, L = this.L, steps = 100) {
    const points = this.computeCurve(trials, steps, L);
    return points.reduce((best, point) => Math.abs(point.value - 0.5) < Math.abs(best.value - 0.5) ? point : best, points[0]).p;
  }

}


export default PercolationModel;
