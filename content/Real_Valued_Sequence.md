# Real Valued Sequence

[TOC]

## Define

$$
f: \mathbb N \to \mathbb R \\
$$

## Properties

### Limitation

$$
\lim_{n \to \infty} x_n=L \Leftrightarrow |x_n-L|<\epsilon, \forall \epsilon>0, \exists N \in Z_+, n > N  \tag{Limit of Sequence}
$$

the limit of the sequence $\{x_{n}\}$ as $n$ approaches infinity is $L$, written as $\lim\limits_{n\rightarrow\infty}x_{n} = L$ if for every positive number $\epsilon> 0$, there exists a positive integer $N$ such that for all $n > N$, we have $\vert a_{n}-L\vert<\epsilon$. If such a number $L$ exists, we say the sequence converges; otherwise, we say the sequence diverges.

#### Basic Properties

- **Uniqueness**:  If a sequence $\{a_{n}\}$ converges, then its limit is unique.

$$
\lim_{n\rightarrow\infty}a_{n}=L_{1}, \lim_{n\rightarrow\infty}a_{n}=L_{2} \Rightarrow L_{1} = L_{2}
$$

- **Boundedness**: If a sequence $\{a_{n}\}$ converges, then the sequence is bounded. There exists a positive number $M$ such that $\vert a_{n}\vert\leq M$ for all $n$. However, the converse is not necessarily true. A bounded sequence may not converge. 
- **Sign preservation**: If $\lim\limits_{n\rightarrow\infty}a_{n}=L$ and $L>0$ (or $L<0$), then there exists a positive integer $N$ such that for all $n > N$, $a_{n}>0$ (or $a_{n}<0$).

- **Comparison Theorem**: If $a_{n}\leq b_{n}$ for all $n$, then $\lim\limits_{n\rightarrow\infty}a_{n}\leq \lim\limits_{n\rightarrow\infty}b_{n}$.
- **Squeeze Theorem**: If $a_{n}\leq c_{n}\leq b_{n}$ for all $n$ and $\lim\limits_{n\rightarrow\infty}a_{n}=\lim\limits_{n\rightarrow\infty}b_{n}=L$, then $\lim\limits_{n\rightarrow\infty}c_{n}=L$.
- **Subsequences of a Convergent Sequence**: If $\lim\limits_{n\rightarrow\infty}a_{n}=L$, the subsequence $\{a_{n_k}\}$ is also convergent and converges to the same limit $L$.

#### Algebraic Properties

- **Sum and Difference Rule**: $\lim\limits_{n\rightarrow\infty}(a_{n} \pm b_{n})=\lim\limits_{n\rightarrow\infty}a_{n} \pm \lim\limits_{n\rightarrow\infty}b_{n}$.
- **Product Rule**: $\lim\limits_{n\rightarrow\infty}(a_{n}\times b_{n})=\lim\limits_{n\rightarrow\infty}a_{n}\times\lim\limits_{n\rightarrow\infty}b_{n}$.
- **Quotient Rule**: If $\lim\limits_{n\rightarrow\infty}b_{n}\neq0$, then $\lim\limits_{n\rightarrow\infty}\frac{a_{n}}{b_{n}}=\frac{\lim\limits_{n\rightarrow\infty}a_{n}}{\lim\limits_{n\rightarrow\infty}b_{n}}$.

### Special Sequences

#### Arithmetic Sequence

$$
\begin{align*}
a_{n}-a_{n - 1}  &= d  \qquad (n\geq2, n\in \mathbb N^+) \\
a_{n} &= a_{1}+(n - 1)d
\end{align*}
$$

If starting from the second term of a sequence, the difference between each term and its preceding term is equal to the same constant, then this sequence is called an arithmetic sequence.

- $d$: the common difference of the arithmetic sequence.

Properties

- **Arithmetic Mean**: If $a$, $b$, $c$ are in arithmetic sequence, then $2b = a + c$, and $b$ is called the arithmetic mean of $a$ and $c$.
- **Sum Formula of the First $n$ Terms**: 

$$
S_{n}=\frac{n(a_{1}+a_{n})}{2}=na_{1}+\frac{n(n - 1)}{2}d
$$

- $m + n = p + q \Rightarrow a_{m}+a_{n}=a_{p}+a_{q}$
- **Monotonicity**: When $d>0$, the sequence is an increasing sequence; when $d<0$, the sequence is a decreasing sequence; when $d = 0$, the sequence is a constant sequence.

#### Geometric Sequence

$$
\begin{align*}
\frac{a_{n}}{a_{n - 1}} &=q  \qquad (n\geq2, n\in \mathbb N^+, q \neq 0)\\
a_{n} &=a_{1}q^{n - 1}
\end{align*}
$$

If starting from the second term of a sequence, the ratio of each term to its preceding term is equal to the same constant, then this sequence is called a geometric sequence.

- $q$: the common ratio of the geometric sequence

Properties

- **Geometric Mean**: If $a$, $b$, $c$ are in geometric sequence, then $b^{2}=ac$, and $b$ is called the geometric mean of $a$ and $c$, and $a$, $b$, $c$ are all non-zero.
- **Sum Formula of the First $n$ Terms**: When $q = 1$, $S_{n}=na_{1}$; when $q\neq1$, $S_{n}=\frac{a_{1}(1 - q^{n})}{1 - q}=\frac{a_{1}-a_{n}q}{1 - q}$.
- $m + n = p + q \Rightarrow a_{m}\cdot a_{n}=a_{p}\cdot a_{q}$
- **Monotonicity**: When $a_{1}>0$, $q>1$ or $a_{1}<0$, $0<q<1$, the sequence is an increasing sequence; when $a_{1}>0$, $0<q<1$ or $a_{1}<0$, $q>1$, the sequence is a decreasing sequence; when $q = 1$, the sequence is a constant sequence; when $q<0$, the sequence is an oscillating sequence.

### Series

A series refers to the sum of the terms of a sequence. Given a sequence $a_n$, the series $S$ is given by:
$$
S = \sum_{i=0}^\infty a_i  \\
S_n = \sum_{i=0}^n a_i
$$

#### Power series

$$
S = \sum_{n=0}^\infty a_n x^n
$$

Special Cases,
$$
\begin{align*}
\sum_{n=0}^\infty x^n &= \frac{1}{(1-x)} \\
\sum_{n=0}^\infty (-1)^n x^n &= \frac{1}{(1+x)} \\
\sum_{n=0}^\infty (n+1) x^{n} &= \frac{1}{(1-x)^2} \\
\end{align*}
$$

### Generating Functions

A Generating Function $A(x)$ for a given sequence $\{a_n\}_{n=0}^\infty$ is a way to encode an infinite sequence into a formal power series.
$$
a_0, a_1, a_2, \dots  \qquad \Rightarrow \qquad A(x) = \sum_\limits{n=0}^\infty a_n x^n
$$
Special Cases,

| Notes                             | Generating Function                         |
| --------------------------------- | ------------------------------------------- |
| $a_n = 1$                         | $\displaystyle \frac{1}{1-x}$               |
| $a_n=r^n$                         | $\displaystyle \frac{1}{1-rx}$              |
| $a_n=n$                           | $\displaystyle \frac{x}{(1-x)^2}$           |
| $a_n=n+1$                         | $\displaystyle \frac{1}{(1-x)^2}$           |
| $a_n=n^2$                         | $\displaystyle \frac{x(1+x)}{(1-x)^3}$      |
| $a_n=n^3$                         | $\displaystyle \frac{x(1+4x+x^2)}{(1-x)^4}$ |
| $\binom{n+k}{k}$                  | $\displaystyle \frac{1}{(1-x)^{k+1}}$       |
| $\binom{n}{k}$                    | $\displaystyle \frac{x^k}{(1-x)^{k+1}}$     |
| $a_n=(-1)^n$                      | $\displaystyle \frac{1}{1+x}$               |
| Even indices only $1,0,1,0,\dots$ | $\displaystyle \frac{1}{1-x^2}$             |
| Odd indices only $0,1,0,1,\dots$  | $\displaystyle \frac{x}{1-x^2}$             |
| Fibonacci $1,1,2,3,5,8,\dots$     | $\displaystyle \frac{1}{1-x-x^2}$           |

#### Operators

| Operation on sequence                | Effect on generating function           |
| ------------------------------------ | --------------------------------------- |
| $b_n=c\,a_n$                         | $B(x)=cA(x)$                            |
| $b_n=a_n+d_n$                        | $B(x)=A(x)+D(x)$                        |
| $b_n=a_{n-1}$, $b_0=0$               | $B(x)=xA(x)$                            |
| $b_n=a_{n-k}$                        | $B(x)=x^kA(x)$                          |
| $b_n=a_{n+1}$                        | $\displaystyle B(x)=\frac{A(x)-a_0}{x}$ |
| $b_n=n\,a_n$                         | $B(x)=xA'(x)$                           |
| $b_n=(n+1)a_n$                       | $B(x)=(xA(x))'$                         |
| $b_n=\sum\limits_{j=0}^n a_j$        | $\displaystyle B(x)=\frac{A(x)}{1-x}$   |
| $c_n=\sum\limits_{k=0}^n a_kb_{n-k}$ | $C(x)=A(x)B(x)$                         |
