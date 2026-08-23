# Boolean Algebra

[TOC]

## Define

> Boolean algebra is an algebraic structure that formalizes logical operations such as and, or, and not.

Boolean Algebra is a [Lattice](./Lattice.md) including value and its operators,
$$
(\{0, 1\}, \neg, \wedge, \vee)
$$

The value of boolean algebra belongs to $\{\text{true}, \text{false}\}$, usually denoted $\{1, 0\}$. The basic operations of boolean algebra include $\neg, \wedge, \vee$.

- NOT $\neg$
  NOT is a unary operator.
  
  |$a$|$\neg a$|
  |---|---|
  | 0 | 1 |
  | 1 | 0 |
  
- AND $\wedge$, OR $\vee$
  AND, OR are two binary operators.  
  
  |$a$|$b$|$a \wedge b$|$a \vee b$|
  |:---:|:---:|:---:|:---:|
  | 0 | 0 | 0 | 0 | 
  | 0 | 1 | 0 | 1 | 
  | 1 | 0 | 0 | 1 | 
  | 1 | 1 | 1 | 1 |

## Properties

- 

  - $a \wedge b = b \wedge a$

  - $a \vee b = b \vee a$

  - $(a \wedge b) \wedge c = a \wedge (b \wedge c)$

  - $(a \vee b) \vee c = a \vee (b \vee c)$

  - $\neg(a \wedge b) = \neg a \vee \neg b$

  - $\neg(a \vee b) = \neg a \wedge \neg b$

  - $a \wedge (a \vee b) = a$

  - $a \vee (a \wedge b) = a$

  - $a \wedge (b \vee c) = (a \wedge b) \vee (a \wedge c)$

  - $a \vee (b \wedge c) = (a \vee b) \wedge (a \vee c)$

### XOR & XNOR

- Define   
  XOR $\oplus$, XNOR $\odot$ are two binary operators.  
  
  |$a$|$b$|$a \oplus b$|$a \odot b$|
  |:---:|:---:|:---:|:---:|
  | 0 | 0 | 0 | 1 | 
  | 0 | 1 | 1 | 0 | 
  | 1 | 0 | 1 | 0 | 
  | 1 | 1 | 0 | 1 | 
  |||
  $$a \oplus b = \neg(a \odot b)$$
  $$a \oplus b = (a \wedge \neg b) \vee (\neg a \wedge b)$$
  
- Property
  - $x \oplus 0 = x$
  - $x \oplus 1 = \neg x$
  - $x \oplus \neg x = 1$
  - $x \oplus x = 0$
  - $(a \oplus b) \oplus c = a \oplus (b \oplus c)$

- |
|$f(0, 0)$|$f(0, 1) = f(1, 0)$|$f(1, 1)$|operator|
|:---:|:---:|:---:|:---:|
| 0 | 0 | 0 | $a \wedge 0$ |
| 0 | 0 | 1 | $a \wedge b$ |
| 0 | 1 | 0 | $a \oplus b = (a \wedge \neg b) \vee (\neg a \wedge b)$ |
| 0 | 1 | 1 | $a \vee b$ |
| 1 | 0 | 0 | $\neg(a \vee b)$ |
| 1 | 0 | 1 | $a \odot b = (a \vee \neg b) \wedge (\neg a \vee b)$ |
| 1 | 1 | 0 | $\neg(a \wedge b)$ |
| 1 | 1 | 1 | $a \vee 0$ |
|||||
