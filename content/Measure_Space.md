# Measure Space

[TOC]

## Define

> A measure space is a measurable space equipped with a measure assigning sizes to measurable sets.

### Measure Space

$$
(E, \mathcal E, \mu)  \tag{Measure Space}
$$

A measure space is a measurable space $(E, \mathcal E)$ equipped with a measure $\mu$ on $(E, \mathcal E)$.

### Measure

A measure on a measurable space $(E, \mathcal E)$ is a function $\mu: \mathcal E \to [0, \infty]$ such that

- $\mu(\emptyset) = 0$
- Countable additivity: for any pairwise disjoint sequence $(A_i)_{i=1}^{\infty}$ with $A_i \in \mathcal E$,
$$
\mu \left(\bigcup_{i=1}^{\infty} A_i\right) = \sum_{i=1}^{\infty} \mu(A_i)
$$

## Properties

### Lebesgue Measure  
For a measurable subset $E \subseteq \mathbb{R}^n$, the Lebesgue measure $\mathrm m(E)$ can be defined by
$$
\mathrm m(E) = \inf\left\{\sum_{i=1}^\infty \mathrm{vol}(Q_i) \ \middle|\ E \subseteq \bigcup_{i=1}^\infty Q_i,\ Q_i \text{ are open boxes}\right\}
\tag{Lebesgue Measure}
$$

### Product Measure

Let $(X, \mathcal A, \mu)$ and $(Y, \mathcal B, \nu)$ be measure spaces. The product measure
$$
\mu \otimes \nu
$$
is the measure on the product measurable space $(X \times Y, \mathcal A \otimes \mathcal B)$ characterized by
$$
(\mu \otimes \nu)(A \times B) = \mu(A)\nu(B)
$$
for measurable rectangles $A \in \mathcal A$, $B \in \mathcal B$.
