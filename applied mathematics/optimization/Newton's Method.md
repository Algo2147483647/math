# Newton's Method

[TOC]

## Description

Newton's method is an iterative second-order method for solving the optimization problem

$$
\begin{aligned}
x^\star \in \arg\min_{x \in \mathcal{X}} \quad & f(x) \\
\text{s.t.} \quad & g_i(x) \le 0, \quad i = 1,\dots,m \\
& h_j(x) = 0, \quad j = 1,\dots,p .
\end{aligned}
$$

The feasible set is

$$
\mathcal{X}
=
\left\{
x \in \mathbb{R}^n
\mid
g_i(x) \le 0,\ i = 1,\dots,m,\ 
h_j(x) = 0,\ j = 1,\dots,p
\right\}.
$$

Here, $x \in \mathbb{R}^n$ is the decision variable, $f:\mathbb{R}^n \to \mathbb{R}$ is the objective function, $\mathcal{X}$ is the feasible set, $g_i$ are inequality constraints, $h_j$ are equality constraints, and $x^\star$ is an optimal solution.

In the unconstrained case $\mathcal{X} = \mathbb{R}^n$, Newton's method constructs a sequence $\left\{x_k\right\}_{k=0}^\infty$ by

$$
x_{k+1}
=
x_k
-
\alpha_k
\left[\nabla^2 f(x_k)\right]^{-1}
\nabla f(x_k),
$$

where $\nabla f(x_k)$ is the gradient, $\nabla^2 f(x_k)$ is the Hessian, and $\alpha_k \in (0,1]$ is a step size.

Equivalently, the Newton direction $d_k$ is the solution of

$$
\nabla^2 f(x_k)d_k
=
-\nabla f(x_k),
$$

and the update is

$$
x_{k+1}
=
x_k
+
\alpha_k d_k.
$$

If $f$ is twice continuously differentiable, $\nabla^2 f(x^\star)$ is positive definite, and $x_0$ is sufficiently close to $x^\star$, then Newton's method converges quadratically to $x^\star$.
