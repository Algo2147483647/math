# Second Order PDE Problems

[TOC]

## Description

A **second order partial differential equation (PDE) problem** seeks an unknown function
$u : \Omega \subset \mathbb{R}^n \to \mathbb{R}$ satisfying an equation involving $u$,
its first derivatives, and its second derivatives.

A general second order PDE has the form

$$
F(x,u(x),\nabla u(x),D^2u(x)) = 0,
\qquad x \in \Omega,
$$

where:

- $\Omega \subset \mathbb{R}^n$ is the domain.
- $x = (x_1,\dots,x_n)$ is the independent variable.
- $u(x)$ is the unknown scalar function.
- $\nabla u(x) = (u_{x_1}(x),\dots,u_{x_n}(x))$ is the gradient of $u$.
- $D^2u(x)$ is the Hessian matrix, defined by

$$
D^2u(x)
=
\left( u_{x_i x_j}(x) \right)_{1 \leq i,j \leq n}.
$$

- $F : \Omega \times \mathbb{R} \times \mathbb{R}^n \times \mathbb{S}^n \to \mathbb{R}$
is a prescribed function, where $\mathbb{S}^n$ denotes the space of real symmetric
$n \times n$ matrices.

A second order PDE problem is typically specified by

$$
\left\{
\begin{aligned}
F(x,u,\nabla u,D^2u) &= 0, && x \in \Omega, \\
B(x,u,\nabla u) &= 0, && x \in \partial \Omega,
\end{aligned}
\right.
$$

where:

- $\partial \Omega$ is the boundary of $\Omega$.
- $B$ is a boundary operator.
- The second equation prescribes boundary conditions for $u$.

Common boundary conditions include the Dirichlet condition

$$
u(x) = g(x),
\qquad x \in \partial \Omega,
$$

the Neumann condition

$$
\frac{\partial u}{\partial \nu}(x)
=
\nabla u(x) \cdot \nu(x)
=
h(x),
\qquad x \in \partial \Omega,
$$

and the Robin condition

$$
\alpha(x)u(x) + \beta(x)\frac{\partial u}{\partial \nu}(x) = r(x),
\qquad x \in \partial \Omega.
$$

Here, $\nu(x)$ is the outward unit normal vector to $\partial \Omega$, and
$g,h,r,\alpha,\beta$ are prescribed functions.

A linear second order PDE has the form

$$
\sum_{i,j=1}^n a_{ij}(x) u_{x_i x_j}
+
\sum_{i=1}^n b_i(x) u_{x_i}
+
c(x)u
=
f(x),
\qquad x \in \Omega,
$$

where:

- $a_{ij}$ are the second order coefficients.
- $b_i$ are the first order coefficients.
- $c$ is the zeroth order coefficient.
- $f$ is the source term.

The principal part is

$$
\sum_{i,j=1}^n a_{ij}(x) u_{x_i x_j}.
$$

Let $A(x) = (a_{ij}(x))_{1 \leq i,j \leq n}$. The PDE is classified by the eigenvalues
of $A(x)$:

$$
\begin{aligned}
A(x) \text{ positive or negative definite} &\implies \text{ elliptic}, \\
A(x) \text{ has mixed signs} &\implies \text{ hyperbolic}, \\
A(x) \text{ is degenerate} &\implies \text{ parabolic or degenerate elliptic}.
\end{aligned}
$$

A function $u$ is a classical solution if
$u \in C^2(\Omega) \cap C(\overline{\Omega})$, satisfies the PDE pointwise in
$\Omega$, and satisfies the prescribed boundary condition on $\partial \Omega$.

## Title

Second Order PDE Problems
