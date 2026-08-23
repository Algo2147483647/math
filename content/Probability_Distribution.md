# Probability Distribution

[TOC]

## Define

> A probability distribution is the law induced by a random element on its state space.

Let $X$ be a [random element](./Random_Element.md)
$$
X:(\Omega,\mathcal F,\mathbb P)\to(E,\mathcal E)
$$
defined on a [probability space](./Probability_Space.md). The **probability distribution**, or **law**, of $X$ is the pushforward probability measure on $(E,\mathcal E)$:
$$
\mathbb P_X(B)
=
\mathbb P(X^{-1}(B))
=
\mathbb P(\{\omega\in\Omega\mid X(\omega)\in B\}),
\quad B\in\mathcal E.
$$

It is also written as
$$
\mathcal L(X)=\mathbb P_X=X_\#\mathbb P.
$$

## Properties

### Support

The support of a distribution is the region where the distribution can place probability mass or density.

For a discrete distribution with probability mass function $p_X$,
$$
\operatorname{supp}(X)=\{x\mid p_X(x)>0\}.
$$

For a distribution on a topological space, the support is often defined as the smallest closed set $S$ such that
$$
\mathbb P_X(S)=1.
$$

### Representations of a Distribution

#### Probability Mass Function

If $X$ is discrete with countable state space $S$, its probability mass function is
$$
p_X(x)=\mathbb P(X=x),\quad x\in S.
$$

It satisfies
$$
p_X(x)\ge 0,
\quad
\sum_{x\in S}p_X(x)=1.
$$

For any $A\subseteq S$,
$$
\mathbb P(X\in A)=\sum_{x\in A}p_X(x).
$$

#### Cumulative Distribution Function

For a real-valued random variable $X$, the cumulative distribution function is
$$
F_X(x)=\mathbb P(X\le x).
$$

It satisfies:

- $F_X$ is non-decreasing.
- $F_X$ is right-continuous.
- $\lim_{x\to-\infty}F_X(x)=0$.
- $\lim_{x\to+\infty}F_X(x)=1$.

For a random vector $\boldsymbol X=(X_1,\cdots,X_n)$,
$$
F_{\boldsymbol X}(\boldsymbol x)
=
\mathbb P(X_1\le x_1,\cdots,X_n\le x_n).
$$

#### Probability Density Function

A real-valued random variable $X$ has a probability density function $f_X$ if its distribution is absolutely continuous with respect to Lebesgue measure:
$$
\mathbb P_X(B)=\int_B f_X(x)\,dx.
$$

Equivalently,
$$
f_X(x)=\frac{d\mathbb P_X}{dx}
$$
in the Radon-Nikodym sense.

If $F_X$ is differentiable at $x$, then
$$
f_X(x)=F_X'(x).
$$

For a random vector $\boldsymbol X$, a joint density $f_{\boldsymbol X}$ satisfies
$$
\mathbb P(\boldsymbol X\in A)=\int_A f_{\boldsymbol X}(\boldsymbol x)\,d\boldsymbol x.
$$

### Types of Distributions

#### Discrete Distribution

A distribution is discrete if it is concentrated on a countable set:
$$
\mathbb P_X(S)=1
$$
for some countable set $S$.

#### Absolutely Continuous Distribution

A distribution is absolutely continuous if it has a density $f_X$ with respect to Lebesgue measure:
$$
\mathbb P_X(B)=\int_B f_X(x)\,dx.
$$

#### Singular Distribution

A distribution is singular if it is concentrated on a set of Lebesgue measure zero but has no point masses. The Cantor distribution is a standard example.

#### Mixed Distribution

A mixed distribution has both discrete and continuous parts.

### Distribution of Random Vectors

#### Joint Distribution

For random elements $X$ and $Y$, the joint distribution of $(X,Y)$ is
$$
\mathbb P_{(X,Y)}(A\times B)
=
\mathbb P(X\in A,\ Y\in B).
$$

The joint distribution contains the dependence structure between $X$ and $Y$.

#### Marginal Distribution

The marginal distribution of one component is obtained from the joint distribution by projection.

For a random vector $\boldsymbol X=(X_1,\cdots,X_n)$ with joint density $f_{\boldsymbol X}$, the marginal density of $X_i$ is
$$
f_{X_i}(x_i)
=
\int_{\mathbb R^{n-1}}
f_{\boldsymbol X}(x_1,\cdots,x_n)
\,dx_1\cdots dx_{i-1}dx_{i+1}\cdots dx_n.
$$

#### Conditional Distribution

For discrete random variables,
$$
\mathbb P(X=x\mid Y=y)
=
\frac{\mathbb P(X=x,Y=y)}{\mathbb P(Y=y)}
$$
when $\mathbb P(Y=y)>0$.

For continuous random variables with joint density,
$$
f_{X\mid Y}(x\mid y)
=
\frac{f_{X,Y}(x,y)}{f_Y(y)}
$$
when $f_Y(y)>0$.

#### Independence

Random elements $X$ and $Y$ are independent if their joint distribution factors as a product measure:
$$
\mathbb P_{(X,Y)}=\mathbb P_X\otimes\mathbb P_Y.
$$

For discrete random variables,
$$
p_{X,Y}(x,y)=p_X(x)p_Y(y).
$$

For continuous random variables,
$$
f_{X,Y}(x,y)=f_X(x)f_Y(y).
$$

### Transformations of Distributions

#### Pushforward Under a Measurable Map

If $Y=g(X)$ for a measurable map $g:E\to F$, then
$$
\mathbb P_Y=g_\#\mathbb P_X.
$$

That is, for every measurable $B\subseteq F$,
$$
\mathbb P(Y\in B)=\mathbb P(X\in g^{-1}(B)).
$$

#### Change of Variables Formula

If $Y=g(X)$, where $g:\mathbb R\to\mathbb R$ is one-to-one and differentiable, then
$$
f_Y(y)
=
f_X(g^{-1}(y))
\left|
\frac{d}{dy}g^{-1}(y)
\right|.
$$

Equivalently,
$$
f_Y(y)
=
\frac{f_X(g^{-1}(y))}
{|g'(g^{-1}(y))|}.
$$

For a differentiable bijection $g:\mathbb R^n\to\mathbb R^n$,
$$
f_{\boldsymbol Y}(\boldsymbol y)
=
f_{\boldsymbol X}(g^{-1}(\boldsymbol y))
\left|
\det Dg^{-1}(\boldsymbol y)
\right|.
$$

Equivalently,
$$
f_{\boldsymbol Y}(\boldsymbol y)
=
\frac{
f_{\boldsymbol X}(g^{-1}(\boldsymbol y))
}{
\left|\det Dg(g^{-1}(\boldsymbol y))\right|
}.
$$

If $g$ is not one-to-one but has finitely many inverse branches, then the density is obtained by summing over all preimages:
$$
f_Y(y)
=
\sum_{x:g(x)=y}
f_X(x)
\left|
\frac{dx}{dy}
\right|.
$$

### Expectation with Respect to a Distribution

If $h:E\to\mathbb R$ is measurable, then
$$
\mathbb E[h(X)]
=
\int_E h(x)\,\mathbb P_X(dx).
$$

Thus the distribution of $X$ determines every expectation that depends only on $X$.

### Generating Functions and Transforms

#### Probability Generating Function

For a random variable $X$ taking values in $\mathbb N_0=\{0,1,2,\cdots\}$, the probability generating function is
$$
G_X(z)
=
\mathbb E[z^X]
=
\sum_{k=0}^{\infty}p_X(k)z^k.
$$

It satisfies:
$$
G_X(1)=1.
$$

The probabilities can be recovered by
$$
p_X(k)=\frac{G_X^{(k)}(0)}{k!}.
$$

The mean and variance are
$$
\mathbb E[X]=G_X'(1),
$$
$$
\operatorname{Var}(X)
=
G_X''(1)+G_X'(1)-\big(G_X'(1)\big)^2.
$$

#### Moment Generating Function

The moment generating function of a real-valued random variable is
$$
M_X(t)=\mathbb E[e^{tX}],
$$
when the expectation exists in a neighborhood of $t=0$.

If it exists near $0$, then
$$
\mathbb E[X^k]=M_X^{(k)}(0).
$$

#### Characteristic Function

The characteristic function of a real-valued random variable is
$$
\varphi_X(t)=\mathbb E[e^{itX}].
$$

Unlike the moment generating function, the characteristic function always exists.

### Common Discrete Distributions

#### Bernoulli Distribution

A Bernoulli distribution describes one trial with success probability $p$:
$$
X\sim\operatorname{Bernoulli}(p),
\quad 0\le p\le 1.
$$

Its probability mass function is
$$
\mathbb P(X=k)=p^k(1-p)^{1-k},
\quad k\in\{0,1\}.
$$

| Property | Value |
|---|---|
| Support | $k\in\{0,1\}$ |
| Mean | $\mathbb E[X]=p$ |
| Variance | $\operatorname{Var}(X)=p(1-p)$ |
| Skewness | $\frac{1-2p}{\sqrt{p(1-p)}}$ |
| Excess kurtosis | $\frac{1-6p(1-p)}{p(1-p)}$ |
| Entropy | $-p\ln p-(1-p)\ln(1-p)$ |

#### Binomial Distribution

A binomial distribution describes the number of successes in $n$ independent Bernoulli trials with the same success probability $p$:
$$
X\sim\operatorname{Binomial}(n,p).
$$

Its probability mass function is
$$
\mathbb P(X=k)
=
\binom nk p^k(1-p)^{n-k},
\quad k=0,1,\cdots,n.
$$

| Property | Value |
|---|---|
| Support | $k=0,1,\cdots,n$ |
| Mean | $\mathbb E[X]=np$ |
| Variance | $\operatorname{Var}(X)=np(1-p)$ |

#### Geometric Distribution

A geometric distribution describes the number of trials needed to get the first success in independent Bernoulli trials with success probability $p$:
$$
X\sim\operatorname{Geometric}(p).
$$

Using the convention $k=1,2,\cdots$, its probability mass function is
$$
\mathbb P(X=k)=p(1-p)^{k-1}.
$$

| Property | Value |
|---|---|
| Support | $k=1,2,\cdots$ |
| Mean | $\mathbb E[X]=\frac1p$ |
| Variance | $\operatorname{Var}(X)=\frac{1-p}{p^2}$ |

Another convention counts the number of failures before the first success, with support $k=0,1,2,\cdots$ and probability mass function
$$
\mathbb P(X=k)=(1-p)^kp.
$$

#### Hypergeometric Distribution

A hypergeometric distribution describes sampling without replacement. Suppose a population has $N$ objects, $M$ of which are successes. If $n$ objects are sampled without replacement, then the number of successes $X$ has probability mass function
$$
\mathbb P(X=k)
=
\frac{\binom Mk\binom{N-M}{n-k}}{\binom Nn}.
$$

The possible values of $k$ satisfy
$$
\max(0,n-(N-M))\le k\le \min(n,M).
$$

| Property | Value |
|---|---|
| Mean | $\mathbb E[X]=n\frac MN$ |
| Variance | $\operatorname{Var}(X)=n\frac MN\left(1-\frac MN\right)\frac{N-n}{N-1}$ |

#### Poisson Distribution

A Poisson distribution describes the number of events occurring in a fixed region when events occur independently with constant average rate:
$$
X\sim\operatorname{Poisson}(\lambda),
\quad \lambda>0.
$$

Its probability mass function is
$$
\mathbb P(X=k)
=
e^{-\lambda}\frac{\lambda^k}{k!},
\quad k=0,1,2,\cdots.
$$

| Property | Value |
|---|---|
| Support | $k=0,1,2,\cdots$ |
| Mean | $\mathbb E[X]=\lambda$ |
| Variance | $\operatorname{Var}(X)=\lambda$ |

For a spatial Poisson process with intensity $\lambda$, the number of events in a region $A$ is distributed as
$$
N(A)\sim\operatorname{Poisson}(\lambda\,\operatorname{area}(A)),
$$
and the numbers of events in disjoint regions are independent.

Poisson distribution is the limiting case of binomial distributions:
$$
\lim_{n\to\infty,\ p=\lambda/n}
\binom nkp^k(1-p)^{n-k}
=
e^{-\lambda}\frac{\lambda^k}{k!}.
$$

### Common Continuous Distributions

#### Uniform Distribution

A continuous uniform distribution on $(a,b)$ has density
$$
f_X(x)=
\begin{cases}
\frac1{b-a}, & a<x<b,\\
0, & \text{otherwise}.
\end{cases}
$$

Its cumulative distribution function is
$$
F_X(x)=
\begin{cases}
0, & x<a,\\
\frac{x-a}{b-a}, & a\le x<b,\\
1, & x\ge b.
\end{cases}
$$

| Property | Value |
|---|---|
| Support | $a<x<b$ |
| Mean | $\mathbb E[X]=\frac{a+b}{2}$ |
| Variance | $\operatorname{Var}(X)=\frac{(b-a)^2}{12}$ |

#### Normal Distribution

A normal distribution with mean $\mu$ and variance $\sigma^2$ is written as
$$
X\sim\mathcal N(\mu,\sigma^2),
\quad \sigma>0.
$$

Its density is
$$
f_X(x)
=
\frac1{\sqrt{2\pi}\sigma}
\exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right),
\quad x\in\mathbb R.
$$

The standard normal distribution is
$$
Z\sim\mathcal N(0,1),
$$
with density
$$
f_Z(z)=\frac1{\sqrt{2\pi}}e^{-z^2/2}.
$$

For a random vector $\boldsymbol X\in\mathbb R^n$, the multivariate normal distribution is
$$
\boldsymbol X\sim\mathcal N(\boldsymbol\mu,\Sigma),
$$
where $\Sigma$ is symmetric positive definite. Its density is
$$
f_{\boldsymbol X}(\boldsymbol x)
=
\frac1{(2\pi)^{n/2}|\Sigma|^{1/2}}
\exp\left(
-\frac12
(\boldsymbol x-\boldsymbol\mu)^T
\Sigma^{-1}
(\boldsymbol x-\boldsymbol\mu)
\right).
$$

| Property | Value |
|---|---|
| Support | $\mathbb R$ |
| Mean | $\mathbb E[X]=\mu$ |
| Variance | $\operatorname{Var}(X)=\sigma^2$ |
| Multivariate mean | $\mathbb E[\boldsymbol X]=\boldsymbol\mu$ |
| Multivariate covariance | $\operatorname{Cov}(\boldsymbol X)=\Sigma$ |

If
$$
\begin{pmatrix}
\boldsymbol X_1\\
\boldsymbol X_2
\end{pmatrix}
\sim
\mathcal N\left(
\begin{pmatrix}
\boldsymbol\mu_1\\
\boldsymbol\mu_2
\end{pmatrix},
\begin{pmatrix}
\Sigma_{11} & \Sigma_{12}\\
\Sigma_{21} & \Sigma_{22}
\end{pmatrix}
\right),
$$
then the conditional distribution of $\boldsymbol X_1$ given $\boldsymbol X_2=\boldsymbol a$ is
$$
\boldsymbol X_1\mid \boldsymbol X_2=\boldsymbol a
\sim
\mathcal N
\left(
\boldsymbol\mu_1
+\Sigma_{12}\Sigma_{22}^{-1}(\boldsymbol a-\boldsymbol\mu_2),
\Sigma_{11}-\Sigma_{12}\Sigma_{22}^{-1}\Sigma_{21}
\right).
$$

#### Student-t Distribution

A Student-t distribution with $\nu>0$ degrees of freedom is written as
$$
T\sim t_\nu.
$$

It can be constructed from a standard normal random variable $Z$ and an independent chi-square random variable $V\sim\chi_\nu^2$:
$$
T=\frac{Z}{\sqrt{V/\nu}}.
$$

Its density is
$$
f_T(t)
=
\frac{\Gamma\left(\frac{\nu+1}{2}\right)}
{\sqrt{\nu\pi}\,\Gamma\left(\frac{\nu}{2}\right)}
\left(1+\frac{t^2}{\nu}\right)^{-\frac{\nu+1}{2}},
\quad t\in\mathbb R.
$$

| Property | Value |
|---|---|
| Support | $\mathbb R$ |
| Mean | $0$, for $\nu>1$ |
| Variance | $\frac{\nu}{\nu-2}$, for $\nu>2$ |

As $\nu\to\infty$, the Student-t distribution converges to the standard normal distribution.

#### Rayleigh Distribution

A Rayleigh distribution with scale parameter $\sigma>0$ has density
$$
f_X(x)=
\begin{cases}
\frac{x}{\sigma^2}\exp\left(-\frac{x^2}{2\sigma^2}\right), & x\ge 0,\\
0, & x<0.
\end{cases}
$$

| Property | Value |
|---|---|
| Support | $x\ge 0$ |
| Mean | $\mathbb E[X]=\sigma\sqrt{\frac\pi2}$ |
| Variance | $\operatorname{Var}(X)=\frac{4-\pi}{2}\sigma^2$ |

#### Gamma Distribution

A gamma distribution with shape parameter $\alpha>0$ and scale parameter $\beta>0$ is written as
$$
X\sim\operatorname{Gamma}(\alpha,\beta).
$$

Its density is
$$
f_X(x)=
\begin{cases}
\frac1{\Gamma(\alpha)\beta^\alpha}
x^{\alpha-1}e^{-x/\beta}, & x>0,\\
0, & x\le 0.
\end{cases}
$$

| Property | Value |
|---|---|
| Support | $x>0$ |
| Mean | $\mathbb E[X]=\alpha\beta$ |
| Variance | $\operatorname{Var}(X)=\alpha\beta^2$ |

Special cases:

- If $\alpha=1$, then the gamma distribution becomes an exponential distribution.
- If $\alpha=\frac n2$ and $\beta=2$, then the gamma distribution becomes a chi-square distribution with $n$ degrees of freedom.

#### Exponential Distribution

An exponential distribution with rate parameter $\lambda>0$ has density
$$
f_X(x)=
\begin{cases}
\lambda e^{-\lambda x}, & x>0,\\
0, & x\le 0.
\end{cases}
$$

Its cumulative distribution function is
$$
F_X(x)=
\begin{cases}
1-e^{-\lambda x}, & x>0,\\
0, & x\le 0.
\end{cases}
$$

| Property | Value |
|---|---|
| Support | $x>0$ |
| Mean | $\mathbb E[X]=\frac1\lambda$ |
| Variance | $\operatorname{Var}(X)=\frac1{\lambda^2}$ |

#### Chi-square Distribution

A chi-square distribution with $n$ degrees of freedom is the distribution of
$$
X=Z_1^2+\cdots+Z_n^2,
$$
where $Z_1,\cdots,Z_n$ are independent standard normal random variables.

It is a gamma distribution:
$$
\chi_n^2=\operatorname{Gamma}\left(\frac n2,2\right).
$$

Its density is
$$
f_X(x)=
\begin{cases}
\frac1{2^{n/2}\Gamma(n/2)}x^{n/2-1}e^{-x/2}, & x>0,\\
0, & x\le 0.
\end{cases}
$$

| Property | Value |
|---|---|
| Support | $x>0$ |
| Mean | $\mathbb E[X]=n$ |
| Variance | $\operatorname{Var}(X)=2n$ |
