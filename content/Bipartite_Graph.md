# Bipartite Graph

[TOC]

## Define

> A bipartite graph is a graph whose vertices can be split into two parts so that every edge connects the two parts.

$$
(X, Y, E)  \tag{Bipartite Graph}
$$
$$
X, Y \subset V, X \cup Y = V  \tag{vertex sets}
$$
$$
E = \{(x_i, y_j) \ |\ x_i \in X, y_j \in Y\}  \tag{edge set}
$$

For a Bipartite Graph, The vertex set $V$ of a graph is divided into two disjoint subsets $X, Y$. And, edges in Bipartite Graph only exist between point sets $X, Y$, not within them.

<img src="./assets/Simple_bipartite_graph;_two_layers.svg" alt="Simple_bipartite_graph;_two_layers" style="zoom:20%;" />

## Properties

- Representation, a bipartite graph can be represented by a matrix $M \in \mathbb R^{m \times n}$ with each value $M_{ij}$ refer to the edge weight between $x_i$ and $y_j$, where $m$ is the element number of $X$ and $n$ is that of $Y$.
  $$
  f:(X \times Y) \to \mathbb R \quad\Rightarrow\quad \mathbb R^{m \times n}
  $$

### Maximum Matching
The maximum matching of bipartite graphs equivalents to a network flow model.
Connect the source point to all points on the left and all points on the right to the sink, with a capacity of $1$. The original edge is connected from left to right, with a capacity of $1$. The maximum flow is the maximum match. 

#### Kuhn-Munkres Algorithm

1. **初始化**：创建一个匹配$M$，开始时$M$为空。
2. **路径搜索**：对于$U$中的每一个未匹配节点，尝试找到一条增广路径。增广路径是指起始于未匹配的节点，终止于未匹配的节点，且路径上的边交替地不在匹配中和在匹配中的路径。
3. **找增广路径**：使用深度优先搜索或广度优先搜索来找到增广路径。设$P$是一条从$u$到$v$的增广路径，其中$u \in U$且$v \in V$。
4. **更新匹配**：如果找到增广路径，更新当前匹配$M$。对于路径$P$上的每一条边，如果它不在$M$中，就加入$M$；如果它在$M$中，就从$M$中移除。这样操作后，$M$中匹配的数量增加了1。
5. **重复**：重复步骤2和3，直到无法找到增广路径为止。

数学上，可以用一个矩阵$A$来表示图$G$，其中$A_{ij} = 1$如果$(i, j) \in E$，否则$A_{ij} = 0$。匹配可以用一个与$A$大小相同的矩阵$M$来表示，其中$M_{ij} = 1$如果边$(i, j)$在匹配$M$中，否则$M_{ij} = 0$。

算法的关键在于找到增广路径，这可以通过构造一个等价的网络流问题来实现。在网络流的表述中，每次增广路径的查找相当于在残余网络中查找从源点到汇点的路径。

#### Hopcroft-Karp Algorithm

在实际应用中，匈牙利算法还可以通过一些优化，比如使用Hopcroft-Karp算法，这可以在更短的时间内找到最大匹配。Kuhn-Munkres算法的时间复杂度通常为$O(V^2E)$，但优化后的版本，如Hopcroft-Karp算法，可以达到$O(\sqrt{V}E)$。

1. **初始化**：

      - 最大匹配$M$开始时为空。

      - 距离函数$dist$用来记录搜索过程中的层级信息。

2. **层次图构建**：
   - 使用广度优先搜索构建层次图。层次图是原图的子图，其中包含从$U$中未匹配顶点出发可以通过增广路径到达的$V$中顶点。
   - 对于每个$u \in U$，如果$u$未匹配，$dist(u) = 0$，否则$dist(u) = \infty$。
   - 使用广度优先搜索计算到每个顶点的距离。

3. **增广路径搜索**：
   - 使用深度优先搜索在层次图中寻找增广路径。
   - 对于每个$u \in U$，如果$u$未匹配，尝试找到一条从$u$出发的增广路径。

4. **路径增广**：
   - 如果找到了增广路径，更新匹配$M$。对于路径上的每条边$(u, v)$，如果它不在$M$中，就加入$M$；如果它在$M$中，就从$M$中移除。

5. **重复构建和搜索**：
   - 重复步骤2和3直到无法找到更多的增广路径为止。

6. **算法结束**：
   - 当层次图中不再存在增广路径时，当前匹配$M$就是最大匹配。

在数学表述中，匹配$M$可以表示为一个集合，其中包含了边的集合。距离函数$dist$可以被视为一个从顶点到非负整数的映射，它记录了从$U$到$V$的最短路径长度。Hopcroft-Karp算法的关键点在于，每次通过层次图寻找增广路径时，至少可以增加一个匹配的大小。而且，每次找到的增广路径都是最短的，这保证了算法的效率。在算法的实现中，通常会维护两个数组来记录匹配关系和距离，这些数据结构会在算法的迭代过程中不断更新。最终，算法能够返回最大匹配的大小和匹配的具体内容。
