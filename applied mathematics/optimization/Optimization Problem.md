# Optimization Problem

[TOC]

## Description

An **optimization problem** is a mathematical problem of choosing a decision variable $x$ from a feasible set $\mathcal{X}$ so as to minimize or maximize an objective function $f$.

A general minimization problem can be written as

$$
\min_{x \in \mathcal{X}} f(x)
$$

where $x$ is the **decision variable**, $\mathcal{X}$ is the **feasible set**, and $f:\mathcal{X}\to\mathbb{R}$ is the **objective function**.

More explicitly, an optimization problem with constraints can be defined as

$$
\begin{aligned}
\min_{x \in \mathbb{R}^n} \quad & f(x) \\
\text{subject to} \quad & g_i(x) \le 0, \quad i = 1,\dots,m, \\
& h_j(x) = 0, \quad j = 1,\dots,p.
\end{aligned}
$$

Here, $x \in \mathbb{R}^n$ is the **decision variable vector**, representing the quantities to be chosen. The function $f:\mathbb{R}^n \to \mathbb{R}$ is the **objective function**, which assigns a numerical cost or value to each possible choice of $x$. The functions $g_i:\mathbb{R}^n \to \mathbb{R}$ define **inequality constraints**, while the functions $h_j:\mathbb{R}^n \to \mathbb{R}$ define **equality constraints**.

The **feasible set** is the set of all points satisfying the constraints:

$$
\mathcal{X} = \left\{
x \in \mathbb{R}^n
\mid
g_i(x) \le 0,\ i=1,\dots,m,;
h_j(x)=0,\ j=1,\dots,p
\right\}
$$

An **optimal solution** is a feasible point $x^\star \in \mathcal{X}$ such that

$$
f(x^\star) \le f(x)
\quad
\text{for all } x \in \mathcal{X}.
$$

The corresponding value $f(x^\star)$ is called the **optimal value** of the optimization problem.
