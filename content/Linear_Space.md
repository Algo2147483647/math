# Linear Space

[TOC]

## Define

> A linear space is a set whose elements can be added and scaled by elements of a field.

$$
+:V\times V\to V,
\quad
\cdot:F\times V\to V
$$

A **linear space** (or vector space) over a [field](./Field.md) $F$ is a nonempty set $V$ together with operations of vector addition $(+)$ and scalar multiplication $(\cdot)$, satisfying the following axioms. A linear space is a special case of a [module](./Module.md) whose scalars come from a field.

- Additive closure: $x + y \in V$
- Scalar multiplication closure: $k x \in V$
- Identity element of vector addition: $x + 0 = x$
- Inverse elements of vector addition: $x + (-x) = 0$
- Identity element of scalar multiplication: $1x = x$
- Commutativity of vector addition: $x + y = y + x$
- Associativity of vector addition: $x + (y + z) = (x + y) + z$
- Compatibility of scalar multiplication with field multiplication: $a(bx) = (ab)x$
- Distributivity of scalar multiplication with respect to vector addition: $a(x + y) = ax + ay$
- Distributivity of scalar multiplication with respect to field addition: $(a + b)x = ax + bx$

## Properties

### Immediate Consequences of the Axioms

For every $v\in V$ and $a\in F$,
$$
0v=0,
\quad
a0=0,
\quad
(-1)v=-v.
$$

Since $F$ is a field,
$$
av=0
\quad\Rightarrow\quad
a=0 \text{ or } v=0.
$$

### Linear Combination and Span

A linear combination of vectors $v_1,\dots,v_n\in V$ is a vector of the form
$$
a_1v_1+\cdots+a_nv_n,
\quad
a_i\in F.
$$

For a subset $S\subseteq V$, its span is
$$
\operatorname{span}(S)
=
\left\{
\sum_{i=1}^n a_i v_i
\mid
n\in\mathbb N,\ a_i\in F,\ v_i\in S
\right\}.
$$

The span of $S$ is the smallest linear subspace of $V$ that contains $S$.

### Linear Subspace

A subset $W\subseteq V$ is a linear subspace if $W$ is itself a linear space under the operations inherited from $V$.

Equivalently, a non-empty subset $W\subseteq V$ is a linear subspace iff
$$
x,y\in W,\ a,b\in F
\quad\Rightarrow\quad
ax+by\in W.
$$

Thus a linear subspace is closed under all finite linear combinations.

### Linear Independence and Linear Dependence

A finite list of vectors $(v_1,\dots,v_n)$ is linearly independent if
$$
\sum_{i=1}^n a_i v_i=0
\quad\Rightarrow\quad
a_1=\cdots=a_n=0.
$$

It is linearly dependent if there exist scalars, not all zero, such that
$$
\sum_{i=1}^n a_i v_i=0.
$$

A subset $S\subseteq V$ is linearly independent if every finite list of distinct vectors from $S$ is linearly independent.

### Basis and Coordinates

A basis of $V$ is a linearly independent subset $B\subseteq V$ whose span is the whole space:
$$
\operatorname{span}(B)=V.
$$

If $B=(e_1,\dots,e_n)$ is a finite basis, then every vector $v\in V$ has a unique expansion
$$
v=a_1e_1+\cdots+a_ne_n.
$$

The scalars $a_1,\dots,a_n$ are the coordinates of $v$ in the basis $B$. The vector $v$ is intrinsic; its coordinate tuple depends on the chosen basis.

### Dimension

If a linear space has a finite basis, then every basis has the same number of vectors. This number is the dimension of $V$:
$$
\dim V=n.
$$

A linear space with a finite basis is finite-dimensional. Otherwise, it is infinite-dimensional.

### Change of Basis

Let
$$
X=(x_1,\dots,x_n),
\quad
Y=(y_1,\dots,y_n)
$$
be two ordered bases of a finite-dimensional linear space $V$. If the columns of $C$ are the coordinates of the new basis vectors $y_i$ in the old basis $X$, then
$$
Y=XC.
$$

For a vector $v\in V$,
$$
v=X[v]_X=Y[v]_Y.
$$

Therefore
$$
[v]_X=C[v]_Y,
\quad
[v]_Y=C^{-1}[v]_X.
$$

The change-of-basis matrix $C$ is invertible. A basis changes in one direction, while coordinates transform in the inverse direction.

### Direct Sum

Let $U,W\subseteq V$ be linear subspaces. The sum of $U$ and $W$ is
$$
U+W=\{u+w\mid u\in U,\ w\in W\}.
$$

The space $V$ is the direct sum of $U$ and $W$, written
$$
V=U\oplus W,
$$
if every vector $v\in V$ has a unique decomposition
$$
v=u+w,
\quad
u\in U,\ w\in W.
$$

Equivalently,
$$
V=U+W
\quad\text{and}\quad
U\cap W=\{0\}.
$$

### Quotient Space

If $W\subseteq V$ is a linear subspace, the quotient space $V/W$ is the set of cosets
$$
V/W=\{v+W\mid v\in V\}.
$$

The operations are
$$
(v+W)+(u+W)=(v+u)+W,
\quad
a(v+W)=av+W.
$$

The quotient space identifies vectors that differ by an element of $W$.

### Dual Space

The dual space of $V$ is the linear space of all linear functionals from $V$ to the base field:
$$
V^*=\operatorname{Hom}_F(V,F)
=
\{f:V\to F\mid f \text{ is linear}\}.
$$

If $V$ has basis $(e_1,\dots,e_n)$, the dual basis $(e^1,\dots,e^n)$ of $V^*$ is defined by
$$
e^i(e_j)=\delta^i_j.
$$

In finite-dimensional coordinates, vectors may be represented as columns and dual vectors as rows:
$$
\begin{pmatrix}
f_1 & \cdots & f_n
\end{pmatrix}
\begin{pmatrix}
v^1 \\
\vdots \\
v^n
\end{pmatrix}
\in F.
$$

### Finite-Dimensional Coordinate Model

After choosing a basis, every $n$-dimensional linear space over $F$ is isomorphic to $F^n$:
$$
V\cong F^n.
$$

This isomorphism depends on the chosen basis. Matrices and coordinate tuples describe linear spaces only after a basis has been chosen.
