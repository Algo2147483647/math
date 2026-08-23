# Integer Ring

[TOC]

## Define

> The integer ring is the ring of whole numbers under ordinary addition and multiplication.

Ring of Integers is a kind of Integral Domain (整环).
$$
\mathbb Z
$$

An **integer** can be defined as an equivalence class of ordered pairs of natural numbers $(a, b)$, where $a$ and $b$ are [natural numbers](./Natural_Number.md), under the following equivalence relation:

- Two ordered pairs $(a, b)$ and $(c, d)$ are considered equivalent if and only if $a + d = b + c$. (the difference between two natural numbers)

$$
(\mathbb Z, +, \cdot)
$$
$$
\forall a, b \in \mathbb Z, a \cdot b = 0 \quad\Rightarrow\quad  (a = 0 \vee b = 0)  \tag{no zero divisor}
$$
Integral ring is a nonzero commutative [ring](./Ring.md) in which the product of any two nonzero elements is nonzero.

- **Addition:** To add two integers represented by $[a, b]$ and $[c, d]$, define their sum as $[a + c, b + d]$. This is equivalent to adding the two 'positive' parts and the two 'negative' parts separately.
  
- **Negation:** The negation of an integer represented by $[a, b]$ is $[b, a]$, reflecting the idea of $ -(a - b) = b - a $.
  
- **Multiplication:** To multiply two integers represented by $[a, b]$ and $[c, d]$, define their product as $[ac + bd, ad + bc]$. This captures the distributive property over the components of the ordered pairs.

## Properties

### Division with Remainder & Factor

For integers $a, b \in \mathbb Z$ with $b \neq 0$, there exist unique integers $q, r \in \mathbb Z$ such that
$$
a = qb + r, \quad 0 \le r < |b|.
$$
Division with remainder decomposes an integer into a quotient part and a smaller remainder.

### Multiplicative Function

- Define  
  A mapping $f: \mathbb Z \to \mathbb R$, such that
  $$
  f(a \times b) = f(a) f(b) \quad \text{when}\ a, b \in \mathbb Z, gcd(a, b) = 1
  $$

- Property
  - $f(1) = 1$

- Example
  * Eular Function
    - Define  
      The number of coprimes with $n$ in positive integers less than $n$.
      $$
      \phi(n) = \text{number}(\{i\ |\ i \in 1:n, \text{GCD}(i, n) = 1\})
      $$

    - Property
      $$
      \begin{align*}
        n &= \prod_i p_i^{k_i}  \\
        \phi(n) &= n \prod_{p|n} (1 - 1/p)  
      \end{align*}
      $$

  * [Möbius Function](./Mobius_Function.md)

### Fermat's Last Theorem

No three positive integers $a, b, c$ satisfy the equation $a^n + b^n = c^n$ for any integer value of $n$ greater than $2$. The cases $n = 1$ and $n = 2$ have been known since antiquity to have infinitely many solutions.
