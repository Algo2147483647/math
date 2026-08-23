# Ordered Set

[TOC]

## Define

> An ordered set is a set equipped with a relation that compares elements according to a specified order.

An ordered set, or more formally, a partially ordered set (poset), is a pair $(S, \le)$ consisting of a set $S$ and  a binary relation $\le$ that satisfies the following properties for all $a, b, c \in S$:

1. Reflexivity: $a \le a$.
2. Antisymmetry: If $a \le b$ and $b \le a$, then $a = b$.
3. Transitivity: If $a \le b$ and $b \le c$, then $a \le c$.

### Partial Order

Partial Order is a homogeneous relation $\le$ on a set $S$ that is reflexive, antisymmetric, transitive.

- Reflexivity. Every element is related to itself.
  $$
  \forall x \in S, x \le x
  $$
- Antisymmetry. 
  $$
  \forall x, y \in S, x \le y, y \le x \quad\Rightarrow\quad x = y
  $$
- Transitivity. 
  $$
  \forall x, y, z \in S, x \le y, y \le z \quad\Rightarrow\quad x \le z
  $$

Strict Partial Order is a homogeneous relation $<$ on a set $S$ that is irreflexivity, antisymmetric, transitive. Where the irreflexivity is not $a < a$ (no element is related to itself).

## Properties

* Least Element & Greatest Element
    $$
    m \le a \quad, m \in S, \forall a \in S  \tag{Least element}
    $$
    $$
    a \le g \quad, g \in S, \forall a \in S  \tag{Greatest element}
    $$
    
  * Minimal Element & Maximal Element  
    $$
    \nexists a \in S, \text{ let } a < m \quad, m \in S \tag{Minimal element}
    $$
    $$
    \nexists a \in S, \text{ let } g < a \quad, g \in S \tag{Maximal element}
    $$
    
  * Infimum & Supremum
    Infimum (greatest lower bound) of a subset $S$ of a partially ordered set $(P, \le)$ is an element $a^*\in P$ such that,
    $$
    a \le x \quad, \forall x \in S  \tag{lower bounds}
    $$
    $$
    a \le a^*, \forall a \tag{Infimum}
    $$
    
    Supremum (least upper bound) of a subset $S$ of a partially ordered set $(P, \le)$ is an element $b^* \in P$ such that,
    $$
    x \le b \quad, \forall x \in S  \tag{upper bounds}
    $$
    $$
    b^* \le b, \forall b \tag{Supremum}
    $$

Include
* Total Order 
  Total Order is a partial order in which any two elements are comparable, such that, 
  - strongly connected, formerly called total: $a \le b$ or $b \le a$.

### Permutation

- Define  
  Permutation, is the arrangement of $k$ elements from a set of $n$ elements in a particular order. 

  The number of combination and permutation subsets
  $$A(n, k) = \frac{n!}{(n - k)!}  \tag{Permutation}$$

- Property
  * Full Permutation
    - Define  
      Full Permutation refers to all possible permutations of all elements in a sequence.  

    - Problem: Generate Full Permutation
      $$\begin{align*}
        f(\{a_i | i\in 1:n\}) 
        &= \{(a_1, a_2, ..., a_n), (a_2, a_1, ..., a_n), (a_n, a_{n-1}, ..., a_1)\}  \\
        &= \cup_{i=1}^n (\{(a_i)\} × f(\{a_j\ |\ j ≠ i, j\in 1:n\}))  \tag{$×$: 序列合并}  \\
        f(\{a_1\}) &= \{(a_1)\}  \tag{initial}  \\
      \end{align*}$$
      
    - Property
      * Cantor Expansion  
        - Define  
          Cantor expansion is a bijection from a permutation sequence $a$ to a natural number $y$ that refer to the index of sequence in full permutation ordered by dictionary order. Where $f(a_i)$ is the number of elements smaller than $a_i$ and not appearing in $a_n:a_i$.
          $$y = \sum\limits_{i=1}^n f(a_i) (i-1)!$$
