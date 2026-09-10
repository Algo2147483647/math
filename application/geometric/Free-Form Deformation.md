# Free-Form Deformation

[TOC]

## Define

Free-form deformation deforms geometry by embedding it in a surrounding parametric control volume, commonly a lattice. Instead of editing mesh vertices directly, the method maps each point into lattice coordinates and evaluates its new position from deformed lattice control points. Classical FFD uses tensor-product Bernstein or B-spline basis functions. For a point with local coordinates (u,v,w), the deformed position is a weighted sum of lattice control points. This gives smooth, intuitive, spatially coherent deformation over curves, surfaces, volumes, or point clouds.

## Boundaries

FFD is excellent for broad smooth edits but less suitable for localized semantic motion unless the lattice is refined or combined with constraints. It can distort fine features and does not automatically prevent self-intersection. The quality depends strongly on lattice placement, resolution, and parameterization.

## Cost

Evaluation costs O(lmn) for a naive lattice of dimensions l,m,n, but local B-spline lattices reduce active control points to a bounded neighborhood. Storage is dominated by lattice control points. Engineering cost includes point-to-lattice parameterization, lattice editing UI, boundary behavior, and efficient updates for dense meshes.
