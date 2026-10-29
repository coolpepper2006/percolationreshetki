import test from 'node:test';
import assert from 'node:assert/strict';
import Grid from '../js/model/Grid.js';
import PercolationModel from '../js/model/PercolationModel.js';
import Cluster from '../js/model/Cluster.js';

test('same seed reproduces the same occupancy pattern', () => {
  const a = new Grid(12, 0.43, 'square', 12345);
  const b = new Grid(12, 0.43, 'square', 12345);
  assert.deepEqual(Array.from(a.cells), Array.from(b.cells));
});

test('growth order contains each site exactly once', () => {
  const model = new PercolationModel({ L: 10, p: 0.4, seed: 99 });
  model.regenerate();
  const order = model.getGrowthOrder();
  assert.equal(order.length, 100);
  assert.equal(new Set(order).size, 100);
  assert.ok(order.every(i => i >= 0 && i < 100));
});

test('p=0 has no occupied clusters; p=1 spans a square grid', () => {
  const empty = new PercolationModel({ L: 8, p: 0, seed: 1 });
  empty.regenerate();
  assert.equal(empty.stats.numClusters, 0);
  const full = new PercolationModel({ L: 8, p: 1, seed: 1 });
  full.regenerate();
  assert.equal(full.stats.hasSpanning, true);
  assert.equal(full.stats.maxSize, 64);
});

test('snapshot declares a schema version and preserves seed', () => {
  const model = new PercolationModel({ L: 6, p: 0.5, seed: 42 });
  model.regenerate();
  const snapshot = model.toSnapshot();
  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.model.seed, 42);
  assert.equal(snapshot.cells.length, 36);
});

test('crossing curve includes uncertainty and reproducibility metadata', () => {
  const model = new PercolationModel({ L: 8, p: 0.5, seed: 123 });
  const points = model.computeCurve(20, 4, 8);
  assert.equal(points.length, 5);
  for (const point of points) {
    assert.ok(point.low <= point.value && point.value <= point.high);
    assert.equal(point.trials, 20);
    assert.equal(point.L, 8);
    assert.equal(point.seed, 123);
  }
});
