# Applied Math Concept Node Schema

[TOC]

## Schema

Use this as the default schema for an applied mathematics concept node:

```json
{
  "Concept_Name": {
    "type": "problem | idea | solution",
    "description": "What is being solved? State the task, objective, constraints, and success criterion.",
    "parents": {
      "ParentConcept": "relation_label"
    },
    "children": {
      "ChildConcept": "relation_label"
    }
  }
}
```

Apply the template rules strictly:

- keep all four standard fields: `type`, `description`, `parents`, and `children`
- use `""` for empty `description`
- use `{}` for empty `parents` and `children`
- do not use `null`
- keep `parents` and `children` synchronized whenever possible
- keep `type` equal to one of `problem`, `idea`, or `solution`

If a display title is needed because the key is underscored or machine-oriented, it may be stored separately, but the core workflow schema above is the default contract.

## Markdown Note Template

Use this as the default Markdown structure:

```markdown
# Concept Name

[TOC]

## Problem

What problem is being solved? State the task, input-output contract, objective, constraints, governing equations, or target property.

## Idea

Explain the analytical viewpoint, transformation, reduction, decomposition, invariant, or structural reason that makes the problem manageable.

## Solution

Describe the concrete method, steps, computational cost, convergence behavior, assumptions, boundary cases, and when the method should or should not be used.

## Include

- [Child_Concept](./Child_Concept.md): relation_label

## Parents

- [Parent_Concept](./Parent_Concept.md): relation_label
```

## Reading Priority By Question Type

- "What problem is this note about?" -> read `problem`
- "Why does this reformulation help?" -> read `idea`
- "How do I actually solve it?" -> read `solution`
- "What broader family does this belong to?" -> read `parents`
- "What special cases, realizations, or implementations sit below it?" -> read `children`

## Field Semantics

### `type`

- Type: string
- Allowed values: `problem`, `idea`, `solution`
- Meaning: the note's primary role in the applied-math workflow

Use `type` to decide what the note is mainly for, not merely what words appear in the text.

### `description` for `problem`

- Type: string
- Meaning: the problem statement and task framing

Typical content:

- objective or target quantity
- input-output specification
- constraints, admissibility conditions, or governing equations
- problem variants or special cases

For a `solution` note, this field should still answer what class of problems the method is intended to solve.

### `description` for `idea`

- Type: string
- Meaning: the analytical viewpoint or transformation

Typical content:

- why the method works
- what structural property is being exploited
- what reduction or decomposition is being used
- when the viewpoint is valid

For a `problem` note, this field may summarize the main known angles of attack.

### `description` for `solution`

- Type: string
- Meaning: the executable method and its practical boundary

Typical content:

- algorithmic steps or solver pipeline
- runtime, memory, convergence, or discretization cost
- assumptions and applicability
- failure modes and tradeoffs
- comparison to nearby methods when useful

This section should answer not only how to solve, but also the price and scope of that solution.

### `parents`

- Type: object mapping `RelatedConcept -> relation_label`
- Meaning: direct upward or outward workflow relations

Best use:

- identifying the broader family of a problem
- showing which idea or solution family this note refines
- recording direct structural context

### `children`

- Type: object mapping `RelatedConcept -> relation_label`
- Meaning: direct downward workflow relations

Best use:

- listing special cases of a problem
- listing realizations of an idea
- listing implementations or refinements of a solution

## Consistency Between `parents` And `children`

- `parents` and `children` should be kept consistent whenever nodes are created or edited
- if `A.parents` contains `B: r`, then ideally `B.children` should contain `A: r`
- if `A.children` contains `B: r`, then ideally `B.parents` should contain `A: r`
- if the two sides temporarily disagree, treat the inconsistency as a repair task rather than a reason to discard information

## Role-Specific Writing Advice

For `problem` notes:

- make the problem statement precise
- list representative ideas and solutions without burying the formulation

For `idea` notes:

- focus on why the transformation helps
- make assumptions and structural prerequisites explicit

For `solution` notes:

- be concrete about the method
- state cost, edge cases, and applicability
- say when another solution should be preferred
