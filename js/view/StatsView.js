class StatsView {
  constructor() {
    this.el = {
      clusters: document.getElementById("stat-clusters"),
      max: document.getElementById("stat-max"),
      spanning: document.getElementById("stat-spanning"),
      occupied: document.getElementById("stat-occupied"),
    };
  }

  render(stats) {
    if (!stats) return;
    if (this.el.clusters) this.el.clusters.textContent = stats.numClusters;
    if (this.el.max)      this.el.max.textContent = stats.maxSize;
    if (this.el.spanning) this.el.spanning.textContent = stats.hasSpanning ? "да" : "нет";
    if (this.el.occupied) this.el.occupied.textContent =
      (stats.occupiedRatio * 100).toFixed(1) + "%";
  }

  renderProgress(p, pc) {
    const marker = document.getElementById("progress-marker");
    const label = document.getElementById("progress-label");
    if (marker) {
      marker.style.left = (Math.max(0, Math.min(1, p)) * 100) + "%";
      const isSuper = p >= pc;
      marker.style.background = isSuper ? "#ff4d4d" : "#58a6ff";
      marker.style.boxShadow = "0 0 12px " + (isSuper ? "#ff4d4d" : "#58a6ff");
    }
    if (label) {
      const isSuper = p >= pc;
      label.textContent = isSuper
        ? "p > p_c — есть сквозной кластер"
        : "p < p_c — сквозного нет";
      label.style.color = isSuper ? "#ff4d4d" : "#8b949e";
    }
  }
}


export default StatsView;
