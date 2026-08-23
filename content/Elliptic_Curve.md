# Elliptic Curve

[TOC]

## Define

> An elliptic curve is a smooth projective genus-one curve with a chosen rational point, equivalently an abelian variety of dimension one.

$$
y^2 = x^3 + a x + b
$$

Over a field $K$ of characteristic not equal to $2$ or $3$, an elliptic curve can often be written in a Weierstrass form as above, where $a, b \in K$ and the discriminant
$$
\Delta = -16(4a^3 - 27b^2)
eq 0
$$
ensures smoothness.

<img src="assets/EllipticCurveCatalog.svg" alt="EllipticCurveCatalog" style="zoom: 33%;" />

## Properties

Groups formed by points on elliptic curves: The points on an elliptic curve form an Abelian group through a defined "addition" operation. This addition operation is related to the intersection of a line and a curve, while the unit element is represented by a point at infinity.

- Addition Operation: Given two points $P = (x_1, y_1), Q = (x_2, y_2)$ on $E$, their sum $P+Q=(x3, y3)$ is defined as follows: (Draw a straight line passing through points $P, Q$. This straight line will align with the curve at the third point $Q'$. By reflecting perpendicular to the x-axis from point $Q'$, you will obtain new points $C$, which is defined as $P + Q$.)

  If $P \neq Q$, the slope of the line through $P$ and $Q$ is:
  $$
  m = \frac{y_2 - y_1}{x_2 - x_1}
  $$
  If $P = Q$, the slope of the tangent to the curve at $P$ is:
  $$
  m = \frac{3x_1^2 + a}{2y_1}
  $$
  The coordinates $x_3$ and $y_3$ of $P + Q$ are given by:
  $$
  (x_3, y_3) = (m^2 - x_1 - x_2, m(x_1 - x_3) - y_1)
  $$

  Special cases:

  if $P = O$, then $P +Q= Q$
  if $Q = O$,then $P +Q = P$
  if $P = (x_1, y_1), Q = (x_1, -y_1)$  (i.e., $Q$ is the reflection of $P$ over the x-axis), then $P + Q= O$.

- Unit element: The unit element of this group is a special point at infinity, usually denoted as $O$. Any point on an elliptical curve plus O is equal to itself.
