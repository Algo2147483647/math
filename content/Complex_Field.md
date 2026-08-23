# Complex Field

[TOC]

## Define

> The complex field extends the real numbers by adjoining a square root of $-1$.

$$
\mathbb C
$$

The set of complex numbers, denoted $\mathbb{C}$, consists of all ordered pairs of [real numbers](./Real_Field.md) $(a, b)$. Each such number is usually written as $a + bi$, where $a$ is called the real part, $b$ is called the imaginary part, and $i$ is the imaginary unit with the property that $i^2 = -1$.
$$
\mathbb C = \{a + bi \mid a, b \in \mathbb R,\ i^2 = -1\}
$$

The operations of addition and multiplication are defined as:
- Addition: $(a + bi) + (c + di) = (a + c) + (b + d)i$.
- Multiplication: $(a + bi)(c + di) = (ac - bd) + (ad + bc)i$.

The set $\mathbb{C}$ with these operations forms a [field](./Field.md). It also has the property that every non-constant polynomial equation with coefficients in $\mathbb{C}$ has a root in $\mathbb{C}$, which is the statement of the Fundamental Theorem of Algebra.

## Properties

- Modulus and argument
$$
\begin{align*}
r &= |z| = \sqrt{a^2 + b^2}  \tag{modulus}\\
\theta &= \arg(z)  \tag{argument}
\end{align*}
$$
$$
z = a + bi = r (\cos \theta + i \sin \theta) = r e^{i \theta}
$$

- Fundamental theorem of algebra

  Every non-constant single-variable polynomial with complex coefficients has at least one complex root.

- Subtraction and division
$$
\begin{align*}
z_1 - z_2 &= (a + bi) - (c + di) = (a - c) + (b - d)i  \tag{subtraction}\\
\frac{z_1}{z_2} &= \frac{a + bi}{c + di} = \frac{(a + bi)(c - di)}{c^2 + d^2} = \frac{ac + bd}{c^2 + d^2} + \frac{bc - ad}{c^2 + d^2} i  \tag{division}
\end{align*}
$$

- Conjugate
$$
\bar z = a - bi  \tag{conjugate}
$$

- Power
$$
z^p = r^p (\cos \theta + i \sin \theta)^p = r^p (\cos (p \theta) + i \sin(p \theta))
\tag{De Moivre's theorem}
$$
