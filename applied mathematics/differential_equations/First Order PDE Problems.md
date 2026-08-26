# First Order PDE Problems

[TOC]

## Description

A **first order partial differential equation (PDE) problem** seeks an unknown function
$u : \Omega \subset \mathbb{R}^n \to \mathbb{R}$ satisfying an equation involving $u$
and its first derivatives.

A general first order PDE has the form

$$
F(x,u(x),\nabla u(x)) = 0,
\qquad x \in \Omega,
$$

where:

- $\Omega \subset \mathbb{R}^n$ is the spatial domain.
- $x = (x_1,\dots,x_n)$ is the independent variable.
- $u(x)$ is the unknown scalar function.
- $\nabla u(x) = (u_{x_1}(x),\dots,u_{x_n}(x))$ is the gradient of $u$.
- $F : \Omega \times \mathbb{R} \times \mathbb{R}^n \to \mathbb{R}$ is a prescribed function.

A first order PDE problem is typically specified by

$$
\left\{
\begin{aligned}
F(x,u,\nabla u) &= 0, && x \in \Omega, \\
u(x) &= g(x), && x \in \Gamma,
\end{aligned}
\right.
$$

where:

- $\Gamma \subseteq \partial \Omega$ or $\Gamma \subset \Omega$ is the prescribed data set.
- $g : \Gamma \to \mathbb{R}$ is the given boundary or initial data.
- The goal is to determine $u$ on $\Omega$ consistent with both the PDE and the data.

A common quasilinear first order PDE has the form

$$
\sum_{i=1}^n a_i(x,u) u_{x_i} = b(x,u),
\qquad x \in \Omega,
$$

where $a_i : \Omega \times \mathbb{R} \to \mathbb{R}$ are transport coefficients and
$b : \Omega \times \mathbb{R} \to \mathbb{R}$ is a source term.

Equivalently, using the vector field
$a(x,u) = (a_1(x,u),\dots,a_n(x,u))$, the equation is

$$
a(x,u) \cdot \nabla u = b(x,u).
$$

The characteristic curves $(X(s),U(s))$ associated with the quasilinear PDE satisfy

$$
\left\{
\begin{aligned}
\frac{dX_i}{ds} &= a_i(X(s),U(s)), && i = 1,\dots,n, \\
\frac{dU}{ds} &= b(X(s),U(s)).
\end{aligned}
\right.
$$

A function $u$ is a classical solution if $u \in C^1(\Omega)$ and satisfies the PDE
pointwise for every $x \in \Omega$, together with the prescribed data on $\Gamma$.

## Title

First Order PDE Problems
