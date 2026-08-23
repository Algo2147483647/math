# Diffusion Process

[TOC]

## Define

> A diffusion process is a Markov process with continuous sample paths.

A **diffusion process** is a continuous-path Markov process, typically on $\mathbb R^d$ or on a manifold, whose infinitesimal evolution is described by drift and diffusion coefficients.

Many diffusions are represented as solutions of stochastic differential equations of the form
$$
dX_t = b(X_t)\,dt + \sigma(X_t)\,dW_t.
$$

## Properties

### Generator

For sufficiently smooth test functions $f$, the generator often has second-order form
$$
Lf(x) = \sum_i b_i(x)\partial_i f(x) + \frac12 \sum_{i,j} a_{ij}(x)\partial_{ij} f(x),
$$
where $a = \sigma \sigma^T$.
