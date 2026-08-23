# Banach Space

[TOC]

## Define

> A Banach space is a normed vector space in which every Cauchy sequence converges.

A **Banach space** is a [normed linear space](./Normed_Linear_Space.md) that is complete with respect to the metric induced by its norm:
$$
d(x,y)=\|x-y\|.
$$

Completeness means that if $(x_n)$ is a Cauchy sequence in the norm, then there exists $x$ in the space such that
$$
\|x_n-x\|\to 0.
$$

## Properties

### Banach Fixed-point Principle

If $X$ is a Banach space and $T:X\to X$ is a contraction, then $T$ has a unique fixed point.

### Examples

Common examples include $\ell^p$ spaces for $1\le p\le \infty$ and spaces of continuous functions with the sup norm.
