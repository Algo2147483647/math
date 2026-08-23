# Vector Bundle

[TOC]

## Define

> A vector bundle is a fiber bundle whose fibers are vector spaces and whose local trivializations are linear on fibers.

A **vector bundle** consists of a total space $E$, a base space $B$, and a projection
$$
\pi:E\to B
$$
such that each fiber $E_b=\pi^{-1}(b)$ is a [linear space](./Linear_Space.md), and locally
$$
\pi^{-1}(U)\cong U\times V
$$
with transition maps that are linear in the $V$-direction.

## Properties

### Sections

A section of a vector bundle is a map $s:B\to E$ with $\pi\circ s=\operatorname{id}_B$.

### Tangent Bundle

For a smooth manifold $M$, the tangent bundle $TM$ is a standard example of a vector bundle.
