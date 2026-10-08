import PercolationModel from '../model/PercolationModel.js';
import CanvasView from '../view/CanvasView.js';
import StatsView from '../view/StatsView.js';
import ControlsView from '../view/ControlsView.js';
import ChartView from '../view/ChartView.js';


class PercolationController {
  constructor(model, view) {
    this.model = model;
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
      this.model.setP(p);
    });
    c.onSizeChange((L) => this.model.setL(L));
    c.onRegenerate(() => this.model.regenerate());

    c.onToggleSpanning(() => {
      this.showOnlySpanning = !this.showOnlySpanning;
      c.setToggleLabel(this.showOnlySpanning);
      this.canvasView.render(this.model.snapshot(), {
        onlySpanning: this.showOnlySpanning,
      });
    });

    c.onAnimate(() => this._animate());
    c.onExport(() => this._exportPNG());
  }

  _animate() {
    if (this.animating) return;
    const state = this.model.snapshot();
    if (!state.grid) return;

    // найти первый занятый узел
    let start = -1;
    for (let i = 0; i < state.grid.cells.length; i++) {
      if (state.grid.cells[i] === 1) { start = i; break; }
    }
    if (start < 0) return;

    const order = this.model.getGrowthOrder(start);
    if (!order.length) return;

    this.animating = true;
    this.controlsView.disableAnimate(true);

    this.canvasView.animate(state, order, () => {
      this.animating = false;
      this.controlsView.disableAnimate(false);
    });
  }

  _exportPNG() {
    const state = this.model.snapshot();
    const name = `percolation_p${state.p.toFixed(2)}_L${state.L}.png`;
    this.canvasView.exportPNG(name);
  }

  _syncURL(p, L) {
    try {
      const url = new URL(location.href);
      url.searchParams.set("p", p.toFixed(2));
      url.searchParams.set("L", L);
      history.replaceState(null, "", url);
    } catch (e) { /* file:// — URL не обновляем */ }
  }

  _readURL() {
    const url = new URL(location.href);
    if (url.searchParams.has("p")) {
      this.model.p = parseFloat(url.searchParams.get("p"));
    }
    if (url.searchParams.has("L")) {
      this.model.L = parseInt(url.searchParams.get("L"), 10);
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
      const data = this.model.computeCurve(30, 20);
      const pc = this.model.estimatePc(30);
      this.chartView.render(data, pc);

      const label = document.getElementById("chart-pc");
      if (label) label.textContent = pc.toFixed(3);

      if (btn) btn.disabled = false;
    }, 30);
  }
}


export default PercolationController;
