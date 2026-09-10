# Simplex Method

[TOC]

## Description

The simplex method solves a linear program by moving between extreme points of a polyhedral feasible set until an optimal extreme point is found.

A linear program in standard minimization form is

$$
\min_{x \in \mathbb{R}^n} c^\top x
$$

subject to

$$
Ax = b, \\
x \ge 0.
$$

Equivalently, the feasible set is

$$
\mathcal{X}
=
\left\{ x \in \mathbb{R}^n :
Ax = b, \;
x \ge 0
\right\}.
$$

Here, $x \in \mathbb{R}^n$ is the decision variable, $c^\top x$ is the linear objective function, $A \in \mathbb{R}^{m \times n}$ is the constraint matrix, $b \in \mathbb{R}^m$ is the right-hand-side vector, and $\mathcal{X}$ is the feasible set.

The goal is to find an optimal solution

$$
x^\star \in \arg\min_{x \in \mathcal{X}} c^\top x.
$$

The simplex method exploits the fact that, if an optimal solution exists for a linear program over a nonempty bounded polyhedron, then at least one optimal solution is an extreme point of $\mathcal{X}$.

A basis is a set of indices $B \subseteq \left\{1,\dots,n\right\}$ with $|B|=m$ such that the submatrix $A_B$ is nonsingular. The associated basic feasible solution is defined by

$$
x_B = A_B^{-1} b, \\
x_N = 0,
$$

where $N = \left\{1,\dots,n\right\} \setminus B$. If $x_B \ge 0$, this solution is feasible.

At each iteration, the simplex method computes the reduced costs

$$
\bar{c}_N^\top
=
c_N^\top - c_B^\top A_B^{-1} A_N.
$$

For a minimization problem, if

$$
\bar{c}_j \ge 0
\quad \text{for all } j \in N,
$$

then the current basic feasible solution is optimal. Otherwise, an index with $\bar{c}_j < 0$ enters the basis, and a leaving index is chosen by the minimum-ratio test to preserve feasibility.

Thus, the simplex method iteratively performs basis exchanges, moving from one feasible extreme point to an adjacent one, strictly improving the objective value under nondegeneracy, until the optimality condition is satisfied or unboundedness is detected.
