# Math Concept Node Policy

[TOC]

Determine whether a mathematical concept should be created as a standalone node.

Do not decide node creation directly from surface wording alone. First classify the concept according to `Math Concept`, then decide whether it should be modeled as a standalone node or recorded inside another node.

## Core Principle

A concept is node-eligible primarily when its main classification in context is an `object` or `object class`.

Other classifications such as `structure`, `morphism`, `predicate/property/relation`, `operation/construction`, `representation`, `invariant`, and metamathematical categories are not normally standalone nodes unless an explicit local policy says otherwise.

## Decision Procedure

When evaluating a concept, proceed in this order:

1. Determine whether the concept is being used in the object-language of mathematics or in metamathematical discourse.
2. If it is object-language, classify it first as one of:
   - `object` or `object class`
   - `structure`
   - `morphism`
   - `predicate/property/relation`
   - `operation/construction`
3. Add secondary tags if needed, such as `specialized`, `construction-derived`, `representation`, `invariant`, or `canonical`.
4. Only after that, decide whether the concept deserves a standalone node.
5. If the concept is genuinely context-sensitive, record the ambiguity explicitly rather than forcing a single interpretation.

### Node-Eligible Concepts

A concept may be created as a standalone node when it is primarily an object or object class and satisfies at least one of the following:

- it is a core mathematical object class
- it is a specialized object class that is classical
- it is frequently used across the note system
- it is a stable subject of mathematical discourse
- it serves as a reusable anchor concept for many related facts, examples, constructions, or variants

Typical positive examples:

- set
- sequence
- matrix
- polynomial
- graph
- group
- ring
- field
- module
- vector space
- topological space
- metric space
- normed space
- inner product space
- manifold
- category

Remarks:

- A specialized object class may still be a node if it is mathematically stable and important enough, for example `Banach space` or `abelian group`.
- A construction-derived object should not be excluded merely because it arises from a standard construction. If the result is itself a stable object class, it may be a node.

### Normally Not Standalone Nodes

The following are normally recorded inside object nodes rather than as standalone nodes:

- pure properties
- pure relations
- pure methods or proof techniques
- pure statements and results
- pure definitions and axiomatizations
- operations understood as processes
- representations and presentations as presentations
- structures on objects

Remarks:

- `Normally not` is a modeling default, not a denial that these are legitimate concept classes in `Math Concept`.
- A local policy may still promote one of these to a standalone node when there is a strong organizational reason.

### Boundary Rules

Use the following distinctions to resolve common cases.

B1. Object class vs structure

- `topology` -> classify as `structure`; normally not a standalone node
- `topological space` -> classify as `object class`; node-eligible
- `measure` -> classify as `structure`; normally not a standalone node
- `measure space` -> classify as `object class`; node-eligible

B2. Object class vs operation

- `completion` -> classify as `operation` when it means the process; normally not a standalone node
- `completion of X` -> classify as `object` when it means the resulting object; node-eligible if stable enough
- `localization` -> classify as `operation` when it means the process; normally not a standalone node
- `localized ring` -> classify as `object class` or `object`; node-eligible if stable enough

B3. Morphism vs relation

- `embedding` -> classify as `morphism`; normally not a standalone node
- `covering map` -> classify as `morphism`; normally not a standalone node
- `isomorphic` -> classify as `relation`; not a standalone node
- `isomorphism` -> classify primarily as `morphism`; normally not a standalone node

B4. Object vs invariant

- `fundamental group` -> classify primarily as an `object class`; node-eligible
- `fundamental group of X` -> may additionally carry the tag `invariant`
- `homology group` -> may be both an `object class` and an `invariant` by role; do not reject node creation merely because of the invariant tag
- `determinant` -> often a `map` and also an `invariant`; normally not a standalone node under this policy

B5. Property vs specialized object class

- `abelian` -> classify as `property`; not a standalone node
- `abelian group` -> classify as `object class` with a `specialized` tag; node-eligible
- `compact` -> classify as `property`; not a standalone node
- `compact manifold` -> classify as `object class` with a `specialized` tag; node-eligible if stable enough

B6. Object vs presentation

- `matrix` -> may be an `object` in linear algebra; node-eligible
- `matrix representation of a linear map` -> classify as `presentation`; normally not a standalone node
- `Fourier series` -> may function as a presentation of a function rather than the function itself; normally not a standalone node unless local policy promotes it

B7. Object-language vs metamathematical language

- `group` -> object-language concept; node-eligible
- `definition of group` -> metamathematical concept; normally not a standalone node
- `spectral theorem` -> statement or result; normally not a standalone node
- `induction` -> method; normally not a standalone node

B8. Function as object vs function as morphism

- `function` -> if treated as a map between sets, classify primarily as `morphism`; normally not a standalone node
- `function` -> if treated in a foundational or set-theoretic setting as an entity in its own right, classify as `object`; node-eligible

## Recommended Recording Practice

When a concept is not promoted to a standalone node:

- store it in the most relevant object node
- record it according to its role, such as structure, property, invariant, method, theorem, or presentation
- preserve secondary tags when useful

Do not demote a genuine object class merely because it is defined by extra structure, described by a presentation, or obtained from a standard construction.
