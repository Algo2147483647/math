# Voronoi Noise

[TOC]

## Define

Voronoi noise, also called cellular noise or Worley noise, generates patterns from distances to pseudo-random feature points distributed in space. For a query point x, nearby feature points are searched and distances are sorted as F1, F2, F3, and so on. The returned value may be F1, F2-F1, cell id, border distance, or another function of nearest feature distances. It naturally produces cells, cracks, stones, scales, bubbles, organic membranes, and procedural partition patterns.

## Boundaries

Naive nearest-feature search is expensive. Grid hashing is usually required. The basic distance field has discontinuities at cell boundaries when returning nearest cell identity, while distance values may have nondifferentiable ridges. Feature distribution, distance metric, and jitter strongly affect visual quality.

## Cost

With spatial hashing, evaluation usually checks the current grid cell and neighboring cells, giving expected constant time per sample for fixed dimension and density. Storage can be implicit through hashing. Engineering cost is dominated by deterministic feature generation, neighbor bounds, distance metric selection, and antialiasing.
