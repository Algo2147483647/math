# Kahn's Algorithm

[TOC]

## Description

Let $G=(V,E)$ be a finite directed graph, where $V$ is the set of vertices and
$E \subseteq V \times V$ is the set of directed edges. For each $v \in V$, define
the indegree of $v$ by

$$
d(v) = \left|\left\{ u \in V : (u,v) \in E \right\}\right|.
$$

Kahn's Algorithm constructs a sequence $L$ as follows. Initialize

$$
S_0 = \left\{ v \in V : d(v)=0 \right\},
\qquad
L_0 = ().
$$

At step $t \geq 0$, if $S_t \neq \varnothing$, choose some vertex $v_t \in S_t$,
append it to the output sequence, and remove it from the graph. Formally,

$$
L_{t+1} = L_t \circ (v_t),
$$

where $\circ$ denotes sequence concatenation. For every outgoing edge
$(v_t,w) \in E$, decrease the indegree of $w$ by one:

$$
d_{t+1}(w)
=
d_t(w) - \left|\left\{ v_t : (v_t,w) \in E_t \right\}\right|.
$$

The next zero-indegree set is

$$
S_{t+1}
=
\left(S_t \setminus \left\{ v_t \right\}\right)
\cup
\left\{ w \in V_t : d_{t+1}(w)=0 \right\}.
$$

The algorithm terminates when $S_t=\varnothing$. If all vertices have been
output, that is,

$$
|L_t| = |V|,
$$

then $L_t$ is a topological ordering of $G$. Otherwise, $G$ contains at least
one directed cycle.

The meaning of each component is as follows:

- $G=(V,E)$ is the input directed graph.
- $V$ is the vertex set.
- $E$ is the directed edge set.
- $d(v)$ is the indegree of vertex $v$.
- $S_t$ is the set of vertices with indegree zero at step $t$.
- $L_t$ is the partial topological ordering after $t$ steps.
- $v_t$ is the zero-indegree vertex selected at step $t$.
- $E_t$ and $V_t$ denote the remaining edges and vertices at step $t$.

Correctness follows from the invariant that every vertex in $S_t$ has no
incoming edge from any remaining vertex. Therefore, selecting any $v_t \in S_t$
cannot violate the topological order condition. If no such vertex exists while
some vertices remain, every remaining vertex has positive indegree, which implies
the existence of a directed cycle.
