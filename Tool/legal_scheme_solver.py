from __future__ import annotations

import sys
from collections.abc import Iterator

Edge = tuple[int, int]
Scheme = frozenset[Edge]


class LegalSchemeSolver:
    """Count and enumerate maximal non-crossing bichromatic edge sets."""

    def __init__(self, colors: str) -> None:
        self.colors = list(colors)
        self.n = len(self.colors)

        if self.n == 0:
            raise ValueError("The color sequence cannot be empty")

        color_id: dict[str, int] = {}
        self.c: list[int] = []
        for color in self.colors:
            if color not in color_id:
                color_id[color] = len(color_id)
            self.c.append(color_id[color])

        if len(color_id) > 2:
            raise ValueError("The color sequence may contain at most two colors")

        self.trivial = self.n <= 2 or len(color_id) <= 1
        self.f: list[list[int]] = [[0] * self.n for _ in range(self.n)]
        self.t: list[list[list[int]]] = [
            [[0, 0] for _ in range(self.n)] for _ in range(self.n)
        ]

        if not self.trivial:
            self._build_dp()

    def _is_polygon_side(self, i: int, j: int) -> bool:
        if i > j:
            i, j = j, i
        return j == i + 1 or (i == 0 and j == self.n - 1)

    def _closing_edge_allowed(self, i: int, j: int) -> bool:
        return self._is_polygon_side(i, j) or self.c[i] != self.c[j]

    def _build_dp(self) -> None:
        for i in range(self.n - 1):
            self.f[i][i + 1] = 1

        for gap in range(2, self.n):
            for left in range(self.n - gap):
                right = left + gap

                for middle in range(left + 1, right):
                    self.t[left][right][self.c[middle]] += (
                        self.f[left][middle] * self.f[middle][right]
                    )

                if not self._closing_edge_allowed(left, right):
                    continue

                value = self.t[left][right][0] + self.t[left][right][1]
                for a in range(left + 1, right - 1):
                    if self.c[a] == self.c[right]:
                        value += (
                            self.f[left][a] * self.t[a][right][self.c[left]]
                        )

                self.f[left][right] = value

    @property
    def count(self) -> int:
        if self.trivial:
            return 1
        return self.f[0][self.n - 1]

    def _mandatory_boundary_edges(self) -> set[Edge]:
        edges: set[Edge] = set()
        for i in range(self.n):
            j = (i + 1) % self.n
            if i != j and self.c[i] != self.c[j]:
                edges.add((min(i, j), max(i, j)))
        return edges

    def schemes(self) -> Iterator[Scheme]:
        boundary = self._mandatory_boundary_edges()

        if self.trivial:
            yield frozenset(boundary)
            return

        pending: list[tuple[int, int]] = [(0, self.n - 1)]
        diagonals: set[Edge] = set()

        def add_face_sides(sides: list[Edge]) -> list[Edge]:
            added: list[Edge] = []
            for u, v in sides:
                edge = (min(u, v), max(u, v))
                if not self._is_polygon_side(*edge) and edge not in diagonals:
                    diagonals.add(edge)
                    added.append(edge)
            return added

        def dfs() -> Iterator[Scheme]:
            if not pending:
                yield frozenset(boundary | diagonals)
                return

            left, right = pending.pop()

            for middle in range(left + 1, right):
                if self.f[left][middle] == 0 or self.f[middle][right] == 0:
                    continue

                children: list[tuple[int, int]] = []
                if middle - left > 1:
                    children.append((left, middle))
                if right - middle > 1:
                    children.append((middle, right))

                added = add_face_sides([(left, middle), (middle, right)])
                pending.extend(children)
                yield from dfs()

                for _ in children:
                    pending.pop()
                for edge in added:
                    diagonals.remove(edge)

            for a in range(left + 1, right - 1):
                if self.c[a] != self.c[right] or self.f[left][a] == 0:
                    continue

                for b in range(a + 1, right):
                    if (
                        self.c[b] != self.c[left]
                        or self.f[a][b] == 0
                        or self.f[b][right] == 0
                    ):
                        continue

                    children = []
                    if a - left > 1:
                        children.append((left, a))
                    if b - a > 1:
                        children.append((a, b))
                    if right - b > 1:
                        children.append((b, right))

                    added = add_face_sides(
                        [(left, a), (a, b), (b, right)]
                    )
                    pending.extend(children)
                    yield from dfs()

                    for _ in children:
                        pending.pop()
                    for edge in added:
                        diagonals.remove(edge)

            pending.append((left, right))

        yield from dfs()


def main() -> None:
    data = sys.stdin.read().split()
    if len(data) < 2:
        raise SystemExit(
            "Input format: N on the first line and a color sequence such as RRBB "
            "on the second line"
        )

    n = int(data[0])
    colors = "".join(data[1:])
    if len(colors) != n:
        raise SystemExit(
            f"N={n}, but the color sequence contains {len(colors)} vertices"
        )

    sys.setrecursionlimit(max(1000, 5 * n + 100))
    solver = LegalSchemeSolver(colors)
    print(solver.count)

    for number, scheme in enumerate(solver.schemes(), start=1):
        edges = sorted((u + 1, v + 1) for u, v in scheme)
        # Keep the CLI output compatible with legacy Windows code pages.
        text = " ".join(f"({u},{v})" for u, v in edges) if edges else "{}"
        print(f"{number}: {text}")


if __name__ == "__main__":
    main()
