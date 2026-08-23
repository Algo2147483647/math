# Chain Complex

[TOC]

## Define

> A chain complex is a sequence of modules or vector spaces linked by differentials whose successive composition is zero.

A **chain complex** is a family of objects $(C_n)_{n\in\mathbb Z}$ together with morphisms
$$
d_n:C_n\to C_{n-1}
$$
such that
$$
d_{n-1}\circ d_n = 0
\quad \text{for all } n.
$$

In practice the terms are often modules, vector spaces, or abelian groups.

## Properties

### Cycles, Boundaries, and Homology

The cycles and boundaries are
$$
Z_n=\ker d_n,
\qquad
B_n=\operatorname{im} d_{n+1}.
$$
Since $d_n\circ d_{n+1}=0$, one has $B_n\subseteq Z_n$, and the homology is
$$
H_n(C)=Z_n/B_n.
$$
