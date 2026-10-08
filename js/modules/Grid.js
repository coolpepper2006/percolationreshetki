export class Grid {
  constructor(L, p) {
    this.L = L;
    this.p = p;
    this.cells = this._generate();
  }

  _generate() {
    const total = this.L * this.L;
    const cells = new Uint8Array(total);
    for (let i = 0; i < total; i++) {
      cells[i] = Math.random() < this.p ? 1 : 0;
    }
    return cells;
  }

  neighbors(idx) {
    const L = this.L;
    const x = idx % L;
    const y = (idx / L) | 0;
    const result = [];
    if (x > 0)     result.push(idx - 1);
    if (x < L - 1) result.push(idx + 1);
    if (y > 0)     result.push(idx - L);
    if (y < L - 1) result.push(idx + L);
    return result;
  }

  getOccupiedRatio() {
    let count = 0;
    for (let i = 0; i < this.cells.length; i++) count += this.cells[i];
    return count / this.cells.length;
  }
}