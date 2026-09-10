# B-Spline Surface

[TOC]

## Define

A B-spline surface is a tensor-product piecewise polynomial surface controlled by a grid of control points and two knot vectors. For degrees p and q, basis functions N_{i,p}(u), M_{j,q}(v), and control points P_{ij}, the surface is S(u,v)=sum_i sum_j N_{i,p}(u) M_{j,q}(v) P_{ij}. Compared with Bezier surfaces, B-spline surfaces provide local control: moving one control point affects only the knot spans where its basis functions are nonzero. Knot multiplicity controls continuity, enabling smooth regions, creases, and patch boundaries in a unified representation.

## Boundaries

B-spline surfaces generally do not interpolate internal control points. Tensor-product topology is naturally rectangular, so extraordinary vertices, arbitrary holes, and complex trimming require additional representation. Parameterization quality strongly affects distortion and sampling density.

## Cost

Evaluation by separable de Boor algorithms is local in the active knot spans and depends mainly on degrees p and q, not on the total number of control points. Storage is O(nm+p+q) for the control grid and two knot vectors. Engineering cost includes knot conventions, trimming, tessellation, normal evaluation, and conversion to polygon meshes.
