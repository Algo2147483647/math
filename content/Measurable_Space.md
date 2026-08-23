# Measurable Space

[TOC]

## Define

> A measurable space is a set equipped with a sigma-algebra specifying which subsets are measurable.

### Measurable Space

A measurable space is a pair $(E, \mathcal E)$, where $E$ is a set and $\mathcal E$ is a collection of subsets of $E$ closed under complements and countable unions.

## Properties

### Defining Sigma-Algebra

The defining collection $\mathcal E$ satisfies:

- $E \in \mathcal E$
- if $A \in \mathcal E$, then $E \setminus A \in \mathcal E$
- if $(A_i)_{i=1}^{\infty} \subseteq \mathcal E$, then $\bigcup_{i=1}^{\infty} A_i \in \mathcal E$

Hence $\emptyset \in \mathcal E$ and $\mathcal E$ is also closed under countable intersections.

### Borel Sigma-Algebra

For a topological space $X$, the Borel sigma-algebra is the smallest sigma-algebra containing all open subsets of $X$.
