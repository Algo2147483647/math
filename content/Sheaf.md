# Sheaf

[TOC]

## Define

> A sheaf is a device for assigning local data to open sets in a way that can be uniquely glued from compatible local pieces.

Given a [topological space](./Topological_Space.md) $X$, a **sheaf** $\mathcal F$ assigns to each open set $U\subseteq X$ an object $\mathcal F(U)$ and to each inclusion $V\subseteq U$ a restriction map
$$
\rho_{U,V}:\mathcal F(U)\to\mathcal F(V),
$$
satisfying locality and gluing axioms.

## Properties

### Locality

If two sections on $U$ restrict to the same section on every member of an open cover, then they are equal.

### Gluing

Compatible local sections on an open cover glue to a unique global section.
