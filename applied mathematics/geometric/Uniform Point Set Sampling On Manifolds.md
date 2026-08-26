# Uniform Point Set Sampling On Manifolds

[TOC]

## Define

Uniform sampling on manifolds is designed to solve the problem of **generating points whose probability follows intrinsic geometric volume**.

- How can points be sampled evenly on a curve, surface, or higher-dimensional manifold?
- Why is uniform sampling in parameter space often not uniform on the shape?
- How can deterministic point sets cover a manifold evenly?

For a manifold $M$, uniform sampling means that for any measurable subset $A \subset M$:
$$
P(A) \propto \operatorname{Vol}_M(A)
$$

where $\operatorname{Vol}_M(A)$ is measured using the intrinsic geometry of $M$.

## Core Idea

Uniformity should be measured on the manifold, not necessarily in the parameter domain.

If a parameterization stretches one region more than another, equal parameter-space area produces unequal manifold area.

The practical essence of manifold sampling is:

1. **Understand the geometric volume element**
2. **Correct for parameterization distortion**
3. **Use random or deterministic samples with the desired density**

## Solution

### Sampling Via Parameterization

Let:
$$
\gamma : \Omega \subset \mathbb{R}^n \to M \subset \mathbb{R}^m
$$

be a parameterization of the manifold.

The Jacobian matrix is:
$$
J_\gamma =
\frac{\partial \gamma}{\partial x}
$$

The local metric tensor is:
$$
G = J_\gamma^T J_\gamma
$$

The intrinsic volume element is:
$$
dV_M = \sqrt{\det(J_\gamma^T J_\gamma)}\,d\boldsymbol{x}
$$

Therefore, a parameter point $\boldsymbol{x} \in \Omega$ should be sampled with density:
$$
f_{\boldsymbol{X}}(\boldsymbol{x})
=
\frac{\sqrt{\det(J_\gamma^T J_\gamma)}}{
\int_\Omega \sqrt{\det(J_\gamma^T J_\gamma)}\,d\boldsymbol{x}}
$$

### Change Of Variables

For an invertible map $g : x \to y$, densities transform according to:
$$
f_Y(y) =
\frac{1}{|\det J_g|}
f_X(g^{-1}(y))
$$

This explains why a nonlinear parameterization changes density unless the Jacobian factor is considered.

### Rejection Sampling

If the density is known but hard to sample directly:

1. Sample a candidate point in parameter space.
2. Compute the local area or volume factor.
3. Accept the point with probability proportional to that factor.
4. Map accepted points through $\gamma$.

This is simple but may be inefficient when the density varies strongly.

### Uniform Sampling On A Sphere

For a sphere of radius $r$, sample:
$$
\xi_1, \xi_2 \sim \operatorname{Uniform}[0,1]
$$

Then:
$$
\theta = \arccos(1 - 2\xi_1)
$$

$$
\varphi = 2\pi\xi_2
$$

and:
$$
\begin{align*}
x &= r\sin\theta\cos\varphi \\
y &= r\sin\theta\sin\varphi \\
z &= r\cos\theta
\end{align*}
$$

This avoids clustering near the poles.

<img src="./assets/v2-ffb3519e0f18feacbd046cd7ce59696c_720w.webp" alt="Uniform sphere sampling" style="zoom:25%;" />

### Fibonacci Lattice

Random sampling is not the only option. Deterministic low-discrepancy sequences can distribute points evenly with less clumping.

For $i = 0,1,\dots,N-1$:
$$
z_i = 1 - \frac{2i+1}{N}
$$

$$
\theta_i = 2\pi \frac{i}{\phi}
$$

where:
$$
\phi = \frac{1+\sqrt{5}}{2}
$$

Then:
$$
\begin{align*}
x_i &= \sqrt{1-z_i^2}\cos\theta_i \\
y_i &= \sqrt{1-z_i^2}\sin\theta_i \\
z_i &= z_i
\end{align*}
$$

<img src="./assets/image-20240120160803978.png" alt="Fibonacci lattice sampling" style="zoom:33%;" />

##  Boundaries

### Parameter Uniformity Is Often Wrong

Sampling $u,v$ uniformly on a parameter domain is only uniform on the surface when the parameterization has constant area distortion.

Most parameterizations do not satisfy this.

### Rejection Sampling Can Waste Work

If the maximum density is much larger than the average density, many candidates may be rejected.

### Boundaries And Singularities Need Care

Poles, seams, chart boundaries, and non-injective parameterizations can cause clustering or missing regions.

### Mesh Sampling Is Different

For triangle meshes, uniform surface sampling usually means:

1. Select a triangle with probability proportional to its area.
2. Sample barycentric coordinates uniformly inside that triangle.

This avoids oversampling small triangles.

## Cost

The main cost of uniform manifold sampling lies in the trade-off between **geometric correctness** and **sampling simplicity**.

### Time Cost

- Direct parameter sampling: **O(1)** per point
- Density-corrected rejection sampling: expected cost depends on acceptance rate
- Mesh area preprocessing: **O(F)** for $F$ faces
- Mesh sampling after preprocessing: **O(log F)** or **O(1)** per point depending on the sampler
- Fibonacci sphere sampling: **O(1)** per point

### Space Cost

For analytic parameterizations, storage can be **O(1)**.

For mesh sampling, storing cumulative triangle areas costs:
$$
O(F)
$$

### Engineering Cost

In real systems, implementing uniform sampling requires careful decisions about:

- parameterization distortion
- random versus deterministic samples
- boundary handling
- chart stitching
- mesh triangle area weighting
- reproducibility through random seeds

So uniform sampling is less about making random numbers and more about matching the correct geometric measure.
