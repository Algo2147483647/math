# Real Value Function

[TOC]

## Define

> A real-valued function assigns a real number to each point of its domain.

$$
f: \mathbb R \to \mathbb R
$$

For multivariate real-valued functions,
$$
f: \mathbb R^n \to \mathbb R
$$

## Properties

### Basic Properties

- Boundedness: A function is bounded if its values stay within fixed limits.
- Differentiability: A function is differentiable at a point if it has a well-defined derivative there. 
- Periodicity: $f(x + T) = f(x)$, A function is periodic if its values repeat after a fixed interval $T>0$. The number $T$ is called a *period* of the function.
- Odd and even symmetry
  - Odd function: $f(-x) = -f(x)$. An odd function is symmetric about the origin.
  - Even function: $f(-x) = f(x)$. An even function is symmetric about the $y$-axis.

### Limit

$$
\lim_{x\rightarrow a}f(x)=L
\Leftrightarrow
\forall\epsilon > 0,\exists\delta > 0,\text{ s.t. }0 < |x - a|<\delta\Rightarrow|f(x)-L|<\epsilon
$$

No matter how small a tolerance $\epsilon > 0$ we demand around $L$, there exists a sufficiently small distance $\delta > 0$ around $a$ such that whenever $x$ is within $\delta$ of $a$, but $x \neq a$, $f(x)$ is within $\epsilon$ of $L$.

> A limit means that every desired degree of closeness in the output can be guaranteed by sufficient closeness in the input.

#### Properties

- Uniqueness: if $\lim\limits_{x\rightarrow a}f(x)$ exists, then it is unique.
- Local boundedness: if $\lim_{x\rightarrow a}f(x)=L$, then $f$ is bounded in some deleted neighborhood of $a$.
- Local sign preservation: if $\lim_{x\rightarrow a}f(x)=L>0$ (or $L<0$), then $f(x)>0$ (or $f(x)<0$) near $a$.
- Squeeze theorem:
  $$
  g(x) \le f(x) \le h(x),\quad \lim_{x\to a} g(x)=\lim_{x\to a} h(x)=L
  \Rightarrow
  \lim_{x\to a} f(x)=L
  $$
- Heine's theorem: $\lim_{x\to x_0} f(x)=L$ iff for every sequence $x_n \to x_0$ with $x_n \ne x_0$, we have $f(x_n)\to L$.

#### Infinitesimal equivalents

Equivalent infinitesimal formulas as $x \to 0$:
$$
\begin{align*}
\sin x &\sim x\\
\tan x &\sim x\\
\arcsin x &\sim x\\
\arctan x &\sim x\\
1-\cos x &\sim \frac{x^2}{2}\\
e^x-1 &\sim x\\
\ln(1+x) &\sim x\\
a^x-1 &\sim x\ln a\\
(1+x)^\alpha-1 &\sim \alpha x
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

> The important difference between Limit and Continuity is that continuity includes $x=a$ and explicitly connects the nearby values of $f(x)$ to the actual value $f(a)$.

#### Discontinuity Classification

- Removable discontinuity: $\displaystyle \lim_{x\to a}f(x)$ exists and is finite, but $f(a)$ is missing or unequal to the limit. Typical behavior is a hole.
- Jump discontinuity: Both one-sided limits exist and are finite, but are unequal. Typical behavior is a finite jump.
- Discontinuity of the second kind: At least one one-sided limit does not exist as a finite real number. Typical behavior is Infinite or oscillatory behavior

#### Properties

- Local boundedness
- Local sign preservation
- Closure under addition, multiplication, and division by nonzero continuous functions

### Differential

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

- **Rolle's theorem**: If $f$ is continuous on $[a,b]$, differentiable on $(a,b)$, and $f(a)=f(b)$, then there exists $\xi\in(a,b)$ such that $f'(\xi)=0$.

- **Lagrange mean value theorem**: If $f$ is continuous on $[a,b]$ and differentiable on $(a,b)$, then there exists $\xi\in(a,b)$ such that
  $$
  f(b)-f(a)=f'(\xi)(b-a)
  $$
  
- **Cauchy mean value theorem**: If $f$ and $g$ are continuous on $[a,b]$ and differentiable on $(a,b)$, then there exists $\xi\in(a,b)$ such that
  $$
  [f(b)-f(a)]g'(\xi)=[g(b)-g(a)]f'(\xi)
  $$

- **Fermat's theorem on stationary points**: If $f$ has a local maximum or minimum at an interior point $c$ and is differentiable at $c$, then $f'(c)=0$.

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

The Riemann integral is defined as the limit of Riemann sums,

$$
\int_a^b f(x)\,dx
=
\lim_{\|P\|\to 0}\sum_{i=1}^n f(\xi_i)\Delta x_i.
$$

If $F'(x)=f(x)$, then by the Fundamental Theorem of Calculus,

$$
\int_a^b f(x)\,dx=F(b)-F(a).
$$

#### Properties

* **Linearity:**

  $$
  \int_a^b(\alpha f+\beta g)\,dx
  =
  \alpha\int_a^b f\,dx+\beta\int_a^b g\,dx.
  $$

* **Additivity over intervals:** For $c\in[a,b]$,

  $$
  \int_a^b f\,dx
  =
  \int_a^c f\,dx+\int_c^b f\,dx.
  $$

* **Comparison theorem:** If $f(x)\le g(x)$ on $[a,b]$, then

  $$
  \int_a^b f(x)\,dx\le\int_a^b g(x)\,dx.
  $$

* **Integral mean value theorem:** If $f$ is continuous on $[a,b]$, then some $\xi\in[a,b]$ satisfies

  $$
  \int_a^b f(x)\,dx=f(\xi)(b-a).
  $$

#### Major Integral Theorems

* **Green's theorem:** For a positively oriented simple closed curve $C=\partial D$,

  $$
  \oint_C P\,dx+Q\,dy
  =
  \iint_D
  \left(
  \frac{\partial Q}{\partial x}
  -
  \frac{\partial P}{\partial y}
  \right)dA.
  $$

* **Gauss's divergence theorem:** For a region $V$ with boundary surface $\partial V$,

  $$
  \iint_{\partial V}\mathbf F\cdot\mathbf n\,dS
  =
  \iiint_V\nabla\cdot\mathbf F\,dV.
  $$

* **Stokes' theorem:** For an oriented surface $S$ with boundary $\partial S$,

  $$
  \oint_{\partial S}\mathbf F\cdot d\mathbf r
  =
  \iint_S(\nabla\times\mathbf F)\cdot\mathbf n\,dS.
  $$

I would separate **Green, Gauss, and Stokes** from “Properties,” since they are integral theorems in vector calculus rather than properties of the one-dimensional Riemann integral.


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

