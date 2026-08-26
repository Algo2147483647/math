# Alternating Direction Method of Multipliers

[TOC]

## Description

The Alternating Direction Method of Multipliers (ADMM) solves structured convex optimization problems of the form

$$
\begin{aligned}
\min_{x \in \mathcal{X},\, z \in \mathcal{Z}} \quad & f(x) + g(z) \\
\text{subject to} \quad & Ax + Bz = c .
\end{aligned}
$$

Here, $x$ and $z$ are decision variables, $f:\mathcal{X}\to \mathbb{R}\cup\left\{+\infty\right\}$ and $g:\mathcal{Z}\to \mathbb{R}\cup\left\{+\infty\right\}$ are objective functions, $\mathcal{X}$ and $\mathcal{Z}$ are feasible sets, and $Ax+Bz=c$ is a linear coupling constraint. An optimal solution is a pair $(x^\star,z^\star)$ satisfying the constraint and attaining the minimum objective value.

The augmented Lagrangian is

$$
\mathcal{L}_{\rho}(x,z,y)
=
f(x)+g(z)+y^\top(Ax+Bz-c)
+
\frac{\rho}{2}\left\|Ax+Bz-c\right\|_2^2,
$$

where $y$ is the Lagrange multiplier and $\rho>0$ is the penalty parameter.

ADMM generates iterates by alternating minimization in $x$ and $z$, followed by a multiplier update:

$$
\begin{aligned}
x^{k+1}
&=
\arg\min_{x \in \mathcal{X}}
\mathcal{L}_{\rho}(x,z^k,y^k), \\

z^{k+1}
&=
\arg\min_{z \in \mathcal{Z}}
\mathcal{L}_{\rho}(x^{k+1},z,y^k), \\

y^{k+1}
&=
y^k+\rho\left(Ax^{k+1}+Bz^{k+1}-c\right).
\end{aligned}
$$

Thus, ADMM decomposes a constrained problem into simpler subproblems involving $f$ and $g$ separately, while enforcing feasibility through the dual variable $y$ and the quadratic penalty term.
