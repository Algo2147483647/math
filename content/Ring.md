# Ring

[TOC]

## Define

> A ring is an algebraic structure with addition, subtraction, and multiplication, where multiplication need not be commutative or invertible.

$$
(G, +, \cdot)
$$

Ring is an algebraic structure, where $G$ is a set, $\cdot$ and $+$ are binary operations, and satisfy:  

- $(G, +)$ is a commutative group
- $(G, \cdot)$ is a monoid
  - $(G, \cdot)$ satisfies associative law, $a \cdot (b \cdot c) = (a \cdot b) \cdot c$
  - $(G, \cdot)$ exists multiplicative identity, $\exist 1: 1 \cdot x = x \cdot 1 = x, \forall x \in G$
- Distributive law: multiplication is distributive with respect to addition,
  $$
  \begin{align*}
    a \cdot (b + c) &= a \cdot b + a \cdot c  \\
    (b + c) \cdot a &= b \cdot a + c \cdot a
  \end{align*}
  $$

## Properties

### Ideal

For a ring $R = (R, +, \cdot)$ and a subring $I$ of $R$, if $I$ satisfies two following conditions, we call $I$ is the ideal subring of $R$.

- **Closure under Addition:** $\forall a, b \in I : a + b \in I$
- **Absorption of Multiplication:** $\forall a \in I, \forall r \in R : a \cdot r \in I, r \cdot a \in I$

#### Quotient Ring

For a ring $R = (R, +, \cdot)$ and a ideal $I$ of $R$, quotient ring $R / I$ is the set of cosets $a + I = \{a +i \ |\ i \in I\}$ of $I$ in $R$ under addition, with addition and multiplication defined as follows.

- **Elements**: Cosets $a + I = \{a +i \ |\ i \in I\}$
- **Addition**: $(a + I) + (b + I) = (a + b) + I$
- **Multiplication**: $(a + I) \cdot (b + I) = (a \cdot b) + I$

#### Prime Ideal

For a commutative ring $R$, an ideal $P \subset R \ (P \neq R)$ is a prime ideal if $\forall a ,b \in R, a \cdot b \in P: a \in P \text{ or } b \in P$.

Properties:

- $P$ is a prime ideal $\iff$ the quotient ring $R / P$ is an integral domain (no zero divisors).
- Every maximal ideal is prime, but the converse is false.

#### Maximal Ideal

For a commutative ring $R$, an ideal $M \subset R \ (M \neq R)$ is a Maximal Ideal if there exists no other proper ideals $J$ properly containing $M$, $M \subsetneq J \subsetneq R$.

Properties:

- $P$ is a maximal ideal $\iff$ the quotient ring $R / P$ is a field (every nonzero element has a multiplicative inverse).
- Maximal ideals exist in nonzero commutative rings (by Zorn’s Lemma).

### Polynomial Ring

The polynomial ring $K[x]$ in $x$ over a field (or, more generally, a commutative ring) $K$ defined as the set of all polynomials in the variable $x$ with coefficients $p_i \in K$ and a non-negative integer $n$ (representing the degree of the polynomial). 
$$
f(x) = p_{0}+p_{1}x+p_{2}x^{2}+\cdots +p_{n}x^{n}
$$

- **Addition**: $g(x) + f(x)$ is the polynomial whose coefficient of $x_i$ is $a_i + b_i$ for each $i$.
- **Multiplication**: Given two polynomials $f, g$, their product $f \cdot g$ is computed using the distributive property.

  

### Commutative Ring

A Ring satisfying commutative law.
$$
a \cdot b = b \cdot a \quad; \forall a, b \in G
$$
