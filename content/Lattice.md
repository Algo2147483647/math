# Lattice

[TOC]

## Define

> A lattice is an ordered set in which every pair of elements has both a greatest lower bound and a least upper bound.

A **lattice** can be defined in two equivalent ways: as an ordered structure or as an algebraic structure.

### Order-theoretic Definition

A lattice is a partially ordered set
$$
(L,\le)
$$
such that every pair of elements $a,b\in L$ has:

- a greatest lower bound, called the meet and denoted $a\wedge b$;
- a least upper bound, called the join and denoted $a\vee b$.

That is,
$$
a\wedge b=\inf\{a,b\},
\quad
a\vee b=\sup\{a,b\}.
$$

### Algebraic Definition

Equivalently, a lattice is a set $L$ equipped with two binary operations
$$
\wedge,\vee:L\times L\to L
$$
satisfying the following identities for all $a,b,c\in L$:

- Commutativity:
$$
a\wedge b=b\wedge a,
\quad
a\vee b=b\vee a.
$$

- Associativity:
$$
a\wedge(b\wedge c)=(a\wedge b)\wedge c,
\quad
a\vee(b\vee c)=(a\vee b)\vee c.
$$

- Absorption:
$$
a\wedge(a\vee b)=a,
\quad
a\vee(a\wedge b)=a.
$$

- Idempotence:
$$
a\wedge a=a,
\quad
a\vee a=a.
$$

## Properties

### Meet and Join

The meet $a\wedge b$ is the largest element below both $a$ and $b$.

The join $a\vee b$ is the smallest element above both $a$ and $b$.

### Bounded Lattice

A lattice is bounded if it has a least element $0$ and a greatest element $1$:
$$
0\le a\le 1,\quad \forall a\in L.
$$

### Distributive Lattice

A lattice is distributive if
$$
a\wedge(b\vee c)=(a\wedge b)\vee(a\wedge c),
$$
and equivalently
$$
a\vee(b\wedge c)=(a\vee b)\wedge(a\vee c).
$$

### Complete Lattice

A lattice is complete if every subset $S\subseteq L$ has both an infimum and a supremum.
