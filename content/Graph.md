# Graph

[TOC]

## Define

> A graph is a structure made of vertices and edges that records pairwise relationships.

A graph is a pair
$$
G=(V,E),
$$
where $V$ is a set of vertices and $E$ is a set of edges connecting vertices.

For a simple undirected graph,
$$
E\subseteq \big\{\{u,v\}\mid u,v\in V,\ u\neq v\big\}.
$$

For a directed graph,
$$
E\subseteq V\times V.
$$

Thus an undirected edge $\{u,v\}$ has no direction, while a directed edge $(u,v)$ points from $u$ to $v$.

### Weighted Graph

A weighted graph is a graph equipped with a weight function
$$
w:E\to W,
$$
where $W$ is usually $\mathbb R$ or $\mathbb R_{\ge 0}$.

Weights are extra data; they are not part of the definition of a bare graph.

## Properties

### Adjacency

Two vertices are adjacent if they are connected by an edge.

For a simple undirected graph, $u$ and $v$ are adjacent if
$$
\{u,v\}\in E.
$$

For a directed graph, $u$ points to $v$ if
$$
(u,v)\in E.
$$

### Representation by Adjacency Matrix

For a finite graph with vertices $v_1,\cdots,v_n$, the adjacency matrix is a matrix $A\in\mathbb R^{n\times n}$.

For an unweighted graph,
$$
A_{ij}=
\begin{cases}
1, & \text{there is an edge from }v_i\text{ to }v_j,\\
0, & \text{otherwise}.
\end{cases}
$$

For a weighted graph,
$$
A_{ij}=w(v_i,v_j)
$$
when the edge exists.

For a simple undirected graph, the adjacency matrix is symmetric.

### Degree

In an undirected graph, the degree of a vertex is the number of edges incident to it.

In a directed graph, the in-degree and out-degree of a vertex $v$ are
$$
\deg^-(v)=|\{u\in V\mid (u,v)\in E\}|,
$$
$$
\deg^+(v)=|\{u\in V\mid (v,u)\in E\}|.
$$

### Path

A path is a sequence of vertices
$$
v_0,v_1,\cdots,v_k
$$
such that consecutive vertices are connected by edges.

For a directed graph, the edges must follow the direction:
$$
(v_i,v_{i+1})\in E.
$$

### Connectivity

An undirected graph is connected if every pair of vertices is joined by a path.

A directed graph is strongly connected if for every pair of vertices $u,v\in V$, there is a directed path from $u$ to $v$ and a directed path from $v$ to $u$.

### Acyclicity

A graph is acyclic if it has no cycle.

For directed graphs, acyclicity means there is no directed cycle.

### Euler Path and Euler Graph

An Euler path is a path that passes through every edge exactly once. If such a path starts and ends at the same vertex, it is called an Euler circuit.

A graph with an Euler circuit is called Eulerian.

<img src="./assets/48727417-28c3d500-ec58-11e8-9715-33b168a50b7c.png" alt="theory1" style="zoom:20%;" />

For a connected undirected graph:

- It has an Euler circuit if and only if every vertex has even degree.
- It has an Euler path but not an Euler circuit if and only if exactly two vertices have odd degree.

### Matching of Graph

A matching in a graph is a set of edges no two of which share a common endpoint:
$$
M\subseteq E,
\quad
e_i\cap e_j=\varnothing
\quad
(e_i\neq e_j).
$$

#### Maximum Matching

A maximum matching is a matching with the largest possible number of edges:
$$
M^*=\arg\max_M |M|.
$$

#### Perfect Matching

A perfect matching is a matching that covers every vertex of the graph.
