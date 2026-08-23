# Natural Number

[TOC]

## Define

> Natural numbers are the discrete numbers used for counting and indexing.

$$
\mathbb N
$$

Natural numbers $\mathbb{N}$ are formally defined by the **Peano's axioms**, which specify the fundamental properties of natural numbers. Let $S(\cdot)$ denote the **successor function**, mapping a number to its next number.

1. $0$ is a natural number.

   $$0 \in \mathbb N$$

2. Every natural number has a successor in the natural numbers.

   $$\forall n \in \mathbb{N}, \exists S(n) \in \mathbb{N}$$

3. $0$ is not the successor of any natural number. 

   $$\forall n \in \mathbb N, S(n) \neq 0$$

4. If the successor of two natural numbers is the same, then the two original numbers are the same. 

   $$\forall m, n \in \mathbb N, S(m) = S(n) \implies m = n$$

5. **Mathematical Induction**: If a set contains $0$ and the successor of every number is in the set, then the set contains the natural numbers.

   $$\Big(\varphi(0) \land \forall n , (\varphi(n) \implies \varphi(S(n))) \Big) \implies \forall n , \varphi(n)$$

## Properties
