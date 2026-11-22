# $Statistics$

[TOC]

## Concept

Population

All possible observations in experiments. 


Sample


For a random variable $X$ with distribution function $F$, if $X_1, X_2,..., X_n$ are iid. random variables with distribution $F$, they are called simple random samples of $n$ capacity obtained from population $X$. Their observed values $x_1, x_2,..., x_n$ are called independent sample values.

Sample Statistic


For samples $X_1, X_2,..., X_n$ from Population $X$, Statistic is a function $g(X_1, ..., X_n)$ (is still a random variable) without any unknown parameter.

Property

Sampling Distribution  


Sampling Distribution is the distribution of Sample Statistic.


* $\chi^2$ distribution 
* Student's t-distribution
* F-distribution



Sample Mean   
$$\bar X = \frac{1}{n} \sum_{i=1}^n X_i$$

Sample Variance , Sample Standard Deviation  
$$\begin{align*}
  S^2 
  &= \frac{1}{n-1} \sum_{i=1}^n (X_i - \bar X)^2 \\
  &= \frac{1}{n-1} \left(\sum_{i=1}^n X_i^2 - n \bar X^2\right)  \tag{Sample Variance}\\
  S &= \sqrt{S^2}  \tag{Sample Standard Deviation}\\
\end{align*}$$

Sample k-order Moment
$$\hat A_k = \frac{1}{n} \sum\limits_{i=0}^n X_i^k$$

Sample k-order Central Moment
$$\hat B_k = \frac{1}{n} \sum\limits_{i=0}^n (X_i - \hat \mu)^k$$



解决一个现实问题的步骤:



1. 明确问题和参数
2. 收集和清洗数据
3. 探索性分析并确定模型
4. 选择估计方法
5. 转为优化问题并计算
6. 量化不确定性
7. 诊断与验证

