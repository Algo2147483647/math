# Quadratic Function

[TOC]

## Define

> A quadratic function is a polynomial function whose highest-degree term has degree two.

$$
\begin{align*}
  f(x) &= a x^2 + b x + c  \tag{Univariate Quadratic}  \\
  f(\boldsymbol x) &= \boldsymbol x^T \boldsymbol A \boldsymbol x + \boldsymbol b \boldsymbol x + c  \tag{Multivariate}  \\
    &= \sum_{i=1}^{\dim} \sum_{j=1}^{\dim} a_{ij} · x_i x_j + \sum_{i=1}^{\dim} b_i x_i + c
\end{align*}
$$

## Properties

### Zero Set of Quadratic Function, Quadric Surface

Quadric Surface is the zero set of a quadratic function,
$$
\begin{align*}
  &\{ \boldsymbol x \ |\ \boldsymbol x^T \boldsymbol A \boldsymbol x + \boldsymbol b \boldsymbol x + c = 0\} \tag{Quadric Surface}\\
\Leftrightarrow &\left\{ \boldsymbol x' \ |\ \boldsymbol x'^T \boldsymbol A' \boldsymbol x' = 0, \boldsymbol x' = \left(\begin{matrix} \boldsymbol x \\ 1 \end{matrix}\right)\right\}
\end{align*}
$$

#### Solution of Univariate Quadratic Equation  
For the given parameters $a, b, c$, and a univariate quadratic equation,
$$
f(x) = a x^2 + b x + c = 0
$$

The solutions of equation are, 
$$
\begin{align*}
  x &= \frac{- b \pm \sqrt{Δ}}{2 a}\\
  Δ &= b^2 - 4 a c
\end{align*}
$$
Properties of solutions, 
- $Δ > 0$, Two real roots
- $Δ = 0$, A real double root
- $Δ < 0$, Two complex roots

##### Sphere & Spherical Surface

For $\boldsymbol A = \boldsymbol I, \boldsymbol b = \boldsymbol 0, c = -r^2$ of a Quadratic Function,
$$
\begin{align*}
  &\{ \boldsymbol x \ |\ \|\boldsymbol x - \boldsymbol x_c\|_2 \le r < 0\}  \tag{Sphere}\\
\Leftrightarrow\quad &\{ \boldsymbol x \ |\ (\boldsymbol x - \boldsymbol x_c)^T (\boldsymbol x - \boldsymbol x_c) \le r^2 < 0\}  \\
\Leftrightarrow\quad &\{ \boldsymbol x_c + r \boldsymbol u \ |\ \|\boldsymbol u\|_2 \le r < 0\}
\end{align*}
$$

$$
\{ \boldsymbol x \ |\ \|\boldsymbol x - \boldsymbol x_c\|_2 = r \}  \tag{Spherical Surface}\\
$$

Spherical Surface is a point set with a constant distance value $r$ from the center point $\boldsymbol x_c$.

<img src="./assets/Sphere_Quadric.png" alt="img" style="zoom:18%;" />

Property:
- Sphere is a convex set

##### Ellipsoid & Ellipsoid Surface

In a Quadratic Function, if $\boldsymbol A = \boldsymbol P^{-1}, \boldsymbol b = \boldsymbol 0, c = -1$ is a positive definite matrix, the zero set of the function is an Ellipsoid Surface,

$$
\begin{align*}
  &\left\{ \boldsymbol x \ |\ (\boldsymbol x - \boldsymbol x_c)^T \boldsymbol P^{-1} (\boldsymbol x - \boldsymbol x_c) \le 1, \boldsymbol P = \boldsymbol P^T ⪰ 0 \right\}  \tag{Ellipsoid}\\
  \Leftrightarrow\quad &\{ \boldsymbol x_c + \boldsymbol A \boldsymbol u \ |\ \|\boldsymbol u\|_2 \le 1\}
\end{align*}
$$

$$
\{ \boldsymbol x \ |\ (\boldsymbol x - \boldsymbol x_c)^T \boldsymbol P^{-1} (\boldsymbol x - \boldsymbol x_c) = 1, \boldsymbol P = \boldsymbol P^T ⪰ 0\}  \tag{Ellipsoid Surface}
$$

<img src="./assets/Ellipsoid_Quadric.png" alt="img" style="zoom:18%;" />

Property:

- Ellipsoid is a convex set

##### Hyperboloid

if $\boldsymbol A$ is a non-positive definite matrix.

Hyperboloid of one sheet, Hyperboloid of two sheets, Conical surface in between

<img src="./assets/Hyperboloid_Of_Two_Sheets_Quadric.png" alt="img" style="zoom: 18%;" />

<img src="./assets/Hyperboloid_Of_One_Sheet_Quadric.png" alt="img" style="zoom:18%;" />

##### Paraboloid

<img src="./assets/Paraboloid_Quadric.png" alt="img" style="zoom:20%;" />

<img src="./assets/Hyperbolic_Paraboloid_Quadric.png" alt="img" style="zoom:18%;" />

##### Cylinder & Cylinder Surface

<img src="./assets/Elliptic_Cylinder_Quadric.png" alt="img" style="zoom:18%;" />

<img src="./assets/Hyperbolic_Cylinder_Quadric.png" alt="img" style="zoom:18%;" />

<img src="./assets/Parabolic_Cylinder_Quadric.png" alt="img" style="zoom:18%;" />

##### Cone

<img src="./assets/Circular_Cone_Quadric.png" alt="img" style="zoom:18%;" />
