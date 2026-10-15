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

    // Показываем ВСЕ занятые ячейки по очереди, а не только один маленький кластер.
    // Сначала обходятся компоненты, а внутри них — соседние клетки: рост выглядит связным.
    const L = state.L;
    const seen = new Uint8Array(L * L);
    const order = [];
    for (let seed = 0; seed < L * L; seed++) {
      if (state.grid.cells[seed] !== 1 || seen[seed]) continue;
      const queue = [seed];
      seen[seed] = 1;
      for (let head = 0; head < queue.length; head++) {
        const idx = queue[head];
        order.push(idx);
        for (const n of state.grid.neighbors(idx)) {
          if (state.grid.cells[n] === 1 && !seen[n]) {
            seen[n] = 1;
            queue.push(n);
          }
        }
      }
    }

    if (!order.length) {
      const btn = document.getElementById("animate");
      if (btn) {
        btn.textContent = "Нет занятых ячеек — увеличь p";
        setTimeout(() => { btn.textContent = "▶ Показать рост кластера"; }, 1800);
      }
      return;
    }
    this.animating = true;
    this.controlsView.disableAnimate(true);
    const btn = document.getElementById("animate");
    if (btn) btn.textContent = "⏳ Растёт кластер…";
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
