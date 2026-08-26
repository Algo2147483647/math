# Floyd-Warshall Algorithm

[TOC]

## Description

Let $G = (V,E,w)$ be a weighted directed graph, where
$V = \{1,2,\dots,n\}$, $E \subseteq V \times V$, and
$w : E \to \mathbb{R}$ is the edge-weight function.

Define the initial distance matrix $D^{(0)} \in (\mathbb{R} \cup \{\infty\})^{n \times n}$ by

$$
D_{ij}^{(0)} =
\left\{
\begin{array}{ll}
0, & i = j, \\
w(i,j), & (i,j) \in E, \\
\infty, & (i,j) \notin E \text{ and } i \neq j.
\end{array}
\right.
$$

For each $k \in \{1,2,\dots,n\}$, define $D^{(k)}$ recursively by

$$
D_{ij}^{(k)}
=
\min\left\{
D_{ij}^{(k-1)},
D_{ik}^{(k-1)} + D_{kj}^{(k-1)}
\right\}
\quad
\text{for all } i,j \in V.
$$

The interpretation is that $D_{ij}^{(k)}$ is the minimum weight of any path from $i$ to $j$ whose internal vertices all belong to the set $\{1,2,\dots,k\}$.

Thus, after $n$ iterations,

$$
D_{ij}^{(n)}
=
\min\left\{
\sum_{\ell=0}^{m-1} w(v_\ell,v_{\ell+1})
:
m \geq 0,\,
v_0=i,\,
v_m=j,\,
(v_\ell,v_{\ell+1}) \in E
\right\}.
$$

Here, $D_{ij}^{(n)}$ is the shortest-path distance from $i$ to $j$, provided no negative-weight cycle is reachable on a path from $i$ to $j$.

A negative-weight cycle exists if and only if

$$
\exists i \in V \text{ such that } D_{ii}^{(n)} < 0.
$$

The Floyd-Warshall algorithm computes all entries of $D^{(n)}$ using the recurrence above. Its time complexity is $O(n^3)$ and its space complexity is $O(n^2)$.
