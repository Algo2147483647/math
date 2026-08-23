# Gaussian Process

[TOC]

## Define

> A Gaussian process is a stochastic process whose every finite family of coordinates is jointly Gaussian.

A Gaussian process is a stochastic process $\{X_t \mid t \in T\}$ such that for every finite subset $t_1, \dots, t_k \in T$, the random vector
$$
(X_{t_1}, \dots, X_{t_k})
$$
has a multivariate normal distribution.

## Properties

A Gaussian process is determined by its mean function
$$
m(t) = \mathbb E[X_t]
$$
and covariance kernel
$$
K(s,t) = \operatorname{Cov}(X_s, X_t).
$$
