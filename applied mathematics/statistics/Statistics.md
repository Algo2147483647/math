# $Statistics$

[TOC]

## Concept

* Population
  - Define  
    All possible observations in experiments. 

* Sample
  - Define  
    For a random variable $X$ with distribution function $F$, if $X_1, X_2,..., X_n$ are iid. random variables with distribution $F$, they are called simple random samples of $n$ capacity obtained from population $X$. Their observed values $x_1, x_2,..., x_n$ are called independent sample values.

* Sample Statistic
  - Define  
    For samples $X_1, X_2,..., X_n$ from Population $X$, Statistic is a function $g(X_1, ..., X_n)$ (is still a random variable) without any unknown parameter.

  - Property
    * Sampling Distribution  
      - Define
        Sampling Distribution is the distribution of Sample Statistic.

      - Include
        * $\chi^2$ distribution 
        * Student's t-distribution
        * F-distribution

  - Include
    * Sample Mean   
      $$\bar X = \frac{1}{n} \sum_{i=1}^n X_i$$

    * Sample Variance , Sample Standard Deviation  
      $$\begin{align*}
        S^2 
        &= \frac{1}{n-1} \sum_{i=1}^n (X_i - \bar X)^2 \\
        &= \frac{1}{n-1} \left(\sum_{i=1}^n X_i^2 - n \bar X^2\right)  \tag{Sample Variance}\\
        S &= \sqrt{S^2}  \tag{Sample Standard Deviation}\\
      \end{align*}$$

    * Sample k-order Moment
      $$\hat A_k = \frac{1}{n} \sum\limits_{i=0}^n X_i^k$$

    * Sample k-order Central Moment
      $$\hat B_k = \frac{1}{n} \sum\limits_{i=0}^n (X_i - \hat \mu)^k$$

## Problem 

* Regression
* Parameter Estimation
  - Include 
    * [Point Estimation](./Point_Estimation.md)

    * Interval estimation

* [Hypothesis Testing](./Hypothesis_Testing.md)

