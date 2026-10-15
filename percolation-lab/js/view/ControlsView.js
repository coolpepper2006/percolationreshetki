class ControlsView {
  constructor() {
    this.pSlider = document.getElementById("p-slider");
    this.pValue = document.getElementById("p-value");
    this.sizeInput = document.getElementById("size-select");
    this.regenBtn = document.getElementById("regenerate");
    this.toggleBtn = document.getElementById("toggle-spanning");
    this.animBtn = document.getElementById("animate");
    this.exportBtn = document.getElementById("export-png");

    if (this.sizeInput) {
      this.sizeInput.addEventListener("input", () => {
        const raw = this.sizeInput.value;
        // Не даём оставить пустое или некорректное значение.
        if (raw !== "" && !/^\\d+$/.test(raw)) {
          this.sizeInput.value = raw.replace(/[^\\d]/g, "").slice(0, 2);
        }
      });
      this.sizeInput.addEventListener("change", () => {
        let n = Number(this.sizeInput.value);
        if (!Number.isFinite(n) || this.sizeInput.value.trim() === "") n = 30;
        n = Math.max(2, Math.min(30, Math.trunc(n)));
        this.sizeInput.value = String(n);
      });
      this.sizeInput.addEventListener("keydown", (e) => {
        if (["-", "+", "e", "E", ".", ","].includes(e.key)) e.preventDefault();
      });
      this.sizeInput.addEventListener("paste", (e) => {
        const text = (e.clipboardData || window.clipboardData).getData("text");
        if (!/^\\d+$/.test(text)) e.preventDefault();
      });
    }
  }

  setPValue(p) { if (this.pValue) this.pValue.textContent = p.toFixed(2); }

  setToggleLabel(only) {
    if (this.toggleBtn) this.toggleBtn.textContent = only ? "Показать все кластеры" : "Только сквозной";
  }

  syncInputs({ p, L }) {
    if (this.pSlider) this.pSlider.value = p;
    if (this.sizeInput) this.sizeInput.value = String(Math.max(2, Math.min(30, Math.trunc(Number(L) || 30))));
    this.setPValue(p);
  }

  onPChange(fn) {
    if (this.pSlider) this.pSlider.addEventListener("input", () => fn(parseFloat(this.pSlider.value)));
  }
  onSizeChange(fn) {
    if (this.sizeInput) this.sizeInput.addEventListener("change", () => {
      let L = Number(this.sizeInput.value);
      if (!Number.isFinite(L) || this.sizeInput.value.trim() === "") L = 30;
      L = Math.max(2, Math.min(30, Math.trunc(L)));
      this.sizeInput.value = String(L);
      fn(L);
    });
  }
  onRegenerate(fn) { if (this.regenBtn) this.regenBtn.addEventListener("click", fn); }
  onToggleSpanning(fn) { if (this.toggleBtn) this.toggleBtn.addEventListener("click", fn); }
  onAnimate(fn) { if (this.animBtn) this.animBtn.addEventListener("click", fn); }
  onExport(fn) { if (this.exportBtn) this.exportBtn.addEventListener("click", fn); }
  disableAnimate(flag) { if (this.animBtn) this.animBtn.disabled = !!flag; }
}
export default ControlsView;
