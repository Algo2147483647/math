# Second-Order Cone Programming

[TOC]

## Description

Second-Order Cone Programming (SOCP) is the class of convex optimization problems of the form

$$
\begin{aligned}
p^\star
= \min_{x \in \mathbb{R}^n} \quad & c^\top x \\
\text{subject to} \quad & \|A_i x + b_i\|_2 \leq d_i^\top x + e_i, \quad i = 1,\dots,m, \\
& Fx = h.
\end{aligned}
$$

Here, $x \in \mathbb{R}^n$ is the decision variable, $c \in \mathbb{R}^n$ defines the linear objective function $f_0(x) = c^\top x$, and $p^\star$ is the optimal value.

For each $i$, the constraint

$$
\|A_i x + b_i\|_2 \leq d_i^\top x + e_i
$$

is a second-order cone constraint, where $A_i \in \mathbb{R}^{k_i \times n}$, $b_i \in \mathbb{R}^{k_i}$, $d_i \in \mathbb{R}^n$, and $e_i \in \mathbb{R}$. The equality constraint $Fx = h$ is affine.

Equivalently, each conic constraint can be written as

$$
\begin{aligned}
(d_i^\top x + e_i,\; A_i x + b_i) \in \mathcal{Q}^{k_i+1},
\end{aligned}
$$

where the second-order cone, or Lorentz cone, is

$$
\mathcal{Q}^{k_i+1}
=
\left\{
(t,u) \in \mathbb{R} \times \mathbb{R}^{k_i}
\;\middle|\;
\|u\|_2 \leq t
\right\}.
$$

The feasible set is

$$
\mathcal{X}
=
\left\{
x \in \mathbb{R}^n
\;\middle|\;
\|A_i x + b_i\|_2 \leq d_i^\top x + e_i,\ i=1,\dots,m,\ Fx=h
\right\}.
$$

An optimal solution is any point $x^\star \in \mathcal{X}$ satisfying

$$
c^\top x^\star
=
\inf_{x \in \mathcal{X}} c^\top x
=
p^\star.
$$

Because the objective is linear and the feasible set is an intersection of affine sets and second-order cone preimages under affine maps, every SOCP is a convex optimization problem.
