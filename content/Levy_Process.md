# Levy Process

[TOC]

## Define

> A Levy process is a cadlag process with stationary independent increments.

A **Levy process** is a stochastic process $(X_t)_{t \ge 0}$ such that:

- $X_0 = 0$ almost surely;
- it has independent increments;
- its increments are stationary;
- its sample paths are cadlag.

## Properties

### Levy-Khintchine Formula

The characteristic function of $X_t$ has the form
$$
\mathbb E[e^{iuX_t}] = e^{t\psi(u)},
$$
where $\psi$ is the Levy exponent.

### Examples

Standard examples include Brownian motion and Poisson processes.
