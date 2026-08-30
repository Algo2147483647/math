# Applied Math Concept Graph

[TOC]

## Purpose

The applied math concept graph is the retained backbone of problem-solving knowledge used across this repository. Its job is to preserve the reusable path:

- what problem is being solved
- what idea explains the reduction or analysis
- what solution can actually be executed

This document defines the graph-level policy that sits above individual note content and below the detailed classification rules in:

- classify a concept using `Applied Math Concept`
- decide whether it is node-eligible using `Applied Math Concept Node Policy`
- decide whether a relation is edge-eligible using `Applied Math Concept Edge Policy`
- record the retained graph using the schema and Markdown conventions of this repository

## What The Graph Represents

The graph represents a directed knowledge backbone of retained applied-math notes.

Each retained node should correspond to a concept that is:

- primarily a `problem`, `idea`, or `solution`
- reusable across more than one local explanation
- stable enough to serve as an anchor for navigation and future expansion

Each retained edge should express one of the direct workflow relations that help a reader move from task to reasoning to execution.

The graph is therefore:

- workflow-centered
- sparse rather than exhaustive
- structured rather than merely associative
- optimized for retrieval, navigation, and future tool support

## Graph Model

### Nodes

A node is a retained standalone applied-math note.

Under the default repository policy, nodes are usually created only for concepts whose main role is one of:

- `problem`
- `idea`
- `solution`

Typical node examples:

- shortest path problem
- constrained optimization
- Dijkstra's algorithm
- finite element method
- ADMM

### Edges

An edge is a retained direct relation between two retained nodes.

The graph should preserve only the edges that clarify problem structure, analytical strategy, or executable solution choice.

Typical retained relations include:

- hierarchy among problems, ideas, or solutions
- problem-to-idea relations
- problem-to-solution relations
- idea-to-solution relations
- solution-to-implementation relations when implementations are retained as solution nodes

### Global Shape

The retained graph should behave like a clean problem-solving backbone.

This implies the following goals:

- keep the graph readable
- prefer direct and reusable workflow links
- avoid noisy "related to everything" expansion
- preserve the distinction between `problem`, `idea`, and `solution`
- keep concrete execution details inside node content unless the relation itself is structurally important

The graph should remain interpretable by both human readers and future scripts.

## Operational Interpretation

When adding a new applied-math concept, the intended workflow is:

1. Classify it under `Applied Math Concept`.
2. Decide whether it deserves a standalone node under `Applied Math Concept Node Policy`.
3. If retained, create the note using the standard schema.
4. Add only direct retained edges justified by `Applied Math Concept Edge Policy`.
5. Put detailed derivations, proofs, tuning advice, and local implementation remarks into note content rather than graph structure.

This keeps the applied-math graph small, stable, and useful.

## Guiding Heuristic

The graph should answer questions such as:

- what kind of problem is this
- what broader family does it belong to
- what analytical idea makes it easier to understand
- what solutions are appropriate
- what implementations realize a retained solution

It should not try to encode every theorem dependency, historical influence, pedagogical order, or incidental association.
