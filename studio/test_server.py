import json
from pathlib import Path
import tempfile
import unittest

try:
    from studio.server import repair_workspace, sync_workspace
except ModuleNotFoundError:
    from server import repair_workspace, sync_workspace


class WorkspaceSyncTests(unittest.TestCase):
    def test_startup_matches_space_keys_to_underscore_markdown_names(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            content_root = Path(temporary_directory)
            json_path = content_root / "math.json"
            graph = {"Vector Space": {"type": "Linear Algebra", "parents": {}, "children": {}}}
            json_path.write_text(json.dumps(graph), encoding="utf-8")
            (content_root / "Vector_Space.md").write_text("# Vector Space\n", encoding="utf-8")

            report = repair_workspace(content_root, json_path)

            self.assertEqual(json.loads(json_path.read_text(encoding="utf-8")), graph)
            self.assertEqual(report["addedMarkdownNodes"], 0)
            self.assertFalse((content_root / "Vector Space.md").exists())

    def test_startup_repair_adds_markdown_nodes_and_mirrors_edges(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            content_root = Path(temporary_directory)
            json_path = content_root / "math.json"
            json_path.write_text(json.dumps({
                "A": {"parents": {}, "children": {"B": "subtype_of"}},
            }), encoding="utf-8")
            (content_root / "A.md").write_text("# A\n", encoding="utf-8")
            (content_root / "C.md").write_text("# C\n", encoding="utf-8")

            report = repair_workspace(content_root, json_path)
            graph = json.loads(json_path.read_text(encoding="utf-8"))

            self.assertTrue(report["changed"])
            self.assertEqual(set(graph), {"A", "B", "C"})
            self.assertEqual(graph["B"]["parents"], {"A": "subtype_of"})
            self.assertEqual(graph["C"], {"type": "", "parents": {}, "children": {}})
            self.assertEqual(graph["B"]["type"], "")
            self.assertTrue((content_root / "B.md").is_file())

    def test_sync_renames_creates_and_deletes_markdown_files(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            content_root = Path(temporary_directory)
            json_path = content_root / "math.json"
            json_path.write_text(json.dumps({
                "A": {"parents": {}, "children": {}},
                "B": {"parents": {}, "children": {}},
            }), encoding="utf-8")
            (content_root / "A.md").write_text("# A\nPreserved content.\n", encoding="utf-8")
            (content_root / "B.md").write_text("# B\n", encoding="utf-8")

            result = sync_workspace({
                "C": {"parents": {}, "children": {}},
                "D": {"parents": {}, "children": {}},
            }, [{"from": "A", "to": "C"}], content_root, json_path)

            self.assertEqual(set(json.loads(json_path.read_text(encoding="utf-8"))), {"C", "D"})
            self.assertEqual((content_root / "C.md").read_text(encoding="utf-8"), "# A\nPreserved content.\n")
            self.assertEqual((content_root / "D.md").read_text(encoding="utf-8"), "# D\n")
            self.assertFalse((content_root / "A.md").exists())
            self.assertFalse((content_root / "B.md").exists())
            self.assertEqual(result["deletedMarkdown"], ["B"])
            self.assertEqual(result["renamedMarkdown"], [{"from": "A", "to": "C"}])

            sync_workspace({
                "B": {"parents": {}, "children": {}},
                "C": {"parents": {}, "children": {}},
                "D": {"parents": {}, "children": {}},
            }, [], content_root, json_path)
            self.assertEqual((content_root / "B.md").read_text(encoding="utf-8"), "# B\n")

    def test_sync_rename_converts_key_spaces_to_filename_underscores(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            content_root = Path(temporary_directory)
            json_path = content_root / "math.json"
            json_path.write_text(json.dumps({"Old Key": {"parents": {}, "children": {}}}), encoding="utf-8")
            (content_root / "Old_Key.md").write_text("Preserved.\n", encoding="utf-8")

            result = sync_workspace(
                {"New Key": {"parents": {}, "children": {}}},
                [{"from": "Old Key", "to": "New Key"}],
                content_root,
                json_path,
            )

            self.assertFalse((content_root / "Old_Key.md").exists())
            self.assertEqual((content_root / "New_Key.md").read_text(encoding="utf-8"), "Preserved.\n")
            self.assertEqual(result["renamedMarkdown"], [{"from": "Old Key", "to": "New Key"}])

    def test_sync_imports_new_external_markdown_as_an_orphan(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            content_root = Path(temporary_directory)
            json_path = content_root / "math.json"
            graph = {"A": {"parents": {}, "children": {}}}
            json_path.write_text(json.dumps(graph), encoding="utf-8")
            (content_root / "A.md").write_text("# A\n", encoding="utf-8")
            (content_root / "External.md").write_text("# External\n", encoding="utf-8")

            sync_workspace(graph, [], content_root, json_path)
            repaired = json.loads(json_path.read_text(encoding="utf-8"))

            self.assertEqual(repaired["External"], {"type": "", "parents": {}, "children": {}})


if __name__ == "__main__":
    unittest.main()
