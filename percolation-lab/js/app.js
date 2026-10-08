
document.addEventListener("DOMContentLoaded", () => {
  const canvasEl = document.getElementById("grid-canvas");
  const chartEl = document.getElementById("chart-canvas");
  if (!canvasEl) { console.warn("canvas не найден"); return; }

  const model = new PercolationModel({ L: 100, p: 0.5 });

  const view = {
    canvas: new CanvasView(canvasEl),
    stats: new StatsView(),
    controls: new ControlsView(),
    chart: new ChartView(chartEl),
  };

  const controller = new PercolationController(model, view);

  // кнопка построения графика — снаружи MVC, просто вызов
  const chartBtn = document.getElementById("chart-build");
  if (chartBtn) chartBtn.addEventListener("click", () => controller.buildChart());
});