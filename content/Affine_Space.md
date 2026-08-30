# Affine Space

[TOC]

## Define

> An affine space is a geometric space with no distinguished origin.

$$
(\mathcal{A}, V, \phi)
$$

Let $V$ be a [vector space](./Linear_Space.md) over a field $K$. An affine space $\mathcal{A}$ over $V$ is a non-empty set of elements called points together with a function

$$
\phi: V \times \mathcal{A} \rightarrow \mathcal{A}
$$

that associates to each point $p \in \mathcal{A}$ and each vector $v \in V$ a point $q = \phi(v, p)$, written as $q = p + v$, such that the following axioms hold:

1. Identity: For every point $p \in \mathcal{A}$, $p + 0 = p$, where $0$ is the zero vector in $V$.
2. Compatibility with vector addition: For every point $p \in \mathcal{A}$ and all vectors $u, v \in V$, $p + (u + v) = (p + u) + v$.
3. Free and transitive action: For any two points $p, q \in \mathcal{A}$, there exists a unique vector $v \in V$ such that $q = p + v$.

## Properties

### Affine Set

An affine set is a subset closed under affine combinations:
$$
\forall \boldsymbol x_i \in C,\ \theta_i \in \mathbb R,\ \sum \theta_i = 1
\quad \Rightarrow \quad
\sum \theta_i \boldsymbol x_i \in C.
$$

### Affine Hull

For a subset $C$ of an affine space, the affine hull is the smallest affine subset containing $C$:
$$
\operatorname{aff}(C) = \left\{\sum \theta_i \boldsymbol x_i\ \middle|\ \boldsymbol x_i \in C,\ \theta_i \in \mathbb R,\ \sum \theta_i = 1\right\}.
$$

### Hyperplane and Half-Space

A hyperplane and a closed half-space in an affine coordinate model are given by
$$
\{\boldsymbol x \mid \boldsymbol a^T \boldsymbol x = b\}
\quad \text{and} \quad
\{\boldsymbol x \mid \boldsymbol a^T \boldsymbol x \le b\}.
$$

Half-spaces are convex sets.
