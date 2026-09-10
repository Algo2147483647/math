# Quadratically Constrained Quadratic Programming

[TOC]

## Description

A Quadratically Constrained Quadratic Program (QCQP) is an optimization problem of the form

$$
\begin{aligned}
p^\star
&=
\min_{x \in \mathbb{R}^n} \quad x^\top Q_0 x + q_0^\top x + r_0 \\
&\text{subject to} \quad x^\top Q_i x + q_i^\top x + r_i \le 0,
\quad i = 1,\dots,m, \\
&\phantom{\text{subject to}} \quad A x = b.
\end{aligned}
$$

Here, $x \in \mathbb{R}^n$ is the decision variable. The function

$$
f_0(x) = x^\top Q_0 x + q_0^\top x + r_0
$$

is the quadratic objective function, where $Q_0 \in \mathbb{S}^n$, $q_0 \in \mathbb{R}^n$, and $r_0 \in \mathbb{R}$. For each $i = 1,\dots,m$,

$$
f_i(x) = x^\top Q_i x + q_i^\top x + r_i
$$

is a quadratic inequality constraint, with $Q_i \in \mathbb{S}^n$, $q_i \in \mathbb{R}^n$, and $r_i \in \mathbb{R}$. The linear equality constraint is defined by $A \in \mathbb{R}^{p \times n}$ and $b \in \mathbb{R}^p$.

The feasible set is

$$
\mathcal{X}
=
\left\{
x \in \mathbb{R}^n
\;\middle|\;
f_i(x) \le 0,\ i = 1,\dots,m,\ \text{and}\ Ax = b
\right\}.
$$

An optimal solution is any point $x^\star \in \mathcal{X}$ satisfying

$$
f_0(x^\star)
=
p^\star
=
\inf_{x \in \mathcal{X}} f_0(x).
$$

If such an $x^\star$ exists, then $x^\star$ solves the QCQP and $p^\star$ is the optimal value. The QCQP is convex when $Q_0 \succeq 0$ and $Q_i \succeq 0$ for all inequality constraints $i = 1,\dots,m$; otherwise, it is generally nonconvex.
