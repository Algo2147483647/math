# Linear Regression

[TOC]

## Define
Linear Regression assumes that the relationship between $y$ and $\boldsymbol x$ is linear,
$$
\begin{align*}
    y_i &= \left(w_0 + \boldsymbol w^T \boldsymbol x_{i}\right) + \epsilon_i  \\
    \boldsymbol y &= \left(\begin{matrix} 1 & \boldsymbol x_1^T \\ \vdots & \vdots \\ 1 & \boldsymbol x_n^T \end{matrix}\right) \boldsymbol w + \boldsymbol \epsilon = \boldsymbol X  \boldsymbol w + \boldsymbol \epsilon 
\end{align*}
$$

- $\boldsymbol w \in \mathbb R^{\dim + 1}$: parameters.  
- $\epsilon \in \mathbb R^{n}$: error variable.

## Solve: Least Square Method

We can set the minimization of error $\epsilon$ as our optimization objective. A commonly used measurement standard is the $L_2$ norm.
$$
\min_{\boldsymbol w} \|\boldsymbol \epsilon\|_2^2= \min_{\boldsymbol w} \|\boldsymbol X \boldsymbol w - \boldsymbol y\|_2^2
$$
The problem shifts to solving an overdetermined system of equations and the form of Least Square Method. Analytical solution is,


$$
\boldsymbol w^* = \boldsymbol X^+ \boldsymbol y = (\boldsymbol X^T \boldsymbol X)^{-1} \boldsymbol X^T \boldsymbol y
$$

For $\dim = 1$, 
$$
\min_{w,b} \quad \sum_i (w x_i + b - y_i)^2
$$

$$
\Rightarrow \begin{align*}
  \left\{\begin{matrix}w^* =& \frac{\sum\limits_i y_i(x_i - \bar x)}{\sum\limits_i x_i^2 - \frac{1}{n} \left(\sum\limits_i x_i\right)^2}\\
  b^* =& \frac{1}{n} · \sum\limits_i (y_i - w x_i)\end{matrix}\right.
\end{align*}
$$

> ***Proof***
> Solving linear equations,
> $$
> \boldsymbol y = \boldsymbol X \boldsymbol w \Rightarrow \boldsymbol w = \boldsymbol X^+ \boldsymbol y
> $$
> the optimum point is obtained when the derivative equal 0,
> $$
> \begin{align*}
>   \frac{∂ f_0(\boldsymbol x)}{∂ \boldsymbol w} &= 2 \boldsymbol X^T (\boldsymbol X \boldsymbol w - \boldsymbol y) = 0  \\
> \Rightarrow \boldsymbol w^* &= (\boldsymbol X^T \boldsymbol X)^{-1} \boldsymbol X^T \boldsymbol y
> \end{align*}
> $$
>
> For $\dim = 1$, the optimum point is,
> $$
> \begin{align*}
>   \Rightarrow \frac{∂ f_0}{∂ b} 
>   &= \sum_i 2 (w x_i + b - y_i)\\
>   &= 2 \left( n b + \sum_i (y_i - w x_i) \right)  \\
>   &= 0  \\
>   \Rightarrow \frac{∂ f_0}{∂ w} 
>   &= \sum_i 2 x_i (w x_i + b - y_i)\\
>   &= 2 \left( w \sum x_i^2 + \sum_i x_i(b - y_i) \right) \\ 
>   &= 0
> \end{align*}
> $$
>
> $$
> \Rightarrow w \sum_i x_i^2 = \sum_i x_i y_i - \frac{1}{n} \left(\sum_i x_i \right) \left(\sum_i y_i\right) + \frac{w}{n} \left(\sum_i x_i\right)^2
> $$
>
> $$
> \begin{align*}
>   \Rightarrow \left\{\begin{matrix}w^* =& \frac{\sum\limits_i y_i(x_i - \bar x)}{\sum\limits_i x_i^2 - \frac{1}{n} \left(\sum\limits_i x_i\right)^2}\\
>   b^* =& \frac{1}{n} · \sum\limits_i (y_i - w x_i)\end{matrix}\right.
> \end{align*}
> $$
