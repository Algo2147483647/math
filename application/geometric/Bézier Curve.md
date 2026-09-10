# Bézier Curve

[TOC]

## Define

A Bézier curve constructs a smooth curve from a small number of control points. It addresses problems such as:

- How can a designer control a curve by moving only a few points?
- How can a curve interpolate its endpoints while being guided by intermediate points?
- How can smooth curves be evaluated, subdivided, and rendered efficiently?

# Idea

A Bézier curve is a weighted average of its control points.

Given control points:
$$
P_0, P_1, ..., P_n
$$

the Bézier curve is defined as:
$$
C(t) = \sum_{i=0}^{n} P_i B_{i,n}(t), \quad t \in [0, 1]
$$

where $B_{i,n}(t)$ is the Bernstein basis function:
$$
B_{i,n}(t) = {n \choose i} t^i(1-t)^{n-i}
$$

The practical essence of a Bézier curve is:

1. **Use control points to define the shape**
2. **Use Bernstein weights to blend the control points**
3. **Evaluate the curve using interpolation or basis functions**

A Bézier curve always lies inside the convex hull of its control points.

# Detail
## Bernstein Form

The Bernstein form evaluates the curve directly:
$$
C(t) = \sum_{i=0}^{n} P_i {n \choose i} t^i(1-t)^{n-i}
$$

Important endpoint properties:
$$
C(0) = P_0
$$

$$
C(1) = P_n
$$

The first and last control edges determine the endpoint tangents:
$$
C'(0) = n(P_1 - P_0)
$$

$$
C'(1) = n(P_n - P_{n-1})
$$

## Quadratic Bézier Curve

For three control points $P_0, P_1, P_2$:
$$
C(t) = (1-t)^2P_0 + 2t(1-t)P_1 + t^2P_2
$$

This is the simplest curved Bézier segment.

## Cubic Bézier Curve

For four control points $P_0, P_1, P_2, P_3$:
$$
C(t) = (1-t)^3P_0 + 3t(1-t)^2P_1 + 3t^2(1-t)P_2 + t^3P_3
$$

Cubic Bézier curves are widely used in vector graphics, fonts, animation paths, and modeling tools.

## de Casteljau Algorithm

The de Casteljau algorithm evaluates a Bézier curve through repeated linear interpolation.

For adjacent points:
$$
P_i^{(r)}(t) = (1-t)P_i^{(r-1)}(t) + tP_{i+1}^{(r-1)}(t)
$$

with:
$$
P_i^{(0)} = P_i
$$

After $n$ interpolation levels:
$$
C(t) = P_0^{(n)}(t)
$$

The recursive form is:
$$
C_{0,1,...,n}(t) =
(1-t)C_{0,1,...,n-1}(t) + tC_{1,2,...,n}(t)
$$

## Subdivision

de Casteljau evaluation also subdivides a Bézier curve at a parameter value $t$.

The interpolation triangle produces:

- a left Bézier curve from the left boundary of the triangle
- a right Bézier curve from the right boundary of the triangle

Subdivision is useful for adaptive rendering, collision testing, and curve refinement.

## Piecewise Bézier Curves

A single high-degree Bézier curve can be numerically unstable and difficult to control. In practice, long curves are usually built from multiple low-degree segments.

To connect two cubic segments smoothly:

- $C^0$ continuity: endpoints match.
- $C^1$ continuity: endpoint tangent vectors match.
- $G^1$ continuity: endpoint tangent directions match.

## Boundaries

### Global Control

Moving one control point can affect the entire curve. This is useful for broad shape design, but poor for local editing.

B-splines and NURBS are often preferred when local control is important.

### High Degree Is Expensive

High-degree Bézier curves can be difficult to evaluate and may oscillate. Piecewise cubic curves are usually more stable.

### No Exact General Offset

The offset of a Bézier curve is usually not another Bézier curve of the same degree. Offset curves often require approximation.

### Parameter Is Not Arc Length

Uniform values of $t$ do not usually produce uniformly spaced points along the curve.

If equal arc-length spacing is needed, the curve must be reparameterized or sampled adaptively.

## Cast

The main cost of a Bézier curve lies in the trade-off between **simple control-point modeling** and **limited local control**.

### Time Cost

- Direct Bernstein evaluation of degree $n$: **O(n)**
- de Casteljau evaluation of degree $n$: **O(n²)**
- Subdivision at one parameter value: **O(n²)**
- Sampling $m$ points directly: **O(mn)** or **O(mn²)**, depending on the evaluation method

### Space Cost

A degree-$n$ Bézier curve stores:
$$
O(n)
$$

control points.

### Engineering Cost

In real systems, implementing Bézier curves requires careful decisions about:

- numerical stability
- adaptive sampling tolerance
- continuity between segments
- arc-length parameterization
- conversion to and from spline or polyline representations

Although the formula is compact, robust curve modeling usually depends on sampling, subdivision, and continuity management.
