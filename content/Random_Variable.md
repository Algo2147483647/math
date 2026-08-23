# Random Variable

[TOC]

## Define

> A random variable is a real-valued random element.

### Random Variable

$$
X: \Omega \to \mathbb R  \tag{Random Variable}
$$
A random variable is a real-valued [random element](./Random_Element.md), equivalently a measurable function from a probability space to the Borel measurable space $(\mathbb R, \mathcal B(\mathbb R))$.

- Note
  The event set $\{\omega \in \Omega \mid X(\omega) \le x\}$ is often written as $\{X \le x\}$.

### Random Vector, Multivariate Random Variable

$$
\boldsymbol X = (X_1, ... , X_n)^T  \tag{Random Vector}
$$

## Properties

### Moment

K-order Moment & K-order Central Moment:
$$
\begin{align*}
  \mathbb E(X^k) &= \sum_i x_i^k \mathbb P_X(x_i)  \tag{Moment (Discrete)}  \\
    &= \int_{-\infty}^\infty x^k f_X(x) \mathrm d x  \tag{Moment (Continuous)}  \\
  \mathbb E((X-\mu_x)^k) &= \sum_i (x_i-\mu_x)^k \mathbb P_X(x_i)  \tag{Central Moment (Discrete)}  \\
    &= \int_{-\infty}^\infty (x-\mu_x)^k f_X(x) \mathrm d x  \tag{Central Moment (Continuous)}
\end{align*}
$$

- $\mu_x = \mathbb E(X)$

### Expectation

$$
\begin{align*}
  \mathbb E(X) = \mu_x &= \sum x_i \mathbb P_X(x_i)  \tag{Discrete}  \\
    &= \int_{-\infty}^\infty x f_X(x) \mathrm d x  \tag{Continuous}  \\
  \mathbb E(\boldsymbol X) &= \left(\begin{matrix} \bar X_i \\ \vdots \end{matrix}\right) 
\end{align*}
$$

Property
$$
\begin{align*}
  \mathbb E(Y) &= \int_{-\infty}^\infty g(x) f_X(x) \mathrm d x  \\
  Y &= g(X)  \tag{$g$ is a measurable function}
\end{align*}
$$

### Variance & Standard Deviation

$$
\begin{align*}
  Var(X) = \sigma_x^2 &= \mathbb E((X - \mu_x)^2)  \tag{Variance}\\
  \sigma_x &= \sqrt{\mathbb E((X - \mu_x)^2)}  \tag{Standard Deviation}
\end{align*}
$$

Property
- $Var(X) = \mathbb E((X - \mu_x)^2) = \mathbb E(X^2) - \mathbb E(X)^2$

### Skewness  

$$
\mathbb E\left(\frac{(X - \mu_x)^3}{\sigma_x^3}\right)  \tag{3-order Central Moment}
$$

### Kurtosis  

$$
\mathbb E\left(\frac{(X - \mu_x)^4}{\sigma_x^4}\right)  \tag{4-order Central Moment}
$$

### Mixed Moment  

$$
\begin{align*}
  &\mathbb E(X^i Y^j) \tag{$ij$-order Joint Moment}  \\
  &\mathbb E((X-\bar X)^i (Y-\bar Y)^j) \tag{$ij$-order Joint Central Moment}
\end{align*}
$$
