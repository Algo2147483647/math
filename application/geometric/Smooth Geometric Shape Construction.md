# Smooth Geometric Shape Construction

[TOC]

## Define

Geometric construction is designed to solve the problem of **building usable geometric objects from mathematical descriptions, samples, and editing operations**.

- How is a curve, surface, mesh, or solid represented?
- How is a shape generated from equations, primitives, or control points?
- How is continuous geometry converted into samples, polygons, voxels, or meshes?
- How is geometry edited, deformed, repaired, or enriched with detail?

Typical inputs include:

- analytic equations
- curves and surfaces
- point clouds
- scalar fields
- polygonal boundaries
- images and height fields
- control points and deformation handles

Typical outputs include:

- point sets
- polylines
- triangle meshes
- tetrahedral meshes
- implicit fields
- parametric surfaces
- solid models

## Core Idea

Geometric construction is mostly a problem of choosing the right representation and converting between representations safely.

Different operations are simple in different forms:

- implicit fields are good for inside-outside tests and contour extraction
- parametric curves are good for smooth evaluation and design control
- meshes are good for rendering, simulation, and fabrication
- point clouds are good for scanned or sampled data
- voxels are good for volumetric processing
- boundary representations are good for CAD solids

The practical essence of geometric construction is:

1. **Choose a representation that matches the operation**
2. **Generate or transform geometry in that representation**
3. **Discretize continuous objects when computation requires finite data**
4. **Validate topology and numerical robustness**
5. **Convert to the representation needed by the next stage**


## Representation

Different algorithms become natural under different geometric representations.

| Representation | Form | Good for | Common operations |
| :--- | :--- | :--- | :--- |
| Explicit graph | $z=f(x,y)$ | height fields, terrain | sampling, interpolation, displacement |
| Implicit equation | $f(x)=0$ | closed curves and surfaces | inside-outside test, boolean operations, contouring |
| Signed distance field | $\phi(x)$ | robust solids, level sets | offset, blending, collision, ray marching |
| Parametric curve | $\gamma(t)$ | curves, trajectories | evaluation, subdivision, arc-length sampling |
| Parametric surface | $x(u,v)$ | smooth surfaces | tessellation, texture coordinates, differential geometry |
| Point cloud | $\{p_i\}_{i=1}^n$ | scanned or sampled geometry | reconstruction, normal estimation, registration |
| Polygon or mesh | $(V,E,F)$ | rendering, simulation, fabrication | triangulation, smoothing, simplification, remeshing |
| Voxel grid | $V[i,j,k]$ | volumetric data | morphology, marching cubes, flood fill |
| Boundary representation | faces, edges, vertices with topology | CAD solids | trimming, sewing, boolean operations |
| Constructive solid geometry | expression tree of primitives and booleans | procedural solids | union, intersection, difference |
