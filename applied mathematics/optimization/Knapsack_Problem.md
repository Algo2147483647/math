# Knapsack Problem

[TOC]

## Problem
For a set of $N$ items, each with a weight and a value $(w, v)$, determine which items to include in the collection so that the total weight is less than or qual to a given limit $C$ and the total value is as large as possible.

- 0/1 Knapsack Problem: the number of available copies of each item is restricted to 0 or 1.
  
- Unbounded Knapsack Problem, or Completed Knapsack Problem: there is not any item quantity limit.
  
- Multiple Knapsack Problem: there is given item quantity limit $\boldsymbol k$.
  
- Fractional Knapsack Problem: allows items to be divided into parts of any size and placed in a backpack.

## Solution

**Dynamic Programming**. For the subproblems of the first $n$ item, the result can be summarized as $f(n,c)$, means the maximum value occupied by the first $n$ items within capacity remaining $c$. Due to the memoryless of subproblems, one there local results are obtained, there is no need to further consider the subproblems themselves.
$$
f(n, c)
$$
For the $n$-th item in current, we decide whether to bring it.
$$
\begin{align*}
f(n, c) &= \max(f(n-1, c), f(n-1, c-w_n) + v_n)  \tag{0/1 Knapsack}\\
f(n, c) &= \max(f(n-1, c), f(n, c-w_n) + v_n)  \tag{Completed Knapsack}
\end{align*}
$$
In the initial value phase, there is
$$
f(0, 0) = 0, f(0, c) = -\infty
$$
