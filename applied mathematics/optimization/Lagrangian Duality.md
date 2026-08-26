# Lagrangian Duality

[TOC]

## Description

Consider the primal optimization problem

$$
\begin{aligned}
p^\star
&= \inf_{x \in \mathcal{X}} f_0(x) \\
&\text{subject to } f_i(x) \le 0,\quad i = 1,\dots,m, \\
&\phantom{\text{subject to }} h_j(x) = 0,\quad j = 1,\dots,p.
\end{aligned}
$$

Here, $x$ is the decision variable, $\mathcal{X}$ is the ambient constraint set, $f_0 : \mathcal{X} \to \mathbb{R}$ is the objective function, $f_i(x) \le 0$ are inequality constraints, and $h_j(x) = 0$ are equality constraints. The feasible set is

$$
\mathcal{F}
=
\left\{
x \in \mathcal{X}
\;\middle|\;
f_i(x) \le 0,\ i = 1,\dots,m,\quad
h_j(x) = 0,\ j = 1,\dots,p
\right\}.
$$

A primal optimal solution is any $x^\star \in \mathcal{F}$ such that

$$
f_0(x^\star) = p^\star = \inf_{x \in \mathcal{F}} f_0(x).
$$

The Lagrangian is

$$
L(x,\lambda,\nu)
=
f_0(x)
+
\sum_{i=1}^m \lambda_i f_i(x)
+
\sum_{j=1}^p \nu_j h_j(x),
$$

where $\lambda \in \mathbb{R}_+^m$ are the Lagrange multipliers for the inequality constraints and $\nu \in \mathbb{R}^p$ are the Lagrange multipliers for the equality constraints.

The Lagrange dual function is

$$
g(\lambda,\nu)
=
\inf_{x \in \mathcal{X}} L(x,\lambda,\nu).
$$

For every $\lambda \in \mathbb{R}_+^m$ and $\nu \in \mathbb{R}^p$, the function $g$ gives a lower bound on the primal optimal value:

$$
g(\lambda,\nu) \le p^\star.
$$

The Lagrange dual problem is

$$
\begin{aligned}
d^\star
&= \sup_{\lambda,\nu} g(\lambda,\nu) \\
&\text{subject to } \lambda \in \mathbb{R}_+^m,\quad \nu \in \mathbb{R}^p.
\end{aligned}
$$

Weak duality states that

$$
d^\star \le p^\star.
$$

If $d^\star = p^\star$, then strong duality holds. Under convexity assumptions and appropriate constraint qualifications, such as Slater's condition, strong duality holds and primal-dual optimal solutions satisfy the Karush--Kuhn--Tucker conditions:

$$
\begin{aligned}
&x^\star \in \mathcal{F}, \\
&\lambda^\star \in \mathbb{R}_+^m, \\
&\lambda_i^\star f_i(x^\star) = 0,\quad i = 1,\dots,m, \\
&x^\star \in \operatorname*{arg\,min}_{x \in \mathcal{X}} L(x,\lambda^\star,\nu^\star).
\end{aligned}
$$
