# Math Concept Edge Policy

Determine whether a relation between two mathematical concepts should be recorded as an edge in the main concept DAG.

Do not decide edge creation from surface wording alone. First classify the concepts according to `Math Concept`, then determine whether they are valid standalone nodes according to `Math Concept Node Policy`, and only after that decide whether a direct edge is justified.

## Core Principle

The main DAG records only stable structural relations among retained mathematical object nodes.

An edge should exist only if it is:

1. object-level
2. semantically necessary
3. direct
4. non-redundant
5. allowed by the retained edge type policy

Default posture:

> Do not add an edge unless the policy clearly justifies it.

## Dependency on `Math Concept` and `Math Concept Node Policy`

Edge creation is downstream from concept classification and node retention.

When evaluating a possible edge `A -> B`, proceed in this order:

1. Classify `A` and `B` using `Math Concept`.
2. Determine whether `A` and `B` are valid standalone nodes using `Math Concept Node Policy`.
3. Only if both are retained object or object-class nodes, evaluate whether a direct edge should be added.

Consequences:

- `structure`, `morphism`, `predicate/property/relation`, `operation/construction`, `representation`, `invariant`, and metamathematical concepts do not normally participate in the main DAG as nodes, so they do not normally generate main-DAG edges.
- A concept does not receive an edge merely because it appears in the definition, theorem statements, examples, or standard exposition of another concept.
- The main DAG is a backbone of retained object concepts, not a general-purpose semantic graph.

## Decision Procedure

When evaluating whether to add an edge `A -> B`, proceed in this order:

1. Verify that `A` and `B` are both retained standalone nodes.
2. Verify that both are used primarily as `object` or `object class` concepts in the current context.
3. Determine whether the relation fits one of the retained edge types in this policy.
4. Check whether the relation is direct rather than better represented through an intermediate node.
5. Check whether the edge would be redundant given existing transitive structure.
6. Add the edge only if it improves the global skeleton of the graph.

If any step fails, reject the edge and record the relation in node content instead when appropriate.

## Retained Edge Types

Only the following edge types may be used in the main DAG.

### 1. `is_a`

**Meaning**

`A is_a B` means that `A` is a specialization of `B` as an object class.

**Interpretation**

Every instance of `A` is naturally an instance of `B`, without projecting away part of the object, forgetting essential structure, or changing semantic role.

**Typical use**

- type refinement
- parent-child object hierarchy
- nearest valid superclass relation

**Examples**

- `field -> ring`
- `Banach space -> normed space`
- `Hilbert space -> inner product space`
- `Lie group -> manifold`

**Non-examples**

- `ring -> group` is not valid as `is_a` if the claim only becomes true by taking the additive part of the ring
- `topological space -> topology` is not valid because a topological space is not a topology
- `measure space -> measurable space` is not valid if the source concept includes extra data rather than pure subtype inclusion

### 2. `defined_over`

**Meaning**

`A defined_over B` means that the standard definition of `A` explicitly requires `B` as an external retained object-class parameter, scalar source, coefficient source, or comparable definitional base, while `A` is not a specialization of `B`.

**Interpretation**

`B` is not the parent type of `A`, but `A` cannot be properly defined in its standard form without explicit reference to `B` as a retained object concept.

**Typical use**

- scalar field dependencies
- coefficient ring dependencies
- external parameter object dependencies

**Examples**

- `vector space -> field`
- `module -> ring`
- `algebra -> field`

**Non-examples**

- do not use `defined_over` for internal technical ingredients such as maps, operations, predicates, axioms, or definitional clauses
- do not use `defined_over` when the relation is better expressed by `is_a`
- do not use `defined_over` merely because one concept is often introduced after another pedagogically

### 3. `modeled_on`

**Meaning**

`A modeled_on B` means that `B` is the standard local model or prototype object for `A`, and this modeling relation is part of the identity of `A`.

**Interpretation**

This is stronger than a generic dependency and weaker than subtype inclusion. Use it only when being locally like `B` or being built from `B` as a standard model is central to what `A` is.

**Typical use**

- geometric objects with local models
- prototype-based object semantics

**Examples**

- `manifold -> Euclidean space`
- `affine space -> vector space`

**Non-examples**

- do not use it as a generic substitute for `defined_over`
- do not use it for loose analogy or motivation
- do not use it when the relation is merely expositional rather than part of formal object identity

**Status**

This type is conditionally retained. Enable it only when the graph includes geometric or locally modeled object families where the distinction adds real structural value.

## Edge Acceptance Criteria

An edge `A -> B` may be added to the main DAG only if all of the following are true:

1. `A` and `B` are already valid retained object nodes under `Math Concept Node Policy`.
2. `A` and `B` are being used primarily as `object` or `object class` concepts in the current context.
3. The relation between `A` and `B` is object-level, stable, and mathematically standard.
4. The relation fits one of the retained edge types in the current policy mode.
5. The edge is direct rather than better expressed through an intermediate node.
6. The edge is not redundant under the transitive structure already present.
7. The edge improves the global backbone of the graph rather than merely adding detail.

If any of these fail, the edge must be rejected.

## Rejected Relations and Recording Practice

When a relation does not qualify for a main-DAG edge:

- record definitional detail in `define`
- record properties, invariants, formulas, and remarks in `properties`
- keep theorem dependence, proof methods, and exposition in node content rather than graph edges
- do not add edges for pedagogical order, historical association, common co-occurrence, or thematic similarity

The main DAG should express only the stable skeleton of retained object concepts. It should not absorb structures, properties, operations, presentations, theorem dependencies, or metamathematical discourse as edge relations.
