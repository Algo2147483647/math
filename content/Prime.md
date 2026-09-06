# Prime

[TOC]

## Define

> A prime number is a natural number greater than one whose only positive divisors are one and itself.

$$
p\in \mathbb Z_{>1} \quad\land\quad \forall d\in\mathbb Z_{>0},\; d\mid p \Rightarrow (d=1\lor d=p)  \tag{prime}
$$
A prime number is a natural number $p > 1$ that is divisible only by $1$ and itself.

## Properties

**Infinitude of Primes.** There exist infinitely many $p \in \mathbb N$ such that $p$ is prime.

> ***Proof of Infinitude of Primes***
>
> Assume there are only finitely many primes $p_1, \cdots, p_n$. Construct,
> $$
> N = p_1p_2\cdots p_n + 1
> $$
> Since $N > 1$, $\forall p_i \in \{p_1, \cdots, p_n\}$, we have
> $$
> N \equiv 1 \mod p_i
> $$
> Hence, there are infinitely many primes.
>
> Q.E.D

- 2 is the only even prime number and minimum prime number.
- Prime factorization is unique.
- $\forall p_1, p_2$ are prisms, $\gcd(p_1, p_2) = 1$.
- $p \mid ab \Rightarrow p \mid a \or p \mid b$

### Fundamental Theorem of Arithmetic

Any integer $n$ greater than $1$ can be uniquely expressed in the form of prime $p_i$ product.   
$$
n = \prod_i p_i^{\alpha_i} \quad n \in \mathbb Z, n > 1
$$

### Goldbach's Conjecture

every even natural number greater than 2 is the sum of two prime numbers.
$$
\forall n \in \mathbb{Z}^+ \, (\, n > 2 \, \land \, \text{even}(n) \, ) \, \exists \, p, q \in \text{Primes} \, (\, n = p + q \, )
$$

### Mersenne Prime

$$
M_n = 2^n - 1  \tag{Mersenne number}
$$
Mersenne Prime is a prime number that is one less than a power of two.



Examples of mersenne primes,

|  n   |                                   value |
| :--: | --------------------------------------: |
|  2   |                                       3 |
|  3   |                                       7 |
|  5   |                                      31 |
|  7   |                                     127 |
|  13  |                                    8191 |
|  17  |                                  131071 |
|  19  |                                  524287 |
|  31  |                              2147483647 |
|  61  |                     2305843009213693951 |
|  89  |             618970019642690137449562111 |
| 107  |       162259276829213363391578010288127 |
| 127  | 170141183460469231731687303715884105727 |

### Resolving prime factors

Pollard Rho algorithm.

### Filter primes

**Euler's Sieve.** For a numbers range from $2$ to $n$, we aim to sift out all primes from them, through let each composite number be screened by its minimum prime factor.

Process,

1. We traverse the numbers $x$ range from $2$ to $n$, we join $x$ into prime set $S_p$ if $x$ is not marked as non-prime.
2. Meanwhile, we traversing the current prime table $p \in S_p$, and mark $p x$ as non-prime. When $p | x$, we should stop traversing the prime table, because that the primes $p' \in S_p$ large than $p$ are no longer the minimum prime factor of $p' x$ ($p' x = p' p r$).
