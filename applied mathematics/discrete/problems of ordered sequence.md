# Problems of Ordered Sequence

[TOC]

## Search elements

### Binary Search

For a sorted array, we aim to find a target value $v$ in the array $a$.

<img src="./assets/7ec7c64b0df75bdd50bcb08f0fcc54ef.png" alt="Binary Search | Binary, Linear search, Algorithm" style="zoom: 50%;" />



#### Property  
we assume an ascending array $a = \{a_1, ..., a_n\}$, $a_i \le a_j , i \le j$, then,
$$
a_i < v \quad\Rightarrow\quad a_j < v, \forall a_j \in \{a_1, ..., a_i\}
$$
$$
a_i > v \quad\Rightarrow\quad a_j > v, \forall a_j \in \{a_i, ..., a_n\}
$$

#### Process  
We divide the search interval in half, $\text{mid} = \frac{\text{start} + \text{end}}{2}$, and determine whether the middle value $a_{\text{mid}}$ meets the target at each iteration $(t)$. 
$$
a^{(t)} = \{a_{\text{start}},..., a_{\text{end}}\} \to \{a_{\text{start}},..., a_{\text{mid}-1}\} \cup \{a_{\text{mid}}\} \cup \{a_{\text{mid}+1},..., a_{\text{end}}\}
$$

- If satisfied, $a_{\text{mid}}$ is the answer. 
- If not satisfied, just select the half interval that may meet the target value for the next interation.

$$
\begin{align*}
    a_{\text{mid}} = v &\quad\Rightarrow\quad \{a_{\text{mid}}\}  \\
    a_{\text{mid}} > v &\quad\Rightarrow\quad a^{(t+1)} = \{a_{\text{start}},..., a_{\text{mid}-1}\}  \\
    a_{\text{mid}} < v &\quad\Rightarrow\quad a^{(t+1)} = \{a_{\text{mid}+1},..., a_{\text{end}}\}
\end{align*}
$$

We repeat the above operation until the search interval can't be divided and return that there is no target value in the array $a$.

$$\text{start} > (\text{mid}-1) \text{ or } (\text{mid} + 1) > \text{end} \quad\Rightarrow\quad a^{(t+1)} \text{ is invalid}$$

### Search the $k$-th largest element

- Heap method
- Quick sort simple version


## Sort sequence

对于元素间定义了次序的列表,  列表排序是指将列表中的所有元素, 按照彼此之间的大小次序重新定义 $\mathbb Z \to S$ 的关系, 保证 $f(a) \le f(b), \forall a \le b$.

### Quick Sort

Quick sort is a divide-and-conquer sorting algorithm. Based on the first value $a_1$, we divide the array into two sub-arrays according to whether they are greater than $a_1$ or less than $a_1$. We repeat the above operation for two sub-arrays just like the binary tree until the array cannot be divided.


$$
\begin{align*}
\left\{a_{s:k-1}^{t+1}, \left(a_{k}^{t+1} \right), a_{k+1:e}^{t+1} \right\} &= \text{partition}\left(a_{s:e}^{t} \right)  \\
a_{k}^{t+1} &= a_{s}^{t}  \\
a_{s:k-1}^{t+1} &\prec a_{s}^{t}  \\
a_{k+1:e}^{t+1} &\succeq a_{s}^{t}
\end{align*}
$$

- $a^t_{s:t}$: the subsequence from $s$ to $e$ of the sequence. $t$ is the iteration number of the sequence.

![quick_sort](./assets/quick_sort.svg)

```C
QuickSort(int[] a, int l, int r) {
    if (l >= r) 
      return;

    int p = Partition(a, l, r);
    QuickSort(a, l, p - 1);
    QuickSort(a, p + 1, r);
}
```

  Where partition can be implemented like,
  ```c
  void Partition(int[] a, int l, int r) {
      int i = l - 1;
  
      for (int j = l ; j > r; j++) 
          if(a[j] <= a[i]) {
              i++;
              swap(a[i], a[j]);
          }
  
      i++;
      swap(a[i], a[j]);
  
      return i;
  }
  ```

#### Property

- **Time complexity**: average time complexity $O(n \log n)$, worst-case time complexity $O(n^2)$
- **Space complexity**: $O(1)$ In Place.

### Merge Sort

Merge Sort is a divide-and-conquer sorting algorithm. It works by dividing the input data into smaller, manageable parts (divide) and then merging these parts in a sorted order (conquer). In the merge operation, since both subsequences are in order, sorting is very simple with a greedy algorithm.

$$
\begin{align*}
b_{l:l} &\gets a_{l:l}\\
b_{l:r} &\gets \text{merge} (b_{l:m}, b_{m+1:r})
\end{align*}
$$

<img src="./assets/Merge_sort_algorithm_diagram.svg" alt="Merge_sort_algorithm_diagram" style="zoom:50%;" />

<img src="./assets/merge.svg" alt="merge" style="zoom:80%;" />

```c
void mergeSort(int[] a, int l, int r) { 
    if (l >= r) 
      return;

    int m = l + (r - l) / 2; 
    mergeSort(a, l, m); 
    mergeSort(a, m + 1, r); 
    merge(a, l, m, r); 
} 
```

Due to the the smaller parts have been sorted, the merging process is done by comparing the first element of each of the smaller parts and merging them back into one sorted array, until all the elements are in the correct order.

Property:
- **Time complexity**: $O(n \log n)$
- **Space complexity**: $O(n)$.

### Heap Sort

In [heap](./heap.md) sort, the array is first turned into a binary heap in place, and the root node, which is either the maximum or minimum element, is swapped with the last element of the array. The heap is then rebuilt without the last element, and the process repeats until the heap is empty. By swapping the root node with the last element, we ensure that the largest or smallest element moves to the end of the array, and the array is partially sorted.

![heap_sort](./assets/heap_sort.svg)

  ```c
  void heapSort(int[] a, int n) {
      for (int i = n / 2 - 1; i >= 0; i--)
          heapify(a, n, i);
  
      for (int i=n-1; i>=0; i--) {
          swap(a[0], a[i]);
          heapify(a, i, 0);
      }
  }
  ```

Property
- **Time complexity**: $O(n \log n)$
- **Space complexity**: $O(1)$ In Place.

### Insertion Sort

we start from the left side of the array, and compare each element with the element next to it. If the element on the right is smaller than the element on the left, the two elements are swapped. This process continues until the end of the list is reached.

  ```c
  void insertionSort(int[] a, int n) {
      for (int i = 1; i < n; i++) {
          int key = a[i],
              j = i-1;
    
          while (j >= 0 && a[j] > key) {
              a[j+1] = a[j];
              j = j - 1;
          }
          a[j+1] = key;
      }
  }
  ```

Property
- **Time complexity**: $O(n^2)$
- **Space complexity**:

### Selection Sort

We repeatedly select and cut the minimum element from the original array $a$ into the sorted array $b$.

$$
\begin{align*}
b^{(0)} &= \emptyset\\
b^{(t)} &= \left\{b^{(t-1)}, \min \left(a - b^{(t-1)} \right)\right\}
\end{align*}
$$

Property
- **Time complexity**: $O(n^2)$
- **Space complexity**:

### Bubble Sort
Bubble sort works by repeatedly swapping adjacent elements if they are in the wrong order until the list is sorted.

```c
void bubbleSort(int[] a, int n) {
for (int i = 0; i < n-1; i++)
    for (int j = 0; j < n-i-1; j++)
        if (a[j] > a[j+1]) 
            swap(a[j], a[j+1]);
}
```

Property
- **Time complexity**: $O(n^2)$
- **Space complexity**: $O(1)$ In Place.

## Subsequence Problems

### Longest Ascending Subsequence

$$
\begin{align*}
\max_{x \subseteq a}  \quad & \text{number}(x)  \\
s.t. \quad & x_i < x_{i+1} \quad
\end{align*}
$$

For a given sequence $a$, find the longest non-contiguous subsequence where the subsequence is ascending.


#### Algorithm: Greedy + Binary Search

$$
\begin{align*}
f(n) &= \max(f(i), \max(f(j)) + 1) \quad ; j < i, a_j < a_i  \\
f(1) &= 1  \tag{initial}
\end{align*}
$$
- $f(n)$: 以$a_n$为结尾的最长上升子序列的长度.

 
