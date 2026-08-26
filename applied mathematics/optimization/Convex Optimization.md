# Convex Optimization

[TOC]

## Description

A **convex optimization problem** is an optimization problem of the form

$$
\min_{x \in \mathcal{X}} f_0(x)
$$

where the feasible set $\mathcal{X}$ is convex and the objective function $f_0$ is convex.

A standard constrained form is

$$
\begin{aligned}
\min_{x \in \mathbb{R}^n} \quad & f_0(x) \\
\text{s.t.} \quad & f_i(x) \le 0, \quad i = 1,\dots,m, \\
& h_j(x) = 0, \quad j = 1,\dots,p,
\end{aligned}
$$

where each $f_i : \mathbb{R}^n \to \mathbb{R}$ is convex, and each $h_j : \mathbb{R}^n \to \mathbb{R}$ is affine.

The feasible set is

$$
\mathcal{X} = \left\{
x \in \mathbb{R}^n
\mid
f_i(x) \le 0,\ i=1,\dots,m,\quad
h_j(x)=0,\ j=1,\dots,p
\right\}.
$$

Here, $x \in \mathbb{R}^n$ is the **decision variable**. The function $f_0(x)$ is the **objective function** to be minimized. The set $\mathcal{X}$ is the **feasible set**, containing all points satisfying the constraints. The inequalities $f_i(x) \le 0$ are **convex inequality constraints**, and the equalities $h_j(x)=0$ are **affine equality constraints**.

A point $x^\star \in \mathcal{X}$ is an **optimal solution** if

$$
f_0(x^\star)  =

\inf_{x \in \mathcal{X}} f_0(x),
$$

or equivalently, if

$$
f_0(x^\star) \le f_0(x),
\quad \forall x \in \mathcal{X}.
$$

The corresponding optimal value is

$$
p^\star = f_0(x^\star).
$$
