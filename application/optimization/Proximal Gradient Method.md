# Proximal Gradient Method

[TOC]

## Description

Proximal Gradient Method addresses composite convex optimization problems of the form

$$
x^\star \in \operatorname*{arg\,min}_{x \in \mathcal{X}} F(x)
\quad \text{where} \quad
F(x) := f(x) + g(x).
$$

Here, $x \in \mathbb{R}^n$ is the decision variable, $\mathcal{X} \subseteq \mathbb{R}^n$ is the feasible set, $F$ is the objective function, $f$ is a differentiable function with $L$-Lipschitz continuous gradient, and $g$ is a proper, closed, convex function that may be nonsmooth. Constraints may be encoded either by $\mathcal{X}$ or by the indicator function

$$
\iota_{\mathcal{X}}(x)
=
\left\{
\begin{array}{ll}
0, & x \in \mathcal{X}, \\
+\infty, & x \notin \mathcal{X}.
\end{array}
\right.
$$

Thus constrained problems can be written as

$$
\min_{x \in \mathbb{R}^n} f(x) + g(x) + \iota_{\mathcal{X}}(x).
$$

For a stepsize $\alpha_k > 0$, the proximal gradient iteration is

$$
x^{k+1}
=
\operatorname{prox}_{\alpha_k g}
\left(
x^k - \alpha_k \nabla f(x^k)
\right),
$$

where the proximal operator is defined by

$$
\operatorname{prox}_{\alpha g}(v)
:=
\operatorname*{arg\,min}_{x \in \mathbb{R}^n}
\left\{
g(x) + \frac{1}{2\alpha}\|x-v\|_2^2
\right\}.
$$

Equivalently, each iteration solves the quadratic local model

$$
x^{k+1}
\in
\operatorname*{arg\,min}_{x \in \mathbb{R}^n}
\left\{
f(x^k)
+ \langle \nabla f(x^k), x - x^k \rangle
+ \frac{1}{2\alpha_k}\|x-x^k\|_2^2
+ g(x)
\right\}.
$$

If constraints are represented explicitly, the update becomes

$$
x^{k+1}
=
\operatorname{prox}_{\alpha_k (g+\iota_{\mathcal{X}})}
\left(
x^k - \alpha_k \nabla f(x^k)
\right).
$$

An optimal solution $x^\star$ satisfies the first-order optimality condition

$$
0 \in \nabla f(x^\star) + \partial g(x^\star) + N_{\mathcal{X}}(x^\star),
$$

where $\partial g(x^\star)$ is the subdifferential of $g$ at $x^\star$, and $N_{\mathcal{X}}(x^\star)$ is the normal cone to $\mathcal{X}$ at $x^\star$. For $0 < \alpha_k \leq 1/L$, the method produces a descent sequence under standard convexity assumptions and converges to an optimal solution when one exists.
