# Interior Point Method

[TOC]

## Purpose    
Simplify the problem by transforming inequality constraints $f_i(x) \le 0$ into the objective function $f_0(x)$ through Indicator function $I_- (x)$. Therefore, the simplified problem is an Optimization Problems only with Equality Constraints.

$$
\begin{align*}
  I_- (x) = \left\{\begin{matrix}  
    0\quad & ; x \le 0\\
    \infty \quad &; x > 0
  \end{matrix}\right.  \tag{Indicator Function}
\end{align*}
$$

$$
\begin{align*}
  \Rightarrow \min_{\boldsymbol x} \quad & f_0 (\boldsymbol x) - \sum_i I_- (f_i(\boldsymbol x)) \\
  s.t. \quad & A x = b
\end{align*}
$$

Barber Function Method:
However, since the Indicator function $I_- (x)$ is non-differentiable, we use the Barrier function to approximate the Indicator function. Meanwhile, the optimal solution of the new problem $\boldsymbol x^*(t)$ is a suboptimal solution whose deviation from the original optimal solution $x^*$ within $\frac{m}{t}$, and $t \to \infty \Rightarrow \boldsymbol x^*(t) \to \boldsymbol x^*$,
$$
I_- (x) \simeq -\frac{1}{t} \log(-x)  \quad; t > 0
$$

$$
\begin{align*}
  \Rightarrow \min_{\boldsymbol x^*(t)} \quad & f_0 (\boldsymbol x) - \frac{1}{t} \sum_i \log(-f_i(\boldsymbol x)) \\
  s.t. \quad & A x = b
\end{align*}
$$

## Solving  

- 序列无约束极小化方法: 顺序求解一系列障碍函数新问题$\boldsymbol x^*(t)$(无约束极小化问题), 每次用所获得的最新点组为求解下一个问题的初始点, 并逐渐增加$t = t + Δt$直到$t ≥ \frac{m}{ε}$.

- 步骤 (序列无约束极小化方法)
  - initial  
    严格可行点$\boldsymbol x$, $t_{(0)}>0$, $Δt$, 误差阈值$ε>0$
  - 循环 ($\frac{m}{t} < ε$时,退出循环)  
    从$\boldsymbol x$开始, 求解障碍函数新问题的解 $\boldsymbol x^*(t)$. 改进 $\boldsymbol x = \boldsymbol x^*(t)$, $t = t + Δt$.

## Note  

- KKT condition (障碍函数新问题)  
  $$
  \begin{align*}
    \boldsymbol A \boldsymbol x^*(t) &= \boldsymbol b  \\
    ∇ L &= ∇ f_0(\boldsymbol x^*(t)) + \frac{1}{t} ∇(- \sum_i \log (-f_i(\boldsymbol x))) + \boldsymbol A^T \boldsymbol v^*(t)  \\
      &= ∇ f_0(\boldsymbol x^*(t)) + \frac{1}{t} \sum_{i=1}^m \frac{∇ f_i(\boldsymbol x^*(t))}{-f_i(\boldsymbol x^*(t))} + \boldsymbol A^T \boldsymbol v^*(t)  \\
      &= 0
  \end{align*}
  $$

  原问题KKT condition, 与障碍函数新问题 KKT condition, 对比如下. 令$λ_i^*(t) = \frac{1}{-t f_i(\boldsymbol x^*(t))}$, 则二者表达式一样.
  $$
  \begin{align*}
    \boldsymbol A \boldsymbol x^*(t) &= \boldsymbol b  \\
    ∇ f_0(\boldsymbol x^*(t)) + \frac{1}{t} \sum_{i=1}^m \frac{∇ f_i(\boldsymbol x^*(t))}{-f_i(\boldsymbol x^*(t))} + \boldsymbol A^T \boldsymbol v^*(t) &= 0  \\
    ∇ f_0(\boldsymbol x^*) + \sum_{i=1}^m λ_i^* ∇ f_i(\boldsymbol x^*) + \boldsymbol A^T \boldsymbol v^* &= 0
  \end{align*}
  $$

- $\boldsymbol x^*(t)$是与原问题最优解偏差在$\frac{m}{t}$以内的次优解, $t \to \infty, \boldsymbol x^*(t) \to \boldsymbol x^*$
  - Proof  
    只要证 $0 ≤ f_0(\boldsymbol x^*(t)) - f_0(\boldsymbol x^*) ≤ \frac{m}{t}$.  
    上文原问题与障碍函数新问题KKT condition对比可得, $\boldsymbol x^*(t)$使得$L(\boldsymbol x, \boldsymbol λ^*(t), \boldsymbol v^*(t))$在其位置达到极小值, 
    $$∇ L(\boldsymbol x^*(t), \boldsymbol λ^*(t), \boldsymbol v^*(t)) = 0$$

    $$
    \begin{align*}
      \Rightarrow \quad  g(\boldsymbol λ^*(t), \boldsymbol v^*(t)) &= \inf_{x \in D} L(\boldsymbol x, \boldsymbol λ^*(t), \boldsymbol v^*(t))  \\
        &= L(\boldsymbol x^*(t), \boldsymbol λ^*(t), \boldsymbol v^*(t))  \\
        &= f_0(\boldsymbol x^*(t)) + \sum_{i=1}^m λ^*_i(t) f_i(\boldsymbol x^*(t)) + \boldsymbol v^*(t)^T (\boldsymbol A^T \boldsymbol x^*(t) - \boldsymbol b)  \\
        &= f_0(\boldsymbol x^*(t)) + \sum_{i=1}^m \frac{1}{-t \boldsymbol x^*(t)} f_i(\boldsymbol x^*(t))  \tag{$\boldsymbol A^T \boldsymbol x^*(t) - \boldsymbol b = 0$}  \\
        &= f_0(\boldsymbol x^*(t)) - \frac{m}{t}
    \end{align*}
    $$

    又$\because$ 强对偶性有, $g(\boldsymbol λ^*, \boldsymbol v^*) = f_0(\boldsymbol x^*)$
    $$
    \begin{align*}
      \therefore \quad & g(\boldsymbol λ^*(t), \boldsymbol v^*(t)) ≤ g(\boldsymbol λ^*, \boldsymbol v^*) = f_0(\boldsymbol x^*)  \\
      \Rightarrow \quad &  f_0(\boldsymbol x^*(t)) - \frac{m}{t} ≤ f_0(\boldsymbol x^*)  \tag{Substitution}  \\
      \Rightarrow \quad &  f_0(\boldsymbol x^*(t)) - f_0(\boldsymbol x^*) ≤ \frac{m}{t}
    \end{align*}
    $$

    又$\because$ 原问题目标函数是$\min f_0(\boldsymbol x)$
    $$
    \begin{align*}
      \Rightarrow \quad &  f_0(\boldsymbol x^*(t)) ≥ f_0(\boldsymbol x^*)  \\
      \Rightarrow \quad &  0 ≤ f_0(\boldsymbol x^*(t)) - f_0(\boldsymbol x^*) ≤ \frac{m}{t}  \\
    \end{align*}
    $$

- Original Dual Method
