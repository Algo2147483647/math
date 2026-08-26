# Laplace Equation

[TOC]

## Description

The **Laplace equation** is a second order elliptic PDE for an unknown function
$u : \Omega \subset \mathbb{R}^n \to \mathbb{R}$.

The classical Dirichlet problem for the Laplace equation is

$$
\left\{
\begin{aligned}
\Delta u(x) &= 0, && x \in \Omega, \\
u(x) &= g(x), && x \in \partial \Omega,
\end{aligned}
\right.
$$

where:

- $\Omega \subset \mathbb{R}^n$ is a bounded spatial domain.
- $\partial \Omega$ is the boundary of $\Omega$.
- $x = (x_1,\dots,x_n)$ is the spatial variable.
- $u : \overline{\Omega} \to \mathbb{R}$ is the unknown function.
- $g : \partial \Omega \to \mathbb{R}$ is the prescribed boundary datum.
- $\Delta$ is the Laplace operator, defined by

$$
\Delta u
=
\sum_{i=1}^n \frac{\partial^2 u}{\partial x_i^2}.
$$

Thus, the PDE may be written explicitly as

$$
\sum_{i=1}^n u_{x_i x_i}(x) = 0,
\qquad x \in \Omega.
$$

A function $u$ satisfying $\Delta u = 0$ in $\Omega$ is called **harmonic** in $\Omega$.

The Neumann problem is

$$
\left\{
\begin{aligned}
\Delta u(x) &= 0, && x \in \Omega, \\
\frac{\partial u}{\partial \nu}(x) &= h(x), && x \in \partial \Omega,
\end{aligned}
\right.
$$

where:

- $\nu(x)$ is the outward unit normal vector to $\partial \Omega$ at $x$.
- $\frac{\partial u}{\partial \nu} = \nabla u \cdot \nu$ is the normal derivative.
- $h : \partial \Omega \to \mathbb{R}$ is the prescribed boundary flux.

A classical solution of the Dirichlet problem is a function
$u \in C^2(\Omega) \cap C(\overline{\Omega})$ such that $\Delta u = 0$ pointwise in
$\Omega$ and $u = g$ on $\partial \Omega$.

## Title

Laplace Equation
