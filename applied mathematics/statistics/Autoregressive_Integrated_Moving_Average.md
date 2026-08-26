# Autoregressive Integrated Moving Average  (ARIMA)

[TOC]

## Define
$ARIMA(p, d, q):$ 
$$
\left(1 - \sum_{i=1}^p \alpha_i L^i \right) (1 - L)^d X_t = \left(1 + \sum_{i=1}^{q} \theta_i L^i \right) \epsilon_t
$$

using $ARIMA(p, d, q)$ to fit the [time series](./Time_Series.md) $\{X_1, ..., X_t\}$ and find the value of parameter $\alpha_i, \theta_i$.

|Symbol|Mean|
|---|---|
|$p$|order of Autoregressive|
|$d$|order of Difference|
|$q$|order of Moving Average|
|$L$|Lag operator|
|$(1 - L)^d X_t = \Delta^d X_t$|the d-order difference operator, Integrated|
|$\left(1 - \sum\limits_{i=1}^p \alpha_i L^i \right) X_t = \epsilon_t$|Autoregressive|
|$\left(1 + \sum\limits_{i=1}^{q} \theta_i L^i \right) \epsilon_t = X_t$|Moving Average|

## Property

### the selection of the order $p, d, q$  
$ARIMA(p, d, 0)$  
自相关系数呈现指数下降或者类似正弦型的波动;
偏自相关图中的延迟 p 中有明显突起, 但延迟更大时不存在类似的突起.    

$ARIMA(0, d, q)$  
偏自相关系数呈现指数下降或者类似正弦型的波动;  
在自相关图中的延迟 q 中有明显突起, 但延迟更大时不存在类似的突起.  

- Autocorrelation Function reflect the correlation between $y_t$ and $y_{t-\tau}$.   
- Partial Autocorrelation Function reflect the correlation between $y_t$ and $y_{t-\tau}$ after eliminating the influence of $y_{t-1}, ..., y_{t-(\tau-1)}$ for $y_t$.

## Application

### Prediction

1. 确定ARIMA模型的参数$p$, $d$, 和 $q$。
2. 对时间序列进行$d$阶差分以获得平稳序列。
3. 使用最小二乘法或最大似然估计来估计AR和MA参数。
4. 根据估计的参数预测未来的值。
$$
\begin{align*}
  \left(1 - \sum_{i=1}^p \alpha_i L^i \right) (1 - L)^d X_t &= \left(1 + \sum_{i=1}^{q} \theta_i L^i \right) \epsilon_t  \\
  \left(1 - \sum_{i=1}^{p+d} \beta_i L^i \right) X_t &= \left(1 + \sum_{i=1}^{q} \theta_i L^i \right) \epsilon_t  \\
  X_t &= \left(\sum_{i=1}^{p+d} \beta_i L^i \right) X_t + \left(1 + \sum_{i=1}^{q} \theta_i L^i \right) \epsilon_t  \\
  \Rightarrow X_{t+\tau} &= \left(\sum_{i=1}^{p+d} \beta_i L^i \right) X_{t+\tau} + \left(1 + \sum_{i=1}^{q} \theta_i L^i \right) \epsilon_{t+\tau}  \tag{Prediction}\\
  &\quad; \epsilon_{\tau} = 0, \tau > t
\end{align*}
$$

* Season Autoregressive Integrated Moving Average
  - Purpose  
    $SARIMA(p, d, q)(P, D, Q)_m$:  
    $$\left(1 - \sum_{i=1}^p \alpha_i L^i \right) \left(1 - \sum_{i=1}^P A_i L^{i·m} \right) (1 - L)^d (1 - L^{m})^D X_t = \left(1 + \sum_{i=1}^{q} \theta_i L^i \right) \left(1 + \sum_{i=1}^{Q} \Theta_i L^{i·m} \right) \epsilon_t$$ 

    using $ARIMA(p, d, q)$ to fit the time series with Seasonality $\{X_1, ..., X_t\}$ and find the value of parameter $\alpha_i, \theta_i, A_i, \Theta_i$.