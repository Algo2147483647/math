# LP Relaxation

[TOC]

## Description

LP relaxation replaces an optimization problem with integrality or discrete constraints by a linear program obtained by enlarging the feasible set to a continuous polyhedron.

Consider an integer linear program:

$$
\begin{aligned}
z_{\mathrm{IP}}
=
\min_{x \in \mathbb{Z}^n} \quad & c^\top x \\
\text{s.t.} \quad & Ax \le b \\
& x \in \mathcal{X}
\end{aligned}
$$

where $x$ is the decision variable, $c^\top x$ is the linear objective function, $Ax \le b$ are linear constraints, and $\mathcal{X}$ denotes any additional structural constraints.

The LP relaxation is obtained by replacing the discrete constraint $x \in \mathbb{Z}^n$ with a continuous constraint, commonly $x \in \mathbb{R}^n$:

$$
\begin{aligned}
z_{\mathrm{LP}}
=
\min_{x \in \mathbb{R}^n} \quad & c^\top x \\
\text{s.t.} \quad & Ax \le b \\
& x \in \operatorname{relax}(\mathcal{X})
\end{aligned}
$$

Equivalently, if the integer feasible set is

$$
\mathcal{F}_{\mathrm{IP}}
=
\left\{ x \in \mathbb{Z}^n : Ax \le b,\ x \in \mathcal{X} \right\},
$$

then the relaxed feasible set is a continuous superset

$$
\mathcal{F}_{\mathrm{LP}}
=
\left\{ x \in \mathbb{R}^n : Ax \le b,\ x \in \operatorname{relax}(\mathcal{X}) \right\},
\qquad
\mathcal{F}_{\mathrm{IP}} \subseteq \mathcal{F}_{\mathrm{LP}}.
$$

The optimal solution of the integer program is

$$
x_{\mathrm{IP}}^\star
\in
\operatorname*{arg\,min}_{x \in \mathcal{F}_{\mathrm{IP}}} c^\top x,
$$

while the optimal solution of the LP relaxation is

$$
x_{\mathrm{LP}}^\star
\in
\operatorname*{arg\,min}_{x \in \mathcal{F}_{\mathrm{LP}}} c^\top x.
$$

For a minimization problem, because the LP relaxation optimizes over a larger feasible set,

$$
z_{\mathrm{LP}} \le z_{\mathrm{IP}}.
$$

Thus, the LP relaxation gives a lower bound on the integer optimum. If $x_{\mathrm{LP}}^\star \in \mathbb{Z}^n$, then $x_{\mathrm{LP}}^\star$ is also feasible for the original integer problem and is therefore an optimal integer solution.
