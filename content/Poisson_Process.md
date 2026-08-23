# Poisson Process

[TOC]

## Define

> A Poisson process is the counting process with stationary independent increments.

A **Poisson process** with rate $\lambda > 0$ is a counting process $(N_t)_{t \ge 0}$ such that:

- $N_0 = 0$;
- it has independent increments;
- for $s < t$,
$$
N_t - N_s \sim \operatorname{Poisson}(\lambda(t-s)).
$$

## Properties

### Distribution

For each $t \ge 0$,
$$
N_t \sim \operatorname{Poisson}(\lambda t).
$$

### Interarrival Times

The waiting times between successive jumps are independent exponential random variables with parameter $\lambda$.
