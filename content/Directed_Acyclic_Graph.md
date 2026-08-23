# Directed Acyclic Graph

[TOC]

## Define

> A directed acyclic graph is a directed graph with no directed cycles.

A **directed acyclic graph** (DAG) is a directed [graph](./Graph.md)
$$
G=(V,E),\quad E\subseteq V\times V,
$$
such that there is no directed cycle. That is, there is no finite sequence of vertices
$$
v_0,v_1,\cdots,v_k
$$
with $k\ge 1$, $v_0=v_k$, and
$$
(v_i,v_{i+1})\in E,\quad i=0,\cdots,k-1.
$$

> A DAG can express dependency without circular dependency.

## Properties

### Source and Sink

A source is a vertex with no incoming edges. A sink is a vertex with no outgoing edges.

Every finite nonempty DAG has at least one source and at least one sink.

### Topological Sort

A topological sort of a DAG is a linear ordering of its vertices such that every directed edge points forward in the ordering.

For an edge
$$
(u,v)\in E,
$$
the vertex $u$ appears before $v$ in the topological order.

A finite directed graph has a topological ordering if and only if it is acyclic.

#### Algorithm

One standard algorithm repeatedly removes vertices with zero in-degree:

1. Find all vertices with no incoming edges.
2. Remove one such vertex and append it to the output order.
3. Remove all outgoing edges from that vertex.
4. Repeat until no vertices remain.

If vertices remain but none has zero in-degree, then the directed graph contains a cycle and is not a DAG.
