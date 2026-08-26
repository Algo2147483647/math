# Branch-and-Bound

[TOC]

## Description

Branch-and-Bound solves a constrained optimization problem of the form

$$
\begin{aligned}
z^\star
&= \min_{x \in \mathcal{X}} f(x) \\
\mathcal{X}
&= \left\{ x \in \mathcal{D} \mid g_i(x) \le 0,\ i = 1,\dots,m \right\}.
\end{aligned}
$$

Here, $x$ is the decision variable, $f:\mathcal{D}\to\mathbb{R}$ is the objective function, $\mathcal{X}$ is the feasible set, $\mathcal{D}$ is the ambient decision domain, and the inequalities $g_i(x)\le 0$ are the constraints. An optimal solution is any $x^\star \in \mathcal{X}$ satisfying

$$
f(x^\star)=z^\star=\min_{x\in\mathcal{X}} f(x).
$$

Branch-and-Bound maintains a collection of subproblems indexed by nodes $N$. Each node corresponds to a subset $\mathcal{X}_N \subseteq \mathcal{X}$, with

$$
\mathcal{X} = \bigcup_{N \in \mathcal{T}} \mathcal{X}_N.
$$

For each node $N$, a relaxation is solved over a superset $\mathcal{R}_N \supseteq \mathcal{X}_N$ to obtain a valid lower bound

$$
L_N
=
\min_{x \in \mathcal{R}_N} f(x)
\le
\min_{x \in \mathcal{X}_N} f(x).
$$

The algorithm also maintains an incumbent feasible solution $\bar{x}\in\mathcal{X}$ with objective value

$$
U=f(\bar{x}),
$$

which is a valid upper bound on $z^\star$.

A node $N$ is pruned if any of the following holds:

$$
\begin{aligned}
&\mathcal{X}_N = \varnothing, \\
&L_N \ge U, \\
&\text{or the relaxation solution is feasible for } \mathcal{X}_N.
\end{aligned}
$$

If a node cannot be pruned, it is branched into finitely many child nodes $N_1,\dots,N_k$ such that

$$
\mathcal{X}_N
=
\bigcup_{j=1}^k \mathcal{X}_{N_j},
\qquad
\mathcal{X}_{N_j} \cap \mathcal{X}_{N_\ell} = \varnothing
\quad \text{for } j \ne \ell.
$$

At termination, all remaining nodes have been pruned. Since every feasible solution belongs to some explored or pruned node, and no pruned node can contain a solution with objective value below the incumbent $U$, the incumbent satisfies

$$
f(\bar{x}) = z^\star.
$$

Thus, Branch-and-Bound proves optimality by systematically partitioning the feasible region, computing valid bounds on subproblems, and eliminating regions that cannot contain a better feasible solution.
