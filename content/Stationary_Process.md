# Stationary Process

[TOC]

## Define

> A stationary process is a stochastic process whose law is invariant under time shifts.

A stochastic process $\{X_t\}$ is stationary if for every $n \in \mathbb N$, every $t_1, \dots, t_n$, and every shift $\tau$,
$$
(X_{t_1}, \dots, X_{t_n})
\stackrel{d}{=}
(X_{t_1+\tau}, \dots, X_{t_n+\tau}).
$$

## Properties

### Weak Stationarity

A process is weakly stationary if its mean is constant and its covariance depends only on the time difference:
$$
\operatorname{Cov}(X_{t_1}, X_{t_2}) = K(t_1-t_2).
$$

### Power Spectral Density

For a weakly stationary process, the power spectral density is the Fourier transform of the autocovariance or autocorrelation function.
