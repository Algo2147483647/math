from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal


@dataclass
class Node:
    key: str = ""
    define: str = ""
    properties: str = ""
    children: dict[str, str] = field(default_factory=dict)
    parents: dict[str, str] = field(default_factory=dict)

    def to_dict(self) -> dict[str, object]:
        return {
            "define": self.define,
            "properties": self.properties,
            "children": dict(self.children),
            "parents": dict(self.parents),
        }

    def add_child(
        self,
        graph: Graph,
        child_key: str,
        label: str = "",
        *,
        create_missing: bool = True,
    ) -> Node | None:
        if not self.key:
            raise ValueError("Node.key is required before adding relationships.")

        child = ensure_node_in_graph(graph, child_key) if create_missing else graph.get(child_key)
        if child is None:
            return None

        self.children[child_key] = label
        child.parents[self.key] = label
        return child

    def add_parent(
        self,
        graph: Graph,
        parent_key: str,
        label: str = "",
        *,
        create_missing: bool = True,
    ) -> Node | None:
        if not self.key:
            raise ValueError("Node.key is required before adding relationships.")

        parent = ensure_node_in_graph(graph, parent_key) if create_missing else graph.get(parent_key)
        if parent is None:
            return None

        self.parents[parent_key] = label
        parent.children[self.key] = label
        return parent

    def remove_child(self, graph: Graph, child_key: str) -> bool:
        if child_key not in self.children:
            return False

        self.children.pop(child_key, None)
        child = graph.get(child_key)
        if child is not None:
            child.parents.pop(self.key, None)
        return True

    def remove_parent(self, graph: Graph, parent_key: str) -> bool:
        if parent_key not in self.parents:
            return False

        self.parents.pop(parent_key, None)
        parent = graph.get(parent_key)
        if parent is not None:
            parent.children.pop(self.key, None)
        return True


Graph = dict[str, Node]


def ensure_node_in_graph(graph: Graph, key: str) -> Node:
    node = graph.get(key)
    if node is None:
        node = Node(key=key)
        graph[key] = node
    elif not node.key:
        node.key = key
    return node


def sync_graph_relations(
    graph: Graph,
    *,
    prefer: Literal["children", "parents"] = "children",
    create_missing: bool = False,
) -> Graph:
    if prefer == "parents":
        for target, node in list(graph.items()):
            for source, label in list(node.parents.items()):
                parent = ensure_node_in_graph(graph, source) if create_missing else graph.get(source)
                if parent is None:
                    continue
                parent.children[target] = label

        for source, node in list(graph.items()):
            for target, label in list(node.children.items()):
                child = ensure_node_in_graph(graph, target) if create_missing else graph.get(target)
                if child is None:
                    continue
                child.parents[source] = label
        return graph

    for source, node in list(graph.items()):
        for target, label in list(node.children.items()):
            child = ensure_node_in_graph(graph, target) if create_missing else graph.get(target)
            if child is None:
                continue
            child.parents[source] = label

    for target, node in list(graph.items()):
        for source, label in list(node.parents.items()):
            parent = ensure_node_in_graph(graph, source) if create_missing else graph.get(source)
            if parent is None:
                continue
            parent.children[target] = label

    return graph


def build_edge_in_graph(graph: Graph, source: str, target: str, weight: str = "") -> None:
    ensure_node_in_graph(graph, source).add_child(graph, target, weight)


def build_node_in_graph(
    graph: Graph,
    relation_type: str,
    anchor_key: str,
    node_key: str,
    weight: str = "",
) -> Node | None:
    if node_key in graph:
        return graph[node_key]

    if anchor_key not in graph:
        return None

    graph[node_key] = Node(key=node_key)

    if relation_type == "kid":
        build_edge_in_graph(graph, anchor_key, node_key, weight)
    elif relation_type == "parent":
        build_edge_in_graph(graph, node_key, anchor_key, weight)

    return graph[node_key]


def replace_children(graph: Graph, key: str, children: dict[str, str]) -> Node:
    node = get_node_from_graph(graph, key)
    for child_key in list(node.children):
        node.remove_child(graph, child_key)
    for child_key, label in children.items():
        node.add_child(graph, child_key, label)
    return node


def replace_parents(graph: Graph, key: str, parents: dict[str, str]) -> Node:
    node = get_node_from_graph(graph, key)
    for parent_key in list(node.parents):
        node.remove_parent(graph, parent_key)
    for parent_key, label in parents.items():
        node.add_parent(graph, parent_key, label)
    return node


def get_node_from_graph(graph: Graph, key: str) -> Node:
    node = graph.get(key)
    if node is None:
        raise ValueError(f"Concept not found: {key}")
    return node


def list_nodes_in_graph(graph: Graph) -> list[str]:
    return sorted(graph)


def create_node_in_graph(
    graph: Graph,
    key: str,
    *,
    define: str = "",
    properties: str = "",
    children: dict[str, str] | None = None,
    parents: dict[str, str] | None = None,
) -> Node:
    if key in graph:
        raise ValueError(f"Concept already exists: {key}")

    node = ensure_node_in_graph(graph, key)
    node.define = define
    node.properties = properties

    for child_key, label in (children or {}).items():
        node.add_child(graph, child_key, label)
    for parent_key, label in (parents or {}).items():
        node.add_parent(graph, parent_key, label)
    return node


def update_node_in_graph(
    graph: Graph,
    key: str,
    *,
    define: str | None = None,
    properties: str | None = None,
    children: dict[str, str] | None = None,
    parents: dict[str, str] | None = None,
    merge_relations: bool = False,
) -> Node:
    node = get_node_from_graph(graph, key)

    if define is not None:
        node.define = define
    if properties is not None:
        node.properties = properties
    if children is not None:
        if merge_relations:
            for child_key, label in children.items():
                node.add_child(graph, child_key, label)
        else:
            replace_children(graph, key, children)
    if parents is not None:
        if merge_relations:
            for parent_key, label in parents.items():
                node.add_parent(graph, parent_key, label)
        else:
            replace_parents(graph, key, parents)
    return node


def delete_node_from_graph(graph: Graph, key: str) -> dict[str, int]:
    node = get_node_from_graph(graph, key)
    removed_parent_links = len(node.parents)
    removed_child_links = len(node.children)

    for parent_key in list(node.parents):
        node.remove_parent(graph, parent_key)
    for child_key in list(node.children):
        node.remove_child(graph, child_key)

    graph.pop(key, None)
    return {
        "removed_parent_links": removed_parent_links,
        "removed_child_links": removed_child_links,
    }


def rename_node_in_graph(graph: Graph, old_key: str, new_key: str) -> Node:
    if old_key == new_key:
        return get_node_from_graph(graph, old_key)
    if new_key in graph:
        raise ValueError(f"Concept already exists: {new_key}")

    node = get_node_from_graph(graph, old_key)
    graph[new_key] = graph.pop(old_key)
    node.key = new_key

    for parent_key in list(node.parents):
        parent = graph.get(parent_key)
        if parent is not None and old_key in parent.children:
            parent.children[new_key] = parent.children.pop(old_key)

    for child_key in list(node.children):
        child = graph.get(child_key)
        if child is not None and old_key in child.parents:
            child.parents[new_key] = child.parents.pop(old_key)

    return node


def add_child_in_graph(graph: Graph, key: str, child_key: str, label: str = "") -> Node:
    node = get_node_from_graph(graph, key)
    node.add_child(graph, child_key, label)
    return node


def add_parent_in_graph(graph: Graph, key: str, parent_key: str, label: str = "") -> Node:
    node = get_node_from_graph(graph, key)
    node.add_parent(graph, parent_key, label)
    return node


def remove_child_in_graph(graph: Graph, key: str, child_key: str) -> bool:
    node = get_node_from_graph(graph, key)
    return node.remove_child(graph, child_key)


def remove_parent_in_graph(graph: Graph, key: str, parent_key: str) -> bool:
    node = get_node_from_graph(graph, key)
    return node.remove_parent(graph, parent_key)


def serialize_graph(graph: Graph) -> dict[str, dict[str, object]]:
    sync_graph_relations(graph)
    return {key: node.to_dict() for key, node in sorted(graph.items())}
