# Compressed Sensing

[TOC]

## Problem

Compressed sensing is designed to solve the problem of **recovering a sparse or compressible signal from far fewer linear measurements than its ambient dimension**.

- How can a high-dimensional signal be reconstructed from a small number of measurements?
- How should the measurement matrix be designed?
- How can the sparse solution be recovered efficiently?

The measurement model is:
$$
b = Ax
$$

where:

- $A \in \mathbb{C}^{m \times n}$ is the measurement matrix
- $x \in \mathbb{C}^n$ is the unknown signal
- $b \in \mathbb{C}^m$ is the observed measurement vector
- $m \ll n$

Since the system is underdetermined, there are usually infinitely many solutions without additional assumptions.

## Core Idea

Compressed sensing assumes that the desired signal is sparse, or sparse after a transform.

A vector $x$ is $s$-sparse if it has at most $s$ nonzero entries:
$$
\|x\|_0 \le s
$$

The ideal recovery problem is:
$$
\begin{aligned}
\min_x \quad & \|x\|_0 \\
\text{s.t.} \quad & Ax = b
\end{aligned}
$$

However, $\ell_0$ minimization is non-convex and generally NP-hard.

The practical essence of compressed sensing is:

1. **Use fewer measurements than the signal dimension**
2. **Exploit sparsity to make recovery possible**
3. **Replace hard sparse recovery with convex or greedy algorithms**

## Solution

### Basis Pursuit

A common relaxation replaces the $\ell_0$ objective with the $\ell_1$ norm:
$$
\begin{aligned}
\min_x \quad & \|x\|_1 = \sum_{i=1}^{n}|x_i| \\
\text{s.t.} \quad & Ax = b
\end{aligned}
$$

This problem is convex and often recovers the same sparse solution when the measurement matrix is well behaved.

### Noisy Measurements

If measurements contain noise:
$$
b = Ax + e
$$

then exact equality is too strict. A common formulation is:
$$
\begin{aligned}
\min_x \quad & \|x\|_1 \\
\text{s.t.} \quad & \|Ax-b\|_2 \le \epsilon
\end{aligned}
$$

Another common form is LASSO:
$$
\min_x \frac{1}{2}\|Ax-b\|_2^2 + \lambda\|x\|_1
$$

### Restricted Isometry Property

The restricted isometry property states that $A$ approximately preserves the length of sparse vectors.

For every $s$-sparse vector $x$:
$$
(1-\delta_s)\|x\|_2^2
\le
\|Ax\|_2^2
\le
(1+\delta_s)\|x\|_2^2
$$

where $\delta_s$ is the restricted isometry constant.

This means sparse vectors do not collapse or distort too much under the measurement map.

### Orthogonal Matching Pursuit

Orthogonal Matching Pursuit is a greedy sparse recovery algorithm.

Let:
$$
A = (a_1,\dots,a_n)
$$

and assume the columns are normalized:
$$
\hat{a}_i = \frac{a_i}{\|a_i\|_2}
$$

OMP repeatedly chooses the column most correlated with the current residual.

### OMP Algorithm

Initialize:
$$
\begin{aligned}
r_0 &\gets b \\
\Lambda_0 &\gets \emptyset \\
x_0 &\gets 0
\end{aligned}
$$

For $k = 1,\dots,s$:

1. Select the index with largest correlation:
   $$
   i_k =
   \arg\max_{i \notin \Lambda_{k-1}}
   |a_i^*r_{k-1}|
   $$

2. Update the support:
   $$
   \Lambda_k = \Lambda_{k-1} \cup \{i_k\}
   $$

3. Solve the least-squares problem on the selected support:
   $$
   x_k|_{\Lambda_k}
   =
   \arg\min_z \|A_{\Lambda_k}z-b\|_2
   =
   A_{\Lambda_k}^{+}b
   $$

4. Set unselected coefficients to zero:
   $$
   x_k|_{\Lambda_k^c} = 0
   $$

5. Update the residual:
   $$
   r_k = b - Ax_k
   $$

Stop when the sparsity level is reached, the residual is small, or the correlation is below a threshold.

### Measurement Matrix Design

Good compressed sensing matrices should make sparse signals distinguishable.

Common choices include:

- random Gaussian matrices
- random Bernoulli matrices
- partial Fourier matrices
- incoherent sensing bases

In practice, measurement design is often constrained by the physical system.

##  Boundaries

### Sparsity Is Required

Compressed sensing works when the signal is sparse or compressible in a known basis.

If the signal is dense in every useful basis, few measurements are not enough.

### Matrix Quality Matters

Recovery depends on properties such as:

- restricted isometry
- incoherence
- low column correlation
- sufficient number of measurements

Poor measurement matrices can make different sparse signals produce the same measurements.

### Noise Reduces Exact Recovery

With noise, the goal becomes stable approximation rather than exact reconstruction.

The recovered signal may be close but not identical.

### Algorithms Have Different Trade-Offs

Convex optimization methods are robust but may be expensive. Greedy methods are often faster but can fail when correlations are misleading.

## Cost

The main cost of compressed sensing lies in the trade-off between **fewer measurements** and **more difficult reconstruction**.

### Time Cost

- Forming measurements: depends on $A$
- Basis pursuit: polynomial time, but often expensive for large $n$
- LASSO solvers: iterative, cost depends on sparsity and conditioning
- OMP with sparsity $s$: roughly **O(smn)** plus least-squares updates

### Space Cost

Storing a dense measurement matrix costs:
$$
O(mn)
$$

Structured matrices such as partial Fourier operators can reduce storage and accelerate multiplication.

### Engineering Cost

In real systems, compressed sensing requires careful decisions about:

- sparsifying basis
- measurement design
- noise model
- recovery algorithm
- stopping criterion
- regularization parameter
- validation of reconstruction quality

So compressed sensing saves measurements by spending structure, assumptions, and reconstruction computation.
