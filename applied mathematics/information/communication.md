# Communication

[TOC]

## Problem

Communication is designed to solve the problem of **transmitting information from a sender to a receiver through a noisy channel**.

- How can a message be represented as a signal?
- How much information can a channel carry reliably?
- How do noise, bandwidth, and signal power limit transmission?
- How can coding and modulation make communication robust?

A basic communication system has the form:
$$
\text{Sender}
\xrightarrow[\text{noise}]{\quad \text{channel} \quad}
\text{Receiver}
$$

## Core Idea

Communication separates a message from the physical signal used to carry it.

The sender encodes information into a signal, the channel modifies the signal, and the receiver tries to infer the original information from the received observation.

The practical essence of communication is:

1. **Encode information into transmissible symbols**
2. **Send those symbols through a noisy channel**
3. **Decode the received signal into an estimate of the message**
4. **Use redundancy and modulation to trade rate, power, and reliability**

The fundamental limit is channel capacity: the maximum reliable information rate supported by the channel.

## Solution

### System Components

A communication system usually contains:

- **source**: produces messages or data
- **source encoder**: removes redundancy or compresses data
- **channel encoder**: adds controlled redundancy for error protection
- **modulator**: converts symbols into physical waveforms
- **channel**: transmits the signal and adds noise or distortion
- **demodulator**: converts received waveforms back into symbols
- **channel decoder**: detects or corrects errors
- **receiver**: reconstructs the intended message

### Channel Model

A channel is often modeled probabilistically.

For input random variable $X$ and output random variable $Y$, the channel is described by:
$$
P(y|x)
$$

The receiver observes $Y$ and estimates the transmitted $X$.

### Mutual Information

The information transmitted through a channel is measured by mutual information:
$$
I(X;Y)
$$

It measures how much uncertainty about $X$ is reduced after observing $Y$.

If $X$ and $Y$ are independent:
$$
I(X;Y) = 0
$$

If $Y$ determines $X$ exactly, then the channel preserves all information in $X$.

### Channel Capacity

Channel capacity is the maximum mutual information over all possible input distributions:
$$
C = \max_{P(x)} I(X;Y)
$$

It is the theoretical maximum rate at which information can be transmitted reliably over the channel.

If the transmission rate is below capacity, reliable communication is possible in principle with suitable codes. If the rate is above capacity, arbitrarily reliable communication is impossible.

### Shannon-Hartley Theorem

For an additive white Gaussian noise channel with bandwidth $B$ and signal-to-noise ratio $S/N$, the capacity is:
$$
C = B\log_2\left(1+\frac{S}{N}\right)
$$

where:

- $C$ is channel capacity in bits per second
- $B$ is bandwidth in hertz
- $S/N$ is the signal-to-noise ratio as a linear power ratio

This formula shows two ways to increase capacity:

- increase bandwidth
- increase signal-to-noise ratio

However, capacity grows only logarithmically with signal power.

### Modulation

Modulation converts digital or analog information into a physical signal suitable for a channel.

Common modulation dimensions include:

- amplitude
- frequency
- phase
- time position
- multiple carriers

Digital modulation maps bits to symbols. For example, $M$-ary modulation can carry:
$$
\log_2 M
$$

bits per symbol under ideal symbol decisions.

### Coding

Channel coding adds redundancy so the receiver can detect or correct errors caused by the channel.

Related note:

- [Error Correction Code](./error%20correction%20code.md)

##  Boundaries

### Capacity Is A Limit, Not A Specific Code

Channel capacity says what is theoretically possible, but it does not give a direct encoding and decoding algorithm.

Practical systems need finite-length codes, modulation schemes, synchronization, and decoding algorithms.

### Channel Models Are Simplifications

Real channels may include:

- fading
- interference
- nonlinear distortion
- synchronization error
- quantization
- burst noise
- time-varying behavior

The useful capacity formula depends on whether the model matches the real channel.

### Reliability Requires Delay And Redundancy

Better reliability usually requires:

- longer code blocks
- lower coding rate
- more decoding computation
- additional latency

### Bandwidth And Power Are Limited

Communication systems usually face constraints from physical hardware, regulation, battery power, spectrum allocation, and thermal noise.

## Cost

The main cost of communication lies in the trade-off between **rate, reliability, bandwidth, power, and latency**.

### Time Cost

Important time-related costs include:

- encoding delay
- modulation and symbol timing
- propagation delay
- decoding delay
- retransmission delay

Error-correcting codes often improve reliability at the cost of decoding computation and latency.

### Space Cost

Communication systems require memory for:

- buffers
- interleavers
- code blocks
- channel estimates
- decoder state

The storage cost depends strongly on coding and protocol design.

### Engineering Cost

In real systems, communication design requires careful decisions about:

- source coding versus channel coding
- modulation order
- bandwidth allocation
- power budget
- channel estimation
- synchronization
- error correction and retransmission
- latency constraints

So communication theory provides the limits, while engineering chooses a practical point inside those limits.
