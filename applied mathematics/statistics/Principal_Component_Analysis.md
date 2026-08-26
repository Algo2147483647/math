# Principal Component Analysis , PCA

[TOC]

## Purpose  

(input) sample points $\boldsymbol X = (\boldsymbol x_1,...,\boldsymbol x_K), \boldsymbol x \in \mathbb R^n$

|Symbol|Means|
|---|---|
|$K$| the number of sample points|
|$n$| the original dimension of input |
|$m$| the processed dimension of output|
|$\boldsymbol x \in \mathbb R^n$|input sample point|
|$\boldsymbol y \in \mathbb R^m$|output point|
|$\boldsymbol X \in \mathbb R^{n \times K}$|input sample points' set|
|$\boldsymbol Y \in \mathbb R^{m \times K}$|output points' set|
|$\boldsymbol P \in \mathbb R^{m \times n}$|Projection matrix|
|||

Dimension Reduction from $n$-dimensional to $m$-dimensional,  find a Projection Transformation that satisfy:  
(These two principles are different interpretations of the same principle.)
- The distance from the sample point to the hyperplane is close enough.
- Maximum separability: The projection of sample points on the hyperplane shall be separated as far as possible.  

$$
\begin{align*}
  \boldsymbol y &= \boldsymbol P \boldsymbol x  \tag{Projection} \\
  \boldsymbol Y &= \boldsymbol P \boldsymbol X
\end{align*}
$$

The Covariance of $Y$ reflects the rule 2, 
$$
Cov(Y, Y)
$$
- Diagonal elements reflect the Variance of new basis, the bigger the better
- Non diagonal elements reflect the relevance between two bases, should be 0.  

Therefore we take $m$ eigenvectors with the largest eigenvalue as the Projection Matrix $P$, and output $Y = P X$.

## Solution  

Eigenvalue Decomposition for $X X^T = Q \Lambda Q^{-1}$, and sort $\Lambda, Q$ in descending order of $\lambda_i$,  then $P = Q^T[1:m, :], Y = P X$

- Proof  

  covariance matrix of $Y$:
  $$
  \begin{align*}
    Cov(Y, Y) 
    &= \frac{1}{m} (Y-\bar Y) (Y-\bar Y)^T   \tag{Covariance}\\
    &= \frac{1}{m} Y Y^T   \tag{$\bar Y = 0$}\\
    &= \frac{1}{m} (PX) (PX)^T   \tag{Projection}\\
    &= \frac{1}{m} P X X^T P^T   \\
    &= \frac{1}{m} P (X-\bar X) (X-\bar X)^T P^T   \tag{$\bar X = 0$}\\
    &= \frac{1}{m} P Cov(X,X) P^T  \tag{Covariance}\\
  \end{align*}
  $$

  Diagonalization of covariance matrix -- Eigenvalue Decomposition
  $$
  \begin{align*}
    Cov(X,X) &= Q \left(\begin{matrix} \lambda_1 && 0 \\ &\ddots \\ 0&&\lambda_n \end{matrix}\right) Q^{-1}  \tag{Eigenvalue Decomposition}  \\
    Q^{-1} Cov(X,X) Q &= \Lambda    \\
    Q^T Cov(X,X) Q &= \Lambda  \tag{$Q Q^T = I$}  \\
  \end{align*}
  $$

  sort $\Lambda, Q$ in descending order of $\lambda_i$, let $P = Q^T[1:m, :]$
