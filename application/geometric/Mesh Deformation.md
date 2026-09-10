# Mesh Deformation

[TOC]

## Define

Mesh deformation is the problem of changing vertex positions of a polygonal or triangle mesh while preserving selected geometric properties. Given an input mesh M=(V,E,F), constraints such as handles, anchors, cages, skeleton joints, displacement fields, or physical forces define a target mesh M'. Good deformation methods preserve smoothness, local detail, approximate rigidity, topology, and sometimes volume or surface area. The problem appears in character animation, shape editing, simulation preprocessing, morphing, CAD repair, and geometric modeling.

## Boundaries

Large rotations, foldovers, self-intersections, and nonmanifold input can make deformation difficult. Linear methods are fast but may lose local rigidity. Nonlinear methods are more faithful but require iterative solvers and convergence control.

## Cost

The cost depends on the deformation model. Handle-based linear systems typically require sparse matrix factorization and repeated back substitution. Nonlinear methods such as as-rigid-as-possible deformation require iterative local-global optimization. Engineering cost is dominated by constraints, solver stability, collision handling, and preservation of surface detail.
