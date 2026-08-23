# Module

[TOC]

## Define

> A module is a vector-space-like structure whose scalars come from a ring rather than necessarily from a field.

$$
(R, M, +, \cdot)
$$

Suppose that $R$ is a [ring](./Ring.md) with multiplicative identity $1_R$. A left $R$-module $M$ consists of an abelian group $(M, +)$ together with an operation
$$
\cdot : R \times M \to M
$$
such that for all $r, s \in R$ and $x, y \in M$,

1. $(r + s) \cdot x = r \cdot x + s \cdot x$
2. $r \cdot (x + y) = r \cdot x + r \cdot y$
3. $(rs) \cdot x = r \cdot (s \cdot x)$
4. $1_R \cdot x = x$

## Properties
