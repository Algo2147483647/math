# Polynomial Function

[TOC]

## Define

> A polynomial function is a function formed from powers of a variable using finitely many additions and scalar multiplications.

$$\begin{align*}
  f(x) &= \sum_{i=0}^{n} a_i x^i  \tag{one variable}  \\
  f(\boldsymbol x) &= \sum_{\boldsymbol i=(0,...,0)_n, i_j \le i_k, \forall j \le k}^{(\dim,...,\dim)_n} \left(a_{\boldsymbol i} \cdot \prod_{i_j \in \boldsymbol i, x_0 = 1}x_{i_j} \right)  \tag{multi-variate}  
\end{align*}$$

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
