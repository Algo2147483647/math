# Linear Function

[TOC]

## Define

> A linear function preserves addition and scalar multiplication.

$$
\begin{align*}
  f(x) &= a x + b \tag{Univariate}  \\
  f(\boldsymbol x) &= \boldsymbol A \boldsymbol x + \boldsymbol b  \tag{Multivariate}
\end{align*}
$$

## Properties

### Zero Set of Linear Function & Plane & Linear Surface 

$$
\{\boldsymbol x \ |\ \boldsymbol A \boldsymbol x = \boldsymbol b \}
$$

### Problem: Solving Linear Equations 

$$
\boldsymbol A \boldsymbol x = \boldsymbol b
$$

Know $\boldsymbol A, \boldsymbol b$ and Solve $\boldsymbol x$. Where, $\boldsymbol A \in \mathbb R^{m \times n}$, $\boldsymbol x \in \mathbb R^{n}$, $\boldsymbol b \in \mathbb R^m$, $n$ is the number of unknown number, $m$ is the number of linear equations.

#### Property: Existence of Solutions  

$$
\begin{align*}
  \left\{\begin{matrix}
    rank((\boldsymbol A\ \boldsymbol b)) = rank(\boldsymbol A) &= n& \quad \text{Unique Solution}  \\
    rank((\boldsymbol A\ \boldsymbol b)) = rank(\boldsymbol A) &< n& \quad \text{Infinite Solutions}  \\
    rank((\boldsymbol A\ \boldsymbol b)) > rank(\boldsymbol A) &&\quad \text{Unsolvable}
  \end{matrix}\right.
\end{align*}
$$

- Proof 
  if $rank((\boldsymbol A\ \boldsymbol b)) > rank(\boldsymbol A)$ 
  $\Rightarrow$ $(\boldsymbol a_1,...,\boldsymbol a_n)$ and $b$ is linearly independent 
  $\Rightarrow$ $\nexists \boldsymbol x \in \mathbb R^{n}$ let $x_1 \boldsymbol a_1 + ... + x_n \boldsymbol a_n = b$. 
  $\Rightarrow$ Unsolvable

  if $rank((\boldsymbol A\ \boldsymbol b)) = rank(\boldsymbol A) < n$ 
  $\Rightarrow$ $\exists u \in \mathbb R^{n-1}, k \in [1, n]$ let $\boldsymbol a_k = \sum\limits_{i=1,i\neq k}^n u_i \boldsymbol a_i$ 
  $\Rightarrow$ $\exists c_1, c_2 \in \mathbb R, c_1 + c_2 = 1$ and $\exists x^*$ is a special solution, let $b = \left(c_1 x_k^* a_k + c_2 x_k^* \sum\limits_{i=1,i\neq k}^n u_i \boldsymbol a_i \right) + \sum\limits_{i=1,i\neq k}^n x_i^* \boldsymbol a_i$ 
  $\Rightarrow$ Infinite Solutions

  for the same reason, if $rank((\boldsymbol A\ \boldsymbol b)) = rank(\boldsymbol A) = n$ 
  $\Rightarrow$ Unique Solution

#### Solving  

- **Unique Solution**
  if $rank(\boldsymbol A) = n$ , then $\boldsymbol A^{-1}$ exists and
  $$
  \boldsymbol x = \boldsymbol A^{-1} \boldsymbol b
  $$
  
- **Infinite Solutions**
  General Solution $\boldsymbol x = \boldsymbol A^{-^{\{1\}}} \boldsymbol b + (\boldsymbol I - \boldsymbol A^{-^{\{1\}}} \boldsymbol A) \boldsymbol c$ 
  Special Solution $\boldsymbol x = \boldsymbol A^{-^{\{1\}}} \boldsymbol b$  

  Minimal Norm Solution. The minimum norm solution is unique.
  $$
  \begin{align*}
    \min_{\boldsymbol x} \quad& ||\boldsymbol x||_2  \\
    s.t. \quad& \boldsymbol A \boldsymbol x = \boldsymbol b
  \end{align*}
  $$
  $$
  \boldsymbol x = \boldsymbol A^{-^{\{1,3\}}} \boldsymbol b
  $$
  
- **Unsolvable**
  Approximate solution $\tilde{\boldsymbol x}$ by giving the evaluation function, such as least square,
  $$
  \min_{\tilde{\boldsymbol x}} \quad ||\boldsymbol A \tilde{\boldsymbol x} - \boldsymbol b||_2
  $$
  $$
  \tilde{\boldsymbol x} = \boldsymbol A^{-^{\{1,4\}}} \boldsymbol b
  $$

  Minimal norm Approximate solution $\tilde{\boldsymbol x}$ by least square,
  $$
  \begin{align*}
    \min_{\tilde{\boldsymbol x}} \quad& ||\boldsymbol A \tilde{\boldsymbol x} - \boldsymbol b||_2  \\
    \min_{\tilde{\boldsymbol x}} \quad& ||\tilde{\boldsymbol x}||_2
  \end{align*}
  $$
  
  $$
  \tilde{\boldsymbol x} = \boldsymbol A^+ \boldsymbol b
  $$
