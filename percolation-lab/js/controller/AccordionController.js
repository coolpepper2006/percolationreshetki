
class AccordionController {
  constructor() {
    this.view = new AccordionView();
    this.view.bindHeaderClick((item) => this.view.toggle(item));
    this.view.bindExpandAll(() => this.view.openAll());
    this.view.bindCollapseAll(() => this.view.closeAll());
  }
}