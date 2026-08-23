# Semimartingale

[TOC]

## Define

> A semimartingale is the basic integrator class for modern stochastic calculus.

A **semimartingale** is a stochastic process that can be decomposed as
$$
X_t = M_t + A_t,
$$
where $M$ is a local martingale and $A$ is a finite-variation adapted process.

## Properties

### Ito Integration

If $X$ is a semimartingale and $H$ is a suitable predictable process, then the stochastic integral
$$
\int H\,dX
$$
is well defined.

### Examples

Levy processes and many diffusion processes are standard semimartingales.
