# $Gaussian\ Process\ Regression$

[TOC]

## Purpose  
Assume $y$ is a Gaussian Process on $x$, where $\mu(\cdot): \mathbb R \to \mathbb R$ is a mean function, $K(\cdot, \cdot): \mathbb R \times \mathbb R \to \mathbb R$ is a covariance function represented by a kernel function

$$
y \sim \mathcal N (\mu, K)
$$

Input $\{(x_1^*, y_1^*), ..., (x_n^*, y_n^*)\}$, where $x_i^* \in \mathbb R$, $y_i^* \in \mathbb R$. we want to solve the estimate of mean function $\tilde \mu$ and covariance function $\widetilde{Var}$ for $(\boldsymbol y | \boldsymbol x, \boldsymbol x^*, \boldsymbol y^*)$.  ([Regression](./Regression.md))

$$
(\boldsymbol y | \boldsymbol x, \boldsymbol x^*, \boldsymbol y^*) \sim \mathcal N \left(\tilde \mu ,  \widetilde{Var} \right)
$$

## Answer  
Joint distribution of $y, \boldsymbol y^*$

$$
\left(\boldsymbol y, \boldsymbol y^* | \boldsymbol x, \boldsymbol x^*\right) \sim \mathcal N \left(\left(\begin{matrix}\boldsymbol \mu_y \\ \boldsymbol \mu_{y^*}\end{matrix}\right), \left(\begin{matrix} K(\boldsymbol x, \boldsymbol x) & K(\boldsymbol x, \boldsymbol x^*) \\ K(\boldsymbol x, \boldsymbol x^*)^T & K(\boldsymbol x^*, \boldsymbol x^*)\end{matrix}\right)\right)
$$

We obtain the answer by Posterior,   
$$
(\boldsymbol y | \boldsymbol x, \boldsymbol x^*, \boldsymbol y^*) \sim \mathcal N \left(\tilde \mu ,  \widetilde{Var} \right)
$$

$$
\begin{align*}
  \tilde \mu &= K(\boldsymbol x, \boldsymbol x^*)^T K(\boldsymbol x, \boldsymbol x)^{-1} (\boldsymbol y - \boldsymbol \mu_y) + \mu_{\boldsymbol y^*}  \\
  \widetilde{Var} &= K(\boldsymbol x^*, \boldsymbol x^*) -K(\boldsymbol x, \boldsymbol x^*)^T K(\boldsymbol x, \boldsymbol x)^{-1} K(\boldsymbol x^*, \boldsymbol x)
\end{align*}
$$

where, we can assume the initial $\mu = \mu_y = \boldsymbol \mu_{\boldsymbol y^*} = 0$.

## Property

- Choose the Optimal Parameters $\boldsymbol \theta^*$ of Kernel Function $K(x_1, x_2; \boldsymbol \theta)$  
  We can solve the $\boldsymbol \theta^*$ by Maximum Marginal Log-likelihood
  $$
  \begin{align*}
  \boldsymbol \theta^* &= \arg\max_{\boldsymbol \theta}\quad \log \mathbb P(\boldsymbol y^* | \boldsymbol \theta)  \\
  &= \arg\max_{\boldsymbol \theta}\quad \log \mathcal N (\mu, K(x^*, x^* ; \boldsymbol \theta))  \\
  &= \arg\max_{\boldsymbol \theta}\quad -\frac{1}{2} \boldsymbol y^T K^{-1}(x^*, x^* ; \boldsymbol \theta) \boldsymbol y - \frac{1}{2} \log|K(x^*, x^* ; \boldsymbol \theta)| - \frac{N}{2} \log(2 \pi)  \\
  &= \arg\max_{\boldsymbol \theta}\quad - \boldsymbol y^T K^{-1}(x^*, x^* ; \boldsymbol \theta) \boldsymbol y - \log|K(x^*, x^* ; \boldsymbol \theta)|
  \end{align*}
  $$





