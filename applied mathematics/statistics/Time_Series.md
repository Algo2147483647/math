# Time Series Prediction

[TOC]

## Define

Let $\{y_t\}_{t=1}^T$ represent a univariate time series, where $y_t$ is the observed value at time $t$. Time series $\{y_t\}_{t \in T}$is considered as a stochastic process (if the observed value is a random variable) or a deterministic sequence (if the observed value is a deterministic value). The time series prediction problem can be defined as finding a function $f$ such that:

$$
\hat{y}_{t+h} = f(y_1, y_2, \ldots, y_t)
$$

where $\hat{y}_{t+h}$ is the predicted value of the time series at time $t+h$, and $f$ encapsulates the relationship and patterns within the historical data up to time $t$ for accurate forecasting.

- **随机时间序列**：$x_t$ 是在时间点 $t$ 的一个随机变量，整个序列 $\{x_t\}$ 表示一个随时间变化的随机过程。
- **确定性时间序列**：$x_t$ 是在时间点 $t$ 的一个确定性的值，整个序列 $\{x_t\}$ 描述了一个随时间变化的确定性过程。

