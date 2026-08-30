# Applied Math Concept Edge Policy

Determine whether a relation between two applied mathematics concepts should be recorded as an edge in the main concept graph.

Do not decide edge creation from surface wording alone. First classify the concepts according to `Applied Math Concept`, then determine whether they are valid standalone nodes according to `Applied Math Concept Node Policy`, and only after that decide whether a direct edge is justified.

## Core Principle

The main graph records only stable workflow relations among retained applied-math nodes.

An edge should exist only if it is:

1. role-aware
2. semantically necessary
3. direct
4. non-redundant
5. allowed by the retained edge type policy

Default posture:

> Do not add an edge unless the policy clearly justifies it.

## Dependency on `Applied Math Concept` and `Applied Math Concept Node Policy`

Edge creation is downstream from concept classification and node retention.

When evaluating a possible edge `A -> B`, proceed in this order:

1. Classify `A` and `B` using `Applied Math Concept`.
2. Determine whether `A` and `B` are valid standalone nodes using `Applied Math Concept Node Policy`.
3. Only if both are retained nodes, evaluate whether a direct edge should be added.

Consequences:

- theorem statements, proofs, notational conventions, benchmark instances, and local engineering details do not normally participate in the main graph as nodes
- a concept does not receive an edge merely because it is mentioned in a definition, proof, experiment, or exposition
- the graph is a problem-solving backbone, not a general-purpose semantic web

## Decision Procedure

When evaluating whether to add an edge `A -> B`, proceed in this order:

1. Verify that `A` and `B` are both retained standalone nodes.
2. Verify the primary roles of `A` and `B`.
3. Determine whether the relation fits one of the retained edge types in this policy.
4. Check whether the relation is direct rather than better represented through an intermediate node.
5. Check whether the edge would be redundant given existing structure.
6. Add the edge only if it improves the global workflow skeleton of the graph.

If any step fails, reject the edge and record the relation in node content instead when appropriate.

## Retained Edge Types

Only the following edge types should normally be used in the main graph.

### 1. `subtype_of`

**Meaning**

`A subtype_of B` means that `A` is a more specific member of the same role family as `B`.

**Typical use**

- `problem -> problem`
- `idea -> idea`
- `solution -> solution`

**Examples**

- `convex optimization -> continuous optimization`
- `mixed-integer linear programming -> mixed-integer optimization`
- `RK4 -> Runge-Kutta method`

### 2. `contains`

**Meaning**

`A contains B` means that `A` is a catalog, umbrella family, or organizational container that directly includes `B`, even when `B` is not best read as a strict subtype.

**Typical use**

- broad problem families
- organized method collections
- curated families of related subproblems

**Examples**

- `differential equations contains ODE problems`
- `numerical methods contains finite element method`

**Remarks**

- Prefer `subtype_of` when the subtype judgment is mathematically cleaner.
- Use `contains` only when the repository really intends an organizational grouping.

### 3. `analyzed_by`

**Meaning**

`A analyzed_by B` means that `A` is primarily understood, transformed, certified, or decomposed using the idea `B`.

**Typical roles**

- `problem -> idea`

**Examples**

- `constrained optimization analyzed_by Lagrangian duality`
- `constrained optimization analyzed_by KKT conditions`
- `PDE boundary value problem analyzed_by separation of variables`

### 4. `solved_by`

**Meaning**

`A solved_by B` means that `B` is a concrete solution that can be applied to `A`.

**Typical roles**

- `problem -> solution`

**Examples**

- `shortest path problem solved_by Dijkstra's algorithm`
- `linear optimization solved_by simplex method`
- `numerical ODE problem solved_by Runge-Kutta method`

### 5. `realized_by`

**Meaning**

`A realized_by B` means that `A` is an idea whose operational realization is the solution `B`.

**Typical roles**

- `idea -> solution`

**Examples**

- `dynamic programming principle realized_by knapsack dynamic programming`
- `operator splitting realized_by ADMM`

**Remarks**

- Use this only when the solution is best understood as a direct executable realization of the idea.
- Do not use it merely because a solution mentions the idea in passing.

### 6. `implemented_by`

**Meaning**

`A implemented_by B` means that `A` is a retained solution method or solver family and `B` is a concrete software-level solver or implementation-level realization.

**Typical roles**

- `solution -> solution` with an implementation tag on the child

**Examples**

- `interior-point method implemented_by IPOPT`
- `ADMM implemented_by OSQP`

### 7. `specializes`

**Meaning**

`A specializes B` means that `A` is a more specific operational form of `B`, but the repository prefers to emphasize method refinement rather than pure type inclusion.

**Typical roles**

- `solution -> solution`
- `idea -> idea`

**Examples**

- `projected gradient method specializes gradient descent`

**Remarks**

- Prefer `subtype_of` when the relation is clearly taxonomic.
- Use `specializes` when the refinement is mainly operational.

## Edge Acceptance Criteria

An edge `A -> B` may be added to the main graph only if all of the following are true:

1. `A` and `B` are already valid retained nodes under `Applied Math Concept Node Policy`.
2. The relation matches the primary roles of `A` and `B`.
3. The relation is stable, standard, and useful for navigation.
4. The relation fits one of the retained edge types in the current policy.
5. The edge is direct rather than better expressed through an intermediate node.
6. The edge is not redundant under the structure already present.
7. The edge improves the workflow backbone rather than merely adding commentary.

If any of these fail, the edge must be rejected.

## Rejected Relations and Recording Practice

When a relation does not qualify for a main-graph edge:

- record derivations, proofs, heuristics, and remarks inside the node content
- record runtime bounds, convergence caveats, and empirical tradeoffs inside the relevant solution note
- do not add edges for historical influence, pedagogical order, common co-occurrence, or vague thematic similarity
- avoid defaulting to weak labels such as `related_to` when a stronger structural relation is absent

The graph should express the reusable path from `problem` to `idea` to `solution`, together with the minimal hierarchy needed to keep that path readable.
