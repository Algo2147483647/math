# Partial Differential Equation Problems

[TOC]

## Define

A partial differential equation (PDE) problem seeks an unknown function
$u : \Omega \to \mathbb{R}^m$ satisfying a differential relation on a domain
$\Omega \subseteq \mathbb{R}^n$, together with prescribed auxiliary conditions.

A general PDE problem can be written as

$$
\left\{
\begin{aligned}
\mathcal{L}\bigl(x,u(x),Du(x),D^2u(x),\ldots,D^k u(x)\bigr) &= f(x), && x \in \Omega, \\
\mathcal{B}\bigl(x,u(x),Du(x),\ldots,D^{k-1}u(x)\bigr) &= g(x), && x \in \partial\Omega.
\end{aligned}
\right.
$$

Here:
- $\Omega \subseteq \mathbb{R}^n$ is the spatial domain.
- $\partial\Omega$ is the boundary of $\Omega$.
- $u$ is the unknown solution.
- $Du, D^2u, \ldots, D^k u$ denote derivatives of $u$ up to order $k$.
- $\mathcal{L}$ is the differential operator defining the PDE.
- $f$ is a prescribed source term.
- $\mathcal{B}$ is the boundary operator.
- $g$ is prescribed boundary data.

For time-dependent problems, one often seeks

$$
u : [0,T] \times \Omega \to \mathbb{R}^m
$$

such that

$$
\left\{
\begin{aligned}
\partial_t u(t,x) + \mathcal{L}\bigl(t,x,u,Du,\ldots,D^k u\bigr) &= f(t,x), && (t,x) \in (0,T] \times \Omega, \\
\mathcal{B}\bigl(t,x,u,Du,\ldots,D^{k-1}u\bigr) &= g(t,x), && (t,x) \in (0,T] \times \partial\Omega, \\
u(0,x) &= u_0(x), && x \in \Omega.
\end{aligned}
\right.
$$

Here:
- $T>0$ is the final time.
- $\partial_t u$ is the time derivative of $u$.
- $u_0$ is the prescribed initial condition.
- $(0,T] \times \Omega$ is the space-time domain.
- $(0,T] \times \partial\Omega$ is the lateral boundary.

A classical solution is a function $u$ with sufficient differentiability such that all equations hold pointwise. For example, if the PDE has order $k$, one typically requires

$$
u \in C^k(\Omega)
$$

or, in the time-dependent case,

$$
u \in C^1([0,T];X) \cap C^k(\Omega)
$$

for a suitable function space $X$.

A weak formulation is obtained by choosing a test space $V$ and requiring

$$
a(u,v) = \ell(v), \qquad \forall v \in V.
$$

Here:
- $V$ is a space of admissible test functions.
- $a : V \times V \to \mathbb{R}$ is a bilinear or nonlinear form induced by the PDE.
- $\ell : V \to \mathbb{R}$ is a linear functional induced by the source and boundary data.
- The solution $u$ is sought in a trial space compatible with the boundary conditions.

A PDE problem is said to be well-posed if:
1. a solution exists;
2. the solution is unique;
3. the solution depends continuously on the data $f$, $g$, and $u_0$.
