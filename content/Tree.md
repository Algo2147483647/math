# Tree

[TOC]

## Define

> A tree is a connected acyclic graph.

Tree is a class of connected undirected graphs without loops.

### Rooted Tree

When the root node is set to a certain node of the tree, the hierarchical relationship of the entire tree and the parent-child relationship among each node will be uniquely determined.

- **root node**: A node without forward nodes, and a tree has only one root node.
- **leaf node:** A node that has no children.
- depth: Number of edges in the simple path from node to root node. The depth of the tree is the maximum node depth in the tree.

<img src="./assets/rooted tree.svg" style="zoom:50%;" />

## Properties

- There exists and only exists one single simple path between any two points of the tree.
- $number(E) = number(V) - 1$
- Delete an edge, the Tree will become disconnected;  
  Add an edge, the Tree will have a loop.
