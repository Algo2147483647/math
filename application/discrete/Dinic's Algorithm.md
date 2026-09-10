# Dinic's Algorithm

[TOC]

## Description

Let $N=(V,E,c,s,t)$ be a directed capacitated network, where $V$ is the finite vertex set, $E \subseteq V \times V$ is the arc set, $c:E \to \mathbb{R}_{\ge 0}$ is the capacity function, and $s,t \in V$ are the source and sink.

Extend $c$ to all ordered pairs by setting $c(u,v)=0$ whenever $(u,v)\notin E$. A flow is a function $f:V\times V \to \mathbb{R}$ satisfying

$$
\begin{aligned}
&f(u,v)=-f(v,u) && \text{for all } u,v \in V, \\
&f(u,v)\le c(u,v) && \text{for all } u,v \in V, \\
&\sum_{v\in V} f(u,v)=0 && \text{for all } u\in V\setminus \{s,t\}.
\end{aligned}
$$

The value of $f$ is

$$
|f|=\sum_{v\in V} f(s,v).
$$

For a current flow $f$, the residual capacity of an ordered pair $(u,v)$ is

$$
c_f(u,v)=c(u,v)-f(u,v).
$$

The residual graph is

$$
G_f=(V,E_f),
\qquad
E_f=\left\{(u,v)\in V\times V : c_f(u,v)>0\right\}.
$$

Dinic's algorithm proceeds in phases.

In each phase, compute the distance label $\ell_f:V\to \mathbb{Z}_{\ge 0}\cup \{\infty\}$ by breadth-first search in $G_f$ from $s$:

$$
\ell_f(v)=
\begin{cases}
\text{length of a shortest directed path from } s \text{ to } v \text{ in } G_f, & \text{if such a path exists}, \\
\infty, & \text{otherwise}.
\end{cases}
$$

If $\ell_f(t)=\infty$, then there is no residual $s$-$t$ path, so $f$ is a maximum flow.

Otherwise, construct the level graph

$$
L_f=(V,E_f^{\mathrm{lev}}),
\qquad
E_f^{\mathrm{lev}}
=
\left\{(u,v)\in E_f : \ell_f(v)=\ell_f(u)+1\right\}.
$$

A blocking flow in $L_f$ is a feasible flow $g$ on $L_f$ with capacities $c_f$ such that every directed $s$-$t$ path in $L_f$ contains at least one saturated arc $(u,v)$ satisfying

$$
g(u,v)=c_f(u,v).
$$

Augment the original flow by $g$:

$$
f(u,v)\leftarrow f(u,v)+g(u,v)
\qquad
\text{for all } u,v\in V.
$$

Then recompute the residual graph and repeat.

Equivalently, Dinic's algorithm is:

$$
\begin{aligned}
&\text{initialize } f(u,v)=0 \text{ for all } u,v\in V, \\
&\text{while } \ell_f(t)<\infty: \\
&\qquad \text{construct } L_f, \\
&\qquad \text{find a blocking flow } g \text{ in } L_f, \\
&\qquad f \leftarrow f+g, \\
&\text{return } f.
\end{aligned}
$$

The components are:
- $G_f$: the residual graph describing all currently possible augmentations.
- $\ell_f$: the BFS distance from $s$ in $G_f$.
- $L_f$: the acyclic graph of shortest residual paths from $s$.
- $g$: a blocking flow that eliminates all current shortest residual $s$-$t$ paths.
- $f\leftarrow f+g$: the augmentation step increasing the flow value.

Correctness follows because each phase eliminates all shortest residual $s$-$t$ paths, and the algorithm terminates exactly when no residual $s$-$t$ path remains. By the max-flow min-cut theorem, this condition is equivalent to optimality of $f$.
