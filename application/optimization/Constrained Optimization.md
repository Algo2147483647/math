# Constrained Optimization

[TOC]

## Properties

# KKT Conditions

The Karush--Kuhn--Tucker (KKT) conditions characterize optimality for a constrained nonlinear optimization problem of the form

$$
\begin{aligned}
\min_{x \in \mathbb{R}^n} \quad & f(x) \\
\text{subject to} \quad & g_i(x) \leq 0, \quad i \in \left\{1,\dots,m\right\}, \\
& h_j(x) = 0, \quad j \in \left\{1,\dots,p\right\}.
\end{aligned}
$$

Here, $x \in \mathbb{R}^n$ is the decision variable, $f:\mathbb{R}^n \to \mathbb{R}$ is the objective function, $g_i:\mathbb{R}^n \to \mathbb{R}$ are inequality constraints, and $h_j:\mathbb{R}^n \to \mathbb{R}$ are equality constraints. The feasible set is

$$
\mathcal{X}
=
\left\{
x \in \mathbb{R}^n
\mid
g_i(x) \leq 0,\ i \in \left\{1,\dots,m\right\},
\ h_j(x)=0,\ j \in \left\{1,\dots,p\right\}
\right\}.
$$

A point $x^\star \in \mathcal{X}$ is an optimal solution if

$$
f(x^\star) \leq f(x)
\quad
\forall x \in \mathcal{X}.
$$

Define the Lagrangian

$$
\mathcal{L}(x,\lambda,\nu)
=
f(x)
+
\sum_{i=1}^m \lambda_i g_i(x)
+
\sum_{j=1}^p \nu_j h_j(x),
$$

where $\lambda_i \geq 0$ are Lagrange multipliers for inequality constraints and $\nu_j \in \mathbb{R}$ are Lagrange multipliers for equality constraints.

Under an appropriate constraint qualification, if $x^\star$ is a local optimum, then there exist multipliers $\lambda^\star \in \mathbb{R}^m$ and $\nu^\star \in \mathbb{R}^p$ such that

$$
\begin{aligned}
\nabla_x \mathcal{L}(x^\star,\lambda^\star,\nu^\star) &= 0, \\
g_i(x^\star) &\leq 0, \quad i \in \left\{1,\dots,m\right\}, \\
h_j(x^\star) &= 0, \quad j \in \left\{1,\dots,p\right\}, \\
\lambda_i^\star &\geq 0, \quad i \in \left\{1,\dots,m\right\}, \\
\lambda_i^\star g_i(x^\star) &= 0, \quad i \in \left\{1,\dots,m\right\}.
\end{aligned}
$$

These are, respectively, stationarity, primal feasibility, dual feasibility, and complementary slackness.

If $f$ and all $g_i$ are convex, all $h_j$ are affine, and a suitable constraint qualification holds, then the KKT conditions are also sufficient for global optimality.

## Description

A constrained optimization problem seeks a decision variable $x$ that minimizes or maximizes an objective function while satisfying prescribed constraints.

A standard minimization form is

$$
\begin{aligned}
x^\star \in \arg\min_{x \in \mathcal{X}} \quad & f(x) \\
\text{subject to} \quad & g_i(x) \le 0, \quad i = 1,\dots,m \\
& h_j(x) = 0, \quad j = 1,\dots,p .
\end{aligned}
$$

Equivalently, the feasible set may be written as

$$
\mathcal{F}
=
\left\{
x \in \mathcal{X}
:
g_i(x) \le 0 \ \forall i = 1,\dots,m,
\ h_j(x) = 0 \ \forall j = 1,\dots,p
\right\}.
$$

Thus the problem is

$$
\min_{x \in \mathcal{F}} f(x).
$$

Here, $x$ is the decision variable, $\mathcal{X}$ is the ambient decision space, $f:\mathcal{X}\to\mathbb{R}$ is the objective function, and $\mathcal{F}\subseteq\mathcal{X}$ is the feasible set. The functions $g_i$ define inequality constraints, while the functions $h_j$ define equality constraints. An optimal solution $x^\star$ is any feasible point satisfying

$$
f(x^\star) \le f(x)
\quad \text{for all } x \in \mathcal{F}.
$$
