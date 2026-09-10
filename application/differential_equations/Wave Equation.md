# Wave Equation

[TOC]

## Description

The **wave equation** is a second order hyperbolic PDE describing the propagation of
waves with finite speed.

The classical initial-boundary value problem for the wave equation is

$$
\left\{
\begin{aligned}
\partial_{tt} u(t,x) - c^2 \Delta u(t,x) &= f(t,x), && (t,x) \in (0,T) \times \Omega, \\
u(t,x) &= g(t,x), && (t,x) \in (0,T) \times \partial \Omega, \\
u(0,x) &= u_0(x), && x \in \Omega, \\
\partial_t u(0,x) &= u_1(x), && x \in \Omega.
\end{aligned}
\right.
$$

where:

- $T > 0$ is the final time.
- $\Omega \subset \mathbb{R}^n$ is the spatial domain.
- $\partial \Omega$ is the boundary of $\Omega$.
- $t \in (0,T)$ is the time variable.
- $x = (x_1,\dots,x_n) \in \Omega$ is the spatial variable.
- $u : [0,T] \times \overline{\Omega} \to \mathbb{R}$ is the unknown wave field.
- $\partial_{tt}u$ is the second time derivative of $u$.
- $c > 0$ is the wave speed.
- $f : (0,T) \times \Omega \to \mathbb{R}$ is the forcing term.
- $g : (0,T) \times \partial \Omega \to \mathbb{R}$ is the prescribed boundary datum.
- $u_0 : \Omega \to \mathbb{R}$ is the initial displacement.
- $u_1 : \Omega \to \mathbb{R}$ is the initial velocity.
- $\Delta$ is the spatial Laplace operator, defined by

$$
\Delta u(t,x)
=
\sum_{i=1}^n \frac{\partial^2 u}{\partial x_i^2}(t,x).
$$

Equivalently, the PDE may be written as

$$
\partial_{tt}u(t,x)
-
c^2 \sum_{i=1}^n u_{x_i x_i}(t,x)
=
f(t,x),
\qquad (t,x) \in (0,T) \times \Omega.
$$

The homogeneous wave equation is obtained by setting $f = 0$:

$$
\partial_{tt}u - c^2 \Delta u = 0.
$$

A Neumann boundary condition may be prescribed instead of the Dirichlet condition:

$$
\frac{\partial u}{\partial \nu}(t,x)
=
h(t,x),
\qquad (t,x) \in (0,T) \times \partial \Omega,
$$

where $\nu(x)$ is the outward unit normal vector to $\partial \Omega$ and

$$
\frac{\partial u}{\partial \nu}
=
\nabla_x u \cdot \nu
$$

is the normal derivative.

A classical solution is a function
$u \in C^2((0,T) \times \Omega) \cap C([0,T] \times \overline{\Omega})$
such that the PDE holds pointwise in $(0,T) \times \Omega$, the boundary condition
holds on $(0,T) \times \partial \Omega$, and the initial conditions satisfy
$u(0,x) = u_0(x)$ and $\partial_t u(0,x) = u_1(x)$ for all $x \in \Omega$.

## Title

Wave Equation
