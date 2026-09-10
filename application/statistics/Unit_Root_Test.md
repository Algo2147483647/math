# Unit Root Test

## Define
Unit root test tests whether a [time series](./Time_Series.md) variable is stationary or not. 

The Null hypothesis $H_0$ of Unit Root Test,
$$H_0: \text{The time series contains a unit root (i.e., it is non-stationary).}$$

## Algorithm

* Augmented Dickey-Fuller Test , ADF Test
  - Purpose
    Augmented Dickey-Fuller (ADF) test is a statistical test used to determine if a time series is stationary or non-stationary.

  - Process   
    ADF test involves estimating the following regression model, 
    $$\Delta y_t = \alpha + \beta y_{t-1} + \sum_{i=1}^{p-1} \gamma_i \Delta y_{t-i} + \epsilon_t$$

    The test statistic of ADF,
    $$\text{ADF} = \frac{\beta - 1}{\text{SE}(\beta)}  \tag{ADF test statistic}$$
    $$\text{SE}(\beta) = \frac{\hat{\sigma}\epsilon}{\sqrt{\sum\limits_{i=1}^p \hat{\gamma}_i^2}}$$

    |Symbol|Means|
    |---|---|
    |$\Delta y_t = y_t - y_{t-1}$ | the first difference of $y_t$|
    |$\alpha$ | a constant term|
    |$\beta$ | the coefficient on $y_{t-1}$|
    |$\gamma_1, \ldots, \gamma_p$ | coefficients on lagged differences of $\Delta y_{t-i}$|
    |$\epsilon_t$ | the error term|
    |$SE(\beta)$|standard error of the coefficient on $y_{t-1}$|
    |||

