class ControlsView {
  constructor() {
    this.pSlider = document.getElementById("p-slider");
    this.pValue = document.getElementById("p-value");
    this.sizeSelect = document.getElementById("size-select");
    this.regenBtn = document.getElementById("regenerate");
    this.toggleBtn = document.getElementById("toggle-spanning");
    this.animBtn = document.getElementById("animate");
    this.exportBtn = document.getElementById("export-png");
  }

  setPValue(p) {
    if (this.pValue) this.pValue.textContent = p.toFixed(2);
  }

  setToggleLabel(only) {
    if (this.toggleBtn) {
      this.toggleBtn.textContent = only
        ? "Показать все кластеры"
        : "Показать только сквозной";
    }
  }

  syncInputs({ p, L }) {
    if (this.pSlider) this.pSlider.value = p;
    if (this.sizeSelect) this.sizeSelect.value = L;
    this.setPValue(p);
  }

  onPChange(fn) {
    if (this.pSlider) this.pSlider.addEventListener("input", () => {
      fn(parseFloat(this.pSlider.value));
    });
  }
  onSizeChange(fn) {
    if (this.sizeSelect) this.sizeSelect.addEventListener("change", () => {
      fn(parseInt(this.sizeSelect.value, 10));
    });
  }
  onRegenerate(fn) {
    if (this.regenBtn) this.regenBtn.addEventListener("click", fn);
  }
  onToggleSpanning(fn) {
    if (this.toggleBtn) this.toggleBtn.addEventListener("click", fn);
  }
  onAnimate(fn) {
    if (this.animBtn) this.animBtn.addEventListener("click", fn);
  }
  onExport(fn) {
    if (this.exportBtn) this.exportBtn.addEventListener("click", fn);
  }
  disableAnimate(flag) {
    if (this.animBtn) this.animBtn.disabled = !!flag;
  }
}


export default ControlsView;
