# Prim's Algorithm

[TOC]

## Description

Let $G=(V,E,w)$ be a finite, connected, undirected weighted graph, where
$V$ is the vertex set, $E \subseteq \{\{u,v\}:u,v \in V,\ u \neq v\}$ is the
edge set, and $w:E \to \mathbb{R}$ assigns a weight to each edge.

Prim's Algorithm constructs a minimum spanning tree $T=(V,A)$ by maintaining
a set $S \subseteq V$ of vertices already included in the tree and a set
$A \subseteq E$ of chosen edges.

Choose an arbitrary root vertex $r \in V$ and initialize

$$
S := \{r\}, \qquad A := \emptyset .
$$

At each iteration, choose a minimum-weight edge crossing the cut
$(S, V \setminus S)$:

$$
e_k
\in
\operatorname*{arg\,min}_{\{u,v\} \in E}
\left\{
w(\{u,v\}) :
u \in S,\ v \in V \setminus S
\right\}.
$$

If $e_k=\{u_k,v_k\}$ with $u_k \in S$ and $v_k \in V \setminus S$, update

$$
S := S \cup \{v_k\}, \qquad
A := A \cup \{e_k\}.
$$

The algorithm terminates when

$$
S = V .
$$

The output is the spanning tree

$$
T = (V,A).
$$

Equivalently, after $k$ iterations,

$$
|S| = k+1, \qquad
|A| = k, \qquad
A \subseteq E.
$$

Meaning of components:
- $G=(V,E,w)$: the input weighted graph.
- $V$: all vertices.
- $E$: all undirected edges.
- $w(e)$: weight of edge $e$.
- $S$: vertices already connected to the growing tree.
- $A$: edges selected so far.
- $(S,V \setminus S)$: the cut separating selected and unselected vertices.
- $e_k$: the minimum-weight edge crossing that cut at iteration $k$.
- $T=(V,A)$: the final minimum spanning tree.

Correctness follows from the cut property: for any nonempty proper subset
$S \subset V$, every minimum-weight edge crossing the cut $(S,V \setminus S)$
is safe to add to some minimum spanning tree. Since each step of Prim's
Algorithm adds such a safe edge, the final set $A$ is the edge set of a
minimum spanning tree.
