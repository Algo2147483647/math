# Simplex Noise

[TOC]

## Define

Simplex noise is a gradient noise function designed as an improvement over classic Perlin noise in higher dimensions. It partitions space into simplices rather than axis-aligned grid cells: line segments in 1D, triangles in 2D, tetrahedra in 3D, and higher-dimensional simplices beyond that. For each query point, the algorithm finds the containing simplex, computes gradient contributions from its simplex corners, applies a compact radial falloff, and sums the contributions. The result is spatially coherent, deterministic procedural noise with fewer directional artifacts than grid-aligned noise.

## Boundaries

Simplex noise is not band-limited by default and can alias under undersampling. Implementations require careful skewing and unskewing transforms. The output distribution and amplitude depend on dimension and normalization. Patent history made it historically awkward in some contexts, although modern implementations are widely used.

## Cost

Simplex noise evaluates fewer corners than hypercubic gradient noise in higher dimensions: n+1 simplex corners instead of 2^n grid corners. It is efficient for procedural terrain, texture synthesis, and animated fields. Engineering cost is mainly in correct simplex ranking, permutation hashing, gradient selection, and octave composition.
