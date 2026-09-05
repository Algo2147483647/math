# Integer Ring

[TOC]

## Define

> The integer ring is the set of integers with usual addition and multiplication.

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

A mapping $f: \mathbb Z \to \mathbb R$, such that
$$
f(a \times b) = f(a) f(b) \quad \text{when}\ a, b \in \mathbb Z, \gcd(a, b) = 1
$$
Properties,
- $f(1) = 1$

#### Eular Function

Eular Function, The number of coprimes with $n$ in positive integers less than $n$.
$$
\phi(n) = \text{number}(\{i\ |\ i \in 1:n, \text{GCD}(i, n) = 1\})
$$
Properties,
$$
\begin{align*}
  n &= \prod_i p_i^{k_i}  \\
  \phi(n) &= n \prod_{p|n} (1 - 1/p)  
\end{align*}
$$


### Fermat's Last Theorem

$$
a^n + b^n = c^n
$$

No three positive integers $a, b, c$ satisfy the equation $a^n + b^n = c^n$ for any integer value of $n$ greater than $2$. The cases $n = 1$ and $n = 2$ have been known since antiquity to have infinitely many solutions.

### Integer partitioning

Integer partitioning is the representation of a positive integer $n$ as a sum of positive integers, where the order of the terms does not matter. The **partition number** $p(n)$ denotes the number of distinct ways in which $n$ can be expressed as such a sum.

$$
\begin{align*}
p(n) &=\frac1{\pi\sqrt2} \sum_{k=1}^{\infty} A_k(n)\sqrt{k}\, \frac{d}{dn} \left[ \frac{ \sinh\!\left( \frac{\pi}{k} \sqrt{\frac23\left(n-\frac1{24}\right)} \right)} {\sqrt{n-\frac1{24}}} \right] \\
A_k(n) &= \sum_{\substack{0\le h<k\\(h,k)=1}} \exp\left( \pi i\,s(h,k)-\frac{2\pi i nh}{k} \right)\\
s(h,k) &= \sum_{r=1}^{k-1} \frac r k \left( \frac{hr}{k} -\left\lfloor\frac{hr}{k}\right\rfloor -\frac12 \right)
\end{align*}
$$

- Recurrence relation:

$$
p(n)=
\sum_{k=1}^{\infty}(-1)^{k-1}
\left[
p\!\left(n-\frac{k(3k-1)}2\right)
+
p\!\left(n-\frac{k(3k+1)}2\right)
\right]
$$


- The generations functions of partition numbers is,
$$
\sum\limits_{n=0}^\infty p(n) x^n = \prod\limits_{k=1}^{\infty} \frac{1}{1-x^k}
$$

Properties,
$$
p(5n+4)\equiv0\pmod5,\\
p(7n+5)\equiv0\pmod7,\\
p(11n+6)\equiv0\pmod{11}
$$
