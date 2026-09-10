# Subgradient Method

[TOC]

## Description

The subgradient method solves the convex optimization problem

$$
\begin{aligned}
\min_{x \in \mathcal{X}} \quad & f(x) \\
\text{s.t.} \quad & x \in \mathcal{X},
\end{aligned}
$$

where $x \in \mathbb{R}^n$ is the decision variable, $f:\mathbb{R}^n \to \mathbb{R}$ is a convex objective function, and $\mathcal{X} \subseteq \mathbb{R}^n$ is the feasible set encoding the constraints.

A vector $g \in \mathbb{R}^n$ is a subgradient of $f$ at $x$ if

$$
f(y) \ge f(x) + g^\top (y - x), \quad \forall y \in \operatorname{dom}(f).
$$

The subdifferential of $f$ at $x$ is the set

$$
\partial f(x)
=
\left\{
g \in \mathbb{R}^n
\mid
f(y) \ge f(x) + g^\top (y - x), \ \forall y \in \operatorname{dom}(f)
\right\}.
$$

Given an initial point $x_0 \in \mathcal{X}$, the projected subgradient method generates iterates

$$
\begin{aligned}
g_k &\in \partial f(x_k), \\
x_{k+1} &= \Pi_{\mathcal{X}}\left(x_k - \alpha_k g_k\right),
\end{aligned}
$$

where $g_k$ is a subgradient at $x_k$, $\alpha_k > 0$ is the stepsize, and $\Pi_{\mathcal{X}}$ denotes Euclidean projection onto $\mathcal{X}$:

$$
\Pi_{\mathcal{X}}(z)
=
\arg\min_{y \in \mathcal{X}} \|y - z\|_2.
$$

An optimal solution is any point

$$
x^\star \in \arg\min_{x \in \mathcal{X}} f(x),
$$

and the optimal value is

$$
f^\star = f(x^\star) = \inf_{x \in \mathcal{X}} f(x).
$$

If $\mathcal{X} = \mathbb{R}^n$, the update reduces to the unconstrained subgradient method

$$
x_{k+1} = x_k - \alpha_k g_k.
$$
