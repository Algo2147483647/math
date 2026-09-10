# Linked List

[TOC]

## Problem

A linked list is designed to solve the problem of **dynamic sequence storage with efficient local insertion and deletion**.

- How can I insert an element without shifting a whole array?
- How can I delete a known node by changing only a few references?
- How can a sequence grow without requiring contiguous memory?

## Core Idea

A linked list stores elements as nodes connected by references.

Instead of keeping all elements in contiguous memory, each node stores:

- the element value
- a reference to the next node
- optionally, a reference to the previous node

The sequence is represented by following links:
$$
a_1 \to a_2 \to ... \to a_n
$$

The practical essence of a linked list is:

1. **Represent order by references**
2. **Change local references to insert or delete nodes**
3. **Trade random access for flexible structural modification**

## Solution

### Singly Linked List

A **singly linked list** is a directed chain of nodes where each node points to the next node.

$$
a_1 \to a_2 \to ... \to a_n
$$

Usually, the first node is called the **head**. The last node points to `NULL`.

Each node can be modeled as:

```c
struct Node {
    Value value;
    Node* next;
};
```

### Doubly Linked List

A **doubly linked list** stores both previous and next references.

$$
a_1 \rightleftharpoons a_2 \rightleftharpoons ... \rightleftharpoons a_n
$$

For an internal node $a_i$:
$$
\begin{align*}
  a_i[\text{prev}] &= a_{i-1} \\
  a_i[\text{next}] &= a_{i+1}
\end{align*}
$$

This makes deletion and backward traversal easier, but each node requires more memory.

### Circular Linked List

A **circular linked list** connects the tail back to the head.

$$
a_n[\text{next}] = a_1
$$

This is useful when the sequence should wrap around naturally, such as in round-robin scheduling.

### Traversal

To visit each node, start from the head and repeatedly follow the next pointer.

```c
Node* nd = head;

while (nd != NULL) {
    nd = nd->next;
}
```

Traversal costs:
$$
O(n)
$$

### Search

Since nodes are not indexed by position, searching requires traversal from the head until the target is found.

Search costs:
$$
O(n)
$$

### Insert

If the previous node is already known, insertion is local.

For a singly linked list:

```c
void insertAfter(Node* left, Node* nd) {
    nd->next = left->next;
    left->next = nd;
}
```

For a doubly linked list:

```c
void insertAfter(Node* left, Node* nd) {
    nd->prev = left;
    nd->next = left->next;

    if (left->next != NULL) {
        left->next->prev = nd;
    }

    left->next = nd;
}
```

With a known position, insertion costs:
$$
O(1)
$$

### Delete

Deletion removes a node by reconnecting its neighboring nodes.

For a singly linked list, the previous node is needed:

```c
void deleteAfter(Node* left) {
    Node* nd = left->next;
    left->next = nd->next;
    nd->next = NULL;
    delete nd;
}
```

For a doubly linked list:

```c
void deleteNode(Node* nd) {
    if (nd->prev != NULL) {
        nd->prev->next = nd->next;
    }

    if (nd->next != NULL) {
        nd->next->prev = nd->prev;
    }

    nd->prev = NULL;
    nd->next = NULL;
    delete nd;
}
```

With a known node and the required neighbors, deletion costs:
$$
O(1)
$$

### Reverse

Reversing a singly linked list repeatedly redirects each node's next pointer.

```cpp
Node* reverse(Node* head) {
    Node* prev = NULL;
    Node* cur = head;

    while (cur != NULL) {
        Node* next = cur->next;
        cur->next = prev;
        prev = cur;
        cur = next;
    }

    return prev;
}
```

Reversal costs:
$$
O(n)
$$

##  Boundaries

### No Random Access

A linked list does not support direct access by index.

To access the $i$-th element, it must traverse from the head:
$$
O(i)
$$

This makes linked lists weaker than arrays for index-heavy workloads.

### Poor Cache Locality

Nodes may be scattered across memory. Traversal can be slower in practice than array traversal because pointer chasing is less cache-friendly.

### Extra Pointer Overhead

Each node stores one or more references in addition to the value.

- singly linked list: one next pointer
- doubly linked list: next and previous pointers
- circular list: same pointer cost, but more careful termination logic

### Edge Cases Around Head And Tail

Insertion and deletion near the head or tail require special handling unless sentinel nodes are used.

Common edge cases include:

- deleting the head
- deleting the tail
- inserting into an empty list
- traversing a circular list without infinite looping

### Local Operations Require Local Knowledge

Insertion and deletion are $O(1)$ only when the relevant node or neighbor is already known. If the position must first be searched, the total cost becomes $O(n)$.

## Cost

The main cost of a linked list lies in the trade-off between **cheap local pointer changes** and **expensive traversal**.

### Time Cost

- Access by index: **O(n)**
- Search by value: **O(n)**
- Traverse all nodes: **O(n)**
- Insert after a known node: **O(1)**
- Delete a known node in a doubly linked list: **O(1)**
- Delete a known node in a singly linked list when previous node is unknown: **O(n)**
- Reverse the list: **O(n)**

### Space Cost

A linked list requires:
$$
O(n)
$$

However, the constant factor is higher than an array because every node stores pointer fields and may have allocation overhead.

### Engineering Cost

In real systems, implementing linked lists requires careful decisions about:

- ownership and memory lifetime
- head and tail handling
- sentinel nodes
- singly linked versus doubly linked structure
- circular versus non-circular termination rules

So while the conceptual model is simple, pointer correctness and boundary cases are the main implementation costs.
