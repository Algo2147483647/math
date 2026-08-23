# Holomorphic Function

[TOC]

## Define

> A holomorphic function is a complex function that is complex differentiable in a neighborhood of every point of its domain.

A holomorphic function is a complex-valued function on an open set $U$ if it is complex differentiable at every point of $U$.
$$
f'(z_0) = \lim\limits_{h \to 0} \frac{f(z_0 + h) - f(z_0)}{h}
$$

## Properties

Holomorphic functions are differentiable everywhere within their domain of definition.

$$
\frac{\partial f}{\partial \bar z} = 0
$$

### Cauchy-Riemann Equations

For a complex function $f(z) = u(x,y) + i v(x,y)$ to be differentiable (and hence analytic) at a point, where $u(x,y)$ and $v(x,y)$ are real and imaginary part respectively, the partial derivatives of $u, v$ must satisfy the Cauchy-Riemann equations at that point.
$$
\frac{\partial u}{\partial x} = \frac{\partial v}{\partial y}  \\ \quad \frac{\partial u}{\partial y} = -\frac{\partial v}{\partial x} \tag{Cauchy-Riemann Equations}
$$
