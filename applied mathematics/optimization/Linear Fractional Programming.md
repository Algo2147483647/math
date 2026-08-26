# Linear Fractional Programming

[TOC]

## Description

A Linear Fractional Programming (LFP) problem is an optimization problem whose objective is the ratio of two affine functions over a polyhedral feasible set.

Let $x \in \mathbb{R}^n$ be the decision variable. A standard LFP is

$$
\begin{aligned}
\min_{x \in \mathcal{X}} \quad & f(x) := \frac{c^\top x + \alpha}{d^\top x + \beta} \\
\text{s.t.} \quad & A x \leq b, \\
& E x = h, \\
& d^\top x + \beta > 0.
\end{aligned}
$$

The feasible set is

$$
\mathcal{X}
=
\left\{
x \in \mathbb{R}^n
\mid
A x \leq b,\;
E x = h,\;
d^\top x + \beta > 0
\right\}.
$$

Here, $c,d \in \mathbb{R}^n$, $\alpha,\beta \in \mathbb{R}$, $A \in \mathbb{R}^{m \times n}$, $b \in \mathbb{R}^m$, $E \in \mathbb{R}^{p \times n}$, and $h \in \mathbb{R}^p$ are given data.

The objective function is

$$
f(x) = \frac{c^\top x + \alpha}{d^\top x + \beta},
$$

where $c^\top x + \alpha$ and $d^\top x + \beta$ are affine functions of $x$. The condition $d^\top x + \beta > 0$ ensures that the objective is well-defined and that the denominator has fixed positive sign over $\mathcal{X}$.

The constraints $A x \leq b$ are linear inequality constraints, while $E x = h$ are linear equality constraints. Together with the denominator condition, they define the feasible region $\mathcal{X}$.

An optimal solution is any point $x^\star \in \mathcal{X}$ satisfying

$$
f(x^\star)
=
\min_{x \in \mathcal{X}} f(x).
$$

The optimal value is

$$
v^\star
=
\min_{x \in \mathcal{X}}
\frac{c^\top x + \alpha}{d^\top x + \beta}.
$$

The set of optimal solutions is

$$
\mathcal{X}^\star
=
\left\{
x^\star \in \mathcal{X}
\mid
f(x^\star) = v^\star
\right\}.
$$
