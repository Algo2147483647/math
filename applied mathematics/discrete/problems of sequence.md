# Problems of Sequence

[TOC]

## Search elements

### Pattern Searching

Searches for occurrences of a "word" W within a main "text string" S.

#### Knuth–Morris–Pratt algorithm

<img src="./assets/Knuth-Morris-Pratt Algorithm.jpg" alt="Knuth-Morris-Pratt Algorithm" style="zoom:50%;" />

## Subsequence Problems


### Longest Common Subsequence

$$
\begin{align*}
\arg\max_{x \subseteq a,x \subseteq b }  \quad & \text{number}(x)
\end{align*}
$$

For a given sequence $a, b$, find the longest non-contiguous subsequence where the subsequence belongs to both $a$ and $b$.


#### Dynamic Programming

$$
\begin{align*}
f(a_{1:n}, b_{1:m}) &= \left\{\begin{matrix}
f(a_{1:n-1}, b_{1:m-1}) + 1 \quad &;  a_n = b_m  \\
\max(f(a_{1:n}, b_{1:m-1}), f(a_{1:n-1}, b_{1:m})) \quad &;  a_n ≠ b_m  \\
\end{matrix}\right.  \\

f(a_1, b_1) &= \left\{\begin{matrix}
1    \quad ; a_1 = b_1  \\
0   \quad ; a_1 ≠ b_1  \\
\end{matrix}\right.  \tag{initial}
\end{align*}
$$

### Longest Continuous Common Subsequence

$$
\begin{align*}
\arg\max_{x \subseteq a,x \subseteq b }  \quad & \text{number}(x)
\end{align*}
$$

For a given sequence $a, b$, find the longest contiguous subsequence where the subsequence belongs to both $a$ and $b$.

#### Dynamic Programming  

$$
\begin{align*}
f(a_{1:n}, b_{1:m}) &= \left\{\begin{matrix}
f(a_{1:n-1}, b_{1:m-1}) + 1 \quad &;  a_n = b_m  \\
0  \quad &;  a_n ≠ b_m
\end{matrix}\right.  \\

f(a_i, b_1) &= \left\{\begin{matrix}
1  \quad ; a_i = b_1  \\
0  \quad ; a_i ≠ b_1
\end{matrix}\right.  \tag{initial}  \\

f(a_1, b_i) &= \left\{\begin{matrix}
1  \quad ; a_1 = b_i  \\
0  \quad ; a_1 ≠ b_i
\end{matrix}\right.
\end{align*}
$$

### Longest Prefix-Suffix

For a given sequence $a$, we aim to find the maximum length $k^*$ of the prefix and suffix of itself, where the prefix equals suffix.
$$
\begin{align*}
  \max \quad & k  \\
  s.t. \quad & a_{1:k} = a_{n-k+1:n}  \tag{prefix = suffix}
\end{align*}
$$

#### Algorithm  

For each place $n$ and the successive subsequence $a_{1:n}$ of $a$, we iterative search as follows until the condition is met 
$$
\begin{align*}
  f(n) = k_n^* = \left\{\begin{matrix}
    f(n-1) + 1  \quad &;  a_n = a_{f(n-1) + 1}  \\
    f(f(n-1)) + 1 \quad &; a_n = a_{f(f(n-1)) + 1}  \\
    \vdots & \vdots  \\
    0  \quad &; other
  \end{matrix}\right.
\end{align*}
$$

- $f(n)$ means maximum prefix-suffix length $k_n^*$ for the successive subsequence $a_{1:n}$ of $a$.

