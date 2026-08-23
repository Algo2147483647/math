# Exponential Function

[TOC]

## Define

> The exponential function is the function whose rate of change is proportional to its current value.

Trigonometric functions $f: \mathbb R \to \mathbb R$ are a set of mathematical [functions](./Function.md) that relate angles $\theta$ to the ratios of the sides (opposite $a$, adjacent $b$, hypotenuse $c$) of a right-angled triangle. Where hypotenuse is the length of the side opposite the right angle, opposite represents the side opposite the given angle $\theta$, adjacent represents the side between the angle $\theta$ and the right angle.

$$
\begin{align*}
  \sin(\theta) &= \frac{a}{c}  \quad\in [-1, 1]\tag{sine}\\
  \cos(\theta) &= \frac{b}{c}  \quad\in [-1, 1]\tag{cosine}\\
  \tan(\theta) &= \frac{a}{b}  \quad\in (-\infty, +\infty)\tag{tangent}
\end{align*}
$$

Hyperbolic Functions $f: \mathbb R \to \mathbb R$ are defined by hyperbola $x^2 - y^2 = 1$, where the angles $\theta$ refer to twice the included angle of the ray from zero point to the point in hyperbola and positive half of x-axis, $\sinh(\theta)$ is the coordinate value $x$ of the point, and $\cosh(\theta)$ is the coordinate value $y$ of the point.

For the complex field $z \in \mathbb C$, the exponential function with an imaginary argument is defined by Euler's formula:

$$
e^{i \pi} + 1 = 0  \tag{Euler's formula}
$$

$$
e^{iz} = \cos(z) + i \sin(z)
$$

$$
\begin{align*}
\sin(z)  &= \frac{e^{iz} - e^{-iz}}{2i} \tag{sine}\\
\cos(z)  &= \frac{e^{iz} + e^{-iz}}{2} \tag{cosine}\\
\tan(z)  &= \frac{\sin(z)}{\cos(z)} = \frac{e^{iz} - e^{-iz}}{ie^{iz} + ie^{-iz}} \tag{tangent}\\
\sinh(z) &= \frac{e^{z} - e^{-z}}{2}  \tag{hyperbolic sine}\\
\cosh(z) &= \frac{e^{z} + e^{-z}}{2}  \tag{hyperbolic cosine}\\
\tanh(z) &= \frac{\sinh(z)}{\cosh(z)} = \frac{e^{-z} - e^{z}}{e^{z} + e^{-z}} \tag{hyperbolic tangent} \\
\end{align*}
$$

## Properties

### Periodicity

Trigonometric functions are periodic functions. The period of $\sin(\cdot), \cos(\cdot)$ is $2 k \pi$, period of $\tan(\cdot)$ is $k \pi$, $k \in \mathbb Z$,
$$
\begin{align*}
  \sin(\theta + 2 k \pi) &= \sin(\theta)  \\
  \cos(\theta + 2 k \pi) &= \cos(\theta)  \\
  \tan(\theta + k \pi) &= \tan(\theta)  \\
\end{align*}
$$

### Combinations of Trigonometric functions

**Identity**:
$$
\begin{align*}
\cos^2(a) + \sin^2(a) &= 1\\
1 + \tan^2(a) &= \frac{1}{\cos^2(a)}
\end{align*}
$$

**Double-Angle Formulas & Half-Angle Formulas**:
$$
\begin{align*}
\sin(2a) &= 2\sin(a) \cos(b) \\
\cos(2a) &= \cos(a)^2  - \sin^2(a)  \\
\tan(2a) &= \frac{2 \tan(a)}{1 - \tan^2(a)}\\
  \sin(3a) &= 3\sin(a) - 4\sin^3(a) \\
  \cos(3a) &= 4\cos^3(a) - 3\cos(a) \\
\sin\left(\frac{\theta}{2}\right) &= \pm \sqrt{\frac{1 - \cos(\theta)}{2}} \\
\cos\left(\frac{\theta}{2}\right) &= \pm \sqrt{\frac{1 + \cos(\theta)}{2}} \\
\tan\left(\frac{\theta}{2}\right) &= \pm \sqrt{\frac{1 - \cos(\theta)}{1 + \cos(\theta)}}
\end{align*}
$$

*The sign ($\pm$) is determined by the quadrant in which $\frac{\theta}{2}$ lies.*

**Angle Addition Formulas**:
$$
\begin{align*}
  \sin(a \pm b) &= \sin(a) \cos(b) \pm \cos(a) \sin(b)  \\
  \cos(a \pm b) &= \cos(a) \cos(b) \mp \sin(a) \sin(b)  \\
  \tan(a \pm b) &= \frac{\tan(a) \pm  \tan(b)}{1 \mp \tan(a) \tan(b)}
\end{align*}
$$
**Product-to-Sum Formulas & Sum-to-Product**: 
$$
\begin{align*}
\sin(a)\cos(b) &= \frac{\sin(a + b) + \sin(a - b)}{2}  \\
\sin(a)\sin(b) &= \frac{\cos(a + b) - \cos(a - b)}{2}  \\
\cos(a)\cos(b) &= \frac{\cos(a + b) + \cos(a - b)}{2}  \\
\sin(a) + \sin(b) &= 2 \sin\left(\frac{a+b}{2}\right) \cos\left(\frac{a-b}{2}\right) \\
\sin(a) - \sin(b) &= 2 \cos\left(\frac{a+b}{2}\right) \sin\left(\frac{a-b}{2}\right) \\
\cos(a) + \cos(b) &= 2 \cos\left(\frac{a+b}{2}\right) \cos\left(\frac{a-b}{2}\right) \\
\cos(a) - \cos(b) &= -2 \sin\left(\frac{a+b}{2}\right) \sin\left(\frac{a-b}{2}\right)
\end{align*}
$$
**Linear Combinations**: 
$$
a \sin(\theta) + b \cos(\theta) = \sqrt{a^2 + b^2} \sin \left(\theta + \arctan\left(\frac{b}{a}\right) \right)
$$

#### Law of Sines and Law of Cosines
These relate the angles and sides of any triangle (not just right-angled).

**Law of Sines:**
$$
\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C} = 2R
$$

(where $a, b, c$ are sides, $A, B, C$ are opposite angles, and $R$ is the radius of the circumscribed circle).

**Law of Cosines (Generalized Pythagorean Theorem):**
$$
c^2 = a^2 + b^2 - 2ab\cos(C)
$$

### Derivatives
$$
\begin{align*}
\frac{d}{dx} \sin(x) &= \cos(x) \\
\frac{d}{dx} \cos(x) &= -\sin(x) \\
\frac{d}{dx} \tan(x) &= \frac{1}{\cos^2(x)} \\
\frac{d}{dx} \frac{1}{\sin(x)} &= -\frac{1}{\sin(x)\tan(x)}\\
\frac{d}{dx} \frac{1}{\cos(x)} &= \frac{\tan(x)}{\cos(x)} \\
\frac{d}{dx} \frac{1}{\tan(x)} &= -\frac{1}{\sin^2(x)} \\
\end{align*}
$$

Chain Rule Applications. For a function $u = u(x)$:
$$
\begin{align*}
\frac{d}{dx} \sin(u) &= \cos(u) \cdot \frac{du}{dx} \\
\frac{d}{dx} \cos(u) &= -\sin(u) \cdot \frac{du}{dx} \\
\frac{d}{dx} \tan(u) &= \frac{1}{\cos^2(x)} \cdot \frac{du}{dx}
\end{align*}
$$

The derivatives of sine and cosine are **periodic**. This creates a cycle every 4 derivatives.
$$
\begin{align*}
f(x) &= \sin(x) \\
f'(x) &= \cos(x) \\
f''(x) &= -\sin(x) \\
f'''(x) &= -\cos(x) \\
f^{(4)}(x) &= \sin(x) \\
&\vdots
\end{align*}
$$

### Integrals

$$
\begin{align*}
\int \sin(x) \, dx &= -\cos(x) + C \\
\int \cos(x) \, dx &= \sin(x) + C \\
\int \tan(x) \, dx &= -\ln|\cos(x)| + C \\\
\int \frac{1}{\sin(x)} \, dx &= \ln|\frac{1}{\sin(x)} - \frac{1}{\tan(x)}| + C \\
\int \frac{1}{\cos(x)} \, dx &= \ln|\frac{1}{\cos(x)} + \tan(x)| + C \\
\int \frac{1}{\tan(x)} \, dx &= \ln|\sin(x)| + C \\
\end{align*}
$$
