class AccordionView {
  constructor() {
    this.items = Array.from(document.querySelectorAll(".accordion-item"));
    this.expandBtn = document.getElementById("expand-all");
    this.collapseBtn = document.getElementById("collapse-all");
  }

  bindHeaderClick(fn) {
    this.items.forEach(item => {
      const header = item.querySelector(".accordion-header");
      if (header) header.addEventListener("click", () => fn(item));
    });
  }
  bindExpandAll(fn) {
    if (this.expandBtn) this.expandBtn.addEventListener("click", fn);
  }
  bindCollapseAll(fn) {
    if (this.collapseBtn) this.collapseBtn.addEventListener("click", fn);
  }
  toggle(item) { item.classList.toggle("open"); }
  openAll() { this.items.forEach(i => i.classList.add("open")); }
  closeAll() { this.items.forEach(i => i.classList.remove("open")); }
}