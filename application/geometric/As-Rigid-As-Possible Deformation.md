# As-Rigid-As-Possible Deformation

[TOC]

## Define

As-rigid-as-possible deformation, usually abbreviated ARAP, deforms a mesh by minimizing local deviation from rigid transformations. The mesh is divided into local neighborhoods, each neighborhood estimates a best-fit rotation, and vertex positions are solved so that transformed edge vectors remain close to their original lengths and directions. A common energy is $E=sum_i sum_{j in N(i)} w_{ij} ||(x_i'-x_j') - R_i(x_i-x_j)||^2$, subject to handle constraints. ARAP is widely used for interactive shape editing because it preserves local detail better than purely Laplacian smoothing methods.

## Boundaries

ARAP is nonlinear because rotations depend on the unknown deformed shape. It usually requires local-global iteration and can converge to local minima. It does not automatically prevent self-intersections or guarantee global rigidity. Boundary constraints strongly affect the result.

## Cost

Each iteration alternates local rotation fitting and a global sparse linear solve. With fixed topology and constraints, matrix factorization can often be reused. Engineering cost includes robust rotation estimation, constraint handling, cotangent weights, convergence criteria, and interactive solver performance.
