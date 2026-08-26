# Poisson Equation

[TOC]

## Description

The **Poisson equation** is a second order elliptic PDE for an unknown function
$u : \Omega \subset \mathbb{R}^n \to \mathbb{R}$.

The classical Dirichlet problem for the Poisson equation is

$$
\left\{
\begin{aligned}
-\Delta u(x) &= f(x), && x \in \Omega, \\
u(x) &= g(x), && x \in \partial \Omega,
\end{aligned}
\right.
$$

where:

- $\Omega \subset \mathbb{R}^n$ is the spatial domain.
- $\partial \Omega$ is the boundary of $\Omega$.
- $x = (x_1,\dots,x_n)$ is the spatial variable.
- $u : \overline{\Omega} \to \mathbb{R}$ is the unknown scalar function.
- $f : \Omega \to \mathbb{R}$ is the source term.
- $g : \partial \Omega \to \mathbb{R}$ is the prescribed boundary datum.
- $\Delta$ is the Laplace operator, defined by

$$
\Delta u(x)
=
\sum_{i=1}^n \frac{\partial^2 u}{\partial x_i^2}(x).
$$

Equivalently, the equation may be written as

$$
-\sum_{i=1}^n u_{x_i x_i}(x) = f(x),
\qquad x \in \Omega.
$$

The Neumann problem is

$$
\left\{
\begin{aligned}
-\Delta u(x) &= f(x), && x \in \Omega, \\
\frac{\partial u}{\partial \nu}(x) &= h(x), && x \in \partial \Omega,
\end{aligned}
\right.
$$

where:

- $\nu(x)$ is the outward unit normal vector to $\partial \Omega$ at $x$.
- $\frac{\partial u}{\partial \nu} = \nabla u \cdot \nu$ is the normal derivative.
- $h : \partial \Omega \to \mathbb{R}$ is the prescribed boundary flux.

For the Neumann problem, a necessary compatibility condition is

$$
\int_\Omega f(x) \, dx
=
-\int_{\partial \Omega} h(x) \, dS.
$$

A classical solution of the Dirichlet problem is a function
$u \in C^2(\Omega) \cap C(\overline{\Omega})$ such that the equation holds pointwise
in $\Omega$ and $u = g$ on $\partial \Omega$.

The Laplace equation is the special case of the Poisson equation with $f = 0$.

## Title

Poisson Equation
