# Manifold

[TOC]

## Define

> A manifold is a space that may be globally curved or complicated but locally looks like Euclidean space.

Manifold $M$ is a second countable [Hausdorff space](./Hausdorff_Space.md) that is locally homeomorphic to a [Euclidean space](./Euclidean_Space.md).

- Hausdorff, $\forall x, y \in M$, there exists open neighborhoods $U_x, U_y \subseteq M$ with $x \in U_x, y \in U_y$ and $U_x \cap U_y = \emptyset$.   
- Second countable, there exits a countable collection $(U_n)_{n \in \mathbb N}$ of open set in $M$ such that for all $V \subseteq M$ open, and $p \in V$, there is some $n$ such that $p \in U_n \subseteq V$
- Locally homeomorphic to a Euclidean space, every point has a neighborhood $U$ homeomorphic $\phi: U \to V$ to an open subset $V$ of the Euclidean space $\mathbb R^n$ for some nonnegative integer $n$.

## Properties

### Manifold $\leftrightarrow \mathbb R^n$ 

#### Chart & Atlas

**Chart** $(U, \phi)$ on a set is a bijection $\phi: U \subseteq M \to \phi(U) \subseteq \mathbb R^n$, where $U, \phi(U)$ is open. A chart $(U, \phi)$ is centered at $p$ for $p \in U$ if $\phi(p) = 0$.

**Atlas** is a set of charts $\{(U_i, \phi_i)\}$, that collectively cover a manifold $M$.
$$
\{(U_i, \phi_i)\}
$$

> Chart is mapping a small region of the manifold to a region in $\mathbb R^n$, and perform ordinary mathematical analysis within that region.

### Geodesic

A geodesic is a curve representing in some sense the shortest path between two points in a Riemannian manifold.
