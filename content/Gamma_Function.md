# Gamma Function

[TOC]

## Define

> The Gamma function extends the factorial function from positive integers to complex and real arguments.

The gamma function is defined for all complex numbers except the non-positive integers. ([Complex Value Function](./Complex_Value_Function.md)) For every positive integer $n$,
$$
\Gamma(n) = (n-1)!
$$
For complex numbers with a positive real part, the gamma function is defined via a convergent improper integral,
$$
\Gamma(z) = \int_{0}^\infty t^{z-1} e^{-t} \mathrm d t \quad, \Re(z) > 0
$$
<img src="assets/Plot_of_gamma_function_in_complex_plane_in_3D_with_color_and_legend_and_1000_plot_points_created_with_Mathematica.svg" alt="Plot_of_gamma_function_in_complex_plane_in_3D_with_color_and_legend_and_1000_plot_points_created_with_Mathematica" style="zoom:12%;" />

## Properties

- Recursion
  $$
  \Gamma(z+1) = z \Gamma(z)
  $$
  
- Euler's reflection formula
  $$
  \Gamma(1-z)\Gamma(z) = \frac{\pi}{\sin \pi z}
  $$

- $$
  2^{2 z-1} \Gamma(z) \Gamma\left(z+ \frac{1}{2}\right)=\sqrt{\pi} \Gamma(2 z)
  $$
  
  - $$
    \Gamma\left(\frac{1}{2}\right) = \sqrt{\pi}
    $$
  
- Stirling's formula
  $$
  \Gamma(n+1) = n! \sim \sqrt{2\pi n} \left(\frac{n}{e}\right)^n
  $$
  
- $$
  \begin{align*}
  \Gamma(z) &=\lim _{n \rightarrow \infty} \frac{1 \cdot 2 \cdots n}{z(z+1) \cdots(z+n)} n^{z}  \\
  &= \frac{e^{-\gamma z}}{z} \prod_{n=1}^{\infty}\left(1+\frac{z}{n}\right)^{-1} e^{\frac{z}{n}}
  \end{align*}
  $$
