# Simplex

[TOC]

## Define

> A simplex is the simplest convex polytope in a given dimension.

$$
C = \text{conv} (\{v_1, ..., v_k\}) = \left\{\sum_{i=1}^k \theta_i v_i \ |\ \theta ⪰ 0, \boldsymbol 1^T \theta=1 \right\}
$$

Simplex represents the simplest possible polytope in any given dimension. Specifically, a $k$-simplex is a $k$-dimensional polytope which is the convex hull of its $k + 1$ vertices. ([polyhedron](./Polyhedron.md))

## Properties

* Point
* Line Segment
* Triangle
  - Define 
  - Property
    - judge whether a point is inside the triangle

      We assume that the order of input vertices of the triangle $(\boldsymbol a, \boldsymbol b, \boldsymbol c)$ is counter clockwise.

      $$
      \left.\begin{matrix}
      (\boldsymbol b-\boldsymbol a) \times (\boldsymbol p-\boldsymbol b) > 0\\
      (\boldsymbol c-\boldsymbol b) \times (\boldsymbol p-\boldsymbol c) > 0\\
      (\boldsymbol a-\boldsymbol c) \times (\boldsymbol p-\boldsymbol a) > 0\\
      \end{matrix} \right\} \Leftrightarrow \boldsymbol p \text{ is in Triangle}(\boldsymbol a, \boldsymbol b, \boldsymbol c)
      $$

  - Helen's formula
      $$
      S = \sqrt{q(q-a)(q-b)(q-c)}
      $$
      $$
      q = \frac{a + b + c}{2}
      $$

* Tetrahedron

- 5-cell
