# Bipartite Matching Problem

[TOC]

## Description

Let $G=(U,V,E)$ be a bipartite graph, where $U$ and $V$ are disjoint vertex sets and
$E \subseteq U \times V$ is the set of admissible edges. A matching is a set
$M \subseteq E$ such that no two edges in $M$ share an endpoint:

$$
\forall e_1,e_2 \in M,\ e_1 \neq e_2
\implies
e_1 \cap e_2 = \varnothing .
$$

Equivalently, introduce a binary decision variable $x_{uv}$ for each edge
$(u,v)\in E$:

$$
x_{uv} =
\begin{cases}
1, & \text{if } (u,v) \text{ is selected in the matching},\\
0, & \text{otherwise}.
\end{cases}
$$

The maximum-cardinality bipartite matching problem is:

$$
\begin{aligned}
\max_{x} \quad & \sum_{(u,v)\in E} x_{uv} \\
\text{s.t.} \quad
& \sum_{v:(u,v)\in E} x_{uv} \leq 1,
&& \forall u \in U, \\
& \sum_{u:(u,v)\in E} x_{uv} \leq 1,
&& \forall v \in V, \\
& x_{uv} \in \{0,1\},
&& \forall (u,v)\in E .
\end{aligned}
$$

Here, the objective maximizes the number of selected edges. The first constraint
ensures that each vertex $u\in U$ is incident to at most one selected edge. The
second constraint ensures that each vertex $v\in V$ is incident to at most one
selected edge. The binary constraint enforces that each edge is either selected
or not selected.

If each edge $(u,v)\in E$ has weight $w_{uv}\in\mathbb{R}$, the maximum-weight
bipartite matching problem is:

$$
\begin{aligned}
\max_{x} \quad & \sum_{(u,v)\in E} w_{uv}x_{uv} \\
\text{s.t.} \quad
& \sum_{v:(u,v)\in E} x_{uv} \leq 1,
&& \forall u \in U, \\
& \sum_{u:(u,v)\in E} x_{uv} \leq 1,
&& \forall v \in V, \\
& x_{uv} \in \{0,1\},
&& \forall (u,v)\in E .
\end{aligned}
$$

A feasible solution $x$ defines the matching

$$
M(x)=\left\{(u,v)\in E : x_{uv}=1\right\}.
$$
