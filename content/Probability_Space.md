# Probability Space

[TOC]

## Define

> A probability space is a measure space whose total measure is one.

$$
(\Omega, \mathcal F, \mathbb P)  \tag{Probability Space}
$$

A probability space is a [measure space](./Measure_Space.md) consisting of

- $\Omega$: Sample space. The set of all possible elementary outcomes; events are subsets of Ω.
- $\mathcal F$: Event space, a $\sigma$-algebra on $\Omega$. The collection of events to which probabilities can be assigned, typically restricted to measurable subsets to avoid pathological cases.
- $\mathbb P$: A probability measure on $(\Omega, \mathcal F)$. A function on the event space F that assigns each measurable event a probability in [0, 1].

### Event

An event is a measurable subset of the sample space $\Omega$:
$$
A \in \mathcal F \subseteq 2^\Omega.
$$
The probability of an event is the value $\mathbb P(A)$.

### Probability

$$
\mathbb P: \mathcal F \to [0, 1]  \tag{Probability}
$$

Probability is a set function satisfying the Kolmogorov axioms:

- Nonnegativity: $\mathbb P(A) \in [0, 1]$ for all $A \in \mathcal F$
- Normalization: $\mathbb P(\Omega) = 1$
- Countable additivity: for pairwise disjoint events $(A_i)_{i=1}^{\infty} \subseteq \mathcal F$,
$$
\mathbb P \left(\bigcup_{i=1}^{\infty} A_i \right) = \sum_{i=1}^{\infty} \mathbb P(A_i)
$$

> Normalization: The sample space is certain to occur.
>
> Countable additivity: Probabilities are additive over mutually exclusive events. Since probability theory often deals with infinite procedures, which naturally give rise to countable unions of events, the additivity requirement is imposed at the countable level.

## Properties

### Law of Large Numbers

For i.i.d. random variables $X_1, X_2, \dots$ with mean $\mu$,
$$
\lim_{n \to \infty} \mathbb P \left(\left|\frac{1}{n} \sum_{k=1}^n X_k - \mu \right| < \varepsilon \right) = 1
\tag{Weak law of large numbers}
$$

For Bernoulli trials with success probability $p$ and empirical frequency $f_A / n$,
$$
\lim_{n \to \infty} \mathbb P\left(\left|\frac{f_A}{n} - p \right| < \varepsilon\right) = 1
\tag{Bernoulli law of large numbers}
$$

### Central Limit Theorem

For i.i.d. random variables $X_1, X_2, \dots$ with mean $\mu$ and variance $\sigma^2$,
$$
\lim_{n \to \infty} \mathbb P \left(\frac{\sum_{k=1}^n X_k - n \mu}{\sqrt{n}\sigma} \le x \right)
= \Phi(x)
= \int_{-\infty}^x \frac{1}{\sqrt{2 \pi}} e^{-t^2 / 2} \, \mathrm d t
\tag{Central Limit Theorem}
$$

### Joint Probability

$$
\mathbb P(A \cap B)
$$

The probability of $A$ and $B$ occurring together.

## Conditional Probability

$$
\mathbb P(B \mid A)
$$

Probability of occurrence of $B$ under the condition that $A$ occurs.

- Independence
  $$
  A \text{ and } B \text{ are independent} \Leftrightarrow \mathbb P(A \cap B) = \mathbb P(A) \mathbb P(B)
  $$

- Relationship between joint and conditional probability
  $$
  \begin{align*}
    \mathbb P(B \mid A) &= \frac{\mathbb P(A \cap B)}{\mathbb P(A)}  \\
    \mathbb P(A \cap B) &= \mathbb P(B \mid A) \mathbb P(A) = \mathbb P(A \mid B) \mathbb P(B)
  \end{align*}
  $$

- Total probability theorem
  $$
  \mathbb P(A) = \sum_i \mathbb P(A \mid B_i) \mathbb P(B_i)
  $$
  where $(B_i)$ is a partition of $\Omega$.


### Bayes' formula

$$
\begin{align*}
  \mathbb P(A \mid B) &= \frac{\mathbb P(B \mid A) \mathbb P(A)}{\mathbb P(B)}  \\
  \mathbb P(A_i \mid B) &= \frac{\mathbb P(B \mid A_i) \mathbb P(A_i)}{\sum\limits_j \mathbb P(B \mid A_j) \mathbb P(A_j)}
\end{align*}
$$

> - $P(A)$: the prior probability, namely the probability assigned to event $A$ before observing the new evidence.
> - $P(B \mid A)$: the likelihood, namely the probability of observing evidence $B$ given that $A$ is true.
> - $P(B)$: the marginal probability of the evidence, or the overall probability that evidence $B$ is observed.
> - $P(A \mid B)$: the posterior probability, that is, the updated probability assigned to $A$ after observing evidence $B$.
>
> Bayes’ theorem understands rational judgment not as the production of a once-and-for-all conclusion, but as an ongoing process of revision. We approach the world with prior probabilities of some kind, and new evidence does not determine the truth in isolation. Rather, by indicating how strongly it supports competing hypotheses, evidence recalibrates the degree of credibility assigned to each of them. Bayes’ theorem therefore reveals a central mechanism of rational inference: preserving probability under uncertainty, revising belief in light of evidence, and moving toward more reliable judgment through the interaction between background probabilities and new information.
