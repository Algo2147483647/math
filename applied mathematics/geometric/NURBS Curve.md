# NURBS Curve

[TOC]

## Define

A NURBS curve, or Non-Uniform Rational B-Spline curve, is a rational extension of the B-spline curve. It represents a curve using control points P_i, weights w_i, a degree p, and a nonuniform knot vector. The curve is C(t)=sum_i N_{i,p}(t) w_i P_i / sum_i N_{i,p}(t) w_i. The denominator makes the representation rational rather than purely polynomial. This allows NURBS to exactly represent lines, circles, ellipses, conic arcs, and many free-form industrial design curves in one unified framework. Weights control how strongly a control point attracts the curve: larger weights pull the curve closer to the corresponding control point.

## Boundaries

NURBS curves are more expressive than polynomial B-splines but also harder to edit intuitively because weights interact with shape. Degenerate or very large weights can cause numerical instability. Like B-splines, NURBS parameters are not arc length and require reparameterization or adaptive sampling for uniform spacing.

## Cost

Evaluation has the same asymptotic basis cost as B-splines, plus weighted homogeneous normalization. A degree-p curve can be evaluated in O(p^2) per parameter value with de Boor-style evaluation. Robust CAD implementation requires careful knot insertion, trimming, tolerance management, and conversion between rational and homogeneous coordinates.
