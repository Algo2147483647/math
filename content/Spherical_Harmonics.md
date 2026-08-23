# Spherical Harmonics

[TOC]

## Define

> Spherical harmonics are special functions on the sphere that form angular modes for rotationally symmetric problems.

$$
Y_l^m(\theta, \phi) = \sqrt{\frac{(2l+1)}{4\pi} \frac{(l-m)!}{(l+m)!}}  P_l^m(\cos \theta)  e^{im\phi}
$$

**Spherical harmonics** $Y_l^m(\theta, \phi)$ are a set of complex-valued functions defined on the unit sphere $S^2$, form an orthogonal basis of functions. They serve as the eigenfunctions of the angular part of Laplace's equation $\nabla^2 f = 0$ in spherical coordinates and constitute a complete set of simultaneous eigenfunctions for the squared angular momentum operator $\hat{L}^2$ and the z-component angular momentum operator $\hat{L}_z$. The associated Legendre polynomials $ P_l^m(\cos \theta) $ constitute the polar angle ($\theta$) component of these functions.

- $l$: Degree, non-negative integer $l = 0, 1, 2, \ldots$, determines the angular "frequency" or scale of variation of the function, analogous to the harmonic order in a Fourier series.
- $m$: Order, integer $|m| \leq l$, determines the dependence or pattern of variation of the function in the azimuthal $\phi$ direction.
- $\theta$: Polar angle, $0 \leq \theta \leq \pi$, defined as the angle down from the positive $z$-axis (North Pole).
- $\phi$: Azimuthal angle, $0 \leq \phi < 2\pi$, defined as the angle of rotation around the $z$-axis within the $xy$-plane.
- $(-1)^m$: Phase factor, known as the Condon-Shortley phase (commonly used in physics), is included in the standard definition of the associated Legendre functions $P_l^m$.

![Sphericalfunctions](./assets/Sphericalfunctions.svg)

### Associated Legendre Polynomials

$$
\begin{align*}
P_l(x) &= \frac{1}{2^l l!} \frac{\mathrm d^l}{\mathrm dx^l} (x^2 - 1)^l  \tag{Legendre}\\
P_l^m(x) &= (-1)^m (1 - x^2)^{m/2} \frac{\mathrm d^m}{\mathrm dx^m} P_l(x) \tag{Associated Legendre}
\end{align*}
$$

**Legendre Polynomials** are defined as an orthogonal system with respect to the weight function $w(x) = 1$ over the interval $[−1,1]$. They satisfy Legendre's differential equation:
$$
\begin{align*}
\int_{-1}^{1} P_m(x) P_n(x)  dx &= \frac{2}{2n+1} \delta_{mn}\\
(1 - x^2) \frac{d^2 y}{dx^2} - 2x \frac{dy}{dx} + n(n+1) y &= 0  \tag{Legendre's differential equation}  \\
\frac{1}{\sqrt{1 - 2xt + t^2}} &= \sum_{n=0}^{\infty} P_n(x) t^n, \quad |t| < 1 \tag{Generating Function}
\end{align*}
$$

$$
(l+1) P_{l+1}(x) = (2l+1) x P_l(x) - l P_{l-1}(x) \\
P_0(x) = 1\\
P_1(x) = x  \tag{Recurrence Relation}
$$

**Associated Legendre polynomials** $P_l^m(x)$ are a set of real-valued functions defined on the interval $[-1, 1]$, which can be derived from the Legendre polynomials $P_l(x)$.
$$
(l-m) P_l^m(x) = x (2l-1) P_{l-1}^m(x) - (l+m-1) P_{l-2}^m(x)
$$

- $x \in [-1, 1]$, $x = \cos \theta$
- $\delta_{mn}$ is the Kronecker delta.

## Properties

Rotational invariance: 

Orthogonality:
$$
\int_0^{2\pi} \int_0^\pi Y_l^m(\theta, \phi)  \left[ Y_{l'}^{m'}(\theta, \phi)\right]^*  \sin\theta  \mathrm d\theta \mathrm  d\phi = \delta_{ll'} \delta_{mm'}
$$

Completeness: 对于任意与球体同胚的函数, 可以通过球谐函数作为标准正交基实现级数展开.
$$
\begin{align*}
f(\theta,\phi) &= \sum_{l=0}^{\infty} \sum_{m=-l}^{l} c_{lm} Y_l^m(\theta,\phi)\\
c_l^m &= \int_{S^2} f(\theta, \phi) Y_l^{m*}(\theta, \phi) \, d\Omega
\end{align*}
$$

Associated Legendre Polynomials
$$
P_n(-x) = (-1)^n P_n(x)
$$

$$
P_l^{-m}(x) = (-1)^m \frac{(l-m)!}{(l+m)!} P_l^m(x)
$$

Orthogonality:
$$
\begin{align*}
\int_{-1}^1 P_l(x) P_{l'}(x) \mathrm dx &= \frac{2}{2l+1} \delta_{ll'}\\
\int_{-1}^{1} P_k^m(x) P_l^m(x)  \mathrm  dx &= \frac{2}{2l + 1} \frac{(l + m)!}{(l - m)!} \delta_{kl}  \\
\end{align*}
$$

Roots: All $n$ roots of $P_n(x)$ are real, distinct, and lie in (-1, 1).
