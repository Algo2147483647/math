# Mobius Function

[TOC]

## Define

> The Mobius function is an arithmetic function that records the square-free prime factor structure of an integer.

$$
\mu(n) = \left\{\begin{matrix}
  1 & n = 1\\
  (-1)^k & n = \prod\limits_{i=1}^k p_i\ (p_i \text{ is prime})\\
  0 & other.
\end{matrix}\right.  \tag{Möbius Function}
$$

Möbius Function $f: \mathbb Z^+ \to \{-1, 0, 1\}$ is defined above. For positive integers without square factors, if $n$ has an odd number of different prime factors, then $\mu(n) = -1$; if there are even numbers of of different prime factors, then $\mu(n)=1$.

## Properties

- Möbius Function is a multiplicative function.

$$
\sum\limits_{d|n} \mu(d) = \epsilon(n) = \left\{\begin{matrix}
1 & n=1 \\
0 & n \neq 1\\
\end{matrix}\right.
$$

### Möbius Inversion 

$$
g(n) = \sum_{d|n} f(d) \quad\Leftrightarrow\quad f(n) = \sum_{d|n} \mu(d) g\left(\frac{n}{d}\right)  \tag{Möbius Inversion}
$$
$$
f * \boldsymbol 1 = g  \quad\Leftrightarrow\quad f = g * \mu
$$

Where, $*$ is dirichlet convolution.
