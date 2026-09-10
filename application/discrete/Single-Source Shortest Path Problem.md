# Single-Source Shortest Path Problem

[TOC]

## Description

Let $G = (V, E)$ be a directed graph, where $V$ is a finite set of vertices and $E \subseteq V \times V$ is a set of directed edges. Let $w : E \to \mathbb{R}$ be an edge-weight function, and let $s \in V$ be a distinguished source vertex.

A path from $s$ to $v$ is a finite sequence

$$
P = (v_0, v_1, \dots, v_k)
$$

such that $v_0 = s$, $v_k = v$, and $(v_{i-1}, v_i) \in E$ for all $i \in \{1, \dots, k\}$.

The weight of a path $P$ is

$$
w(P) = \sum_{i=1}^{k} w(v_{i-1}, v_i).
$$

The shortest-path distance from $s$ to $v$ is defined by

$$
\delta(s, v)
=
\begin{cases}
\min \left\{ w(P) : P \text{ is a path from } s \text{ to } v \right\}, & \text{if such a path exists}, \\
+\infty, & \text{otherwise}.
\end{cases}
$$

The Single-Source Shortest Path problem is to compute

$$
\left\{ \delta(s, v) : v \in V \right\}.
$$

Equivalently, the problem is to find a function $d : V \to \mathbb{R} \cup \{+\infty\}$ such that

$$
d(v) = \delta(s, v)
\quad \text{for every } v \in V.
$$

When shortest paths are also required, one may compute a predecessor map

$$
\pi : V \to V \cup \{\bot\},
$$

where $\pi(v)$ is the vertex immediately preceding $v$ on a shortest path from $s$ to $v$, and $\pi(v) = \bot$ if $v = s$ or if no such path exists.

The distances satisfy the Bellman optimality conditions

$$
d(s) = 0, \\
d(v) \le d(u) + w(u, v)
\quad \text{for every } (u, v) \in E.
$$

If $v$ is reachable from $s$ and has a shortest predecessor $u$, then

$$
d(v) = d(u) + w(u, v).
$$

Here, $G$ denotes the graph, $V$ the vertex set, $E$ the edge set, $w$ the edge-weight function, $s$ the source vertex, $P$ a path, $w(P)$ the total path weight, $\delta(s,v)$ the true shortest-path distance, $d(v)$ the computed distance value, and $\pi(v)$ the predecessor of $v$ in a shortest-path tree.
