# Delaunay Triangulation

[TOC]

## Define

Delaunay triangulation constructs a triangle mesh from a finite point set such that no input point lies inside the circumcircle of any triangle. In the plane, for points in general position, it maximizes the minimum angle among all triangulations and avoids many skinny triangles. It is dual to the Voronoi diagram: two sites share a Delaunay edge exactly when their Voronoi cells share a boundary segment. Common algorithms include incremental insertion with edge flips, divide and conquer, sweepline construction, and Bowyer-Watson cavity retriangulation.

## Boundaries

The standard Delaunay triangulation does not preserve arbitrary polygon boundary edges. Co-circular points can make the triangulation nonunique. Floating-point predicates can create invalid topology unless orientation and in-circle tests are robust. It optimizes triangle angles but does not by itself enforce mesh-size fields, boundary conformity, or element quality constraints.

## Cost

Typical planar algorithms run in O(n log n) expected or worst-case time, depending on the method. Incremental insertion can degrade without randomization. Storage is O(n). Robust implementations usually depend on exact or adaptive predicates for orientation and in-circle tests.
