# Field

[TOC]

## Define

> A field is an algebraic structure where addition, subtraction, multiplication, and division by nonzero elements are all possible.

$$
(G, +, \cdot)
$$

Field is a [ring](./Ring.md) that satisfies the existence of multiplicative inverses for every nonzero element.

- $(G, +)$ is a commutative group

- $(G \setminus\{0\}, \cdot)$ is a commutative group

- Distributive law: multiplication is distributive with respect to addition,
  $$
  \begin{align*}
    a \cdot (b + c) &= a \cdot b + a \cdot c  \\
    (b + c) \cdot a &= b \cdot a + c \cdot a
  \end{align*}
  $$

## Properties

### Field extension

$$
E/F
$$

A field extension is a pair of fields $E$ and $F$ such that the operations of $F$ are those of $E$ restricted to $F$. In other words, $F$ is a subset of $E$, and the addition and multiplication of elements of $F$ in $E$ coincide with their addition and multiplication in $F$. When $F$ is a subfield of $E$, we often say that $E$ is an extension of $F$ and write $E/F$.

### Field Automorphism

$$
\begin{align*}
f(a + b) &= f(a) + f(b) \\
f(a \cdot b) &= f(a) \cdot f(b)
\end{align*}
$$

### Galois Group

$$
Gal(K/F) = (\{\phi: K \to K \ |\ \phi(a) = a, \forall a \in F\}, \circ)
$$

**Galois group** of a field extension $K/F$, is the group of all field automorphisms of $K$ that fix $F$ pointwise, and the group operation is function composition operator $\circ$.

#### Galois Correspondence

For a field extension $K/F$, **Galois Correspondence** is a one-to-one correspondence  $E \longleftrightarrow H$ between intermediate fields $E$ (the subfields satisfying $F \subseteq E \subseteq K$) and subgroups $H$ of the Galois group $\text{Gal}(K/F)$. Meanwhile, $E$ is the fixed field of $H$ in $K$, consisting of elements fixed by every automorphism in $H$. Conversely, $H$ is the Galois group $\operatorname{Gal}(K/E)$, consisting of all $F$-automorphisms of $K$ that fix $E$ pointwise. Under this correspondence, larger subgroups correspond to smaller fixed fields, because a larger subgroup $H$ imposes more constraints (more automorphisms must fix an element), resulting in a smaller set $E$ of elements that can satisfy all these constraints. Galois group and correspondence serves as a bridge, establishing a precise correspondence between the  extension of fields and subgroups of groups.

$$
\begin{matrix}
F & \subseteq & E & \subseteq & K \\
& & \updownarrow\\
\text{Gal}(K/F) &\ge & \text{Gal} (K/E) & \ge & \{\text{id}\} \\
\end{matrix}\\
$$

$$
\begin{align*}
E &=  \{x \in K \ |\ \sigma(x) = x, \forall \sigma\in \text{Gal} (K/E)\}  \\
\text{Gal} (K/E) &= \{\sigma \in \text{Gal}(K/F) \ |\ \sigma (x) = x, \forall x \in E\}
\end{align*}
$$
