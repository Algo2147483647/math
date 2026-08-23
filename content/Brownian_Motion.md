# Brownian Motion

[TOC]

## Define

> Brownian motion is the continuous Gaussian process with stationary independent increments.

A **Brownian motion**, or **Wiener process**, is a stochastic process $(W_t)_{t \ge 0}$ such that:

- $W_0 = 0$ almost surely;
- it has independent increments;
- for $0 \le s < t$,
$$
W_t - W_s \sim \mathcal N(0, t-s);
$$
- its sample paths are almost surely continuous.

## Properties

### Mean and Covariance

For standard Brownian motion,
$$
\mathbb E[W_t] = 0,
\qquad
\operatorname{Cov}(W_s, W_t) = \min\{s,t\}.
$$

### Scaling

Brownian motion is self-similar:
$$
(W_{ct})_{t \ge 0} \stackrel{d}{=} (\sqrt{c}\,W_t)_{t \ge 0}.
$$
