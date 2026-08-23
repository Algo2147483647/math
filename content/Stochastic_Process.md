# Stochastic Process

[TOC]

## Define

> A stochastic process is a family of random variables indexed by time or another parameter.

A Stochastic Process $X(t, \omega), \omega \in \Omega, t \in T$ is defined as a collection of random variables defined on a [Probability Space](./Probability_Space.md) $(Ω, \mathcal F, P)$, and these random variables indexed by set $T$.

Note
- When the time $t$ is fixed, the random process degenerates into a random variable.
- When the random sample $ζ$ is determined, the random process degenerates into a continuous time function

## Properties

### Correlation Function and Covariance Function

$$
\begin{align*}
  \operatorname{Corr}(X(t_1), Y(t_2)) &= \mathbb E(X(t_1)Y(t_2)),\\
  \operatorname{Cov}(X(t_1), Y(t_2)) &= \mathbb E((X(t_1)-\mu_X(t_1))(Y(t_2)-\mu_Y(t_2))).
\end{align*}
$$

#### Property

- $X$ and $Y$ are uncorrelated iff $\operatorname{Cov}(X(t_1), Y(t_2)) = 0$ for all $t_1,t_2$.
- Orthogonality in $L^2$ means $\operatorname{Corr}(X(t_1), Y(t_2)) = 0$ for all $t_1,t_2$.

### Examples

- Simple process:
  $$
  X(t, \zeta) = X(\zeta) f(t)
  $$
- Random sine wave:
  $$
  X(t, \zeta) = A(\zeta) \sin(\omega_0 t + \Theta(\zeta)).
  $$

Specialized object classes such as stationary processes, Gaussian processes, and Poisson point processes are promoted to their own nodes.
