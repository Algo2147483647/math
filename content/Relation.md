# Relation

[TOC]

## Define

> A relation records which ordered tuples of elements are considered related.

$$
R(A_1, A_2, \cdots, A_n) \subseteq A_1 \times A_2 \times \cdots \times A_n  \tag{Relation}
$$

A $n$-ary **relation** $R$ in sets $A_1, A_2, \cdots, A_n$ is a [subset](./Set.md) of their Cartesian product $A_1 \times A_2 \times \cdots \times A_n$. Relation is like a table, consists of a set of tuples (rows) and attributes (columns).

- $n$ Degree: The number of attributes (columns) in a relation.
- Cardinality: The number of tuples (rows) in a relation.

## Properties

### Operations

#### Set operations

A relation is essentially a set, so it possesses the same operations as a set.

- **Intersection** (∩): returns the rows that are common to both relations.

$$
R\cap S=\{t|t\in R\land t\in S\} \text{ and } R\cap S = R-(R - S)
$$

- **Union** (∪): combines the results of two relations. The relations must be union-compatible (i.e., they have the same number of columns with the same domains).

$$
R\cup S = \{t|t\in R \lor t\in S\}
$$

- **Set Difference** (−): returns the rows that are in the first relation but not in the second.

$$
R - S = \{t|t\in R \land t\notin S\}
$$

- **Cartesian Product** (×): combines each row of the first relation with every row of the second relation.

$$
R\times S=\{(r_1,r_2,\cdots,r_m,s_1,s_2,\cdots,s_n)|(r_1,r_2,\cdots,r_m)\in R\land(s_1,s_2,\cdots,s_n)\in S\}
$$

#### Select & Projection

**Select** (σ): filters rows based on a specified condition (predicate).
$$
\sigma_\text{condition}(R)=\{t|t\in R\land F(t)=\text{True}\}
$$

**Projection** (π): selects specific columns from a relation.
$$
\pi_{A}(R)=\{t[A]|t\in R\}
$$

#### Join

$$
R\Join_{A\theta B}S=\sigma_{A\theta B}(R\times S)  \tag{join}
$$

**Join** ($\Join$): combines related tuples from two relations based on a condition, typically a common attribute. Where A and B are groups of attributes of equal and comparable degree on R and S respectively, and $\theta$ is a comparison operator.

$$
\begin{align*}
R\Join_{L,\theta}S &=\{(r_1,\cdots,r_m,s_1,\cdots,s_n)\mid (r_1,\cdots,r_m)\in R\land((\exists(s_1,\cdots,s_n)\in S: \theta((r_1,\cdots,r_m),(s_1,\cdots,s_n)))\lor\forall(s_1,\cdots,s_n)\in S:\neg\theta((r_1,\cdots,r_m),(s_1,\cdots,s_n))\land(s_1 = \text{null},\cdots,s_n=\text{null}))\}\\
R\Join_{R,\theta}S &=\{(r_1,\cdots,r_m,s_1,\cdots,s_n)\mid (s_1,\cdots,s_n)\in S\land((\exists(r_1,\cdots,r_m)\in R: \theta((r_1,\cdots,r_m),(s_1,\cdots,s_n)))\lor\forall(r_1,\cdots,r_m)\in R:\neg\theta((r_1,\cdots,r_m),(s_1,\cdots,s_n))\land(r_1 = \text{null},\cdots,r_m=\text{null}))\}\\
R\Join_{\text{full},\theta}S &=(R\Join_{L,\theta}S)\cup(R\Join_{R,\theta}S)
\end{align*}    \tag{outer join}
$$

Outer Join (Left, Right, Full): Joins relations but retains rows from one or both relations that do not meet the join condition, filling with nulls where necessary.

- **Left Outer Join ($\Join_L$)**: Keeps all rows from the left relation. For each row $r$ in $R$, if there is a row $s$ in $S$ such that $\theta(r, s)$ holds, then the pair $(r, s)$ is in $R\Join_{L,\theta}S$. If there is no such row $s$ in $S$ that satisfies $\theta(r, s)$, then the pair $(r, (\text{null},\cdots,\text{null}))$ is in $R\Join_{L,\theta}S$.
- **Right Outer Join ($\Join_R$)**: Keeps all rows from the right relation. For each row $s$ in $S$, if there is a row $r$ in $R$ such that $\theta(r, s)$ holds, then the pair $(r, s)$ is in $R\Join_{R,\theta}S$. If there is no such row $r$ in $R$ that satisfies $\theta(r, s)$, then the pair $(( \text{null},\cdots,\text{null}), s)$ is in $R\Join_{R,\theta}S$.
- **Full Outer Join ($\Join_\text{full}$)**: Keeps rows from both relations.

$$
R\bowtie S=\left\{(r_1,\cdots,r_m,s_1,\cdots,s_n)\mid r\in R\land s\in S\land\bigwedge_{i = 1}^{k}(r[C_i]=s[C_i])\right\}/_{\sim}  \tag{natural join}
$$

Natural join of relations $R$ and $S$ is an special join where the join condition is defined by common attributes having equal values, combines tuples from $R$ and $S$ where the values of the common attributes are equal. 

- $R$: The first relation, $R$ has attributes $A_1, A_2,\cdots, A_m$.
- $S$: The second relation, $S$ has attributes $B_1, B_2,\cdots, B_n$
- $C$: the set of common attributes between $R$ and $S$. $C = \{C_1,C_2,\cdots,C_k\}\subseteq\{A_1,\cdots,A_m\}\cap\{B_1,\cdots,B_n\}$.
- $\theta$: the join condition (a boolean valued function on the attributes of $R, S$)
- $\sim$: represents an equivalence relation that removes the duplicate columns of the common attributes. That is, we only keep one copy of each common attribute in the final result.

### Binary Relation

$$
X \ R\ Y \subseteq X \times Y  \tag{Binary Relation}
$$
Binary Relation $R$ over set $X, Y$ is a subset of the Cartesian product $X \times Y$. The set $X$ is called the domain, and set $Y$ the codomain.
