# Lie Algebra

[TOC]

## Define

> A Lie algebra is a vector space equipped with a bilinear bracket satisfying antisymmetry and the Jacobi identity.

A **Lie algebra** over a field $F$ is a [linear space](./Linear_Space.md) $\mathfrak g$ together with a bilinear map
$$
[-,-]:\mathfrak g\times\mathfrak g\to\mathfrak g
$$
such that for all $x,y,z\in\mathfrak g$:

- antisymmetry:
$$
[x,y]=-[y,x],
$$
- Jacobi identity:
$$
[x,[y,z]]+[y,[z,x]]+[z,[x,y]]=0.
$$

## Properties

### Adjoint Action

Each element $x\in\mathfrak g$ defines a linear map
$$
\operatorname{ad}_x(y)=[x,y].
$$

### Lie Algebra of a Lie Group

For a Lie group $G$, its Lie algebra is the tangent space at the identity with bracket induced by commutators of left-invariant vector fields.
