# Markov Chain

[TOC]

## Define

> A Markov chain is a discrete-time Markov process.

A **Markov chain** is a sequence of random variables $(X_0, X_1, X_2, \dots)$ such that for every $n$ and every measurable set $A$,
$$
\mathbb P(X_{n+1} \in A \mid X_n, X_{n-1}, \dots, X_0) = \mathbb P(X_{n+1} \in A \mid X_n).
$$
Thus the law of the next state depends only on the present state.

## Properties

### Transition Matrix

For a finite or countable state space, the transition probabilities form a matrix
$$
P_{ij} = \mathbb P(X_{n+1} = j \mid X_n = i).
$$
Each row is nonnegative and sums to $1$.

### Stationary Distribution

A probability vector $\pi$ is stationary if
$$
\pi P = \pi.
$$
