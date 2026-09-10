# Stochastic Differential Equation

[TOC]

## Define

A Stochastic Differential Equation (SDE) is a mathematical equation that describes the evolution of a stochastic process over continuous time. It combines elements of ordinary differential equations (ODEs) with stochastic calculus to model systems where randomness or uncertainty plays a significant role.

现实是充满了噪音的，随机微分方程，一个包含了噪音的微分方程。我们希望这个噪音是一个比较好的噪音，它必须是平稳、独立、且均值为0的噪音。作为最佳候选者，noise将使用一个布朗运动的微小增量替代
$$
\mathrm{d}X_t = \mu(t, X_t) \mathrm{d}t + \sigma(t, X_t) \mathrm{d} B_t
$$
- $dX(t)$: This represents the infinitesimal change in the stochastic process X(t) over a small time interval dt.
- $a(X(t), t)$: It is a deterministic function that defines the drift or trend of the process at time t and depends on both the current value of X(t) and time t.
- $b(X(t), t)$: This is a deterministic function that defines the volatility or randomness in the process at time t and depends on both the current value of X(t) and time t.
- $dW(t)$: 布朗运动, 维纳过程. It represents a Wiener process or Brownian motion, which is a continuous-time stochastic process with independent and normally distributed increments. It introduces randomness or noise into the equation.

## Itô integral

$B_t$ 无法求微分，Ito积分重新定义积分的概念, 解决古典微积分的手段无法对布朗运动处理的困境。伊藤引理是理解和求解SDE的关键工具。它提供了一种方法来计算一个随机过程的函数的微分。

Ito 积分的定义是基于布朗运动（Wiener 过程）的增量的。
$$
I = \int_0^t g(X_s, s) \mathrm{d}B_s
$$

$$
\int_0^t f(s, B_s) \mathrm{d} B_s = \lim_{n\to\infty} \sum^{n-1}_{i=0} f(t_i, B_{t_i}) (B_{t_{i+1}} - B_{t_i})
$$



### Property

$$
\mathbb E(\int_0^t g(X_s, s) \mathrm{d}B_s) = 0
$$

$$
\mathbb E(\int_0^t f(X_s, s) \mathrm{d}B_s \cdot \int_0^t g(X_s, s) \mathrm{d}B_s) = \int \mathbb E(f\cdot g)\mathrm{d}t
$$



### Itô's Lemma

$$
\mathrm{d} f(t, X(t)) = \left(\frac{\partial f}{\partial t} + \frac{\partial f}{\partial X}\mu + \frac{1}{2}\frac{\partial^2 f}{\partial X^2}\sigma^2\right) \mathrm{d} t + \frac{\partial f}{\partial X}\sigma\mathrm{d} W(t)
$$

## Stratonovich integral

Stratonovich 积分使用了一个中间值，而不是在积分路径的起点或终点进行计算。
$$
\int\frac{1}{2}(H(t) + H(t+dt)) \circ \mathrm{d}W(t)
$$
