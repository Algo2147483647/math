# Perlin Noise

[TOC]

## Define

Perlin noise is a gradient noise function.

Instead of assigning random values directly to grid points, it assigns random gradient vectors to grid points and interpolates their local influence.

<img src="./assets/Perlin_noise_example.png" alt="Perlin noise" style="zoom:12%;" />

### Perlin Noise Process

For a query point $x$:

1. Find the grid cell containing $x$.
2. Read the pseudo-random gradient vector at each grid corner.
3. Compute the displacement vector from each corner to $x$.
4. Take dot products between gradients and displacement vectors.
5. Smoothly interpolate the dot products.

<img src="./assets/1024px-PerlinNoiseGradientGrid.svg.png" alt="Perlin gradient grid" style="zoom:25%;" />
<img src="./assets/1024px-PerlinNoiseDotProducts.svg.png" alt="Perlin dot products" style="zoom:25%;" />
<img src="./assets/1024px-PerlinNoiseInterpolated.svg.png" alt="Perlin interpolation" style="zoom:25%;" />

### Smooth Interpolation

Linear interpolation is:
$$
lerp(a,b,t) = (1-t)a + tb
$$

For smoother visual results, Perlin noise often uses a fade function:
$$
fade(t) = 6t^5 - 15t^4 + 10t^3
$$

This gives zero first and second derivatives at cell boundaries.
