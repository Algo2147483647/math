# Math Concept

[TOC]

## Math Concept Classification

This classification is organized in three layers:

- ontological core categories for concepts in the object-language of mathematics
- semantic or functional tags that refine how a concept is used
- metamathematical or discursive categories for concepts about mathematical exposition, formulation, and proof

The primary goal is to classify a concept by its main semantic role in context without forcing all concepts into mutually exclusive boxes.

## I. Ontological Core

### 1. Objects and Object Classes

A concept `C` belongs here when it names mathematical entities that can naturally serve as values of variables, be compared, related by maps, and studied as a stable subject matter.

Typical signals:

- one naturally writes `let X be a ...`
- one asks for examples of `C`
- one studies morphisms, subobjects, quotients, or classifications of instances of `C`

Examples:

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
- manifold
- category

Remarks:

- This is the default class for entity-like concepts.
- An object class may be primitive, structured, specialized, or construction-derived; these are usually better treated as secondary tags rather than separate top-level categories.

### 2. Structures and Data on Objects

A concept `C` belongs here when it names structure, extra data, or additional algebraic, geometric, analytic, or logical decoration placed on an underlying object.

Typical form:

- a structure on an object
- a datum attached to an object

Examples:

- topology on a set
- metric on a set
- norm on a vector space
- inner product on a vector space
- measure on a measurable space
- orientation on a manifold
- complex structure on a real vector space or manifold
- Riemannian metric on a manifold

Important distinction:

- `topology` is a structure
- `topological space` is an object class

Remarks:

- A structure is usually not understood in isolation from the underlying object on which it is imposed.

### 3. Morphisms and Map Classes

A concept `C` belongs here when it names maps, transformations, or admissible arrows between objects.

Examples:

- function when treated as a map between sets
- linear map
- homomorphism
- isomorphism
- homeomorphism
- diffeomorphism
- embedding
- immersion
- quotient map
- covering map
- representation when treated as a homomorphism into a linear group

Remarks:

- Some morphism concepts, such as `isomorphism`, also induce relations.
- A map class is not the same thing as a relation, even when it can be used relationally.
- In foundational contexts, `function` may also be treated as an object; classify by intended use.

### 4. Predicates, Properties, and Relations

A concept `C` belongs here when it expresses a condition, testable attribute, or relation that may hold of one or more entities.

Typical linguistic forms:

- `X is compact`
- `f is injective`
- `R is Noetherian`
- `x is orthogonal to y`

#### Unary predicates and properties

Examples:

- compactness
- connectedness
- completeness
- separability
- Hausdorffness
- boundedness
- smoothness
- normality
- abelianness
- Noetherianity
- measurability

#### Relations

Examples:

- equality
- inclusion
- divisibility
- order relation
- equivalence relation
- conjugacy
- orthogonality
- independence
- adjacency

Remarks:

- The distinction between property and relation is often arity: a property is usually unary, while a relation is binary or higher-arity.
- `isomorphic` is naturally classified as a relation, while `isomorphism` is naturally classified as a morphism.

### 5. Operations, Transformations, and Constructions

A concept `C` belongs here when it names a mathematical procedure, formation rule, or standard way to produce new entities, structures, or maps from given ones.

Examples:

- taking products
- taking quotients
- completion
- localization
- dualization
- tensoring
- forming closures
- taking limits
- pushforward
- pullback

Important distinction:

- `dualization` is an operation
- `dual space` is an object

Remarks:

- The output of an operation should be classified separately according to what it is: object, structure, morphism, predicate, or relation.
- Terms such as `pushforward` and `pullback` may produce different kinds of outputs depending on context.

## II. Semantic / Functional Tags

These are usually not primary ontological classes. They function as secondary tags that refine how a concept is being used.

### 6. Representations and Presentations

A concept `C` belongs here when it names a way of presenting, encoding, coordinatizing, or describing an object rather than the object itself.

Examples:

- coordinate representation
- matrix representation
- Fourier expansion
- local chart description
- normal form
- presentation of a group by generators and relations

Remarks:

- A representation may depend on auxiliary choices and need not be intrinsic.
- A represented object should still be classified primarily by its ontological type.

### 7. Invariants and Classifying Data

A concept `C` belongs here when it names a quantity, object, class, or datum attached to an entity and preserved under a relevant notion of equivalence, or when it helps classify entities up to such equivalence.

Examples:

- dimension
- determinant
- trace
- rank
- genus
- Euler characteristic
- characteristic class
- spectrum when treated as an invariant
- homotopy type when treated invariantly

Remarks:

- Some invariants are numbers, some are polynomials, and some are themselves objects.
- An invariant is often better viewed as a functional role played by some object or quantity, not as a separate ontological genus.

### 8. Contextual / Qualification Tags

These tags record how a concept is situated relative to another concept or how it is being qualified in context.

Common uses:

- structured object class
- specialized object class
- construction-derived object class
- intrinsic vs extrinsic
- local vs global
- canonical vs noncanonical
- chosen vs functorial

Examples:

- `abelian group` as a specialized object class inside `group`
- `Banach space` as a specialized object class inside `normed space`
- `dual space` as construction-derived
- `homology group` as both object and invariant, depending on use
- `matrix of a linear map relative to a basis` as a chosen presentation

Remarks:

- These are best recorded as qualifiers on top of a primary classification.
- A contextual tag should not normally replace the primary ontological class.

## III. Metamathematical and Discursive Categories

These categories concern mathematical discourse, formulation, proof, and exposition rather than the core object-language of mathematics.

### 9. Statements and Results

A concept `C` belongs here when it is a mathematical assertion, established result, or named claim rather than an object, structure, map, or property.

Examples:

- theorem
- proposition
- lemma
- corollary
- criterion
- formula when used as an asserted identity

Typical examples:

- Heine-Borel theorem
- Hahn-Banach theorem
- spectral theorem
- Fubini theorem
- Riesz representation theorem

### 10. Definitions and Axiomatizations

A concept `C` belongs here when it is explicitly a defining clause, axiomatic package, or formulation specifying what a notion means or what assumptions govern a theory.

Examples:

- definition of continuity
- definition of sheaf
- universal property of product
- axioms of a group
- axioms of a topological space

Remarks:

- The underlying notion defined may belong to a different primary category.
- This category concerns the act or package of definition, not the ontological status of the defined notion itself.

### 11. Methods, Techniques, and Proof Patterns

A concept `C` belongs here when it names a proof strategy, problem-solving style, or recurring mathematical technique.

Examples:

- induction
- proof by contradiction
- diagonal argument
- compactness method
- variational method
- generating function method
- probabilistic method

## Boundary Rules

Use the following distinctions to resolve common ambiguities.

### B1. Object class vs structure

- `topology` -> structure
- `topological space` -> object class
- `measure` -> structure
- `measure space` -> object class

### B2. Object class vs operation

- `completion` -> operation when it means the process
- `completion of X` -> object when it means the resulting completed object
- `localization` -> operation when it means the process
- `localized ring` -> object when it means the result

### B3. Morphism vs relation

- `embedding` -> morphism class
- `covering map` -> morphism class
- `isomorphic` -> relation
- `isomorphism` -> morphism class, or relation in looser usage

### B4. Object vs invariant

- `fundamental group` -> primarily an object class
- `fundamental group of X` may also carry the tag `invariant of a space`
- `determinant` -> often both a map and an invariant

### B5. Property vs specialized object class

- `abelian` -> property
- `abelian group` -> object class with a specialization tag
- `compact` -> property
- `compact manifold` -> object class with a specialization tag

### B6. Object vs presentation

- `matrix` -> object in linear algebra
- `matrix representation of a linear map` -> presentation
- `Fourier series` may be a presentation of a function, not the function itself

### B7. Object-language vs metamathematical language

- `group` -> object-language concept
- `definition of group` -> metamathematical concept
- `spectral theorem` -> statement
- `induction` -> method

## Recommended Practice

When classifying a concept, proceed in this order:

1. Determine whether the term is being used in the object-language of mathematics or in metamathematical discourse.
2. If it belongs to the object-language, classify it first into one of the ontological core categories:
   `object`, `structure`, `morphism`, `predicate/property/relation`, or `operation/construction`.
3. Add semantic or functional tags such as `representation`, `invariant`, `specialized`, `construction-derived`, or `canonical` when helpful.
4. Do not demote a genuine object class merely because it is defined by extra structure or arises from a standard construction.
5. When a term is genuinely context-sensitive, record the ambiguity explicitly rather than forcing a single interpretation.
