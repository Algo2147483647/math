# Math Concept Graph

[TOC]

## Purpose

The math concept graph is the retained backbone of mathematical object concepts used across this repository.

Its job is not to encode every semantic relation that appears in mathematical writing. Its job is to provide a sparse, stable, and machine-usable structural graph of standalone concept nodes.

This document defines the graph-level policy that sits above individual node content and below the detailed concept-classification rules in:

- Classify a concept using `Math Concept`.
- Decide whether it is node-eligible using `Math Concept Node Policy`.
- Decide whether a relation is edge-eligible using `Math Concept Edge Policy`.
- Record the retained graph using the schema and Markdown conventions of this repository.

### What The Graph Represents

The graph represents a directed acyclic graph of retained mathematical concept nodes.

Each retained node should correspond to a concept that is:

- primarily an object or object class in the object-language of mathematics
- important enough to deserve a standalone note
- stable enough to serve as a reusable anchor for definitions, facts, and downstream concepts

Each retained edge should correspond to a direct structural relation between retained object nodes.

The graph is therefore:

- object-centered
- sparse rather than exhaustive
- structural rather than pedagogical
- optimized for retrieval, navigation, and downstream tooling

## Graph Model

### Nodes

A node is a retained standalone mathematical concept note.

In the default repository policy, a node should usually be created only when the concept is primarily an `object` or `object class`.

Typical node examples:

- set
- group
- ring
- field
- module
- vector space
- topological space
- normed space
- Banach space
- manifold

Borderline concepts should be resolved by classification first, not by intuition from naming alone.

### Edges

An edge is a retained direct relation between two retained nodes.

Only a small number of edge types belong in the main graph. Under current policy, the graph retains:

- `is_a`
- `defined_over`
- `modeled_on` when the distinction adds real structural value

Edges must be:

- object-level
- direct
- semantically necessary
- standard in mathematical usage
- non-redundant in the current graph

### Global Shape

The retained graph should behave like a backbone DAG.

This implies the following global goals:

- keep the graph acyclic
- prefer direct nearest-parent structure
- avoid redundant transitive edges
- avoid exploding detail for local exposition
- preserve a readable ontology across algebra, analysis, geometry, topology, and related areas

The graph should remain interpretable both by a human reader and by scripts that build or validate `math.json`.

## Operational Interpretation

When adding a new concept to the repository, the intended workflow is:

1. Decide whether the concept is object-language or metamathematical.
2. Classify it under `Math Concept`.
3. Check node eligibility under `Math Concept Node Policy`.
4. If retained, create the node using the standard schema.
5. Add only direct retained edges justified by `Math Concept Edge Policy`.
6. Put all extra definitional detail, properties, theorems, and remarks into node content rather than graph structure.
7. Rebuild or validate derived graph artifacts as needed.

This keeps the graph small, stable, and suitable for both human browsing and script-based lookup.

## Guiding Heuristic

The graph should answer questions such as:

- what kind of mathematical object is this
- what is its nearest parent concept
- what external retained object is it defined over
- what standard model object is built into its identity

It should not try to answer every question that mathematical prose can express.

That restraint is a feature, not a limitation.
