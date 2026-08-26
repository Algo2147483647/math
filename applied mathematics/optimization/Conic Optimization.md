# Conic Optimization

[TOC]

## Description

Conic optimization is the study of optimization problems in which the feasible region is described by affine constraints together with membership in a convex cone. A standard conic optimization problem has the form

$$
\begin{aligned}
p^\star
&= \inf_{x \in \mathbb{R}^n} c^\top x \\
&\text{subject to } Ax + b \in \mathcal{K},
\end{aligned}
$$

where $x \in \mathbb{R}^n$ is the decision variable, $c \in \mathbb{R}^n$ defines the linear objective function $c^\top x$, $A \in \mathbb{R}^{m \times n}$ and $b \in \mathbb{R}^m$ define the affine constraint map, and $\mathcal{K} \subseteq \mathbb{R}^m$ is a convex cone.

The feasible set is

$$
\mathcal{X}
=
\left\{ x \in \mathbb{R}^n : Ax + b \in \mathcal{K} \right\}.
$$

Thus, the problem can equivalently be written as

$$
p^\star
=
\inf_{x \in \mathcal{X}} c^\top x.
$$

The constraint $Ax + b \in \mathcal{K}$ generalizes many familiar constraint classes. For example, if $\mathcal{K} = \mathbb{R}_+^m$, the problem becomes a linear program; if $\mathcal{K}$ is a second-order cone, it becomes a second-order cone program; and if $\mathcal{K}$ is the cone of positive semidefinite matrices, it becomes a semidefinite program.

An optimal solution is a point $x^\star \in \mathcal{X}$ such that

$$
c^\top x^\star = p^\star
$$

and

$$
c^\top x^\star \leq c^\top x
\quad
\text{for all } x \in \mathcal{X}.
$$

Here, $p^\star$ is the optimal value, $x^\star$ is an optimizer, the objective function measures the quantity being minimized, the feasible set $\mathcal{X}$ contains all admissible decisions, and the conic constraint imposes generalized convex structure through the cone $\mathcal{K}$.
