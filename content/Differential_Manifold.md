# Differential Manifold

[TOC]

## Define

> A smooth manifold is a space that locally looks like $\mathbb R^n$, and whose overlapping coordinate systems transform smoothly into one another.

A **differential manifold** $M$ of dimension $n$ is a [manifold](./Manifold.md) equipped with a differentiable structure.

A differentiable structure on $M$ is represented by a **smooth atlas** (chart set) 
$$
\mathcal A = \{(U_\alpha, \varphi_\alpha)\}
$$

where each chart $\varphi_\alpha:U_\alpha\to \varphi_\alpha(U_\alpha)\subseteq \mathbb R^n$ is a homeomorphism onto an open subset of $\mathbb R^n$, and the charts cover $M$ satisfy

$$
\bigcup_\alpha U_\alpha=M
$$

For any two overlapping charts $(U_{\alpha},\varphi_{\alpha}), (U_{\beta},\varphi_{\beta}) \in \mathcal A$ with $U_{\alpha}\cap U_{\beta}\neq\varnothing$, the transition maps

$$
\varphi_{\beta}\circ\varphi_{\alpha}^{-1}:\varphi_{\alpha}(U_{\alpha}\cap U_{\beta})\to\varphi_{\beta}(U_{\alpha}\cap U_{\beta})
$$

are smooth (infinitely differentiable $C^\infty$) map between open subsets of Euclidean spaces.

<img src="./assets/Two_coordinate_charts_on_a_manifold.svg" alt="Two_coordinate_charts_on_a_manifold"  />

## Properties

### Maximal Smooth Atlas

A maximal smooth atlas is a smooth atlas that contains every chart compatible with it. A smooth structure may be viewed either as:

- a maximal smooth atlas, or
- an equivalence class of mutually compatible smooth atlases.

This avoids treating a particular choice of coordinates as part of the intrinsic manifold.

### Smooth Functions and Smooth Maps

#### Smooth Function

For a smooth manifold $M$, the set of smooth real-valued functions on $M$ is denoted by
$$
C^\infty(M)=\{f:M\to\mathbb R\mid f \text{ is smooth}\}.
$$

A function $f:M\to\mathbb R$ is smooth if, for every chart $(U,\varphi)$, the coordinate representation
$$
f\circ\varphi^{-1}:\varphi(U)\to\mathbb R
$$
is smooth as a function on an open subset of $\mathbb R^n$.

#### Smooth Map

Let $M$ and $N$ be smooth manifolds. A map
$$
f:M\to N
$$
is smooth if for every $p\in M$, for every chart $(U,\varphi)$ around $p$ and every chart $(V,\psi)$ around $f(p)$ with $f(U)\subseteq V$, the coordinate representation
$$
\psi\circ f\circ\varphi^{-1}:
\varphi(U)\to\psi(V)
$$
is a smooth map between open subsets of Euclidean spaces.

For a $C^r$ map, the same condition is required with $C^r$ coordinate representations.

> Smoothness of a map between manifolds is checked after translating both source and target into local Euclidean coordinates.

#### Diffeomorphism

Two smooth manifolds $M$ and $N$ are diffeomorphic if there exists a bijection $f:M\to N$ such that both $f$ and $f^{-1}$ are smooth. A diffeomorphism is an isomorphism in the category of smooth manifolds.
### Curves and Scalar Fields

#### Scalar Field

A scalar field on $M$ is a smooth function
$$
f:M\to\mathbb R.
$$
The function itself is intrinsic. In a chart $(U,\varphi)$, it is represented by an ordinary function of $n$ real variables:
$$
f\circ\varphi^{-1}(x^1,\cdots,x^n).
$$

#### Curve

A smooth curve on $M$ is a smooth map
$$
\gamma:I\subseteq\mathbb R\to M.
$$
In a chart $(U,\varphi)$, the curve has coordinate functions
$$
\varphi\circ\gamma(t)=\big(x^1(t),\cdots,x^n(t)\big).
$$

### Tangent Structure

#### Tangent Space

The tangent space at $p\in M$ is the vector space
$$
T_pM
=
\left\{
D:C^\infty(M)\to\mathbb R
\;\middle|\;
D \text{ is linear and } D(fg)=f(p)D(g)+g(p)D(f)
\right\}.
$$

Elements of $T_pM$ are tangent vectors at $p$. In this definition, a tangent vector is a derivation at $p$.

> Tangent space is the linear space that best approximates the manifold near one point.

In local coordinates $(x^1,\cdots,x^n)$, a basis of $T_pM$ is written as
$$
\left\{
\frac{\partial}{\partial x^1}\Big|_p,
\cdots,
\frac{\partial}{\partial x^n}\Big|_p
\right\}.
$$
Thus every tangent vector has the local form
$$
v=v^i\frac{\partial}{\partial x^i}\Big|_p.
$$

#### Tangent Vector of a Curve

Let $\gamma:I\to M$ be a smooth curve and $t_0\in I$. The tangent vector of $\gamma$ at $t_0$ is the derivation
$$
\dot\gamma(t_0)(f)
=
\frac{d(f\circ\gamma)}{dt}\Big|_{t=t_0},
\quad f\in C^\infty(M).
$$

This definition says that a tangent vector measures how every smooth function changes along the curve.

#### Tangent Bundle

The tangent bundle is the disjoint union of all tangent spaces:
$$
TM=\bigsqcup_{p\in M}T_pM.
$$
It comes with a natural projection
$$
\pi:TM\to M,\quad \pi(v_p)=p.
$$

The tangent bundle packages all tangent spaces of a manifold into one geometric object.

#### Differential / Pushforward

Let $f:M\to N$ be a smooth map. The differential, or pushforward, at $p\in M$ is the linear map
$$
df_p:T_pM\to T_{f(p)}N.
$$
For $v\in T_pM$ and $g\in C^\infty(N)$, it is defined by
$$
(df_pv)(g)=v(g\circ f).
$$

The differential is the local linear approximation of a smooth map.

#### Vector Field

A vector field on $M$ is a smooth assignment
$$
p\mapsto X_p\in T_pM.
$$
Equivalently, it is a smooth section of the tangent bundle:
$$
X\in\Gamma(TM).
$$

A vector field acts on a smooth function by
$$
X(f)(p)=X_p(f).
$$

#### Lie Bracket

For vector fields $X,Y\in\Gamma(TM)$, their Lie bracket is the vector field defined by
$$
[X,Y](f)=X(Y(f))-Y(X(f)),
\quad f\in C^\infty(M).
$$

The Lie bracket measures the non-commutativity of infinitesimal motions generated by vector fields.

### Cotangent and Tensor Structure

#### Cotangent Space

The cotangent space at $p\in M$ is the dual vector space of $T_pM$:
$$
T_p^*M=\operatorname{Hom}(T_pM,\mathbb R).
$$
Its elements are called covectors or one-forms at $p$.

If $f\in C^\infty(M)$, then its differential at $p$ is a covector
$$
df_p\in T_p^*M
$$
defined by
$$
df_p(v)=v(f),\quad v\in T_pM.
$$

#### Cotangent Bundle

The cotangent bundle is
$$
T^*M=\bigsqcup_{p\in M}T_p^*M.
$$

A smooth section of $T^*M$ is a differential one-form.

#### Tensor Field

A tensor field of type $(r,s)$ assigns smoothly to each point $p\in M$ a multilinear map built from $T_pM$ and $T_p^*M$.

Equivalently, a type $(r,s)$ tensor field is a smooth section of
$$
(TM)^{\otimes r}\otimes(T^*M)^{\otimes s}.
$$

Tensor fields are the natural coordinate-independent objects used to describe geometry on smooth manifolds.

### Additional Geometric Structures

The following structures are not part of a bare smooth manifold. They are extra structures placed on a smooth manifold.

#### Metric Tensor

A metric [tensor](./Tensor.md) on a smooth manifold $M$ is a smooth symmetric non-degenerate $(0,2)$-tensor field
$$
g_p:T_pM\times T_pM\to\mathbb R.
$$

For all tangent vectors $u,v,w\in T_pM$ and scalars $a,b\in\mathbb R$:

- Bilinear: $g(au+bv,w)=ag(u,w)+bg(v,w)$, and similarly in the second argument.
- Symmetric: $g(u,v)=g(v,u)$.
- Non-degenerate: if $g(u,v)=0$ for every $v\in T_pM$, then $u=0$.

In local coordinates,
$$
g=g_{ij}\,dx^i\otimes dx^j,
$$
where
$$
g_{ij}=g_{ji},\quad \det(g_{ij})\neq 0.
$$

The metric tensor allows one to define:

- Length of a vector: $|v|=\sqrt{|g(v,v)|}$.
- Orthogonality: $g(u,v)=0$.
- Length of a curve.
- Angles, when the metric is positive definite.

#### Riemannian and Pseudo-Riemannian Manifold

A Riemannian manifold is a smooth manifold equipped with a positive definite metric tensor:
$$
g(v,v)>0,\quad v\neq 0.
$$

A pseudo-Riemannian manifold is a smooth manifold equipped with a symmetric non-degenerate metric tensor that is not necessarily positive definite.

A Lorentzian manifold is a pseudo-Riemannian manifold whose metric has signature
$$
(-,+,\cdots,+)
$$
or equivalently the opposite convention
$$
(+,-,\cdots,-).
$$

### Connection

#### Affine Connection / Covariant Derivative

An affine connection, or covariant derivative, is an operator
$$
\nabla:\Gamma(TM)\times\Gamma(TM)\to\Gamma(TM),
\quad (X,Y)\mapsto\nabla_XY,
$$
that differentiates vector fields along vector fields.

It satisfies:

- $\nabla_{fX+gY}Z=f\nabla_XZ+g\nabla_YZ$.
- $\nabla_X(Y+Z)=\nabla_XY+\nabla_XZ$.
- $\nabla_X(fY)=X(f)Y+f\nabla_XY$.

Here $X,Y,Z\in\Gamma(TM)$ and $f,g\in C^\infty(M)$.

The connection extends naturally to tensor fields by the Leibniz rule and by commuting with contraction.

#### Torsion

The torsion tensor of a connection is
$$
T(X,Y)=\nabla_XY-\nabla_YX-[X,Y].
$$

A connection is torsion-free if
$$
T(X,Y)=0
$$
for all vector fields $X,Y$.

#### Levi-Civita Connection

On a Riemannian or pseudo-Riemannian manifold, the Levi-Civita connection is the unique connection satisfying:

- Torsion-free: $T(X,Y)=0$.
- Metric-compatible: $\nabla g=0$.

The Levi-Civita connection is the canonical connection determined by the metric.

#### Christoffel Symbols

In a coordinate basis $\{\partial_i\}$, the covariant derivative of basis vector fields is written as
$$
\nabla_{\partial_i}\partial_j=\Gamma^k_{ij}\partial_k.
$$
The functions $\Gamma^k_{ij}$ are the Christoffel symbols of the second kind.

For a vector field
$$
Y=Y^j\partial_j,
$$
the covariant derivative along
$$
X=X^i\partial_i
$$
has components
$$
(\nabla_XY)^k
=
X^i\left(\partial_iY^k+\Gamma^k_{ij}Y^j\right).
$$

For the Levi-Civita connection, the Christoffel symbols are determined by the metric:
$$
\Gamma^k_{ij}
=
\frac12 g^{kl}
\left(
\partial_i g_{jl}
+\partial_j g_{il}
-\partial_l g_{ij}
\right).
$$

The Christoffel symbols of the first kind are
$$
\Gamma_{kij}
=
\frac12
\left(
\partial_i g_{jk}
+\partial_j g_{ik}
-\partial_k g_{ij}
\right).
$$

> Christoffel symbols are not tensor components. They describe how the chosen coordinate basis changes from point to point.

### Curvature

#### Riemann Curvature Tensor

The curvature tensor of a connection is
$$
R(X,Y)Z
=
\nabla_X\nabla_YZ
-\nabla_Y\nabla_XZ
-\nabla_{[X,Y]}Z.
$$

Curvature measures the failure of covariant derivatives to commute.

In local coordinates,
$$
R(\partial_i,\partial_j)\partial_k
=
R^l{}_{kij}\partial_l.
$$

For the Levi-Civita connection, the components can be written in terms of Christoffel symbols:
$$
R^l{}_{kij}
=
\partial_i\Gamma^l_{jk}
-\partial_j\Gamma^l_{ik}
+\Gamma^m_{jk}\Gamma^l_{im}
-\Gamma^m_{ik}\Gamma^l_{jm}.
$$

### Geodesic

A geodesic is a curve whose tangent vector is parallel transported along itself:
$$
\nabla_{\dot\gamma}\dot\gamma=0.
$$

In local coordinates $x^k(t)$, this becomes
$$
\frac{d^2x^k}{dt^2}
+\Gamma^k_{ij}
\frac{dx^i}{dt}
\frac{dx^j}{dt}
=0.
$$

- $\frac{d^2x^k}{dt^2}$ is the ordinary coordinate acceleration.
- $\Gamma^k_{ij}\frac{dx^i}{dt}\frac{dx^j}{dt}$ is the correction term produced by the connection and the coordinate basis.

For a Riemannian metric, geodesics locally extremize length when parameterized affinely.

> Proof.
>
> Let a curve be written in coordinates as $x^\mu(s)$, and use the energy functional
> $$
> E[x]=\frac12\int g_{\mu\nu}(x)\dot x^\mu\dot x^\nu\,ds.
> $$
> The Euler-Lagrange equation gives
> $$
> \frac{d}{ds}(g_{\rho\nu}\dot x^\nu)
> -\frac12\partial_\rho g_{\mu\nu}\dot x^\mu\dot x^\nu=0.
> $$
> Expanding the total derivative,
> $$
> g_{\rho\nu}\ddot x^\nu
> +\partial_\sigma g_{\rho\nu}\dot x^\sigma\dot x^\nu
> -\frac12\partial_\rho g_{\mu\nu}\dot x^\mu\dot x^\nu=0.
> $$
> Multiplying by $g^{\lambda\rho}$ and symmetrizing the velocity terms gives
> $$
> \ddot x^\lambda
> +\frac12g^{\lambda\rho}
> \left(
> \partial_\mu g_{\rho\nu}
> +\partial_\nu g_{\rho\mu}
> -\partial_\rho g_{\mu\nu}
> \right)
> \dot x^\mu\dot x^\nu=0.
> $$
> Since
> $$
> \Gamma^\lambda_{\mu\nu}
> =
> \frac12g^{\lambda\rho}
> \left(
> \partial_\mu g_{\rho\nu}
> +\partial_\nu g_{\rho\mu}
> -\partial_\rho g_{\mu\nu}
> \right),
> $$
> the equation becomes
> $$
> \frac{d^2x^\lambda}{ds^2}
> +\Gamma^\lambda_{\mu\nu}
> \frac{dx^\mu}{ds}
> \frac{dx^\nu}{ds}
> =0.
> $$
>
> If the curve is parameterized by a non-affine parameter $\lambda$, the equation becomes
> $$
> \frac{d^2x^\mu}{d\lambda^2}
> +\Gamma^\mu_{\alpha\beta}
> \frac{dx^\alpha}{d\lambda}
> \frac{dx^\beta}{d\lambda}
> =
> f(\lambda)\frac{dx^\mu}{d\lambda}
> $$
> for some function $f(\lambda)$.
