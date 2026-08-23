# Dirac Delta Function

[TOC]

## Define

> The Dirac delta is a generalized function that represents unit mass concentrated at a single point.

The **Dirac delta** at $a\in\mathbb R$, denoted $\delta_a$, is not an ordinary real-valued function. It is a generalized function, or distribution, characterized by its action on test functions:
$$
\delta_a(\varphi)=\varphi(a).
$$

Equivalently, it is formally written as
$$
\int_{-\infty}^{\infty}\varphi(x)\delta(x-a)\,dx=\varphi(a).
$$

For $a=0$, one writes $\delta=\delta_0$:
$$
\int_{-\infty}^{\infty}\varphi(x)\delta(x)\,dx=\varphi(0).
$$

As a measure, the Dirac measure at $a$ is
$$
\delta_a(B)=
\begin{cases}
1, & a\in B,\\
0, & a\notin B,
\end{cases}
$$
for measurable sets $B$.

<img src="assets/Dirac_distribution_PDF.svg" alt="Dirac_distribution_PDF" style="zoom:15%;" />

## Properties

### Sampling Property

For a suitable function $f$,
$$
\int_{-\infty}^{\infty} f(t)\delta(t-T)\,dt=f(T).
$$

More generally,
$$
\int_{\mathbb R} f(x)\,\delta_a(dx)=f(a).
$$

### Shift

The shifted Dirac delta $\delta(x-a)$ represents unit mass at $x=a$.

### Scaling

For $c\neq 0$,
$$
\delta(cx)=\frac1{|c|}\delta(x).
$$
