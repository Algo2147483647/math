# Martingale

[TOC]

## Define

> A martingale is a stochastic process whose conditional future value equals its present value.

Martingale is a discrete-time [stochastic process](./Stochastic_Process.md) that satisfies for any time $n$,
$$
\mathbb E(|X_n|) < \infty
$$
$$
\mathbb E(X_{n+1} \ |\ X_1, ..., X_n) = X_n
$$

The second condition means that the conditional expected value of the next observation, given all the past observations, is equal to the most recent observation.

## Properties

- Doob-Meyer decomposition
