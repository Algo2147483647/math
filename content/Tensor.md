# Tensor

[TOC]

## Define

> A tensor is a multilinear object that generalizes scalars, vectors, covectors, and linear maps.

$$
T:\underbrace{V^*\times\cdots\times V^*}_{k\text{ times}}\times\underbrace{V\times\cdots\times V}_{l\text{ times}}\to\mathbb{R}
$$

A $(k,l)$-type tensor $T$ is a multilinear map on an $n$-dimensional [vector space](./Linear_Space.md) $V$ and its dual space $V^*$.

In abstract index notation, tensors $T_{a_1,\cdots, a_l}^{a_{l+1}, \cdot, a_{l+k}}$ are denoted by letters with indices, but the indices do not refer to specific components in a particular basis as in the traditional component-based index notation. Instead, they represent the abstract algebraic and geometric roles that the tensors play in a given context. (Therefore, we cannot discuss the issue of $a=1$ or $a=2$)

- Repeating the upper and lower abstract indicators represents shrinking and combining these two indicators

$$
T_a^{ab} = T(e^{\mu^*}, \cdot ; e_\mu)
$$

- Specific indicators: When it comes to the components of tensors, the corresponding indicators are represented by lowercase Greek letters such as $\mu, \nu, \alpha, \beta$, and can be asked whether $\alpha = 1, \alpha = 2$.

$$
T_c^{ab} = T^{\mu\nu}_\sigma (e_\mu)^a(e_\nu)^b(e^\sigma)_c
$$

## Properties

### Special Examples

- vector is a $(1, 0)$-Tensor, $T: V^* \to \mathbb R$
- dual vector is a $(0, 1)$-Tensor, $T: V \to \mathbb R$
- matrix is a $(1, 1)$-tensor, $T: V^* \times V \to \mathbb R$

Matrix multiplied by vector: $\boldsymbol A \boldsymbol v = A_i^j v^i = w^j$

### Basic Operations

- Addition: 

$$
(T + S)(\alpha_1,\cdots,\alpha_k,v_1,\cdots,v_l)=T(\alpha_1,\cdots,\alpha_k,v_1,\cdots,v_l)+S(\alpha_1,\cdots,\alpha_k,v_1,\cdots,v_l)
$$

- Tensor Product

$$
(T S)(\alpha_1,\cdots,\alpha_{k_1 + k_2},v_1,\cdots,v_{l_1 + l_2})=T(\alpha_1,\cdots,\alpha_{k_1},v_1,\cdots,v_{l_1})S(\alpha_{k_1+1},\cdots,\alpha_{k_1 + k_2},v_{l_1 + 1},\cdots,v_{l_1 + l_2})
$$

- $\alpha_1,\cdots,\alpha_k\in V^*$
- $v_1,\cdots,v_l\in V$.

### Contraction

$$
C\left(T^{i_1\cdots i_{k - 1}i_{k + 1}\cdots i_m}_{j_1\cdots j_{l - 1}j_{l + 1}\cdots j_n}\right)=\sum_{r = 1}^{N}T^{i_1\cdots r\cdots i_m}_{j_1\cdots r\cdots j_n}
$$

The contraction of a tensor is an operation that reduces the rank of a tensor by summing over a pair of indices. For a tensor $T^{i_1i_2\cdots i_m}_{j_1j_2\cdots j_n}$, if we contract over the indices $i_k$ and $j_l$, we sum over the values of these indices.

- $N$ is the dimension of the vector space on which the tensor is defined.
