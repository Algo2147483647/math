# Quadratic Programming

[TOC]

## Description

A Quadratic Program (QP) is an optimization problem of the form

$$
\begin{aligned}
\min_{x \in \mathbb{R}^n} \quad & \frac{1}{2}x^\top Qx + q^\top x + r \\
\text{subject to} \quad & Ax \leq b, \\
& Ex = h, \\
& x \in \mathcal{X}.
\end{aligned}
$$

Here, $x \in \mathbb{R}^n$ is the decision variable. The objective function is

$$
f(x) = \frac{1}{2}x^\top Qx + q^\top x + r,
$$

where $Q \in \mathbb{R}^{n \times n}$ is symmetric, $q \in \mathbb{R}^n$, and $r \in \mathbb{R}$. The feasible set is

$$
\mathcal{F}
=
\left\{
x \in \mathcal{X}
\mid
Ax \leq b,\;
Ex = h
\right\},
$$

where $Ax \leq b$ represents affine inequality constraints, $Ex = h$ represents affine equality constraints, and $\mathcal{X} \subseteq \mathbb{R}^n$ may encode additional simple constraints such as bounds.

An optimal solution is any point $x^\star \in \mathcal{F}$ satisfying

$$
f(x^\star) \leq f(x)
\quad
\text{for all } x \in \mathcal{F}.
$$

If $Q \succeq 0$ and $\mathcal{X}$ is convex, then the QP is convex. If $Q \succ 0$ on the feasible directions and $\mathcal{F}$ is nonempty, the optimal solution is unique.
