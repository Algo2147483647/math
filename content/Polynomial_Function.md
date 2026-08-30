# Polynomial Function

[TOC]

## Define

> A polynomial function is a function formed from powers of a variable using finitely many additions and scalar multiplications.

$$
\begin{align*}
f(x) &= \sum_{i=0}^{n} a_i x^i  \tag{one variable}  \\
f(\boldsymbol x) &= \sum_{\substack{\boldsymbol i=(0,\ldots,0)_n\\ i_j \le i_k,\ \forall j \le k }}^{(\dim,\ldots,\dim)_n} 
\left(a_{\boldsymbol i} \cdot \prod_{\substack{i_j \in \boldsymbol i \\ x_0 := 1}}x_{i_j} \right)  \tag{multi-variate}  
\end{align*}
$$

Polynomial function is a kind of [function](./Function.md).

## Properties

### Abel-Ruffini theorem

For a univariate $N$-th degree equation, there is no root-finding formula composed of finite addition, subtraction, multiplication, division, and square root operations $(+, -, \times, /, \sqrt{\ })$ from the fifth degree onwards.

> **Proof**: Abel-Ruffini theorem
>
> Let $f(x)$ be an irreducible polynomial of degree $n$ over a field $F$ (typically $\mathbb{Q}$ or $\mathbb{R}$), and let $K$ be its splitting field (the smallest extension containing all roots).
>
> **Radical extension tower**: If every root of $f(x)$ can be expressed by a finite combination of operations $+, -, \times, /$, and $\sqrt[k]{\cdot}$ ($k \in \mathbb{N}$), this is equivalent to $K$ being obtainable from $F$ via a radical extension tower:
> $$
> \begin{align*}
> F &= E_0 \subseteq E_1 \subseteq \cdots \subseteq E_k = K  \\
> E_{i+1} &= E_i(\sqrt[m_i]{\alpha_i}) \quad \text{where}\quad \alpha_i \in E_i, m_i \in \mathbb{N}
> \end{align*}
> $$
>
> **Galois Correspondence**: This radical extension tower corresponds, under Galois theory, to a chain of normal subgroups as follows. Each extension step $E_{i+1}/E_i$ is cyclic, and cyclic groups are Abelian. Thus, the quotient groups $G_i / G_{i+1}$ are Abelian.
> $$
> \text{Gal}(K/F) = G_0 \triangleright \cdots \triangleright G_k = \{e\}
> $$
>
> $$
> f(x) \text{ is solvable by radicals} \iff \text{Gal}(K/F) \text{ is solvable}.
> $$
>
>
> - The symmetry of root corresponding the Galois group $\text{Gal}(K/F)$. Because the coefficients and their domain $F$ remain unchanged, and root symmetry transformations are domain automorphisms of the expanded domain, all domain isomorphisms from the splitting field K to itself that preserve the coefficient field elements are $\text{Gal}(K/F)$.
>   
> - **Definition of Solvable Group**: A group $G$ is solvable if and only if there exists a chain of normal subgroups
>   $$
>   G = G_0 \triangleright G_1 \triangleright \cdots \triangleright G_k = \{e\}
>   $$
>
> $Gal(K/F)$ is a subgroup of $S_n$. When $n \ge 5$, the subgroup chain is $S_n \triangleright A_n \triangleright \{e\}$, where $A_n$ is a simple group and non-commutative. Therefore, the chain does not satisfy the solvability condition, and no radical solution is found.
>
> Q. E. D.

### Fundamental Theorem of Algebra
Every non-constant single-variable polynomial with complex coefficients has at least one complex root. (Theorem states the field of complex numbers is algebraically closed.)

### Special Surfaces

#### Barth sextic surface

A standard homogeneous equation for the Barth sextic is
$$
\left\{
[x:y:z:w]\in\mathbb P^3
\mid
F_{\mathrm B}(x,y,z,w)=0
\right\}
$$

$$
F_{\mathrm B}(x,y,z,w)
=
4(\phi^2x^2-y^2)
(\phi^2y^2-z^2)
(\phi^2z^2-x^2)
 -(1+2\phi)
(x^2+y^2+z^2-w^2)^2w^2
=0
$$

$$
\phi=\frac{1+\sqrt5}{2}
$$

Barth sextic surface is a degree-$6$ algebraic surface with 65 ordinary double points (nodes)in complex projective $3$-space, the maximum possible for a sextic. In the standard affine chart $w=1$, 50 of these nodes are finite; the remaining 15 lie at infinity. The surface has strong icosahedral symmetry, closely related to the golden ratio appearing in its equation.

#### Togliatti quintic surface

$$
\left\{
[x:y:z:w]\in\mathbb P^3
\mid
F_{\mathrm T}(x,y,z,w)=0
\right\}
$$

$$
F_{\mathrm T} = 64(x-w) \Big[ x^4 -4x^3w -10x^2y^2 -4x^2w^2 +16xw^3 -20xy^2w +5y^4 +16w^4 -20y^2w^2 \Big]  - 5\sqrt{5-\sqrt5} \left( 2z-\sqrt{5-\sqrt5}\,w \right) \times \left[ 4(x^2+y^2+z^2) +(1+3\sqrt5)w^2 \right]^2 .
$$

Togliatti quintic surface is a quintic nodal surface with 31 ordinary double points, which is the maximum possible number for a quintic surface in $\mathbb P^3$. This particular explicit model has dihedral $D_5$ symmetry and contains 15 distinguished lines.

#### Chmutov surface

$$
P_d(x_1,x_2)+T_d(x_3)=0,
$$

Chmutov's key idea is to combine two polynomials having carefully controlled critical values. Singularities occur when critical points of the two component polynomials line up at compatible critical values. This produces approximately ordinary double points as $d$ grows, making Chmutov surfaces important in the problem of constructing algebraic surfaces with many singularities.

#### Togliatti Surface

$$
64(x-w)[x^4-4x^3w-10x^2y^2-4x^2w^2+16xw^3-20xy^2w+5y^4+16w^4-20y^2w^2]
-5\sqrt{5-\sqrt{5}}(2z-\sqrt{5-\sqrt{5}}w)[4(x^2+y^2+z^2)+(1+3\sqrt5)w^2]^2,
$$

The Dervish is essentially a particular Togliatti-type 31-nodal quintic, rather than a separate degree or category of algebraic surface. The name comes from the appearance of a rotated affine visualization, which resembles a whirling dervish.
