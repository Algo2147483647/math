# Group

[TOC]

## Define

> A group is an algebraic structure that captures reversible composition with an identity element.

$$
(G, \cdot)
$$

Group is an algebraic structure, where $G$ is a set, $\cdot$ is a binary operation, and satisfy:

- closure: $a, b \in G \Rightarrow a \cdot b \in G$
- associative law $(a \cdot b) \cdot c = a \cdot (b \cdot c)$
- exists identity element, $\exists 1: x \cdot 1 = 1 \cdot x = x$
- exists inverse element, $\exists x^{-1}: x \cdot x^{-1} = x^{-1} \cdot x = 1$

```lean
structure Group where
  G : Type
  mul : G → G → G
  one : G
  inv : G → G
  
  -- Group axioms
  mul_assoc : ∀ (a b c : G), mul (mul a b) c = mul a (mul b c)
  one_mul : ∀ (a : G), mul one a = a
  mul_one : ∀ (a : G), mul a one = a
  mul_left_inv : ∀ (a : G), mul (inv a) a = one
```

## Properties

- $1$ is unique

  > Proof
  > $$
  > 1_1 = 1_1 \cdot 1_2 = 1_2
  > $$

- The inverse of each element is unique.

- 
  - $\forall a \in G, (a^{-1})^{-1} = a$
  - $\forall a,b \in G, (a \cdot b)^{-1} = b^{-1} \cdot a^{-1}$
  - $\forall a,b,c \in G, a\cdot b = a \cdot c  \quad\Rightarrow\quad b = c$
  - $\forall a,b,c \in G, b\cdot a = c \cdot a  \quad\Rightarrow\quad b = c$ 

### Subgroup

$$
H \subseteq G, H \neq \emptyset, (H, \cdot) \text{ is group } \quad\Rightarrow\quad H \le G  \tag{Subgroup}
$$

For a group $(G, \cdot)$ and a nonempty subset $H$ of $G$, if $(H, \cdot)$ is also group, then $(H, \cdot)$ is a subgroup of $(G, \cdot)$.

Property:
- $1 \le G, G \le G$
* **Lagrange's Theorem**: The size of any subgroup $H$ of a finite group $G$ divides the size of $G$, written $|H| \mid |G|$. *(Proved using cosets.)*
  $$
  \begin{align*}
  \text{number of coset}(G, H) &= \frac{|G|}{|H|}
  \end{align*}
  $$

#### Coset

For a subgroup $H$ of the group $G$ and an element $g \in G$, the left cosets of $H$ in $G$ are the sets obtained by multiplying each element of $H$ by a fixed element $g$ (where $g$ is the left factor). The right cosets are defined similarly, except that the element g is now a right factor.
$$
\begin{align*}
gH = \{gh \ |\ h \in H\} \quad, \text{for } g \in G  \tag{left cosets}  \\
Hg = \{hg \ |\ h \in H\} \quad, \text{for } g \in G  \tag{right cosets}
\end{align*}
$$

Properties:

Cosets form a partition of group $G$, they divide $G$ into several equal-sized disjoint sets. 

- **Equal-sized**: Each coset of subgroup $H$ have the same number of elements as the subgroup $H$, $|gH|=|H|$. 
- **Covering**: $\forall g \in G : g \in g H$, because $g = g \cdot e$
- **Disjointness**: Two cosets are either identical or completely disjoint. $aH \neq bH : aH \cap bH = \emptyset$

> **Proof**: Disjointness
>
> if $aH \cap bH \neq \emptyset$, then
> $$
> \begin{align*}
> \exist h_1, h_2 \in H : a h_1 &= b h_2 \quad\\
> \Rightarrow aH &= \{b h_1^{-1} h_2 h \ |\ h \in H \}  \\
> \because h_1^{-1} h_2 h &\in H \tag{closure}\\
> \Rightarrow b h_1^{-1} h_2 h &\in b H, aH \subseteq bH  \\ 
> \text{similarly}\quad  bH &\subseteq aH  \\
> \Rightarrow aH &= bH
> \end{align*}
> $$
> Two cosets are either identical or completely disjoint. 
> $\square$

#### Normal Subgroup

$$
N \lhd G \quad\Leftrightarrow\quad  g^{-1}ng \in N, \forall n \in N \le G, g \in  G \tag{Normal Subgroup}
$$
Normal Subgroup is a subgroup $N \le G$ if it is invariant under conjugation $g^{-1}ng \in H$.

Properties:

- Without normal subgroups, coset multiplication cannot form a well-defined group operation (Quotient Group). The existence of normal subgroups allows us to "quotient/mod out" the information/symmetry represented by the subgroup $N$, yielding a new group (Quotient Group) $G/N$ whose structure may be simpler compared to the original group.
- $gN = Ng$, The left coset and the right coset of normal subgroup are consistent.

##### Quotient Group

$$
\begin{align*}
G/N &= (\{a N \ |\ a \in G\}, \cdot)  \\
(g_1 N) \cdot (g_2 N) &= g_1 g_2 N \quad, \forall g_1, g_2 \in G
\end{align*}
$$

For a group $G$ and a normal subgroup $N \lhd G$, the Quotient Group $G/N$ is a group composed of all left cosets of $N$ in $G$ as elements and multiplication operations.
- identity element is $N$ itself, $gN \cdot N = gN$
- inverse element is $g^{-1} N$

Properties:

- $|G/N| = \frac{|G|}{|N|}$

### Group Homomorphism

$$
f: G \to H
$$
Group Homomorphism is a function $f$ from a group $(G, \cdot)$ to another group $(H, *)$ such that for all $u, v \in G$ it hold that,
$$
f(u \cdot v) = f(u) * f(v) \quad, \forall u, v \in G
$$
Property:

**Isomorphism** of Groups: If Group Homomorphism of $G, H$ is a Bijection, the groups $G, H$ are called isomorphic.

### Simple Group

A simple group is a group $G$ whose only normal subgroups are the trivial group $\{e\}$ (a trivial group or zero group is a group consisting of a single element $e$) and the group itself.

Property:

Classification of finite simple groups: Every finite simple group is isomorphic to one of the following groups

- a member of one of three infinite classes of such, namely:
  - the cyclic groups of prime order,
  - the alternating groups of degree at least 5,
  - the groups of Lie type,
  - the derivative of the groups of Lie Type, such as the Tits group
- one of 26 groups called the "sporadic groups"

<img src="./assets/gn5cimd92mh11.jpg" alt="gn5cimd92mh11"  />

### Commutative Group, Abelian Group
$$
a \cdot b = b \cdot a
$$
Commutative Group is a Group satisfied commutative law,

### Cyclic Group
$$
\begin{align*}
G = ⟨g⟩ &= (\{g^k \ |\ k \in \mathbb Z\}, \cdot) \\ 
G = ⟨g⟩ &= (\{k \cdot g \ |\ k \in \mathbb Z\}, +)
\end{align*}
$$

A group $G$ is called cyclic if there exists an element $a \in G$ such that every element of $G$ can be expressed as a power of $a$. In other words, every element in $G$ is of the form $a^k$ for some integer $k$. The element $a$ is called a generator of the group.

Properties:

- Each cyclic group is Abelian group.

### Symmetric Group

$$
S_n = \left(\{\sigma: X \to X\}, \circ \right)
$$

Symmetric group on a finite set $X$ with $n$ elements is a group whose elements are all bijective functions (called permutations) on $X$, and group operation is function composition operator $\circ$.

- identity element is $\sigma(x) = x$.

- $n$: the degree of symmetric group, and the number of elements in set $X$.

Properties:

- $|S_n| = n!$
- **Cayley's theorem**: Any finite group is isomorphic to a subgroup of some symmetric group.
- Permutation Group: Permutation group is a group $G$ whose elements are permutations of a given set $M$ and whose group operation is the composition of permutations in $G$ (which are thought of as bijective functions from the set $M$ to itself).  
  - every group is isomorphic to some permutation group.

### Alternating Group

An alternating group $A_n$ on a set with $n$ elements is a group of all even permutations of the $n$ elements. The even permutation refers to a permutation that can be decomposed into the product of an even number of Swap (swaps the positions of two elements while leaving the other elements unchanged).

Properties:
- $A_n$ is a normal subgroup of $S_n$. $|A_n| = \frac{1}{2} |S_n|$.
- For $n>5$, $A_n$ is a simple group.
