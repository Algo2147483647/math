# Real Value Function

[TOC]

## Define

> A real-valued function assigns a real number to each point of its domain.

$$
f: \mathbb R \to \mathbb R
$$

A real-valued function is a [function](./Function.md) from [real numbers](./Real_Field.md) to real numbers.

For multivariate real-valued functions:
$$
f: \mathbb R^n \to \mathbb R
$$

## Properties

### Basic Properties

- Boundedness
- Differentiability
- Periodicity: $f(x + T) = f(x)$, where $T$ is a period
- Odd and even symmetry
  - Odd function: $f(-x) = -f(x)$
  - Even function: $f(-x) = f(x)$

### Limit

$$
\lim_{x\rightarrow a}f(x)=L
\Leftrightarrow
\forall\epsilon > 0,\exists\delta > 0,\text{ s.t. }0 < |x - a|<\delta\Rightarrow|f(x)-L|<\epsilon
$$

#### Properties

- Uniqueness: if $\lim_{x\rightarrow a}f(x)$ exists, then it is unique.
- Local boundedness: if $\lim_{x\rightarrow a}f(x)=L$, then $f$ is bounded in some deleted neighborhood of $a$.
- Local sign preservation: if $\lim_{x\rightarrow a}f(x)=L>0$ (or $L<0$), then $f(x)>0$ (or $f(x)<0$) near $a$.
- Squeeze theorem:
  $$
  g(x) \le f(x) \le h(x),\quad \lim_{x\to a} g(x)=\lim_{x\to a} h(x)=L
  \Rightarrow
  \lim_{x\to a} f(x)=L
  $$
- Heine's theorem: $\lim_{x\to x_0} f(x)=L$ iff for every sequence $x_n \to x_0$ with $x_n \ne x_0$, we have $f(x_n)\to L$.

Equivalent infinitesimal formulas as $x \to 0$:
$$
\begin{align*}
\sin x &\sim x\\
\tan x &\sim x\\
1 - \cos x &\sim\frac{1}{2}x^2\\
e^x - 1 &\sim x\\
\ln(1 + x) &\sim x
\end{align*}
$$

#### Limit Operation Rules

- Addition and subtraction:
  $$
  \lim_{x\rightarrow a}(f(x)\pm g(x))=\lim_{x\rightarrow a}f(x)\pm \lim_{x\rightarrow a}g(x)
  $$
- Multiplication:
  $$
  \lim_{x\rightarrow a}(f(x)g(x))=\lim_{x\rightarrow a}f(x)\lim_{x\rightarrow a}g(x)
  $$
- Division:
  $$
  \lim_{x\rightarrow a}\frac{f(x)}{g(x)}=\frac{\lim_{x\rightarrow a}f(x)}{\lim_{x\rightarrow a}g(x)}
  \quad \text{if } \lim_{x\to a}g(x)\ne0
  $$
- Composite functions: if $\lim_{x \to x_0}g(x)=u_0$ and $\lim_{u \to u_0}f(u)=A$, then $\lim_{x \to x_0}f(g(x))=A$ under the usual composition hypotheses.

### Continuity

A function $f$ is continuous at $x_0$ if
$$
\lim_{x\to x_0} f(x)=f(x_0)
$$

#### Discontinuity Classification

- Removable discontinuity
- Jump discontinuity
- Discontinuity of the second kind

#### Properties

- Local boundedness
- Local sign preservation
- Closure under addition, multiplication, and division by nonzero continuous functions

### Differential: Derivative and Partial Derivative

$$
f'(x) = \lim_{\Delta x \to 0} \frac{f(x+\Delta x)-f(x)}{\Delta x}
\tag{Derivative}
$$

For a multivariate function $f(x_1,\dots,x_n)$,
$$
\frac{\partial f}{\partial x_i}
=
\lim_{\Delta x_i\to0}
\frac{f(\ldots,x_i+\Delta x_i,\ldots)-f(\ldots,x_i,\ldots)}{\Delta x_i}
\tag{Partial derivative}
$$

Higher-order derivatives are denoted by
$$
f^{(n)}(x)=\frac{\mathrm d^n f}{\mathrm dx^n},
\qquad
\frac{\partial^2 f}{\partial x_j \partial x_i}
=
\frac{\partial}{\partial x_j}\left(\frac{\partial f}{\partial x_i}\right)
$$

#### Properties

- Necessary condition for differentiability: differentiability implies the relevant partial derivatives exist.
- A standard sufficient condition: if the partial derivatives are continuous in a neighborhood, then the function is differentiable there.
- Arithmetic rules:
  $$
  \begin{align*}
  (u\pm v)'&=u'\pm v'\\
  (uv)' &= u'v + uv'\\
  (cu)'&=cu'\\
  \left(\frac{u}{v}\right)'&=\frac{u'v - uv'}{v^{2}} \quad (v\neq0)
  \end{align*}
  $$
- Chain rule:
  $$
  \frac{\mathrm d z}{\mathrm d x} = \frac{\mathrm d z}{\mathrm d y} \cdot \frac{\mathrm d y}{\mathrm d x}
  $$
- Chain rule for partial derivatives:
  $$
  \begin{align*}
  \frac{\partial z}{\partial x}&=\frac{\partial z}{\partial u}\frac{\partial u}{\partial x}+\frac{\partial z}{\partial v}\frac{\partial v}{\partial x}\\
  \frac{\partial z}{\partial y}&=\frac{\partial z}{\partial u}\frac{\partial u}{\partial y}+\frac{\partial z}{\partial v}\frac{\partial v}{\partial y}
  \end{align*}
  $$
- Derivative of the inverse function:
  $$
  (f^{-1})'(x)=\frac{1}{f'(y)}
  $$
- L'Hospital's rule for $0/0$ or $\infty/\infty$ forms under the usual hypotheses.

### Taylor's Theorem

If $f$ is sufficiently differentiable at $x=a$, then
$$
f(x) = f(a) + \sum_{i=1}^k \frac{f^{(i)}(a)}{i!}(x-a)^i + o(|x-a|^k)
$$

### Mean Value Theorems

- Rolle's theorem
- Lagrange mean value theorem:
  $$
  f(b)-f(a)=f'(\xi)(b-a)
  $$
- Cauchy mean value theorem
- Fermat's theorem on stationary points

### Gradient, Divergence, and Curl

$$
\nabla f = \sum_{i=1}^{\dim} \frac{\partial f}{\partial x_i} \hat{\boldsymbol x_i}
=
\left(\begin{matrix}
\frac{\partial f}{\partial x_1} \\
\vdots \\
\frac{\partial f}{\partial x_{\dim}}
\end{matrix}\right)
\tag{Gradient}
$$

The gradient points in the direction of steepest increase.

$$
\nabla \cdot \boldsymbol f
=
\lim_{|V| \to 0} \frac{1}{|V|} \oint_{S(V)} \boldsymbol f \cdot \hat {\boldsymbol n} \, \mathrm d S
\tag{Divergence}
$$

In Cartesian coordinates,
$$
\nabla \cdot \boldsymbol f = \sum_{i=1}^{\dim} \frac{\partial f_i}{\partial x_i}
$$

The divergence measures the outward flux density of a vector field near a point.

$$
\nabla \times \boldsymbol f
=
\lim_{A \to 0} \frac{1}{|A|} \oint_{C} \boldsymbol f \cdot \mathrm d \boldsymbol r
\tag{Curl}
$$

In three-dimensional Cartesian coordinates,
$$
\begin{align*}
\nabla \times \boldsymbol f
=& \left(\frac{\partial f_z}{\partial y} - \frac{\partial f_y}{\partial z} \right) \hat{\boldsymbol x} \\
&+ \left(\frac{\partial f_x}{\partial z} - \frac{\partial f_z}{\partial x} \right) \hat{\boldsymbol y} \\
&+ \left(\frac{\partial f_y}{\partial x} - \frac{\partial f_x}{\partial y} \right) \hat{\boldsymbol z}
\end{align*}
$$

The curl measures local rotational tendency, with direction given by the right-hand rule.

#### Properties

- $\nabla \times (\nabla \phi) = 0$
- $\nabla \cdot (\nabla \times \boldsymbol F) = 0$
- $\nabla \cdot (\phi \boldsymbol F) = (\nabla \phi) \cdot \boldsymbol F + \phi (\nabla \cdot \boldsymbol F)$
- $\nabla \times (\phi \boldsymbol F) = (\nabla \phi) \times \boldsymbol F + \phi (\nabla \times \boldsymbol F)$

### Integral

$$
\int f(x) \, \mathrm d x  = F(x)  + C \tag{Indefinite Integral}
$$

The indefinite integral of $f$ is a family of antiderivatives $F$ such that $F'(x)=f(x)$.

#### Properties

- Integration by parts:
  $$
  \int u \, \mathrm d v = uv - \int v \, \mathrm d u
  $$
- Substitution:
  $$
  \int f(x)\,\mathrm dx=\int f(\varphi(t))\varphi'(t)\,\mathrm dt
  $$

### Riemann Integral

$$
\int_a^b f(x) \, \mathrm d x = F(b) - F(a)
\tag{Definite Integral}
$$

The definite integral can be defined as the limit of Riemann sums.

#### Properties

- Linearity
- Additivity over intervals
- Comparison theorem
- Integral mean value theorem
- Green's theorem
- Gauss's divergence theorem
- Stokes' theorem

### Monotonicity

If $f'(x)\ge 0$ on an interval, then $f$ is nondecreasing there. If $f'(x)\le 0$, then $f$ is nonincreasing there.

### Concavity and Convexity

For twice differentiable functions:

- $f''(x) \le 0$ suggests concavity
- $f''(x) \ge 0$ suggests convexity

### Differential Equation

$$
f \left(x, y, \frac{\mathrm d y}{\mathrm d x}, \frac{\mathrm d^2 y}{\mathrm dx^2}, ..., \frac{\mathrm d^n y}{\mathrm d x^n} \right) = 0
\tag{ODE}
$$

An ordinary differential equation relates an unknown function $y$ to derivatives with respect to a single variable.

$$
f \left(D^k u(x), ... , D^2 u(x), u(x), x \right) = 0
\tag{PDE}
$$

A partial differential equation relates an unknown function $u$ of several variables to its partial derivatives.
