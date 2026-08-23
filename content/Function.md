# Function

[TOC]

## Define

> A function assigns each input in its domain exactly one output in its codomain.

$$
f: X \to Y  \tag{Function}
$$
$$
\forall x \in X, \exists_{= 1} y \in Y, f(x) = y
$$
Mapping, refer to a [binary relation](./Relation.md) from the element of set $X$ to that of set $Y$, and satisfy any element in $X$ has a unique element in $Y$ corresponding to it (One-to-many is not allowed).

$X$: domain of Definition.

### Injective

$$
\forall x, x', f(x) = f(x') \Rightarrow x = x'
$$
Each mapped element $y$ has a unique element $x$ corresponding to it.

### Surjection

$$
\forall y \in Y, \exists x \in X, f(x) = y
$$
Each element $y$ in set $Y$ has a element $x$ in set $X$ corresponding to it.

### Bijection, One-to-One Correspondence

$$
\forall y \in Y, \exists_{= 1} x \in X, f(x) = y
$$
A map that is both injective and surjective. Each element $y$ in set $Y$ has a unique element $x$ in set $X$ corresponding to it. Meanwhile, each element $x$ in set $X$ has a unique element $y$ in set $Y$ corresponding to it.

<img src="assets/R-16983288702011.png" alt="R" style="zoom: 30%;" />

## Properties

* Inverse Function
  if $f$ is a bijection, its inverse function is $f^{-1}(b) = a \Leftrightarrow f(a) = b$

### Convolution

When the relevant integrability conditions hold, the convolution of two functions is
$$
(f * g)(t) = \int_{-\infty}^{\infty} f(\tau) g(t-\tau)\, d\tau.
$$

Convolution is an operation on functions rather than a standalone object node.

### Hilbert Transform

For a suitable function $u$, the Hilbert transform is the principal-value singular integral
$$
H(u)(t) = \operatorname{p.v.}\frac{1}{\pi} \int_{-\infty}^{\infty} \frac{u(\tau)}{t-\tau}\, d\tau.
$$

### Laplace Transform

For a suitable function $f$, the Laplace transform is
$$
\mathcal L f(s) = \int_0^{\infty} f(t) e^{-st}\, dt.
$$

These transforms are standard operations on functions, so they are stored here instead of as standalone nodes.
