# Complex Value Function

[TOC]

## Define

> A complex-valued function assigns a complex number to each point of its domain.

$$
f: \mathbb C \to \mathbb C
$$

A complex function $f: \mathbb C \to \mathbb C$ is a [function](./Function.md) from [complex numbers](./Complex_Field.md) to complex numbers.

## Properties

- Differentiability: Holomorphic functions (or analytic functions) are differentiable everywhere within their domain of definition. For complex functions, holomorphism and analyticity are equivalent. 

  Let $U$ be an open set in the complex plane $\mathbb C$ and let $f : U \to \mathbb C$ be a function. The function ,is said to be analytic (or holomorphic) on $U$ if for every $z_0 \in U$, there exists an open disk $D$ centered at $z_0$ such that $f$ is differentiable at every point in $D$.

### Residue & Residue Theorem

$$
\begin{align*}
\Res(f, z_0) &= \lim\limits_{z \to z_0} (z-z_0) f(z) \tag{Simple Pole}\\
\Res(f, z_0) &= \frac{1}{(m-1)!}\lim\limits_{z \to z_0} \frac{\mathrm d^{m-1}}{\mathrm dz^{m-1}}((z-z_0)^m f(z))  \tag{Higher-Order Pole}\\
\end{align*}
$$

The **residue** of a function $f(z)$ at an isolated singularity $z = a$ is the coefficient $c_{-1}$ of the $(z - a)^{-1}$ term in its Laurent series expansion around $a$. Formally, if $f(z)$ has a Laurent series expansion $f(z) = \sum_{n=-\infty}^{\infty} c_n (z - a)^n$, then the residue of $f$ at $a$, denoted $\text{Res}(f, a)$, is $c_{-1}$. Residues are defined for functions with isolated singularities (removable, poles, or essential singularities). Essential Singularity requires direct computation of the Laurent series coefficient $c_{-1}$.
$$
\oint_C f(z)\,\mathrm{d}z=2\pi i\sum_{k=1}^n \Res(f,a_k)  \tag{Residue Theorem}
$$

**Residue Theorem**: For an analytic function $f(z)$ on an open set $D$ and a simple closed curve $C$ that encircles counterclockwise all the isolated singularities $a_1,a_2,\ldots,a_n$ of $f(z)$, then the integral of $f(z)$ along $C$ can be expressed as the sum of the residues of $f(z)$ at these singularities. And $\operatorname{Res}(f,a_k)$ denotes the residue of $f(z)$ at the point $a_k$.

### Laurent Series

The Laurent series for a complex function $f(z)$ about a point $c$ is given by
$$
f(z) = \sum^{\infty}_{n=-\infty} a_n(z-c)^n\\
a_n = \frac{1}{2\pi i} \oint_\gamma \frac{f(z)}{(z-c)^{n+1}}\mathrm{d}z
$$
The path of integration $\gamma$ is counterclockwise around a Jordan curve enclosing $c$ and lying in an annulus $A$ in which $f(z)$ is holomorphic (analytic). The expansion for $f(z)$ will then be valid anywhere inside the annulus.

### Analytic Function

$$
f(z) = \sum_{n=0}^\infty c_n (z - z_0)^n  \tag{Analytic Function}
$$

Analytic function $f$ is a complex function on an open set $D$ in the real line if for any $x_0 \in D$, it can be expanded into a power series. Where the coefficients $a_i \in \mathbb R$.

### Meromorphic Function

A meromorphic function on an open subset $D$ of the complex plane is a function that is holomorphic on all of $D$ except for a set of isolated points, which are poles of the function.
