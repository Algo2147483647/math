# Applied Math Concept

[TOC]

## Applied Math Concept Classification

Applied mathematics in this repository is organized around problem solving rather than pure ontology.

The primary question is not only "what mathematical object is this," but also:

- what problem does it address
- what idea explains the reduction or analysis
- what concrete solution can actually be executed

This classification is therefore organized in three primary roles:

- `problem`: what must be solved
- `idea`: from what angle the problem is analyzed, and why the reformulation helps
- `solution`: how the problem is concretely solved, at what cost, and under what assumptions

The goal is to classify each concept by its main role in a problem-solving workflow without forcing every term into one rigid box.

## I. Core Roles

### 1. Problem

A concept `C` belongs here when it states a target task, question, or class of tasks to be solved.

Typical signals:

- one asks for an input-output specification
- one asks for constraints, objectives, or success criteria
- one compares hardness, solvability, or approximation guarantees
- one asks which methods apply

Typical contents of a problem note:

- mathematical formulation
- input, output, and admissibility conditions
- objective, constraints, or governing equations
- special cases and refinements

Examples:

- shortest path problem
- maximum flow problem
- linear optimization
- constrained optimization
- initial value problem
- boundary value problem
- graph coloring problem

Remarks:

- A problem is about what needs to be achieved, not yet about why a certain reduction works or how a particular algorithm proceeds.
- Problem families and their special cases both belong here.

### 2. Idea

A concept `C` belongs here when it provides the analytical viewpoint, structural reformulation, invariant, decomposition, relaxation, or transformation that explains why a problem becomes tractable.

Typical signals:

- one asks why this transformation is useful
- one asks what structural property is being exploited
- one asks what reduction, decomposition, relaxation, or invariant guides the method
- the concept explains a family of solutions more than one concrete procedure

Typical contents of an idea note:

- the key modeling or reasoning perspective
- why the perspective reduces complexity or exposes structure
- what assumptions make the idea valid
- which problem families the idea helps analyze

Examples:

- dynamic programming principle
- greedy-choice principle
- relaxation
- Lagrangian duality
- KKT conditions
- separation of variables
- transform-domain reasoning
- linearization

Remarks:

- An idea explains the route from problem structure to an executable method.
- An idea is usually more abstract than a single algorithm, solver, or software package.

### 3. Solution

A concept `C` belongs here when it gives a concrete method, algorithm, scheme, solver, or operational pipeline that can actually be applied to a problem.

Typical signals:

- one can describe the procedure step by step
- one can state runtime, memory, convergence, discretization, or implementation cost
- one can say when the method is applicable and when it breaks down
- one can compare it directly against alternative methods

Typical contents of a solution note:

- the executable procedure
- assumptions and applicability conditions
- computational cost, approximation quality, or convergence behavior
- edge cases, failure modes, and tradeoffs

Examples:

- Dijkstra's algorithm
- Bellman-Ford algorithm
- simplex method
- interior-point method
- Runge-Kutta method
- finite element method
- ADMM

Remarks:

- A solution should answer how to solve, how much it costs, and when it should be used.
- A software system such as `Gurobi` or `OSQP` may also be classified as a solution when the repository is treating implementations as executable solvers rather than as separate engineering artifacts.

## II. Secondary Tags

These are usually not the primary role of a note. They refine how a problem, idea, or solution is used.

### 4. Modeling Tags

Use these tags to describe the mathematical setting:

- continuous
- discrete
- combinatorial
- geometric
- probabilistic
- variational
- algebraic
- statistical

### 5. Execution Tags

Use these tags to describe how a solution behaves operationally:

- exact
- approximate
- heuristic
- deterministic
- randomized
- distributed
- online
- adaptive

### 6. Analysis Tags

Use these tags when a note mainly supports understanding, certification, or performance judgment:

- feasibility criterion
- optimality condition
- convergence argument
- stability criterion
- error estimate
- complexity bound
- relaxation certificate

Remarks:

- These tags refine a concept's role but should not usually replace the main `problem`, `idea`, or `solution` classification.

## III. Metamathematical and Support Categories

These categories are valid concepts, but they are not usually primary workflow nodes.

### 7. Statements and Results

Examples:

- theorem
- lemma
- proposition
- convergence theorem
- approximation guarantee
- complexity lower bound

### 8. Definitions and Formulations

Examples:

- standard form of linear programming
- weak formulation
- primal form
- dual form

### 9. Implementations, Benchmarks, and Instances

Examples:

- solver package
- benchmark suite
- test instance
- input format

Remarks:

- Some implementations may still be stored as `solution` nodes when they are treated as first-class executable solvers.
- Individual benchmark instances are usually not reusable concept nodes.

## Boundary Rules

Use the following distinctions to resolve common ambiguities.

### B1. Problem vs idea

- `shortest path problem` -> `problem`
- `relaxation of edge labels` -> `idea`
- `Lagrangian duality` -> `idea`
- `constrained optimization` -> `problem`

The problem states what must be solved. The idea explains why a reduction, reformulation, or structural view is useful.

### B2. Idea vs solution

- `dynamic programming` -> `idea` when it refers to the Bellman-style decomposition principle
- `dynamic programming for 0-1 knapsack` -> `solution` when the state, transition, and cost are concretely specified
- `separation of variables` -> usually `idea`
- `finite difference method` -> `solution`

An idea explains the route. A solution is the route made operational.

### B3. Problem vs instance

- `assignment problem` -> `problem`
- `this 1000-city routing dataset` -> not normally a standalone concept node

Keep stable problem classes as nodes, not one-off datasets or exercises.

### B4. Solution vs implementation

- `interior-point method` -> `solution`
- `IPOPT` -> `solution` with an implementation tag when treated as a reusable solver
- local script flags, hyperparameters, or code snippets -> not standalone concept nodes

### B5. Idea vs theorem

- `greedy-choice principle` -> `idea`
- `proof that Dijkstra is correct` -> statement or proof content, not a primary workflow node
- `KKT conditions` -> usually `idea` or analysis support, not a full solution

### B6. Solution family vs specialized solution

- `Runge-Kutta method` -> `solution`
- `RK4` -> specialized `solution`
- `branch-and-bound` -> `solution`
- `branch-and-cut for MILP` -> specialized `solution`

### B7. Problem-language vs support-language

- `maximum flow problem` -> primary workflow concept
- `definition of maximum flow problem` -> support-language concept
- `time complexity of Dijkstra's algorithm` -> analysis content attached to a solution note

## Recommended Practice

When classifying an applied mathematics concept, proceed in this order:

1. Decide whether the note's main job is to describe a `problem`, an `idea`, or a `solution`.
2. Add secondary tags only after the primary role is clear.
3. If the concept is context-sensitive, record the ambiguity explicitly instead of forcing a misleading label.
4. Prefer `idea` when the concept mainly explains why a transformation works.
5. Prefer `solution` when the concept mainly specifies how to execute the method and what it costs.
