# Inner Product Space

[TOC]

## Define

> An inner product space is a vector space with a product that defines length, angle, and orthogonality.

An **inner product space** is a [linear space](./Linear_Space.md) $V$ over $\mathbb R$ or $\mathbb C$ equipped with an inner product
$$
\langle\cdot,\cdot\rangle:V\times V\to F,
\quad F\in\{\mathbb R,\mathbb C\}.
$$

For all $x,y,z\in V$ and $\alpha,\beta\in F$, the inner product satisfies:

- Conjugate symmetry:
$$
\langle x,y\rangle=\overline{\langle y,x\rangle}.
$$

- Linearity in the first argument:
$$
\langle \alpha x+\beta y,z\rangle
=
\alpha\langle x,z\rangle+\beta\langle y,z\rangle.
$$

- Positive definiteness:
$$
\langle x,x\rangle\ge 0,
\quad
\langle x,x\rangle=0\iff x=0.
$$

For real vector spaces, conjugate symmetry becomes symmetry:
$$
\langle x,y\rangle=\langle y,x\rangle.
$$

## Properties

### Induced Norm

Every inner product induces a norm
$$
\|x\|=\sqrt{\langle x,x\rangle}.
$$

Thus every inner product space is naturally a [normed linear space](./Normed_Linear_Space.md).

### Orthogonality

Two vectors $x,y\in V$ are orthogonal if
$$
\langle x,y\rangle=0.
$$

### Cauchy-Schwarz Inequality

For all $x,y\in V$,
$$
|\langle x,y\rangle|\le \|x\|\,\|y\|.
$$

### Angle in a Real Inner Product Space

For nonzero vectors $x,y$ in a real inner product space, the angle $\theta$ between them satisfies
$$
\cos\theta=
\frac{\langle x,y\rangle}{\|x\|\|y\|}.
$$

### Geometric Interpretation

The inner product measures alignment. In Euclidean space,
$$
\langle x,y\rangle=x^Ty=\|x\|\,\|y\|\cos\theta.
$$
