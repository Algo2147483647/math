# Normed Linear Space

[TOC]

## Define

> A normed linear space is a vector space equipped with a norm that measures vector length.

A **normed linear space** is a [linear space](./Linear_Space.md) $V$ over a field $F$, usually $F=\mathbb R$ or $F=\mathbb C$, equipped with a norm
$$
\|\cdot\|:V\to\mathbb R_{\ge 0}.
$$

For all $x,y\in V$ and all scalars $\alpha\in F$, the norm satisfies:

- Positive definiteness:
$$
\|x\|\ge 0,
\quad
\|x\|=0\iff x=0.
$$

- Absolute homogeneity:
$$
\|\alpha x\|=|\alpha|\,\|x\|.
$$

- Triangle inequality:
$$
\|x+y\|\le \|x\|+\|y\|.
$$

## Properties

### Metric Induced by a Norm

Every norm induces a metric
$$
d(x,y)=\|x-y\|.
$$

Thus every normed linear space is naturally a metric space.

### Unit Ball and Unit Sphere

The unit ball is
$$
B=\{x\in V\mid \|x\|<1\}.
$$

The unit sphere is
$$
S=\{x\in V\mid \|x\|=1\}.
$$

### Complete Normed Linear Space

A complete normed linear space is a [Banach space](./Banach_Space.md).
