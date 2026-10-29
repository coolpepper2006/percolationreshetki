# Experiment passport

## Goal
Study how the probability of a spanning occupied cluster depends on occupation probability for a finite lattice.

## Hypothesis
For a fixed lattice geometry and size, the vertical crossing probability `R_L(p)` increases as occupation probability `p` increases.

## Model and assumptions
- Site percolation: each site is occupied independently with probability `p`.
- The current 2D square lattice uses open boundaries.
- A vertical crossing means one occupied connected component touches both top and bottom boundaries.
- The 3D lattice choices are visual 2D schematic projections in this version; their thresholds must not be interpreted as validated 3D results.
- Animation traverses a generated configuration; it is not a time-dependent physical process.

## Observables
- `R_L(p)`: number of realizations with a top-to-bottom crossing divided by number of trials.
- `std_error = sqrt(R_L(1-R_L)/N)`.
- `ci_low`, `ci_high`: 95% Wilson binomial confidence interval.
- Single-realization occupancy ratio, number of clusters, largest cluster size and whether any crossing exists.

## Boundary conditions
Open boundaries; crossing event is top-to-bottom only. Horizontal crossing is not combined with vertical crossing.

## Verification plan
- Test p=0 and p=1 limiting cases.
- Test deterministic reproducibility for a fixed seed.
- Ensure traversal visits each site once.
- Check each reported confidence interval contains the point estimate.
- Compare square-lattice curves for several sizes and trial counts before making claims about the infinite-system critical threshold.

## Interpretation limits
A finite-size crossing curve is not the order parameter `P∞`. A single-size estimate where `R_L(p)` is near 0.5 is not by itself an estimate of the infinite-lattice critical threshold.
