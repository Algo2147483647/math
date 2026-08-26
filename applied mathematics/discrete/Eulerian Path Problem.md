# Eulerian Path Problem

[TOC]

## Description

Let $G=(V,E)$ be a finite graph, where $V$ is the vertex set and $E$ is the edge set. An Eulerian path is a sequence

$$
P=(v_0,e_1,v_1,e_2,\ldots,e_m,v_m)
$$

such that

$$
\left\{e_1,e_2,\ldots,e_m\right\}=E,
\qquad
e_i \neq e_j \text{ for } i \neq j,
\qquad
e_i=\left\{v_{i-1},v_i\right\} \text{ for all } i \in \left\{1,\ldots,m\right\}.
$$

The Eulerian Path Problem is the decision problem

$$
\text{Given } G=(V,E), \text{ determine whether there exists an Eulerian path } P \text{ in } G.
$$

Equivalently, it asks whether the edge set $E$ can be ordered as

$$
(e_1,e_2,\ldots,e_m)
$$

so that consecutive edges are incident and every edge of $G$ appears exactly once.

For an undirected graph, an Eulerian path exists if and only if

$$
G \text{ is connected after deleting isolated vertices}
\quad\text{and}\quad
\left|\left\{v \in V : \deg(v) \text{ is odd}\right\}\right| \in \left\{0,2\right\}.
$$

Here, $V$ is the set of vertices, $E$ is the set of edges, $m=|E|$ is the number of edges, $v_i$ are vertices visited by the path, $e_i$ are edges traversed by the path, and $\deg(v)$ denotes the degree of vertex $v$.
