# Convex Set

[TOC]

## Define

> A convex set is a subset that contains the line segment joining any two of its points.

A convex set in an affine space is a subset $C$ such that for every finite family of points $\boldsymbol x_i \in C$ and coefficients $a_i \in [0,1]$ with $\sum a_i = 1$,
$$
\sum a_i \boldsymbol x_i \in C.
$$

Equivalently, for any two points $x,y \in C$ and any $t \in [0,1]$,
$$
(1-t)x + ty \in C.
$$

## Properties

### Supporting Hyperplane

Every boundary point of a sufficiently regular convex set admits a supporting hyperplane.

### Convex Hull

For a subset $S$ of an affine space, the convex hull is the smallest convex set containing $S$:
$$
\operatorname{conv}(S) = \left\{\sum \theta_i x_i\ \middle|\ x_i \in S,\ \theta_i \in [0,1],\ \sum \theta_i = 1\right\}.
$$

Equivalently, $\operatorname{conv}(S)$ is the intersection of all convex sets containing $S$.

### Examples

- Half-spaces are convex.
- Polyhedra are convex.
- The convex hull of finitely many points is a polytope.
