# Error Correction Code

[TOC]

## Problem

Error correction codes are designed to solve the problem of **recovering transmitted or stored data when some symbols are corrupted**.

- How can a receiver detect that an error occurred?
- How can the original message be recovered without retransmission?
- How much redundancy is needed to tolerate a given amount of noise?

The sender adds redundant information to the original data. The receiver uses the relationship between the data and redundancy to detect or correct errors introduced by a channel or storage medium.

## Core Idea

An error correction code maps a message into a longer codeword.

If the codewords are far apart, then a received word with a small number of errors can still be decoded to the nearest valid codeword.

The practical essence of error correction is:

1. **Add structured redundancy**
2. **Detect invalid received words**
3. **Correct errors by choosing the most likely codeword**
4. **Trade data rate for reliability**

For a code with message length $k$ and codeword length $n$, the code rate is:
$$
R = \frac{k}{n}
$$

## Solution

### Block Code

A block code encodes a fixed-size message block into a fixed-size codeword.

For an $(n,k)$ block code:

- $k$ information symbols are input
- $n$ code symbols are output
- $n-k$ symbols are redundancy

### Linear Block Code

A linear block code uses linear algebra over a finite field, often $\mathbb{F}_2$.

Encoding can be written as:
$$
c = uG
$$

where:

- $u$ is the message vector
- $G$ is the generator matrix
- $c$ is the codeword

A parity-check matrix $H$ defines valid codewords:
$$
Hc^T = 0
$$

For a received word $r$, the syndrome is:
$$
s = Hr^T
$$

If $s \ne 0$, an error has been detected.

### Hamming Distance

The Hamming distance between two codewords is the number of positions where they differ.

If the minimum distance of a code is $d_{min}$, then it can:

- detect up to $d_{min}-1$ errors
- correct up to $\left\lfloor \frac{d_{min}-1}{2} \right\rfloor$ errors

### Hamming Code

Hamming codes are linear block codes designed to correct single-bit errors.

If $r$ parity bits protect $k$ data bits, the total length is:
$$
n = k + r
$$

To correct one error, the parity bits must distinguish all $n$ bit positions plus the no-error case:
$$
2^r \ge n + 1
$$

Equivalently:
$$
2^r - 1 \ge n
$$

Basic Hamming codes correct one bit error. Extended Hamming codes add one more parity bit to also detect two-bit errors.

### Cyclic Code

A cyclic code is a linear block code with cyclic symmetry.

If:
$$
(c_0,c_1,\dots,c_{n-1})
$$

is a codeword, then its cyclic shift is also a codeword:
$$
(c_{n-1},c_0,c_1,\dots,c_{n-2})
$$

Cyclic codes can be represented using polynomials modulo $x^n-1$, which makes encoding and syndrome computation efficient.

### Low-Density Parity-Check Code

Low-density parity-check codes use a sparse parity-check matrix $H$.

The sparsity allows iterative decoding on a bipartite graph:

- variable nodes represent code bits
- check nodes represent parity constraints
- edges represent nonzero entries in $H$

LDPC codes can approach channel capacity with long block lengths and efficient belief-propagation decoding.

### Convolutional Code

A convolutional code has memory.

The encoded output depends on:

- current input bits
- previous input bits stored in the encoder state

The constraint length describes how much history affects the output.

### Viterbi Decoding

Viterbi decoding is a dynamic programming algorithm for convolutional codes.

It searches a trellis and keeps the most likely path ending in each state.

### Turbo Code

Turbo codes combine two or more convolutional codes with an interleaver.

They use iterative decoding, where decoders exchange soft information until the estimate stabilizes or the iteration limit is reached.

##  Boundaries

### Redundancy Reduces Rate

Adding parity symbols improves reliability but lowers the code rate:
$$
R = \frac{k}{n}
$$

Higher reliability usually costs more redundancy or more decoding work.

### Correction Capability Is Limited

A code can only correct errors within its designed distance or probabilistic decoding capability.

Too many errors can cause decoding failure or miscorrection.

### Channel Model Matters

Different codes fit different noise patterns:

- random independent bit errors
- burst errors
- erasures
- soft-decision noisy observations
- fading channels

Interleaving is often used to convert burst errors into more independent-looking errors.

### Finite Length Matters

Asymptotic capacity results often assume long block lengths. Real systems must balance performance with latency and complexity.

## Cost

The main cost of error correction codes lies in the trade-off between **redundancy, decoding complexity, latency, and reliability**.

### Time Cost

- Linear block encoding: often **O(nk)** with dense matrices, less with structure
- Syndrome computation: **O(n(n-k))** dense, less with sparse matrices
- Viterbi decoding: proportional to trellis length times number of states
- LDPC decoding: proportional to number of graph edges times iteration count
- Turbo decoding: proportional to block length times iteration count

### Space Cost

Storage is needed for:

- generator or parity-check matrices
- trellis states
- interleavers
- soft values and messages
- buffers for code blocks

Sparse codes such as LDPC reduce matrix storage.

### Engineering Cost

In real systems, implementing error correction requires careful decisions about:

- target channel model
- code rate
- block length
- hard-decision versus soft-decision decoding
- latency budget
- error floor behavior
- hardware or software constraints

So error correction is not just adding extra bits. The redundancy must be structured so decoding is reliable and computationally feasible.
