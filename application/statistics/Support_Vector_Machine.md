# Support Vector Machine

- Purpose
  $$
  \begin{align*}
    \max_{\boldsymbol w, b} \quad& \min_i d_i = \frac{1}{\| \boldsymbol w\| } \min_i |\boldsymbol w^T \boldsymbol x_i + b|\\
    s.t. \quad& y_i \left(\boldsymbol w^T \boldsymbol x_i + b\right) \le  1
  \end{align*}
  $$

  - $y_i \in \{-1,1\}$  
  Find a hyperplane, maximize the minimum distance between the sample point and the hyperplane, and make points belong to different categories $y_i$ live on both sides of the hyperplane.

- Solution
  $$
  \begin{align*}
    \max_{\boldsymbol \lambda } \quad& \sum \lambda _i - \frac{1}{2} \sum\limits_i \sum\limits_j \lambda _i \lambda _j y_i y_j \boldsymbol x_i^T \boldsymbol x_j  \tag{Dual Problem}\\
    s.t. \quad& \sum\limits_i \lambda _i^* y_i = 0\\
    & \lambda _i \ge  0
  \end{align*}
  $$
  This is the Dual problem, and could be solved $λ_i^*$ by Sequential Minimal Optimization,   
  代入解出$\boldsymbol w^*, b^*$.
  
  - Proof  
    优化问题简化, 可令$\min_i |\boldsymbol w^T \boldsymbol x_i + b| = 1$, 且
    $$\arg\max_{\boldsymbol w, b} \frac{1}{||\boldsymbol w||} \Rightarrow \arg\min_{\boldsymbol w, b} \frac{||\boldsymbol w||^2}{2}$$
    $$
    \begin{align*}
      \max_{\boldsymbol w, b} \quad& \frac{\| \boldsymbol w\| ^2}{2}\\
      s.t. \quad&y_i \left(\boldsymbol w^T \boldsymbol x_i + b\right) \le  1
    \end{align*}
    $$

    Lagrange函数,
    $$
    \begin{align*}
      L\left(\boldsymbol w, b,\boldsymbol \lambda \right) &= \frac{\| \boldsymbol w\| ^2}{2} + \sum\limits_i \lambda _i \left(1 - y_i \left(\boldsymbol w^T \boldsymbol x_i + b\right)\right) \tag{Lagrange Function}\\
      \frac{\partial  L\left(\boldsymbol w, b,\boldsymbol \lambda \right)}{\partial  \boldsymbol w} |_{\boldsymbol w = \boldsymbol w^*} &= \boldsymbol w^* - \sum\limits_i \lambda _i x_i y_i = 0\\
      \frac{\partial  L\left(\boldsymbol w, b,\boldsymbol \lambda \right)}{\partial  b} |_{b = b^*} &= - \sum\limits_i \lambda _i y_i = 0
    \end{align*}
    $$

    $$
    \begin{align*}
      \Rightarrow\quad& \boldsymbol w^* = \sum\limits_i \lambda _i y_i x_i\\
      & \sum\limits_i \lambda _i^* y_i = 0
    \end{align*}
    $$

    Lagrange Dual Function, Dual Problem,
    $$
    \begin{align*}
    G\left(\boldsymbol \lambda \right) &= \inf_{\boldsymbol w, b} L\left(\boldsymbol w, b, \boldsymbol \lambda \right)  \tag{Lagrange Dual Function}\\
      &= L\left(\boldsymbol w^*, b^*, \boldsymbol \lambda \right)\\
      &= \frac{1}{2} \left(\sum\limits_i \lambda _i y_i x_i\right)^T \left(\sum\limits_j \lambda _j y_j x_j\right) + \left(-\sum\limits_i \lambda _i y_i \left(\sum\limits_j \lambda _j y_j x_j\right)^T x_i + \sum\limits_i \lambda _i\right)  \tag{$\boldsymbol w^*, b^*$ Substitution}\\
      &= \sum \lambda _i - \frac{1}{2} \sum\limits_i \sum\limits_j \lambda _i \lambda _j y_i y_j \boldsymbol x_i^T \boldsymbol x_j
    \end{align*}
    $$

    $$
    \begin{align*}
      \max_{\boldsymbol \lambda } \quad& \sum \lambda _i - \frac{1}{2} \sum\limits_i \sum\limits_j \lambda _i \lambda _j y_i y_j \boldsymbol x_i^T \boldsymbol x_j  \tag{Dual Problem}\\
      s.t. \quad& \sum\limits_i \lambda _i^* y_i = 0\\
      & \lambda _i \ge  0
    \end{align*}
    $$
    Dual Problem is Convex Quadratic programming problem, Could be solved $λ_i^*$ by Sequential Minimal Optimization,   
    代入解出$\boldsymbol w^*, b^*$.  
    KKT条件,
    $$
    \begin{align*}
      y_i \left(\boldsymbol w^{*T} \boldsymbol x_i + b^*\right) &\le  1\\
      \lambda _i^* &\ge  0\\
      \lambda _i^* \left(1 - y_i \left(\boldsymbol w^{*T} \boldsymbol x_i + b^*\right)\right) &= 0\\
      \boldsymbol w^* &= \sum\limits_i \lambda _i^* x_i y_i\\
      \sum\limits_i \lambda _i^* y_i &= 0
    \end{align*}
    $$

- Include
  * Kernel Method & Kernel Function
    - Define  
      $$κ(\boldsymbol x_i, \boldsymbol x_j) = \phi(\boldsymbol x_i)^T \phi(\boldsymbol x_j)$$
      
    - Example  
      |Kernel|Expression|
      |---|---|
      | Linear Kernel | $\kappa \left(\boldsymbol x_i, \boldsymbol x_j\right) = \boldsymbol x_i^T \boldsymbol x_j$ |
      | Gauss Kernel | $\kappa \left(\boldsymbol x_i, \boldsymbol x_j\right) = e^{-\frac{1}{2}\left(\boldsymbol x_i - \boldsymbol x_j\right)^T \Sigma ^{-1} \left(\boldsymbol x_i - \boldsymbol x_j\right)}$ |
      | Polynomial Kernel | $\kappa \left(\boldsymbol x_i, \boldsymbol x_j\right) = \left(\boldsymbol x_i^T \boldsymbol x_j\right)^d$ |
      | Laplace Kernel | $\kappa \left(\boldsymbol x_i, \boldsymbol x_j\right) = e^{-\frac{\|\boldsymbol x_i-\boldsymbol x_j\|}{\sigma}}$ |
      | Sigmoid Kernel | $\kappa \left(\boldsymbol x_i, \boldsymbol x_j\right) = \tanh \left(\beta \boldsymbol x_i^T \boldsymbol x_j + \theta \right)$ |
      |||

