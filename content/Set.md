# Set

[TOC]

## Define

> A set is a collection of distinct objects considered as a single mathematical object.

$$
\{\cdot\}
$$

A set $S$ is a collection of distinct objects. 

If an object $x$ is a member of a set $S$, we write $x \in S$. Otherwise, we write $x \notin S$. The most commonly used axiomatic system for set theory is Zermelo-Fraenkel set theory with the Axiom of Choice (ZFC axiomatic system):

1. **Axiom of Extensionality**: Two sets $A, B$ are equal if they have the same elements.
   $$
   \forall A \forall B (\forall x (x \in A \leftrightarrow x \in B) \rightarrow A = B)
   $$

2. **Axiom of Regularity (also known as the Axiom of Foundation)**: Every non-empty set $\varnothing$ has a member that is disjoint from it. 
   $$
   \forall x(x \neq \varnothing \rightarrow \exists y(y \in x \wedge y \cap x=\varnothing))
   $$

3. **Axiom of Pairing**: For any two sets, there is a set $B$ that contains exactly those two sets.
   $$
   \forall x \forall y \exists B \forall z (z \in B \leftrightarrow (z = x ∨ z = y))
   $$

4. **Axiom of Union**: For any set of sets $A$, there is a set $B$ that contains all the elements of those sets.
   $$
   \forall A \exists B \forall x (x \in B \leftrightarrow \exists C (x \in C ∧ C \in A))
   $$

5. **Axiom of Infinity**: There exists a set $A$ that contains the empty set $\varnothing$ and is closed under the operation of "successor" which is defined for any set $x$ as $x \cup \{x\}$.
   $$
   \exists A (\varnothing \in A ∧ \forall x (x \in A \rightarrow x ∪ \{x\} \in A))
   $$

6. **Axiom Schema of Separation (also known as the Axiom Schema of Comprehension)**: For any set $A$ and any property $\varphi$ that can be defined without reference to the whole set, there is a subset $B$ containing exactly those elements of the original set $A$ that have the property $\varphi$.
   $$
   \forall w_{1},\ldots ,w_{n}\,\forall A\,\exists B\,\forall x\,(x\in B\Leftrightarrow [x\in A\land \varphi (x,w_{1},\ldots ,w_{n},A)])
   $$

7. **Axiom of Power Set**: For any set $A$, there is a set $B$ of all its subsets.
   $$
   \forall A \exists B \forall C (C \in B \leftrightarrow \forall x (x \in C \rightarrow x \in A))
   $$

8. **Axiom Schema of Replacement**: If a property $\varphi$ defines a function on a set $A$, then the image of the set $B$ under that function is also a set.
   $$
   \forall A (\forall x \in A \exists !y φ(x, y, p_1, ..., p_n) \rightarrow \exists B \forall x \in A \exists y (y \in B ∧ φ(x, y, p_1, ..., p_n)))
   $$

9. **Axiom of Choice (also known as the Axiom of well-ordering)**: For any set of non-empty sets, there exists a choice function that selects one element from each set.
   $$
   \forall A (\exists B \forall x (x \in B \leftrightarrow (\exists y (y \in A ∧ \forall z (z \in A \rightarrow (z = y ∨ ¬S(z, y)))))))
   $$

## Properties

### Cardinality & Counting

$$
|S| = \text{number}(S)  \tag{Cardinality}
$$
Cardinality $|S|$ is the number of elements in a set $S$.

Two sets $A$ and $B$ have the same cardinality if there exists a bijection between them:
$$
|A|=|B|
\quad\Leftrightarrow\quad
\exists f:A\to B \text{ such that } f \text{ is bijective}.
$$

#### Infinite Cardinality and Aleph Numbers

The cardinality of the natural numbers is denoted by
$$
|\mathbb N|=\aleph_0
$$

$\aleph_0$ is the smallest infinite cardinal number. A set is countably infinite if its cardinality is $\aleph_0$.

The next larger well-ordered cardinal is denoted by
$$
\aleph_1
$$

$\aleph_1$ is the smallest uncountable well-ordered cardinal number. It should not automatically be identified with the cardinality of the real numbers. The cardinality of the continuum is
$$
|\mathbb R|=2^{\aleph_0}.
$$

The continuum hypothesis states
$$
2^{\aleph_0}=\aleph_1
$$
but this statement is independent of the usual ZFC axioms.

#### Uncountability of the Real Numbers

The real numbers are uncountable:
$$
|\mathbb R|>\aleph_0.
$$

It is enough to prove that the interval $(0,1)$ is uncountable, because
$$
(0,1)\subseteq\mathbb R.
$$

> Proof: Cantor's diagonal argument.
>
> Suppose, for contradiction, that $(0,1)$ is countable. Then all real numbers in $(0,1)$ can be listed as
> $$
> x_1,x_2,x_3,\cdots.
> $$
> Write each number in decimal form, choosing the representation that does not end in an infinite string of $9$s:
> $$
> \begin{aligned}
> x_1 &= 0.d_{11}d_{12}d_{13}\cdots\\
> x_2 &= 0.d_{21}d_{22}d_{23}\cdots\\
> x_3 &= 0.d_{31}d_{32}d_{33}\cdots\\
> &\vdots
> \end{aligned}
> $$
> Construct a new real number
> $$
> y=0.c_1c_2c_3\cdots
> $$
> by changing the diagonal digits:
> $$
> c_n=
> \begin{cases}
> 1, & d_{nn}\neq 1,\\
> 2, & d_{nn}=1.
> \end{cases}
> $$
> Then $y\in(0,1)$, and for every $n$, the $n$-th digit of $y$ is different from the $n$-th digit of $x_n$.
> Hence
> $$
> y\neq x_n,\quad \forall n\in\mathbb N.
> $$
> So $y$ is a real number in $(0,1)$ that is not in the supposed complete list. This contradicts the assumption that $(0,1)$ is countable.
>
> Therefore $(0,1)$ is uncountable, and hence $\mathbb R$ is uncountable.

#### Property

* Addition theorem  
  for $S = \cap_{i=1}^n S_i, S_i \cap S_j = \emptyset (i ≠ j)$
  $$
  \Rightarrow |S| = \sum_{i=1}^n |S_i|
  $$

* Multiplication theorem  
  for sets $S_A, S_B$, and
  $$
  \begin{align*}
    S &= \{(a, b) | a \in S_A, b \in S_B\}  \\
      &= S_A × S_B  \tag{Cartesian积}  \\
  \end{align*}
  $$
  $$
  \Rightarrow |S| = |S_A| × |S_B|
  $$

  Proof
  $$
  \begin{align*}
    S 
    &= \{(a, b) | a \in S_A, b \in S_B\}  \\
    &= \bigcap_{a_i \in S_A} \{(a_i, b) | b \in S_B\}  \\
    \Rightarrow |S| &= \sum_{i=1}^{|S_A|} |S_B|  \tag{Addition theorem}  \\
    &= |S_A| × |S_B|  \\
  \end{align*}
  $$

* Principle of Inclusion-Exclusion

  for $A_1,...,A_n \subseteq S$
  $$
  \begin{align*}
    \left|\bigcup_{i=1}^n A_i\right| &= \sum_{k=1}^n \left((-1)^{k-1} \sum_{\substack{i_1,...,i_k \in 1:n \\ i_1≠...≠i_k}} \left|\bigcup_{i\in\{i_1,...,i_k\}} A_i\right|\right)
  \end{align*}
  $$

- Special Counting Sequence: Catalan Numbers 
  $$
  \begin{align*}
    f_n 
    &= \frac{C(2n, n)}{n+1}\quad, n \ge 0  \\
    &= C(2n, n) - C(2n, n - 1)  \\
    &= C(2n, n) - C(2n, n + 1)  \\
    &= \frac{(2n)!}{(n+1)! n!}\\
    &= \left\{\begin{matrix}
      \sum\limits_{i=1}^n f_{i-1}f_{n-i}  & n \ge 2\\
      1 & n = 0, 1
    \end{matrix}\right. \tag{recurrence form}\\
    &= \frac{4n-2}{n+1} f_{n-1}
  \end{align*}
  $$
  Catalan Numbers are a sequence of natural numbers.
* Pigeonhole Principle
  
  for $A_1, ..., A_n \subseteq A, |A| = n + 1$, $\Rightarrow \exists A_i, |A_i| ≥ 2$.

### Relationship between sets

* Subset & Proper Subset 
  $$
  A \subseteq B \quad\Leftrightarrow\quad x \in B, \forall x \in A \tag{Subset}
  $$
  If all the elements of set $A$ are contained in a set $B$, then we say $A$ is a subset of $B$.

  $$
  A \subset B \Leftrightarrow x \in B, \forall x \in A \text{ and } \exist x \notin A, x \in B \tag{Proper Subset}
  $$

  A set $A$ is a proper subset of $B$, if $A \subseteq B$, but not $A = B$.

* Equal  
  $$
  \begin{align*}
    A = B &\quad\Leftrightarrow\quad x \in B, \forall x \in A \text{ and } x \in A, \forall x \in B  \tag{equal}\\
    &\quad\Leftrightarrow\quad A \subseteq B, B \subseteq A
  \end{align*}
  $$
  Two sets are equal, if they contain the same elements.

* Disjoint
  $$
  A, B \text{ is Disjoint } \quad\Leftrightarrow\quad A \cap B = \emptyset
  $$

### Operations

#### Intersection

$$
A \cap B = \{x \ |\ x \in A, x \in B\}  \tag{Intersection}
$$

Property:
- idempotency law: $A \cap A = A$
- commutative law: $A \cap B = B \cap A$  
- associative law: $A \cap (B \cap C) = (A \cap B) \cap C$

#### Union

$$
A \cup B = \{x \ |\ x \in A \text{ or } x \in B \}  \tag{Union}
$$

Property:
- idempotency law: $A \cup A = A$
- commutative law: $A \cup B = B \cup A$  
- associative law: $A \cup (B \cup C) = (A \cup B) \cup C$

#### Difference

$$
A - B = \{x \ |\ x \in A \text{ and } x \notin B\}  \tag{Difference}
$$

#### Complement of A Set

$$
\bar A = U - A = \{x \ |\ x \in U, x \notin A\}  \tag{Complement of A Set}
$$

For a universal set $U$, the complement of a set $A$ is $U - A$.

Property:
- $\bar{\bar A} = A$ 

- distributive laws 
  $$
  A \cap (B \cup C) = (A \cap B) \cup (A \cap C)
  $$
  $$
  A \cup (B \cap C) = (A \cup B) \cap (A \cup C)
  $$
- absorption laws
  $$
  A \cap (A \cup B) = A
  $$
  $$
  A \cup (A \cap B) = A
  $$
- DeMorgan's laws
  $$
  A - (B \cap C) = (A - B) \cup (A - C)
  $$
  $$
  A - (B \cup C) = (A - B) \cap (A - C)
  $$
  $$
  \overline{A \cap B} = \bar A \cup \bar B
  $$
  $$
  \overline{A \cup B} = \bar A \cap \bar B
  $$

### Cartesian Product

$$
A \times B = \{(a, b) \ | a \in A \text{ and } b \in B\}
$$
For two sets $A, B$, cartesian product is the set of all ordered pairs such that the first element of the pair is an element of $A$ and the second one is from $B$.

Property:
- $\text{number}(A \times B) = \text{number}(A) \cdot \text{number}(B)$

### Power Set

The power set of $A$ is the set of all subsets of $A$:
$$
\mathcal P(A)=\{B \mid B \subseteq A\}.
$$

This is stored here as a standard set construction rather than as a standalone node.

### Ordered Pair

$$
(a, b) = \{\{a\}, \{a, b\}\}
$$
Ordered pair $(a, b)$ is a pair of two elements $a, b$ in which order matters.

### Empty Set
$$
\emptyset = \{\}  \tag{Empty Set}
$$
Empty Set is a set without any element. 

Property:
- $\emptyset \subseteq S, \forall \text{ set } S$
- $A \cap \emptyset = \emptyset$
- $A \cup \emptyset = A$
