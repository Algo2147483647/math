# Dijkstra's Algorithm

[TOC]

## Description

Let $G=(V,E,w)$ be a weighted directed graph, where $V$ is the finite vertex set,
$E \subseteq V \times V$ is the edge set, and $w:E \to \mathbb{R}_{\ge 0}$ assigns
a nonnegative weight to each edge. For a source vertex $s \in V$, Dijkstra's
algorithm computes the shortest-path distance

$$
\delta(s,v)
=
\min \left\{
\sum_{i=0}^{k-1} w(v_i,v_{i+1})
:
k \ge 0,\ v_0=s,\ v_k=v,\ (v_i,v_{i+1}) \in E
\right\}.
$$

The algorithm maintains:
- $S \subseteq V$: vertices whose shortest-path distances are finalized.
- $Q = V \setminus S$: vertices not yet finalized.
- $d:V \to \mathbb{R}_{\ge 0} \cup \{\infty\}$: tentative distance estimates.
- $\pi:V \to V \cup \{\bot\}$: predecessor map encoding shortest paths.

Initialization:

$$
d(v)
=
\begin{cases}
0, & v=s, \\
\infty, & v \ne s,
\end{cases}
\qquad
\pi(v)=\bot
\quad \text{for all } v \in V,
\qquad
S=\varnothing.
$$

At each iteration, choose the unsettled vertex with minimum tentative distance:

$$
u \in \arg\min_{v \in Q} d(v).
$$

Then finalize $u$:

$$
S \leftarrow S \cup \{u\},
\qquad
Q \leftarrow Q \setminus \{u\}.
$$

For each outgoing edge $(u,v) \in E$ with $v \in Q$, perform relaxation:

$$
\text{if } d(v) > d(u)+w(u,v), \text{ then}
\\
d(v) \leftarrow d(u)+w(u,v),
\qquad
\pi(v) \leftarrow u.
$$

The fundamental invariant is:

$$
\forall u \in S,\qquad d(u)=\delta(s,u).
$$

Because all edge weights satisfy $w(e)\ge 0$, once a vertex $u$ has minimum
tentative distance among $Q$, no later path through vertices in $Q$ can produce
a shorter path to $u$. Hence finalizing $u$ preserves the invariant.

When the algorithm terminates, $Q=\varnothing$, and therefore

$$
\forall v \in V,\qquad d(v)=\delta(s,v).
$$

Thus $d$ gives the shortest-path distances from $s$, and $\pi$ reconstructs
corresponding shortest paths whenever such paths exist.
