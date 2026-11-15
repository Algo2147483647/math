# Bipartite Graph

[TOC]

## Define

> A bipartite graph is a graph whose vertices can be split into two parts so that every edge connects the two parts.

$$
(X, Y, E)  \tag{Bipartite Graph}
$$
$$
X, Y \cap \varnothing, X \cup Y = V  \tag{vertex sets}
$$
$$
E \sube  X \times Y\tag{edge set}
$$

For a Bipartite Graph, The vertex set $V$ of a graph is divided into two disjoint subsets $X, Y$. And, edges in Bipartite Graph only exist between point sets $X, Y$, not within them. The weights of edges can be represented by
$$
f: X\times Y \to S
$$

<img src="./assets/Simple_bipartite_graph;_two_layers.svg" alt="Simple_bipartite_graph;_two_layers" style="zoom:20%;" />

## Properties

- Representation, a bipartite graph can be represented by a matrix $M \in S^{m \times n}$ with each value $M_{ij}$ refer to the edge weight between $x_i$ and $y_j$, where $m$ is the element number of $X$ and $n$ is that of $Y$.
  $$
  f:(X \times Y) \to S \quad\Longrightarrow\quad S^{m \times n}
  $$

## Maximum Matching
A maximum matching in a bipartite graph $G=(U,V,E)$ is a set of edges $M \sube E$ with the largest possible number of edges, such that no two selected edges share a vertex.

- Maximum-weight bipartite matching: If each edge $(u,v)\in E$ has weight $w_{uv}\in\mathbb{R}$, $\max_{x}  \sum\limits_{(u,v)\in E} w_{uv}x_{uv}$.

### Optimal Solution Properties

Augmenting Path: (1) Starts and ends at an unmatched nodes. (2) Edges along the path alternate between matched and unmatched states. If no augmenting path can be found in the graph, it means the current solution cannot be further improved and is, therefore, the optimal solution.
$$
\nexists \text{ augmenting path for }M\ \Longleftrightarrow\ M\text{ is a maximum matching}
$$

Therefore, the maximum matching problem is transformed into the problem of how to quickly find augmenting paths.

### Solution 

Kuhn-Munkres Algorithm

#### Maximum-cardinality matching: Hopcroft-Karp Algorithm

The core of the Hopcroft–Karp algorithm lies in simultaneously finding multiple vertex-disjoint shortest augmenting paths in each iteration. 

1. First, a Breadth-First Search (BFS) is initiated from all unmatched vertices on the left side, traversing alternating sequences of "unmatched edges" and "matched edges" to establish a layered structure and determine the shortest distance to any unmatched vertex on the right side.
2. Subsequently, a Depth-First Search (DFS) is employed within this layered graph to identify a maximal set of shortest augmenting paths; the matching status of the edges along each of these paths is then toggled, thereby increasing the total size of the matching.
3. This process is repeated until the BFS can no longer locate any augmenting paths, at which point the maximum matching has been obtained. 

This batch-augmentation approach ensures that the shortest augmenting paths found in subsequent iterations become progressively longer. Time consuming is $O(|E|\sqrt{V})$.

![hopcroft-karp-layout](./assets/hopcroft-karp-layout.svg)

#### Maximum-weight matching
