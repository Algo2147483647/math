# Bessel Function

[TOC]

## Define

> Bessel functions are special functions that naturally arise as radial solutions of differential equations with cylindrical symmetry.

[**Bessel functions**](./Function.md) are canonical solutions $y(x)$ of Bessel's differential equation
$$
x^{2}{\frac {\mathrm{d}^{2}y}{\mathrm{d}x^{2}}}+x{\frac {\mathrm{d}y}{\mathrm{d}x}}+\left(x^{2}-\alpha ^{2}\right)y=0\\
y(x)=c_{1}J_{\alpha }(x)+c_{2}Y_{\alpha }(x)
$$
**Bessel function of the first kind** $J_{\alpha}(x)$, are solutions of Bessel's differential equation. For integer or positive $α$, Bessel functions of the first kind are finite at the origin $(x = 0)$; while for negative non-integer $α$, Bessel functions of the first kind diverge as x approaches zero. The Bessel function can be defined by its Taylor series expansion at $x = 0$.
$$
J_{\alpha }(x)=\sum _{m=0}^{\infty }{\frac {(-1)^{m}}{m!\Gamma (m+\alpha +1)}}{\left({\frac {x}{2}}\right)}^{2m+\alpha}
$$
**Bessel functions of the second kind** $Y_{\alpha}(x)$, 
$$
Y_{\alpha }(x)={\frac {J_{\alpha }(x)\cos(\alpha \pi )-J_{-\alpha }(x)}{\sin(\alpha \pi )}}
$$

## Properties
