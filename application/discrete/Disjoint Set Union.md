# Disjoint Set Union

[TOC]

## Description

Let $U$ be a finite universe of elements. A Disjoint Set Union maintains a partition
$\mathcal{P}$ of $U$:

$$
\mathcal{P} = \left\{ S_1, S_2, \ldots, S_k \right\}
$$

where each $S_i \subseteq U$ satisfies

$$
S_i \neq \varnothing,\quad
S_i \cap S_j = \varnothing \text{ for } i \neq j,\quad
\bigcup_{i=1}^k S_i = U.
$$

Each set $S_i$ has a distinguished representative $r_i \in S_i$. The DSU stores a
parent function

$$
p : U \to U
$$

such that the directed graph induced by edges $x \to p(x)$ is a forest of rooted
trees. An element $r \in U$ is a root precisely when

$$
p(r) = r.
$$

For any $x \in U$, the representative of the set containing $x$ is

$$
\operatorname{Find}(x) = r
\quad\Longleftrightarrow\quad
p^{(m)}(x) = r \text{ for some } m \geq 0 \text{ and } p(r)=r.
$$

Here, $p^{(m)}$ denotes $m$ repeated applications of $p$.

The equivalence relation represented by the DSU is

$$
x \sim y
\quad\Longleftrightarrow\quad
\operatorname{Find}(x) = \operatorname{Find}(y).
$$

Thus each equivalence class is

$$
[x] = \left\{ y \in U : \operatorname{Find}(y) = \operatorname{Find}(x) \right\}.
$$

The operation $\operatorname{Union}(x,y)$ replaces the two classes containing $x$
and $y$ by their union. If

$$
r_x = \operatorname{Find}(x),\quad
r_y = \operatorname{Find}(y),
$$

then

$$
\operatorname{Union}(x,y)
=
\begin{cases}
\mathcal{P}, & r_x = r_y, \\
\left(\mathcal{P} \setminus \left\{ [x], [y] \right\}\right)
\cup \left\{ [x] \cup [y] \right\}, & r_x \neq r_y.
\end{cases}
$$

Operationally, when $r_x \neq r_y$, one root is made the parent of the other:

$$
p(r_x) \gets r_y
\quad\text{or}\quad
p(r_y) \gets r_x.
$$

With union by rank or size, an auxiliary function such as

$$
s : U \to \mathbb{N}
$$

may be stored on roots, where $s(r)$ denotes the size or rank of the tree rooted at
$r$. The smaller-rank or smaller-size tree is attached below the larger one.

With path compression, after computing $\operatorname{Find}(x)=r$, every vertex on
the search path from $x$ to $r$ has its parent reset to $r$:

$$
p(v) \gets r
\quad
\text{for each } v \text{ on the path from } x \text{ to } r.
$$

The DSU invariant is that for all $x,y \in U$,

$$
x \text{ and } y \text{ are in the same maintained set}
\quad\Longleftrightarrow\quad
\operatorname{Find}(x)=\operatorname{Find}(y).
$$

Using both union by rank or size and path compression, any sequence of $m$
operations on $n = |U|$ elements runs in

$$
O\left(m\,\alpha(n)\right),
$$

where $\alpha$ is the inverse Ackermann function.
