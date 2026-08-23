# Elliptic Integral

[TOC]

## Define

> Elliptic integrals are integrals involving square roots of cubic or quartic polynomials that generally cannot be expressed by elementary functions.

Elliptic integrals are integrals that cannot be expressed in terms of elementary functions. Elliptic integrals are most commonly expressed in three fundamental types, known as the Legendre canonical forms.
$$
\begin{align*}
F(\phi, k) &= \int_0^\phi \frac{\mathrm d \theta}{\sqrt{1 - k^2 \sin \theta}} = \int_0^t \frac{\mathrm d t}{\sqrt{(1-t^2)(1 - k^2 t^2)}} \tag{First Kind}\\
E(\phi, k) &= \int_0^\phi \sqrt{1 - k^2 \sin \theta} \mathrm d \theta \tag{Second Kind}\\
\Pi(n;\phi, k) &= \int_0^\phi \frac{\mathrm d \theta}{(1-n\sin^2\theta)\sqrt{1 - k^2 \sin \theta}} \tag{Third Kind}\\
\end{align*}
$$

## Properties

### Jacobi Elliptic Functions

For $u = F(\phi, k)$
$$
\text{sn}(u, k) = \sin(\phi)\\
\text{cn}(u, k) = \cos(\phi)\\
\text{dn}(u, k) = \sqrt{1 - k^2 \text{sn}^2 (u, k)}
$$

$$
\text{sn}^2(a) + \text{cn}^2(a) = 1 \\
\text{dn}^2(a) + k^2 \text{sn}^2(a) = 1
$$
