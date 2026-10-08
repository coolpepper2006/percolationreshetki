export class Statistics {
  constructor(grid, cluster) {
    this.numClusters = cluster.numClusters;
    this.maxSize = cluster.maxSize();
    this.hasSpanning = cluster.hasSpanning();
    this.occupiedRatio = grid.getOccupiedRatio();
  }

  toObject() {
    return {
      numClusters: this.numClusters,
      maxSize: this.maxSize,
      hasSpanning: this.hasSpanning,
      occupiedRatio: this.occupiedRatio,
    };
  }
}