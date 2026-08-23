# Fourth Order Function

[TOC]

## Define

> A fourth-order function is a polynomial function whose highest-degree term has degree four.

$$
f(x) = \sum_{i=0}^{4} a_i x^i  \tag{Univariate}
$$

$$
\begin{align*}
f(\boldsymbol x) =& \sum\limits_{i_1=0}^{\dim} \sum\limits_{i_2=i_1}^{\dim} \sum\limits_{i_3=i_2}^{\dim} \sum\limits_{i_4=i_3}^{\dim} a_{i_1 i_2 i_3 i_4} \cdot x_{i_1} x_{i_2} x_{i_3} x_{i_4}  \quad \text{where } x_0 = 1 \\
=& \sum_{i_1=1}^{\dim} \sum_{i_2=i_1}^{\dim} \sum_{i_3=i_2}^{\dim} \sum_{i_4=i_3}^{\dim} a_{i_1 i_2 i_3 i_4} · x_{i_1} x_{i_2} x_{i_3} x_{i_4} +    \\
&\sum_{i_1=1}^{\dim} \sum_{i_2=i_1}^{\dim} \sum_{i_3=i_2}^{\dim} b_{i_1 i_2 i_3} · x_{i_1} x_{i_2} x_{i_3} +    \\
&\sum_{i_1=1}^{\dim} \sum_{i_2=i_1}^{\dim} c_{i_1 i_2} · x_{i_1} x_{i_2} +    \\
&\sum_{i_1=1}^{\dim} d_{i_1} x_{i_1} +    \\
&e  \tag{Multivariate}  \\
\end{align*}
$$

## Properties

### Zero Set of Quartic Function, Quartic Surface

### Solution of Univariate Quartic Equation  
For an Univariate Quartic Equation,
$$
a x^4 + b x^3 + c x^2 + d x + e = 0
$$

The solutions are $r_1, r_2, r_3, r_4$,
$$
\begin{align*}
  r_{i} &= -\frac{b}{4 a} - S \pm \frac{1}{2} \sqrt{-4 S^2 -2 p \pm \frac{q}{S}}  \\
  p & =\frac{8 a c-3 b^2}{8 a^2} \\
  q & =\frac{b^3-4 a b c+8 a^2 d}{8 a^3} \\
  S & =\frac{1}{2} \sqrt{-\frac{2}{3} p+\frac{1}{3 a}\left(Q+\frac{\Delta_0}{Q}\right)} \\
  Q & =\sqrt[3]{\frac{\Delta_1+\sqrt{\Delta_1^2-4 \Delta_0^3}}{2}} \\
  \Delta_0 & =c^2-3 b d+12 a e \\
  \Delta_1 & =2 c^3-9 b c d+27 b^2 e+27 a d^2-72 a c e
\end{align*}
$$

Or representation by
$$
\begin{align*}
  Q_1 &= c^2 - 3bd + 12e  \\
  Q_2 &= 2c^3 - 9bcd + 27d^2 + 27b^2e - 72ce  \\
  Q_3 &= 8bc - 16d - 2b^3  \\
  Q_4 &= 3b^2 - 8c  \\
  Q_5 &= \sqrt[3]{\frac{Q_2}{2} + \sqrt{\left(\frac{Q_2^2}{4} - Q_1^3\right)}}   \\
  Q_6 &= \frac{Q_1}{Q_5} + Q_5  \\
  Q_7 &= 2\sqrt{\frac{Q_4}{12} + Q_6}   \\
  x_1 &= \frac{-b - Q_7 - \sqrt{4\left(\frac{Q_4}{6} - Q_6 - \frac{Q_3}{Q_7}\right)}}{4} \\
  x_2 &= \frac{-b - Q_7 + \sqrt{4\left(\frac{Q_4}{6} - Q_6 - \frac{Q_3}{Q_7}\right)}}{4} \\
  x_3 &= \frac{-b + Q_7 - \sqrt{4\left(\frac{Q_4}{6} - Q_6 + \frac{Q_3}{Q_7}\right)}}{4} \\
  x_4 &= \frac{-b + Q_7 + \sqrt{4\left(\frac{Q_4}{6} - Q_6 + \frac{Q_3}{Q_7}\right)}}{4}
\end{align*}
$$

### Torus

$$
\{\boldsymbol x \ |\ (R^2 - r^2 + \boldsymbol x^T \boldsymbol x)^2 - 4 R^2 (\boldsymbol x^T \boldsymbol x - x_i^2) = 0\}  \tag{Torus}
$$

<img src="./assets/torus-84d2651b-f18b-462b-be8c-436c8ae4c54-resize-750.gif" alt="torus-84d2651b-f18b-462b-be8c-436c8ae4c54-resize-750" style="zoom:50%;" />

### Tanglecube

$$
\left\{\boldsymbol x \ |\ \sum_{i=1}^3 \left(x_i^4 - 5 x_i^2 \right) + 11.8 = 0 \right\}  \tag{Tanglecube}
$$

<img src="./assets/Tanglecube1_700.svg" alt="Tanglecube1_700" style="zoom:67%;" />
