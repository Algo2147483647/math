# Heap

[TOC]

## Problem

A heap is designed to solve the problem of **quickly accessing the element with the highest or lowest priority**.

- What is the current minimum or maximum element?
- How can I insert a new element while preserving priority order?
- How can I repeatedly remove the highest-priority element efficiently?

## Core Idea

A heap addresses this by maintaining a partial order instead of a full sorted order.

For a **max heap**, every parent has priority greater than or equal to its children:
$$
priority(parent) \ge priority(child)
$$

For a **min heap**, every parent has priority less than or equal to its children:
$$
priority(parent) \le priority(child)
$$

This means the best element is always located at the root. The heap does not require all elements to be sorted. It only guarantees that the root is the current extremum.

The practical essence of a heap is:

1. **Keep the extremum at the root**
2. **Maintain local parent-child priority order**
3. **Use tree shape constraints to keep height logarithmic**

Usually, a heap is implemented as a **complete binary tree**, so its height is:
$$
O(\log n)
$$

## Solution

### Abstract Structure

$$
\{S, \arg\max(S) / \arg\min(S)\}
$$

A heap stores a collection of elements where each element has an associated priority. It supports fast access to the highest-priority or lowest-priority element, depending on whether the heap is a max heap or min heap.

### Binary Heap

The most common heap implementation is the **binary heap**.

A binary heap satisfies two conditions:

- **Shape property**: the tree is complete, so all levels are filled except possibly the last one.
- **Heap property**: each parent has priority no worse than its children.

Because the tree is complete, it can be stored compactly in an array.

For a zero-indexed array:

- parent of node $i$: $\left\lfloor \frac{i - 1}{2} \right\rfloor$
- left child of node $i$: $2i + 1$
- right child of node $i$: $2i + 2$

### Insert

To insert a new element:

1. Append it to the end of the array.
2. Compare it with its parent.
3. Swap upward while the heap property is violated.

This upward adjustment is often called **sift up** or **bubble up**.

### Peek

The minimum or maximum element is always stored at the root.

- In a min heap, `heap[0]` is the minimum.
- In a max heap, `heap[0]` is the maximum.

This operation does not modify the heap.

### Extract

To remove the root:

1. Save the root as the result.
2. Move the last element to the root.
3. Remove the last array slot.
4. Compare the new root with its children.
5. Swap downward while the heap property is violated.

This downward adjustment is often called **sift down** or **heapify down**.

### Build Heap

Given an unordered array, a heap can be built by applying sift down from the last internal node back to the root.

The last internal node is:
$$
\left\lfloor \frac{n}{2} \right\rfloor - 1
$$

Although each sift down may cost $O(\log n)$, building a heap this way costs only:
$$
O(n)
$$

### Heap Sort

Heap sort repeatedly extracts the root and places it into its final sorted position.

![Heap sort](./assets/heap_sort.svg)

For an ascending sort, a max heap is commonly used:

1. Build a max heap.
2. Swap the root with the last unsorted element.
3. Shrink the heap range.
4. Restore the heap property.

##  Boundaries

### Not Fully Ordered

A heap only guarantees that each parent is ordered relative to its children. It does not guarantee that elements at the same level, or across unrelated branches, are sorted.

So a heap is not suitable when you need:

- fast search for arbitrary values
- sorted iteration
- predecessor or successor queries
- range queries

For those tasks, balanced search trees or sorted arrays are usually more appropriate.

### Root Access Only

A heap gives fast access to the global minimum or maximum, but not to arbitrary priorities.

Finding an arbitrary element generally requires scanning the heap:
$$
O(n)
$$

### Update Requires Position Tracking

If an element's priority changes, the heap may need to move the element upward or downward.

Efficient priority updates require knowing the element's current index. Without an index map, locating the element costs $O(n)$.

### Stable Ordering Is Not Guaranteed

If multiple elements have the same priority, a normal heap does not preserve insertion order unless an extra tie-breaking rule is added.

### Binary Heap Is Not Always Best

Binary heaps are simple and efficient, but other heap variants may be better for specialized workloads:

- **d-ary heap**: fewer levels, useful when decrease-key is less important
- **binomial heap**: efficient merging
- **Fibonacci heap**: strong theoretical bounds for decrease-key

## Cost

The main cost of a heap lies in the trade-off between **fast extremum access** and **limited ordering information**.

### Time Cost

- Peek minimum / maximum: **O(1)**
- Insert: **O(log n)**
- Extract minimum / maximum: **O(log n)**
- Build heap from array: **O(n)**
- Search arbitrary element: **O(n)**
- Delete arbitrary element with known index: **O(log n)**

### Space Cost

A binary heap stored in an array requires:
$$
O(n)
$$

It has low overhead because the tree structure is implicit in array indices and does not require explicit child pointers.

### Engineering Cost

In real systems, implementing a heap requires careful decisions about:

- min heap or max heap semantics
- comparator design
- tie-breaking rules for equal priorities
- whether priority updates are needed
- whether an auxiliary index map is necessary

So while the core heap is small, priority-queue behavior can require additional bookkeeping.
