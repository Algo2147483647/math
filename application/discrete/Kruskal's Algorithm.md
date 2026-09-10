# Kruskal's Algorithm

[TOC]

## Description

Let $G=(V,E,w)$ be a finite, undirected, weighted graph, where:

- $V$ is the vertex set.
- $E \subseteq \left\{ \{u,v\} : u,v \in V,\ u \neq v \right\}$ is the edge set.
- $w:E \to \mathbb{R}$ assigns a weight to each edge.
- The goal is to find a minimum spanning tree $T \subseteq E$ minimizing

$$
\min_{T \subseteq E}
\sum_{e \in T} w(e)
$$

subject to $(V,T)$ being connected and acyclic.

Kruskal's algorithm constructs $T$ greedily. Initialize

$$
T_0=\varnothing
$$

and sort the edges as

$$
e_1,e_2,\dots,e_m
$$

such that

$$
w(e_1) \leq w(e_2) \leq \cdots \leq w(e_m).
$$

For $i=1,\dots,m$, define

$$
T_i =
\begin{cases}
T_{i-1} \cup \left\{ e_i \right\}, & \text{if } (V,T_{i-1} \cup \left\{ e_i \right\}) \text{ is acyclic}, \\
T_{i-1}, & \text{otherwise}.
\end{cases}
$$

The output is

$$
T = T_m.
$$

Equivalently, at each step Kruskal selects the minimum-weight edge crossing two distinct connected components of the current forest:

$$
e^\star \in
\operatorname*{arg\,min}_{e=\{u,v\} \in E}
\left\{ w(e) : u \text{ and } v \text{ lie in distinct components of } (V,T) \right\}.
$$

Then update

$$
T \leftarrow T \cup \left\{ e^\star \right\}.
$$

The algorithm terminates when

$$
|T| = |V|-1.
$$

If $G$ is connected, the resulting set $T$ is a minimum spanning tree. If $G$ is disconnected, the same procedure returns a minimum spanning forest.

The acyclicity condition ensures that $T$ remains a forest at every step. The greedy choice is valid by the cut property: for any cut of $G$, a minimum-weight edge crossing that cut is safe to add to some minimum spanning tree.
