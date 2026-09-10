# Quadratic Optimization

[TOC]

## Description

Quadratic optimization is the problem of optimizing a quadratic objective over a feasible set defined by constraints. A standard finite-dimensional form is

$$
\begin{aligned}
\min_{x \in \mathbb{R}^n} \quad & q(x) := \frac{1}{2}x^\top Qx + c^\top x + r \\
\text{subject to} \quad & Ax = b, \\
& Gx \le h.
\end{aligned}
$$

Here, $x \in \mathbb{R}^n$ is the decision variable, $Q \in \mathbb{R}^{n \times n}$ is a symmetric matrix, $c \in \mathbb{R}^n$ is a linear coefficient vector, and $r \in \mathbb{R}$ is a constant term.

The objective function is

$$
q(x) = \frac{1}{2}x^\top Qx + c^\top x + r,
$$

where the term $\frac{1}{2}x^\top Qx$ is quadratic in $x$, the term $c^\top x$ is linear in $x$, and $r$ does not affect the optimizer.

The feasible set is

$$
\mathcal{X}
=
\left\{
x \in \mathbb{R}^n
\mid
Ax = b,\;
Gx \le h
\right\}.
$$

The equality constraints $Ax = b$ impose affine restrictions on $x$, while the inequality constraints $Gx \le h$ impose componentwise affine upper bounds.

The quadratic optimization problem can therefore be written compactly as

$$
\min_{x \in \mathcal{X}} q(x).
$$

An optimal solution is any point $x^\star \in \mathcal{X}$ satisfying

$$
q(x^\star) \le q(x)
\quad
\text{for all } x \in \mathcal{X}.
$$

The optimal value is

$$
p^\star := q(x^\star) = \inf_{x \in \mathcal{X}} q(x),
$$

provided that the infimum is attained. If $Q \succeq 0$ and $\mathcal{X}$ is convex, then the problem is a convex quadratic optimization problem; otherwise, it is generally nonconvex.
