# Applied Math Concept Node Policy

[TOC]

Determine whether an applied mathematics concept should be created as a standalone node.

Do not decide node creation directly from surface wording alone. First classify the concept according to `Applied Math Concept`, then decide whether it should be modeled as a standalone note or recorded inside another note.

## Core Principle

A concept is node-eligible primarily when its main classification in context is one of:

- `problem`
- `idea`
- `solution`

Support categories such as theorem statements, proofs, local parameter tricks, benchmark instances, formatting conventions, or one-off implementation details are not normally standalone nodes unless an explicit local policy says otherwise.

## Decision Procedure

When evaluating a concept, proceed in this order:

1. Decide whether the concept is primarily a `problem`, `idea`, or `solution`.
2. Add secondary tags if needed, such as `exact`, `approximate`, `heuristic`, `distributed`, `continuous`, or `implementation`.
3. Only after that, decide whether the concept deserves a standalone node.
4. If the concept is context-sensitive, record the ambiguity explicitly rather than forcing a misleading label.

### Node-Eligible Concepts

A concept may be created as a standalone node when it satisfies at least one of the following:

- it is a stable problem class that readers may want to revisit independently
- it is a reusable idea that explains many related solutions or reductions
- it is a concrete solution family or solver that deserves direct comparison with alternatives
- it serves as an anchor for multiple subproblems, refinements, or implementations
- it is likely to accumulate problem, idea, or solution content beyond one paragraph

Typical positive examples:

- shortest path problem
- maximum flow problem
- constrained optimization
- Dijkstra's algorithm
- interior-point method
- finite element method
- ADMM

### Normally Not Standalone Nodes

The following are normally recorded inside other notes rather than as standalone nodes:

- isolated notation
- one-off reductions used only once
- proof details
- correctness proofs
- runtime lemmas
- benchmark datasets
- individual exercises
- local parameter settings
- low-level code fragments
- implementation flags
- remarks that merely compare two nearby methods without introducing a stable concept

## Recommended Recording Practice

When a concept is not promoted to a standalone node:

- store it in the most relevant `problem`, `idea`, or `solution` note
- record assumptions, proofs, derivations, complexity bounds, and tuning advice in the section where they are most useful
- keep the graph focused on reusable workflow concepts

Do not demote a genuine reusable idea or solution merely because it is abstract, derived from another method, or implemented in software.
