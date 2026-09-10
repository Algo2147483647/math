# Heat Equation

[TOC]

## Description

The **heat equation** is a second order parabolic PDE describing the evolution of a
scalar quantity $u$ under diffusion.

The classical initial-boundary value problem for the heat equation is

$$
\left\{
\begin{aligned}
\partial_t u(t,x) - \kappa \Delta u(t,x) &= f(t,x), && (t,x) \in (0,T) \times \Omega, \\
u(t,x) &= g(t,x), && (t,x) \in (0,T) \times \partial \Omega, \\
u(0,x) &= u_0(x), && x \in \Omega,
\end{aligned}
\right.
$$

where:

- $T > 0$ is the final time.
- $\Omega \subset \mathbb{R}^n$ is the spatial domain.
- $\partial \Omega$ is the boundary of $\Omega$.
- $t \in (0,T)$ is the time variable.
- $x = (x_1,\dots,x_n) \in \Omega$ is the spatial variable.
- $u : [0,T] \times \overline{\Omega} \to \mathbb{R}$ is the unknown temperature or
  diffusing scalar field.
- $\partial_t u$ is the time derivative of $u$.
- $\kappa > 0$ is the diffusion coefficient.
- $f : (0,T) \times \Omega \to \mathbb{R}$ is the source term.
- $g : (0,T) \times \partial \Omega \to \mathbb{R}$ is the prescribed boundary datum.
- $u_0 : \Omega \to \mathbb{R}$ is the initial datum.
- $\Delta$ is the spatial Laplace operator, defined by

$$
\Delta u(t,x)
=
\sum_{i=1}^n \frac{\partial^2 u}{\partial x_i^2}(t,x).
$$

Equivalently, the PDE may be written as

$$
\partial_t u(t,x)
-
\kappa \sum_{i=1}^n u_{x_i x_i}(t,x)
=
f(t,x),
\qquad (t,x) \in (0,T) \times \Omega.
$$

The homogeneous heat equation is obtained by setting $f = 0$:

$$
\partial_t u - \kappa \Delta u = 0.
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
$u \in C^1((0,T) \times \Omega) \cap C^2_x((0,T) \times \Omega) \cap C([0,T] \times \overline{\Omega})$
such that the PDE holds pointwise in $(0,T) \times \Omega$, the boundary condition
holds on $(0,T) \times \partial \Omega$, and the initial condition satisfies
$u(0,x) = u_0(x)$ for all $x \in \Omega$.

## Title

Heat Equation
