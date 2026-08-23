# Branching Process

[TOC]

## Define

> A branching process models a population in which each individual reproduces randomly and independently.

A **branching process** is a stochastic process $(Z_n)_{n \ge 0}$ describing generation sizes. In the classical Galton-Watson case,
$$
Z_{n+1} = \sum_{i=1}^{Z_n} X_{n,i},
$$
where the offspring counts $X_{n,i}$ are independent and identically distributed.

## Properties

### Mean Offspring Number

If $m = \mathbb E[X_{n,i}]$, then the process is called subcritical, critical, or supercritical according as $m < 1$, $m = 1$, or $m > 1$.

### Extinction Probability

A central quantity is the probability that the population eventually dies out.
