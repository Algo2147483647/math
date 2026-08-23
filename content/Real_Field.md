# Real Field

[TOC]

## Define

> The real field is the complete ordered field that models the continuous number line.

$$
\mathbb R
$$

The **Real Field** $\mathbb{R}$ is a set equipped with addition $+$ and multiplication $\times$ operations, as well as a total order relation, satisfying the following axioms. The essence of real numbers lies in filling the "gaps" of rational numbers $\mathbb Q$ and forming a complete and ordered number field.

- **Field Structure**
  - Associativity of $+$: $(a + b) + c = a + (b + c)$
  - Commutativity of $+$: $a + b = b + a$
  - Additive identity ($0$): $\exist 0 \in R : a + 0 = a , \forall a \in \mathbb R$.
  - Additive inverse: $\forall a \in R, \exist -a \in R : a + (-a) = 0$
  - Associativity of $\times$: $(a \times b) \times c = a \times (b \times c)$
  - Commutativity of $\times$: $a \times b = b \times a$
  - Multiplicative identity ($1$): $\exist 1 \in R (1 \neq 0) : a \times 1 = a, \forall a \in \mathbb R$.
  - Multiplicative inverse: $\forall a \in R, a \neq 0, \exist a^{-1} \in \mathbb R : a \times a^{-1} = 1$.
  - Distributivity: $a \times (b + c) = (a \times b) + (a \times c)$

- **Order Structure**
  - Total order ($\le$) : $\mathbb R$ has a total order, $\forall a, b \in \mathbb{R}, (a \leq b) \lor (b \leq a)  \text{ and } \big( (a \leq b) \land (b \leq a) \iff a = b \big)$
  - Transitivity: $a \le b, b \le c : a \le c$
  - Translation Invariance (Order Preservation under Addition): $a \le b : a+c \le b+c,  \forall c \in \mathbb R$
  - Scale Invariance (Order Preservation under Non-negative Multiplication): $a \le b, 0 \le c : a \times c \le b \times c$

- **Completeness Axiom (Continuity of real numbers)**: Every non-empty subset of $\mathbb R$ that is bounded above has a least upper bound (supremum). 

> **Proof**: the equivalence of completeness axiom & continuity of real numbers
>
> **Completeness Axiom $\Rightarrow$ Continuity of real numbers**
>
> Assume, for contradiction, that there exists a "gap" in $\mathbb{R}$. This corresponds to a Dedekind cut $(L, R)$ where:  
>
> - $L$ and $R$ are nonempty, $L \cup R = \mathbb{R}$, and $L \cap R = \emptyset$.  
> - If $x \in L$ and $y \in R$, then $x < y$.  
> - $L$ has no greatest element.  
> - $R$ has no least element.  
>
> Define $S = L$. Then:  
> - $S \neq \emptyset$ (since $L \neq \emptyset$).  
> - $S$ is bounded above (any $y \in R$ is an upper bound).  
>
> By the Completeness Axiom, $\sup S = u$ exists in $\mathbb{R}$. Since $\mathbb{R} = L \cup R$, either $u \in L$ or $u \in R$.  
>
> - **Case 1:** $u \in L$. Since $L$ has no greatest element, $\exists x \in L$ such that $x > u$. But $x \in S$ and $u = \sup S$, so $x \leq u$—contradiction.  
> - **Case 2:** $u \in R$. Since $R$ has no least element, $\exists y \in R$ such that $y < u$. For all $x \in S = L$, $x < y$ (as $x \in L$, $y \in R$). Thus $y$ is an upper bound for $S$. But $y < u = \sup S$—contradiction.  
>
> Both cases yield a contradiction. Thus, no such gap exists.
> $\square$
>
> **Completeness Axiom $\Leftarrow$ Continuity of real numbers**

### Constructive Definitions (Equivalent Approaches)

**Defined by Dedekind Cuts**: The Dedekind cut is a pair of sets $A$ and $B$ that divide the [rational number](./Rational_Number_Field.md) set $\mathbb Q$ into two parts, satisfying as follows items. Each Dedekind cut defines a real number: if the cut represents a rational number, it is that rational number, otherwise it is an irrational number.

- $A \neq \empty, A \neq \mathbb Q$
- if $p, q \in \mathbb Q, p < q, q \in A$, then $p \in A$. 
- No maximum element in $A$, if $q \in A$, then there must be $p \in \mathbb Q, p > q$, let $p \in A$.

**Defined by Cauchy Sequences**: A Cauchy sequence of rational numbers $(a_1, a_2, a_3, \dots), a_n \in \mathbb{Q}$ satisfy $\forall \varepsilon \in \mathbb Q, \varepsilon > 0, \exist \mathbb N : \forall m, n > N$, $|a_m - a_n| < \varepsilon$. Two Cauchy sequences $(a_n), (b_n)$ are defined to be equivalent $(a_n) \sim (b_n) \iff \lim\limits_{n \to \infty} (a_n - b_n) = 0$.   The set of real numbers $\mathbb{R}$ is the collection of all equivalence classes of Cauchy sequences.

- The equivalence class of a constant sequence $(r, r, r, \dots)$ represents the rational number $r$.  
- The equivalence class of a Cauchy sequence that does not converge in $\mathbb{Q}$ represents an irrational number.

## Properties
