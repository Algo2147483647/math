# B-Spline Curve

[TOC]

## Define

A B-spline curve is a piecewise polynomial curve controlled by a sequence of control points, a polynomial degree, and a nondecreasing knot vector. It generalizes Bezier curves by using local basis functions, so moving one control point affects only a bounded parameter interval. For degree p, control points P_i, and basis functions N_{i,p}(t), the curve is C(t)=sum_i N_{i,p}(t) P_i. The basis functions are defined recursively by the Cox-de Boor recurrence. B-splines support local control, stable evaluation, subdivision, knot insertion, degree elevation, and continuity control across segment boundaries. A knot with multiplicity m reduces continuity to C^{p-m} at that knot. Uniform B-splines are convenient for smooth repeated structure; nonuniform B-splines allow nonuniform parameter spacing and endpoint interpolation through clamped knots.

## Boundaries

B-splines do not generally interpolate their internal control points. Their parameter is not arc length. Poor knot placement can produce uneven speed or clustered detail. Exact circular arcs and general conics cannot be represented exactly without rational weights.

## Cost

Evaluation by de Boor's algorithm costs O(p^2) per parameter value, or O(p) with precomputed basis values. Storage is O(n+p) for n control points and the knot vector. Engineering cost is dominated by knot convention, endpoint handling, numerical robustness, and conversion between piecewise Bezier and spline forms.
