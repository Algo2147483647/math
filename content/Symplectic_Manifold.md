# Symplectic Manifold

[TOC]

## Define

> A symplectic manifold is a smooth manifold equipped with a closed nondegenerate differential 2-form.

A **symplectic manifold** is a [differential manifold](./Differential_Manifold.md) $M$ together with a smooth 2-form $\omega$ such that
$$
d\omega=0
$$
and for every nonzero tangent vector $v\in T_pM$ there exists $w\in T_pM$ with
$$
\omega_p(v,w)\neq 0.
$$
The form $\omega$ is called the symplectic form.

## Properties

### Darboux Theorem

Locally every symplectic manifold looks like the standard symplectic vector space.

### Hamiltonian Vector Field

For a smooth function $H$, the Hamiltonian vector field $X_H$ is determined by
$$
\iota_{X_H}\omega=dH.
$$
