# Linear Optimization

[TOC]

## Description

A **linear optimization problem** (Linear Programming) is an optimization problem in which the objective function and all constraint functions are linear in the decision variable $x$.

A standard form is:

$$
\begin{aligned}
\min_{x \in \mathbb{R}^n} \quad & c^\top x \\
\text{s.t.} \quad & Ax \le b, \\
& Ex = d.
\end{aligned}
$$

Equivalently, it can be written as:

$$
\min_{x \in \mathcal{X}} c^\top x
$$

where the feasible set $\mathcal{X}$ is defined by linear constraints:

$$
\mathcal{X} =

\left\{
x \in \mathbb{R}^n
\mid
Ax \le b,\ Ex = d
\right\}.
$$

Here:

* $x \in \mathbb{R}^n$ is the **decision variable**, whose value is to be determined.
* $c^\top x$ is the **linear objective function**, where $c \in \mathbb{R}^n$ is the cost vector.
* $\mathcal{X}$ is the **feasible set**, containing all decision variables satisfying the constraints.
* $Ax \le b$ represents **linear inequality constraints**, with $A \in \mathbb{R}^{m \times n}$ and $b \in \mathbb{R}^m$.
* $Ex = d$ represents **linear equality constraints**, with $E \in \mathbb{R}^{p \times n}$ and $d \in \mathbb{R}^p$.
* An **optimal solution** is a point $x^\star \in \mathcal{X}$ such that:

$$
c^\top x^\star
\le
c^\top x
\quad
\forall x \in \mathcal{X}.
$$

The corresponding value $c^\top x^\star$ is called the **optimal objective value**.
