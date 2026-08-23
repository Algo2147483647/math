# Prime

[TOC]

## Define

> A prime number is a natural number greater than one whose only positive divisors are one and itself.

$$
p > 1 \text{ and the only positive divisors of } p \text{ are } 1 \text{ and } p
\tag{Prime}
$$
A prime number is a natural number $p > 1$ that is divisible only by $1$ and itself.

## Properties

### Fundamental Theorem of Arithmetic
Any integer $n$ greater than $1$ can be uniquely expressed in the form of prime $p_i$ product.   
$$
n = \prod_i p_i^{\alpha_i} \quad n \in \mathbb Z, n > 1
$$

### Fermat's Little Theorem

$$
a^{p-1} \equiv 1 \mod p
$$
Where $p$ is a prime and $a$ is any integer that is not a multiple of $p$.

Property:
$$
\frac{a}{b} \mod p \equiv a \times b^{p-2} \mod p
$$

> Proof
>
>
> $$
> \frac{a}{b} \mod p = a \times b^{-1} \mod p  \\
> b^{p-1} \equiv 1 \mod p \\
> b \times b^{p-1} \equiv 1 \mod p  \\
> \Rightarrow \quad b^{-1} \equiv b^{p-2}  \mod p \\
> \Rightarrow \quad \frac{a}{b} \mod p \equiv a \times b^{p-2} \mod p
> $$

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

Property:
- example of mersenne primes
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

### Resolving prime factor

- Pollard Rho algorithm

### Filter Prime Number from a range of numbers

Euler's Sieve
For a numbers range from $2$ to $n$, we aim to sift out all primes from them, through let each composite number be screened by its minimum prime factor.

- Process
  First, We traverse the numbers $x$ range from $2$ to $n$, we join $x$ into prime set $S_p$ if $x$ is not marked as non-prime.

  Meanwhile, we traversing the current prime table $p \in S_p$, and mark $p x$ as non-prime. When $p | x$, we should stop traversing the prime table, because that the primes $p' \in S_p$ large than $p$ are no longer the minimum prime factor of $p' x$ ($p' x = p' p r$).
