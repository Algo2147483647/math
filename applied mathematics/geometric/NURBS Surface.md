# NURBS Surface

[TOC]

## Define

A NURBS surface is a non-uniform rational B-spline surface. It extends a B-spline surface by attaching a weight w_{ij} to each control point. The surface is S(u,v)=sum_i sum_j N_{i,p}(u) M_{j,q}(v) w_{ij} P_{ij} / sum_i sum_j N_{i,p}(u) M_{j,q}(v) w_{ij}. Rational weights allow exact representation of conic sections, cylinders, spheres, tori patches, and free-form CAD surfaces in a single framework. NURBS surfaces are the standard representation for much of industrial CAD and geometric modeling.

## Boundaries

NURBS surfaces are powerful but complex. Weights can be unintuitive, trimming curves add topological complexity, and exact intersection or offset computation is difficult. Tensor-product parameterization can be awkward for arbitrary topology.

## Cost

Evaluation has the local cost of B-spline basis evaluation plus rational homogeneous normalization. Storage includes control points, weights, and two knot vectors. Engineering cost is high because robust CAD systems require trimming, tolerance management, knot insertion, degree elevation, surface-surface intersection, and reliable tessellation.
