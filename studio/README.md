# DAG Studio

DAG Studio is a browser-based graph viewer and lightweight JSON editor for directed graph data.

It is built for fast graph inspection and editing in the browser:

- load the repository's default JSON graph and render it immediately
- infer a document-specific field mapping when JSON uses custom field names
- navigate by root, subtree, or parent level
- edit nodes and relationships directly in the UI
- batch graph edits from a text console in `Edit` mode
- undo and redo graph mutations without losing navigation history
- write every graph edit directly to `content/math.json`

![DAG Studio screenshot](./docs/assets/screenshot.png)

## Quick Start

Double-click the launcher for your platform from the repository root:

- Windows: [`../launch-studio.cmd`](../launch-studio.cmd)
- macOS: [`../launch-studio.command`](../launch-studio.command)

The launcher starts the local Python integration API and Vite, then opens DAG Studio in the default browser. On macOS, if Finder blocks the script after a zip download, run `chmod +x launch-studio.command` once.

For UI-only frontend development:

```powershell
npm install
npm run dev
```

Then open the local dev server URL shown by Vite. File synchronization and Typora require `python server.py` or a repository-root launcher.

Useful commands:

```powershell
npm run build
npm test
```

When the launcher starts, the local backend repairs the [`../content/`](../content/) workspace before Vite loads [`../content/math.json`](../content/math.json). Markdown files missing from JSON become isolated nodes, JSON nodes missing Markdown receive a new file, dangling relation targets become nodes, and missing mirrored parent/child edges are written back automatically.

The default document uses an inferred field mapping. Every committed graph edit, undo, and redo is serialized through a single write queue and written directly to the workspace.

## What You Can Do

- switch between `Preview` and `Edit` mode
- focus a node, move back through focus history, or move up to parent levels
- work with multiple roots as a forest
- change layout modes between `BFS`, `Sugiyama layered`, and `Dagre layered`
- inspect every node field in a generic node viewer
- edit relationships, rename nodes, or delete a node or subtree
- use the graph console for batch edits with undoable transactions
- create and delete matching Markdown files when nodes are created or deleted
- view the complete corresponding Markdown source in each node's derived `content` field
- open the corresponding Markdown file in Typora from the node detail icon

## Documentation

- [Documentation Index](docs/index.md): overview of the available project docs
- [Usage Guide](docs/usage.md): UI workflows, navigation, immediate synchronization, and layouts
- [Data Format Guide](docs/data-format.md): supported JSON shapes, field rules, and normalization behavior
- [Graph Console DSL](docs/graph-console-dsl.md): command reference for the edit-mode console
- [Development Guide](docs/development.md): local scripts, source layout, and implementation notes

## Minimal Example

```json
{
  "A": {
    "children": {
      "B": "related_to",
      "C": "related_to"
    }
  },
  "B": {},
  "C": {}
}
```

For the recommended data model and additional examples, see [Data Format Guide](docs/data-format.md).

## Project Structure

- [`src/`](src/): React app source
- [`server.py`](server.py): local launcher and narrowly scoped Typora API
- [`../content/math.json`](../content/math.json): default graph data
- [`../content/`](../content/): default Markdown and asset workspace
- [`docs/`](docs/): user and developer documentation
- [`src/styles/`](src/styles/): split global styles (tokens, layout, controls, graph, console, modals)

## License

MIT License. See [LICENSE](LICENSE) for details.
