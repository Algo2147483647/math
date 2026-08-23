# Markov Process

[TOC]

## Define

> A Markov process is a stochastic process whose future depends on the present state and not on the past history.

A [stochastic process](./Stochastic_Process.md) is **Markov** if the conditional law of the future given the present and the past depends only on the present state.

## Properties

### Transition Kernel

For a measurable state space $E$, the transition kernel is
$$
P_t(x, A) = \mathbb P(X_t \in A \mid X_0 = x).
$$
It records the law of the process after time $t$ when the current state is $x$.

### Chapman-Kolmogorov Equation

The transition kernels satisfy
$$
P_{t+s}(x, A) = \int_E P_t(x, dy) P_s(y, A).
$$

### Examples

Classical specialized Markov-process nodes include [Markov_Chain](./Markov_Chain.md), [Diffusion_Process](./Diffusion_Process.md), [Brownian_Motion](./Brownian_Motion.md), [Levy_Process](./Levy_Process.md), and [Poisson_Process](./Poisson_Process.md).
