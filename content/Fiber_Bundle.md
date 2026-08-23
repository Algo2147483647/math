# Fiber Bundle

[TOC]

## Define

> A fiber bundle is a space that locally looks like a product of a base space with a typical fiber.

A **fiber bundle** consists of a total space $E$, a base space $B$, a typical fiber $F$, and a projection
$$
\pi:E\to B
$$
such that for every point $b\in B$ there exists an open neighborhood $U\subseteq B$ with a homeomorphism
$$
\pi^{-1}(U)\cong U\times F
$$
compatible with the projection to $U$.

## Properties

### Local Trivialization

A local trivialization identifies the bundle over a small open set with a product space.

### Section

A section is a map
$$
s:B\to E
$$
such that $\pi\circ s=\operatorname{id}_B$.
