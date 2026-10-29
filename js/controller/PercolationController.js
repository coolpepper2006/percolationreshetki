import PercolationModel from '../model/PercolationModel.js';
import CanvasView from '../view/CanvasView.js';
import StatsView from '../view/StatsView.js';
import ControlsView from '../view/ControlsView.js';
import ChartView from '../view/ChartView.js';


class PercolationController {
  constructor(model, view, viewModel = null) {
    this.model = model;
    this.viewModel = viewModel;
    this.canvasView = view.canvas;
    this.statsView = view.stats;
    this.controlsView = view.controls;
    this.chartView = view.chart;
    this.showOnlySpanning = false;
    this.animating = false;

    this._bindModel();
    this._bindView();
    this._readURL();
    this._initialRender();
  }

  _bindModel() {
    this.model.subscribe((state) => {
      this.canvasView.render(state, { onlySpanning: this.showOnlySpanning });
      this.statsView.render(state.stats);
      this.statsView.renderProgress(state.p, state.pc);
      this._syncURL(state.p, state.L);
    });
  }

  _bindView() {
    const c = this.controlsView;

    c.onPChange((p) => {
      c.setPValue(p);
      this.viewModel ? this.viewModel.setProbability(p) : this.model.setP(p);
    });
    c.onSizeChange((L) => this.viewModel ? this.viewModel.setSize(L) : this.model.setL(L));
    c.onLatticeChange((type) => this.viewModel ? this.viewModel.selectLattice(type) : this.model.setLattice(type));
    c.onRegenerate(() => this.model.regenerate({ newSeed: true }));

    c.onToggleSpanning(() => {
      this.showOnlySpanning = !this.showOnlySpanning;
      c.setToggleLabel(this.showOnlySpanning);
      this.canvasView.render(this.model.snapshot(), {
        onlySpanning: this.showOnlySpanning,
      });
    });

    c.onAnimate(() => this._animate());
    c.onExport(() => this._exportPNG());
    document.getElementById('export-csv')?.addEventListener('click', () => this._exportCSV());
    document.getElementById('export-json')?.addEventListener('click', () => this._exportJSON());
    document.getElementById('export-chart-csv')?.addEventListener('click', () => this._exportChartCSV());
  }

  _animate() {
    if (this.animating) return;
    const state = this.model.snapshot();
    if (!state.grid) return;

    const order = this.model.getGrowthOrder();

    this.animating = true;
    this.controlsView.disableAnimate(true);
    const btn = document.getElementById("animate");
    if (btn) btn.textContent = "⏳ Обход компонент…";
    this.canvasView.animate(state, order, () => {
      this.animating = false;
      this.controlsView.disableAnimate(false);
      if (btn) btn.textContent = "↻ Повторить анимацию";
    });
  }

  _exportPNG() {
    const state = this.model.snapshot();
    const name = `percolation_p${state.p.toFixed(2)}_L${state.L}.png`;
    this.canvasView.exportPNG(name);
  }

  _download(filename, content, type = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  _exportCSV() {
    const s = this.model.snapshot();
    const occupied = Array.from(s.grid.cells).reduce((a, b) => a + b, 0);
    const rows = [['schema_version','L','p','lattice','seed','occupied_count','occupied_ratio','cluster_count','max_cluster_size','has_spanning'],
      [1,s.L,s.p,s.lattice,s.seed,occupied,s.stats.occupiedRatio,s.stats.numClusters,s.stats.maxSize,s.stats.hasSpanning]];
    this._download(`percolation-stats-L${s.L}-seed${s.seed}.csv`, rows.map(r => r.join(',')).join('\\n'), 'text/csv;charset=utf-8');
  }

  _exportJSON() {
    this._download(`percolation-snapshot-L${this.model.L}-seed${this.model.seed}.json`, JSON.stringify(this.model.toSnapshot(), null, 2), 'application/json;charset=utf-8');
  }

  _exportChartCSV() {
    const data = this.viewModel?.state?.chart || [];
    if (!data.length) { alert('Сначала построй график.'); return; }
    const header = 'L,p,trials,spanning_count,spanning_probability,std_error,ci_low,ci_high,seed';
    const rows = data.map(d => [d.L,d.p,d.trials,d.spanning_count,d.value,d.std_error,d.low,d.high,d.seed].join(','));
    this._download(`crossing-curve-L${this.model.L}-seed${this.model.seed}.csv`, [header,...rows].join('\\n'), 'text/csv;charset=utf-8');
  }

  _syncURL(p, L) {
    try {
      const url = new URL(location.href);
      url.searchParams.set("p", p.toFixed(2));
      url.searchParams.set("L", L);
      url.searchParams.set("lattice", this.model.lattice);
      url.searchParams.set("seed", this.model.seed);
      history.replaceState(null, "", url);
    } catch (e) { /* file:// — URL не обновляем */ }
  }

  _readURL() {
    const url = new URL(location.href);
    if (url.searchParams.has("p")) {
      this.model.p = parseFloat(url.searchParams.get("p"));
    }
    if (url.searchParams.has("lattice")) {
      const type = url.searchParams.get("lattice");
      if (["square", "triangular", "honeycomb", "cubic", "bcc", "fcc"].includes(type)) this.model.lattice = type;
    }
    if (url.searchParams.has("seed")) { const seed = Number(url.searchParams.get("seed")); if (Number.isInteger(seed) && seed >= 0) this.model.seed = seed >>> 0; }
    if (url.searchParams.has("L")) {
      this.model.L = Math.max(2, Math.min(30, Math.trunc(Number(url.searchParams.get("L")) || 30)));
    }
  }

  _initialRender() {
    this.controlsView.syncInputs({ p: this.model.p, L: this.model.L });
    this.model.regenerate();
  }

  // Публичный метод — построить график по кнопке
  buildChart() {
    const btn = document.getElementById("chart-build");
    if (btn) btn.disabled = true;

    setTimeout(() => {
      const data = this.viewModel ? this.viewModel.buildChart(200, 20) : this.model.computeCurve(200, 20, this.model.L);
      this.chartView.render(data, this.model.lattice === 'square' ? 0.592746 : null);

      const label = document.getElementById("chart-pc");
      if (label) label.textContent = this.model.lattice === 'square' ? `L=${this.model.L}; p_c(2D) ≈ 0.592746 (справочно)` : `L=${this.model.L}; p_c зависит от решётки`;

      if (btn) btn.disabled = false;
    }, 30);
  }
}


export default PercolationController;
