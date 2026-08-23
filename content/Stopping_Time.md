# Stopping Time

[TOC]

## Define

> A stopping time is a random time whose occurrence can be determined from the information available up to that time.

Stopping Time $\tau: \Sigma \to \bar T, \bar T = T \cup \{\infty\}$ is a random variable defined on the filtered probability space $(\Omega, \mathcal F, (\mathcal F_n)_{n \in \mathbb N}, P)$ with value in $T = [0, +\infty)$, such that 

$$
\{\tau \le t\} \in \mathcal F_t \quad, \forall t \in T
$$

## Properties

Property: 

- Optional stopping theorem

  Consider a stochastic process $\{X_t\}$ and a stopping time $\tau$ (a random variable that represents the time at which some event of interest occurs). The optional stopping theorem provides conditions under which
  $$
  \mathbb E(X_\tau) = \mathbb E(X_0)
  $$
