# Riemannian Manifold

[TOC]

## Define

> A Riemannian manifold is a smooth manifold equipped with a positive definite metric tensor.

A **Riemannian manifold** is a [differential manifold](./Differential_Manifold.md) $M$ together with a smooth symmetric bilinear form
$$
g_p:T_pM\times T_pM\to\mathbb R
$$
for each point $p\in M$, such that
$$
g_p(v,v)>0
\quad \text{for every } v\neq 0.
$$
The metric varies smoothly with $p$ and allows one to measure lengths, angles, areas, and volumes.

## Properties

### Levi-Civita Connection

A Riemannian manifold has a unique torsion-free connection compatible with the metric.

### Geodesics

Geodesics are curves satisfying
$$
\nabla_{\dot\gamma}\dot\gamma=0.
$$
They locally extremize length when parameterized affinely.
