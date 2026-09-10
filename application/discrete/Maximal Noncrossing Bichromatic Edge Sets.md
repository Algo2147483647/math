# Maximal Noncrossing Bichromatic Edge Sets

[TOC]

## 1. Problem Statement

Let \(N\) colored points be arranged clockwise on a circle. Because the points are
in strictly convex position, they may be regarded as the vertices of a convex
\(N\)-gon. For now assume \(N\ge 3\), and write

$$
V=\{0,1,\ldots,N-1\},
\qquad
\chi:V\to\{0,1\}
$$

for the vertex set and its two-coloring. The degenerate cases \(N\le 2\) are
handled separately below.

Only pairs of differently colored vertices may be joined. Thus the set of
admissible edges is

$$
E_\chi
=
\bigl\{\{i,j\}:0\le i<j<N,\ \chi(i)\ne\chi(j)\bigr\}.
$$

A scheme is an edge set \(S\subseteq E_\chi\). It is **noncrossing** if the
relative interiors of any two selected segments are disjoint; selected edges
may share endpoints. After cutting the cyclic order at vertex \(0\), two edges
with four distinct endpoints,

$$
\{i,j\},
\qquad
\{k,l\},
$$

cross in their interiors exactly when their endpoints alternate around the
circle, for example,

$$
i<k<j<l
\qquad\text{or}\qquad
k<i<l<j.
$$

A scheme \(S\) is a **maximal noncrossing bichromatic edge set** if there is no

$$
e\in E_\chi\setminus S
$$

for which \(S\cup\{e\}\) remains noncrossing. Here *maximal* initially means
maximal under set inclusion, not necessarily maximum cardinality.

The vertex labels are fixed. Two schemes are distinct whenever their edge sets
are distinct; rotations, reflections, and color swaps are not identified.
These symmetries give bijections between the corresponding relabeled instances
and therefore preserve the number of schemes, but they do not merge different
edge sets within the given instance.

## 2. From Maximal Edge Sets to Polygon Dissections

### 2.1 Bichromatic boundary edges are mandatory

Let

$$
B
=
\bigl\{\{i,i+1\}:0\le i<N-1\bigr\}
\cup
\bigl\{\{0,N-1\}\bigr\}
$$

be the boundary-edge set of the original polygon, and let

$$
B_\chi=B\cap E_\chi
$$

be its bichromatic boundary edges.

**Lemma 1 (mandatory boundary edges).** Every maximal scheme \(S\) satisfies

$$
B_\chi\subseteq S.
$$

**Proof.** A polygon side cannot cross the interior of any segment joining two
vertices. If a bichromatic polygon side were absent from \(S\), it could always
be added without creating a crossing, contradicting maximality. \(\square\)

Consequently, the only genuine choices are internal diagonals. Add every
polygon side as an auxiliary edge, allowing monochromatic polygon sides to
participate in the geometric subdivision without treating them as selected
edges. Define

$$
D=S\setminus B_\chi.
$$

Then \(D\) is a set of pairwise noncrossing bichromatic diagonals, and
\(B\cup D\) dissects the convex polygon into convex faces.

### 2.2 Visibility within a face

**Lemma 2 (common-face criterion).** Let \(u,v\) be nonadjacent vertices whose
edge is not already selected. The segment \(uv\) can be added without crossing
\(D\) if and only if \(u\) and \(v\) lie on the boundary of a common face of
\(B\cup D\).

**Proof.** Every face is itself a convex polygon, so two nonadjacent vertices on
the same face can be joined inside that face. Conversely, a segment joining
vertices that do not share a face must pass from one face to another and hence
cross an existing diagonal. No segment can pass through a third vertex because
distinct points on a circle are in strictly convex position. \(\square\)

It follows immediately that:

> A scheme is maximal if and only if no face contains a nonadjacent pair of
> differently colored vertices.

### 2.3 Complete classification of the faces

Consider a face containing \(r\) vertices of color \(0\) and \(b\) vertices of
color \(1\). If the face contains no addable bichromatic diagonal, every
opposite-color pair must be adjacent on its boundary. Fixing one color-\(0\)
vertex shows that all color-\(1\) vertices must be among its two boundary
neighbors, so \(b\le 2\). Interchanging the colors gives \(r\le 2\). Therefore,
whenever both colors occur in the face,

$$
r+b\le 4.
$$

If the overall instance is not monochromatic, every face contains both colors.
Indeed, a monochromatic face cannot have an internal diagonal as one of its
sides because all internal diagonals are bichromatic. A face with no internal
diagonal on its boundary can only be the entire undissected polygon, which
would force the whole instance to be monochromatic.

Hence a nonmonochromatic instance has exactly two possible face types:

1. **Triangle.** A triangle has no internal face diagonal. Its sides that are
   dissection diagonals must, as always, be bichromatic.
2. **Alternating quadrilateral.** Its cyclic color sequence must be

   $$
   0,1,0,1
   \qquad\text{or}\qquad
   1,0,1,0.
   $$

   Equivalently, both of its unselected diagonals join equal-colored vertices.

This classification is the structural basis of the algorithm.

**Theorem 1 (dissection bijection).** For a nonmonochromatic coloring with
\(N\ge 3\), maximal noncrossing bichromatic edge sets are in bijection with
polygon dissections satisfying:

- every internal dissection edge joins differently colored vertices;
- every face is a triangle or an alternating quadrilateral.

The two maps are

$$
S\longmapsto D=S\setminus B_\chi,
\qquad
D\longmapsto S=B_\chi\cup D.
$$

**Proof.** Starting with a maximal scheme, Lemmas 1 and 2 and the face
classification show that its dissection satisfies both conditions.

Conversely, begin with such a dissection. A triangular face has no internal
face diagonal, while both diagonals of an alternating quadrilateral are
monochromatic. A segment joining vertices in different faces must cross an
existing dissection diagonal. Thus no absent bichromatic edge can be added, so
\(B_\chi\cup D\) is maximal. The two constructions are visibly inverse.
\(\square\)

## 3. Fixed Edge Count and Outerplanar Structure

The dissection bijection gives a structural result stronger than the counting
recurrence.

Let

- \(m=|B_\chi|\) be the number of bichromatic polygon sides, equivalently the
  number of color changes around the circle;
- \(h=N-m\) be the number of monochromatic polygon sides;
- \(t,q,d\) be the numbers of triangular faces, quadrilateral faces, and
  internal diagonals, respectively.

For a nonmonochromatic circular two-coloring, \(m\ge 2\) and \(m\) is even.

Every triangular face has exactly one monochromatic side. That side cannot be
an internal diagonal, so it must be a monochromatic side of the original
polygon. Conversely, the face incident to any monochromatic polygon side
cannot be an alternating quadrilateral and therefore must be a triangle.
Consequently,

$$
t=h=N-m.
$$

For any dissection of a convex polygon into triangles and quadrilaterals,

$$
t+q=d+1,
$$

because each added diagonal increases the number of faces by one. Counting
face-edge incidences also gives

$$
3t+4q=N+2d.
$$

Eliminating \(d\) yields

$$
t+2q=N-2.
$$

Substituting \(t=N-m\) gives

$$
\boxed{q=\frac{m-2}{2}},
\qquad
\boxed{d=N-2-\frac m2}.
$$

The actual scheme contains the \(m\) bichromatic boundary edges and the \(d\)
internal diagonals, so

$$
\boxed{|S|=N-2+\frac m2}.
$$

**Corollary 1 (maximal means maximum).** For a fixed nonmonochromatic color
sequence, all maximal schemes have the same number of edges. Every noncrossing
scheme can be extended in finitely many steps to a maximal one, so this common
cardinality is also the maximum cardinality of any noncrossing bichromatic edge
set.

**Corollary 2 (connectivity).** Every nonmonochromatic maximal scheme is
connected. The auxiliary dissection graph \(B\cup D\) is connected. When a
monochromatic polygon side is removed, the other two sides of its incident
triangle give a two-edge bichromatic path between its endpoints. Removing all
auxiliary monochromatic boundary edges therefore preserves connectivity.

The selected scheme is a bipartite outerplanar graph in its given straight-line
embedding. Its cycle-space dimension is

$$
|S|-N+1
=
\frac{m-2}{2}
=q.
$$

In particular, if the circular sequence has exactly two color changes, every
maximal scheme is a spanning tree. Each additional pair of color changes adds
one independent cycle and one alternating quadrilateral face.

## 4. Interval Dynamic Programming

### 4.1 Subproblems and closing edges

Number the vertices \(0,1,\ldots,N-1\), and abbreviate
\(c_i=\chi(i)\). For

$$
0\le l<r\le N-1,
$$

define the consecutive subpolygon

$$
P(l,r)=(l,l+1,\ldots,r).
$$

Its closing edge is \((l,r)\). This edge may bound a subproblem exactly when it
is an original polygon side or joins differently colored vertices:

$$
\operatorname{ok}(l,r)
\iff
r=l+1
\quad\lor\quad
(l,r)=(0,N-1)
\quad\lor\quad
c_l\ne c_r.
$$

The pair \((0,N-1)\) is the original polygon side crossing the cut in the
linear indexing.

Let

$$
F[l][r]
$$

denote the number of legal dissections of \(P(l,r)\). A subproblem consisting
of a single edge has one empty dissection:

$$
F[l][l+1]=1.
$$

If \(r-l\ge 2\) and \(\operatorname{ok}(l,r)\) is false, the closing edge is a
monochromatic internal diagonal and cannot be a dissection edge. Therefore,

$$
F[l][r]=0.
$$

### 4.2 Root-face decomposition

Suppose the closing edge is legal. Consider the unique face incident to
\((l,r)\), called the root face.

#### Triangular root face

If the root face is \((l,k,r)\), where \(l<k<r\), the remaining region splits
into two independent subpolygons. Its contribution is

$$
F[l][k]F[k][r].
$$

#### Quadrilateral root face

If the root face is \((l,a,b,r)\), where \(l<a<b<r\), it is alternating exactly
when its two unselected diagonals have equal-colored endpoints:

$$
c_l=c_b,
\qquad
c_a=c_r.
$$

The remaining region splits into three independent subpolygons, contributing

$$
F[l][a]F[a][b]F[b][r].
$$

Therefore, when \(r-l\ge 2\) and \(\operatorname{ok}(l,r)\) holds,

$$
\boxed{
F[l][r]
=
\sum_{l<k<r}F[l][k]F[k][r]
+
\sum_{\substack{l<a<b<r\\c_l=c_b\\c_a=c_r}}
F[l][a]F[a][b]F[b][r]
}.
$$

Directly enumerating \(l,r,a,b\) takes \(O(N^4)\) arithmetic operations.

### 4.3 Cubic-time optimization

For a color \(x\in\{0,1\}\), define

$$
T_x[l][r]
=
\sum_{\substack{l<k<r\\c_k=x}}
F[l][k]F[k][r].
$$

The entire triangular contribution is

$$
T_0[l][r]+T_1[l][r].
$$

After fixing \(a\) in the quadrilateral contribution, the sum over \(b\) is
exactly \(T_{c_l}[a][r]\). Thus,

$$
\boxed{
F[l][r]
=
T_0[l][r]+T_1[l][r]
+
\sum_{\substack{l<a<r\\c_a=c_r}}
F[l][a]T_{c_l}[a][r]
}.
$$

Compute the intervals in increasing order of \(r-l\). For each interval, first
compute \(T_0,T_1\) from shorter \(F\)-intervals, and then compute \(F[l][r]\)
if the closing edge is legal.

One subtle detail is essential: \(T_x[l][r]\) must be computed even when
\((l,r)\) is a monochromatic internal diagonal and \(F[l][r]=0\). Such a
\(T_x[l][r]\) may be needed in the sum for a larger quadrilateral root face.
In that context, \((l,r)\) is deliberately an *unselected* monochromatic
diagonal of the quadrilateral rather than the closing edge of a legal
subproblem.

Each \(T_x[l][r]\) and \(F[l][r]\) takes \(O(N)\) operations to compute, and
there are \(O(N^2)\) intervals. Hence the counting phase uses

$$
\text{time }O(N^3),
\qquad
\text{space }O(N^2).
$$

These are arithmetic-operation bounds, treating each arbitrary-precision
integer addition and multiplication as one operation. Actual Python running
time also depends on the bit length of the counts. Python integers are
arbitrary precision, so fixed-width integer overflow does not occur.

The final count is

$$
F[0][N-1].
$$

The monochromatic case must return \(1\) separately: for \(N\ge 5\), its unique
undissected monochromatic \(N\)-gon is outside the nonmonochromatic
triangle-or-alternating-quadrilateral classification.

## 5. Correctness of the Recurrence

**Theorem 2 (counting correctness).** For every nonmonochromatic color
sequence, the value \(F[0][N-1]\) produced by the interval recurrence equals
the number of maximal noncrossing bichromatic edge sets.

**Proof.** Proceed by induction on the interval length \(r-l\).

For length \(1\), there is no interior region, and the unique empty dissection
gives \(F[l][l+1]=1\). If the closing edge is a monochromatic internal
diagonal, the interval cannot occur as a legal subpolygon, so its count is
\(0\).

Now suppose the closing edge is legal. Every legal dissection has a unique root
face incident to it. By Theorem 1, the root face is either a triangle or an
alternating quadrilateral.

- A triangular root face has a unique third vertex \(k\), which determines two
  shorter subpolygons. Conversely, any pair of legal dissections of those
  subpolygons glues uniquely to the root triangle.
- A quadrilateral root face has unique intermediate vertices \(a,b\), which
  determine three shorter subpolygons. The conditions
  \(c_l=c_b\) and \(c_a=c_r\) are exactly the alternating-color condition.
  Any triple of legal subdissections glues uniquely to that root
  quadrilateral.

Different root-face types or different root vertices cannot produce the same
dissection. For a fixed root face, the subpolygons have disjoint interiors and
their choices are independent. The two sums are therefore exhaustive and
disjoint. Applying the induction hypothesis to all shorter intervals proves
the recurrence. Theorem 1 then converts the dissection count to the desired
maximal-scheme count. \(\square\)

## 6. Complete Enumeration

The counting table also supplies feasibility pruning for enumeration. Maintain:

- `pending`: a stack of subintervals that remain to be dissected;
- `diagonals`: the currently selected internal diagonals;
- \(B_\chi\): the mandatory bichromatic polygon sides added to every result.

Start with the interval \((0,N-1)\). Each time an interval \((l,r)\) is popped:

1. Enumerate triangular root faces \((l,k,r)\). Enter a branch only if
   \(F[l][k]>0\) and \(F[k][r]>0\). Add the nonboundary sides of the root face
   and push its nondegenerate child intervals.
2. Enumerate quadrilateral root faces \((l,a,b,r)\). Check
   \(c_l=c_b\), \(c_a=c_r\), and positivity of all three child counts. Add the
   nonboundary sides and push the nondegenerate child intervals.
3. On returning from the recursive call, undo the intervals and diagonals
   introduced at this level.
4. When `pending` is empty, output

   $$
   B_\chi\cup D.
   $$

**Soundness.** Every output is assembled from legal triangles and alternating
quadrilaterals, so Theorem 1 makes it a maximal scheme.

**Completeness.** Every maximal scheme has a unique dissection. The root face
of every one of its subpolygons is visited by the corresponding triangle or
quadrilateral branch, so every scheme is eventually produced.

**Uniqueness.** The face incident to the closing edge of each subpolygon is
unique. Recursively, the complete sequence of root-face choices uniquely
determines the dissection, so no edge set is generated twice.

If the number of schemes is \(K\), merely producing all schemes requires
\(\Omega(K)\) time. Every nonmonochromatic scheme has \(\Theta(N)\) edges, so
the textual output itself has size \(\Theta(KN)\). Complete enumeration
therefore cannot have total running time bounded by a polynomial in \(N\)
alone. The implementation streams its results: it stores the current recursion
path, current diagonal set, and \(O(N^2)\) DP tables rather than retaining all
\(K\) schemes in memory.

## 7. Boundary Cases

### \(N=1\)

There is no admissible edge, so the empty edge set is the unique maximal
scheme.

### \(N=2\)

- If the two vertices have the same color, no edge is admissible and the empty
  set is the unique scheme.
- If the vertices have different colors, the edge joining them is the unique
  maximal scheme.

### All vertices have the same color

No edge is admissible, so the empty edge set is the unique maximal scheme for
every \(N\).

### Exactly one vertex has the minority color

All admissible edges share the minority-color vertex and therefore cannot
cross one another. Maximality forces all of them to be present. The unique
scheme is a star centered at the minority-color vertex.

## 8. Two Closed-Form Families

### 8.1 Two consecutive color blocks

Suppose the circular sequence can be written from some starting vertex as

$$
R^aB^b,
\qquad
a,b\ge 1.
$$

There are exactly two bichromatic polygon sides, so \(m=2\), \(q=0\), and every
face is triangular. Let \(A(a,b)\) be the number of schemes. Use the boundary
edge joining the first \(R\) to the last \(B\) as the root closing edge. The
third vertex of its root triangle can only be the second \(R\) or the
next-to-last \(B\); any other choice would make one side of the root face a
monochromatic internal edge. Hence

$$
A(a,b)=A(a-1,b)+A(a,b-1)
\qquad
(a,b\ge 2),
$$

with boundary values

$$
A(1,b)=A(a,1)=1.
$$

Pascal's recurrence gives

$$
\boxed{A(a,b)=\binom{a+b-2}{a-1}}.
$$

### 8.2 An even number of perfectly alternating vertices

Let \(N=2k\) and suppose the color sequence is

$$
RBRB\cdots RB.
$$

Here \(m=N\), \(h=t=0\), and \(q=k-1\), so the legal dissections are exactly the
quadrangulations of a convex \(2k\)-gon. Every diagonal in a quadrangulation
splits the polygon into two even-sided subpolygons; its endpoints therefore
have opposite parity in the cyclic numbering and hence different colors. The
standard quadrangulation count is

$$
\boxed{
\frac{1}{2k-1}\binom{3k-3}{k-1}
}.
$$

For \(N=4,6,8,10,\ldots\), the counts begin

$$
1,3,12,55,\ldots.
$$

These count dissections of a polygon with fixed vertex labels; rotations and
reflections are not factored out.

## 9. Example: `RRBB`

Let \(N=4\), with clockwise color sequence

$$
R,R,B,B.
$$

The bichromatic boundary edges \((1,4)\) and \((2,3)\) are mandatory. The two
possible bichromatic diagonals, \((1,3)\) and \((2,4)\), cross each other, so a
maximal scheme must contain exactly one of them:

$$
\begin{aligned}
S_1&=\{(1,4),(2,3),(2,4)\},\\
S_2&=\{(1,3),(1,4),(2,3)\}.
\end{aligned}
$$

Therefore,

$$
F[0][3]=2.
$$

The structural identities give \(m=2\), \(h=2\), \(t=2\), \(q=0\), and
\(d=1\), so each scheme has

$$
|S|=N-2+\frac m2=3
$$

edges, as the explicit enumeration confirms.

For another simple check, consider `RBRB`. All four polygon sides are
mandatory, while both diagonals are monochromatic. The boundary 4-cycle is
therefore the unique scheme.

## 10. Correspondence with the Python Implementation

Implementation:
[`Tool/legal_scheme_solver.py`](../../Tool/legal_scheme_solver.py).

| Mathematical object or step | Implementation |
| --- | --- |
| Color map \(\chi:V\to\{0,1\}\) | `colors`, `self.c` |
| Closing-edge predicate \(\operatorname{ok}(l,r)\) | `_is_polygon_side`, `_closing_edge_allowed` |
| Dynamic-programming table \(F[l][r]\) | `self.f` |
| Auxiliary sums \(T_x[l][r]\) | `self.t` |
| Increasing-length \(O(N^3)\) recurrence | `_build_dp` |
| Mandatory boundary set \(B_\chi\) | `_mandatory_boundary_edges` |
| Root-face backtracking and streaming | `dfs` inside `schemes` |
| Total scheme count | `count` |

The input format is

```text
N
color sequence
```

Each color must be represented by one character. Examples include
`RRBB`, `0101`, and any two distinct Unicode characters.
One-color inputs are allowed, but inputs containing three or more distinct
characters are rejected. The program checks that the declared \(N\) equals
the actual number of characters.

The first output line is the total count; each subsequent line contains one
scheme. The implementation uses 0-based indexing internally and converts to
1-based indexing in its output. An empty scheme is printed as `{}`.

## 11. Independent Validation

For small instances, an exhaustive solver provides an independent correctness
oracle:

1. Enumerate all subsets of \(E_\chi\).
2. Reject any subset containing a crossing pair.
3. For each remaining subset, test whether any absent bichromatic edge can
   still be added.
4. Compare the resulting maximal edge sets, one by one, with both the DP count
   and the generator output.

For \(N=1,2,\ldots,8\), global color-swap symmetry allows the first character
to be fixed as `R`. This leaves

$$
1+2+4+8+16+32+64+128=255
$$

representative instances. On all of them, the implementation's count, output
edge sets, and uniqueness agree exactly with independent exhaustive search.

As a further implementation check, all \(1023\) color-swap representatives
for \(N=1,2,\ldots,10\) were generated and tested directly for admissible
endpoints, noncrossing, inclusion maximality, duplicate freedom, agreement
between `count` and the number generated, and the fixed-cardinality identity

$$
|S|=N-2+\frac m2
$$

whenever the instance was nonmonochromatic. The two closed-form families in
Section 8 were also checked over multiple parameter values.

## 12. Correctness Verdict and Scope

The algorithm is correct for the model stated in Section 1. More precisely:

- Theorem 1 proves that the geometric maximality condition is equivalent to
  the triangle-and-alternating-quadrilateral dissection model.
- Theorem 2 proves that the interval recurrence counts every such dissection
  exactly once.
- The generator follows the same unique root-face decomposition, which proves
  soundness, completeness, and absence of duplicate output.
- Independent exhaustive comparison supplies an implementation-level check
  separate from the proof.

The conclusion relies on the following assumptions:

- all vertices are distinct points in strictly convex position, as they are on
  a circle;
- there are at most two colors;
- an edge is admissible exactly when its endpoints have different colors;
- edges sharing an endpoint are allowed, while intersections of relative
  interiors are forbidden;
- maximality is under adding admissible edges;
- labeled edge sets are counted without quotienting by geometric symmetries.

If any of these rules changes—for example, if three colors are allowed, shared
endpoints are forbidden, collinear vertices are permitted, or schemes are
identified under rotation—the face classification and therefore the algorithm
need not remain valid.
