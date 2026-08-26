# $Point\ Estimation$

[TOC]

## Define  
If the form of the distribution function $F(X; \theta)$ of Population $X$ be known where $\theta$ is the parameters to be estimated, and is the parameter to be estimated, the purpose of Point Estimation is to construct an appropriate Sample Statistic $\hat \theta(X_1, X_2, ..., X_n)$ and use its observed value $\hat \theta(x_1, x_2, ..., x_n)$ as a approximate value of unknown parameter $\theta$ from samples $\{X_1, ..., X_n\}$.

## Property

### Biasness
$$
bias(\hat \theta) = \mathbb E(\hat \theta) - \theta
$$
$$
\begin{align*}
  \mathbb E(\hat \theta) - \theta = 0  \tag{unbiased}\\
  \left(\lim_{m \to \infty} \mathbb E(\hat \theta_m)\right) - \theta = 0  \tag{asymptotically unbiased}\\
\end{align*}
$$

- Proof  
  Sample Mean:
  $$
  \begin{align*}
    E({\hat \mu}^2)
    &= \mathbb E\left(\frac{1}{n} \sum_{i=1}^n X_i \right)  \\
    &= \frac{1}{n} \sum_{i=1}^n \mathbb E\left(X_i \right)  \\
    &= \frac{1}{n} \sum_{i=1}^n \mu  \\
    &= \mu
  \end{align*}
  $$

  Sample Variance:
  $$
  \begin{align*}
    E({\hat \sigma}^2)
    &= \mathbb E\left(\frac{1}{n} \sum_{i=1}^n (X_i - \hat \mu)^2 \right)  \\
    &= \mathbb E\left(\frac{1}{n} \sum_{i=1}^n ((X_i - \mu) - (\hat \mu - \mu))^2 \right)  \\
    &= \mathbb E \left( \frac{1}{n} \sum_{i=1}^n (X_i - \mu)^2 - \frac{2}{n} \sum_{i=1}^n (X_i - \mu)(\hat \mu - \mu) + \frac{1}{n} \sum_{i=1}^n (\hat \mu - \mu)^2 \right)  \\
    &= \mathbb E \left( \frac{1}{n} \sum_{i=1}^n (X_i - \mu)^2 - 2 (\hat \mu - \mu)\left(\frac{1}{n}\sum_{i=1}^n(X_i) - \mu \right) + (\hat \mu - \mu)^2 \right)  \\
    &= \mathbb E \left( \frac{1}{n} \sum_{i=1}^n (X_i - \mu)^2 - 2 (\hat \mu - \mu)^2 + (\hat \mu - \mu)^2 \right)  \\
    &= \frac{1}{n} \sum_{i=1}^n \left( \mathbb E \left( (X_i - \mu)^2 \right) \right) - \mathbb E \left((\hat \mu - \mu)^2 \right)  \\
    &= \sigma^2 - Var \left(\hat \mu \right)  \\
    &= \sigma^2 - \frac{1}{n} \sigma^2  \\
    &= \frac{n-1}{n} \sigma^2
  \end{align*}
  $$

  $$
    \Rightarrow {\tilde \sigma}^2 = \frac{1}{n-1} \sum_{i=1}^n (X_i - \hat \mu)^2
  $$

### Efficiency

## Solve

* Moment Estimation  
  For Moment of Population,
  $$
  \mu_l = \mathbb E(\mu_l) = \sum_{x\in range(x)} x^l \mathbb P(x ; \theta_1, ..., \theta_k)
  $$

  and Sample Moments converge to the corresponding Population Moment in probability,
  $$
  A_l = \frac{1}{n} \sum_{i=1}^n X_i^l \stackrel{\text{in probability}}{\longrightarrow} \mu_l
  $$

  we express and estimate the Estimator $\hat \theta_i$ called Moment Estimation of the parameters $\theta_i$ by Moments through using the Sample Moments $A_l$ as the estimator of the corresponding Population Moment $\mu_l$,
  $$
  \left\{\begin{matrix}\mu_1 = \mu_1(\theta_1, ..., \theta_k)\\ \vdots \\ \mu_k = \mu_k(\theta_1, ..., \theta_k)\end{matrix}\right. \Rightarrow \left\{\begin{matrix}\theta_1 = \theta_1(\mu_1, ..., \mu_k) \\ \vdots \\ \theta_k = \theta_k(\mu_1, ..., \mu_k)\end{matrix}\right.
  $$
  $$
  \Rightarrow \hat \theta_i = \theta_i (A_1, A_2, ..., A_k) \tag{Moment Estimation}
  $$
  
* Maximum Likelihood Estimation  
  We take the value that maximizes the probability of joint occurrence of all samples $\{X_1, ..., X_n\}$ as the Estimator $\hat \theta_i$ of parameters $\theta_i$, i.e. arguments of the Maximum Likelihood $\mathbb P(x_1, ..., x_n| \theta)$,
  $$
  \begin{align*}
    \hat \theta
    &= \arg\max_{\theta \in \Theta}\quad \mathbb P(x_1, ..., x_n| \theta) \\
    &= \arg\max_{\theta \in \Theta}\quad \prod_{i=1}^n \mathbb P(x_i | \theta)  \\
    &= \arg\max_{\theta \in \Theta}\quad \sum_{i=1}^n \log \mathbb P(x_i | \theta) 
  \end{align*}
  $$

* Maximum A Posteriori Estimation
  $$
  \begin{align*}
    \hat \theta
    &= \arg\max_{\theta \in \Theta}\quad \mathbb P(\theta | x_1, ..., x_n) \\
    &= \arg\max_{\theta \in \Theta}\quad \frac{\mathbb P(x_1, ..., x_n| \theta)\mathbb P(\theta)}{\mathbb P(x_1, ..., x_n)} \\
    &= \arg\max_{\theta \in \Theta}\quad \mathbb P(\theta) \prod_{i=1}^n \mathbb P(x_i | \theta)  \\
    &= \arg\max_{\theta \in \Theta}\quad \left(\sum_{i=1}^n \log  \mathbb P(x_i | \theta) \right) + \log \mathbb P(\theta)
  \end{align*}
  $$