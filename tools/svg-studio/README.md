# Vectora SVG Studio

A local-first SVG editor built with **React 19, TypeScript (strict mode), and Vite 8**. The interface is entirely in English. Artwork stays in browser storage; no account or backend is required.

## Start

Requires **Node.js 22.12 or later** and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173/. On Windows, double-click `launch.cmd` or run `./launch.ps1`. The launcher also supports an existing Codex desktop Node runtime when the system installation is older. `./launch.ps1 -Preview` builds and serves the production version.

This is now a built application: opening `index.html` directly or serving the source directory with Python is no longer supported. To host it on a static server:

```sh
npm run build
npm run preview
```

Deploy the generated `dist/` directory. Relative asset paths support hosting in a subdirectory.

## Editing

- **Select (V):** drag on empty canvas or surrounding workspace to marquee-select. **Workspace settings → Marquee selection** switches between **Touch to select** and **Fully enclosed only**. Shift adds to a selection. Drag a selected object to move the selection; drag the collective corner handles to scale it. Hidden and locked objects are excluded.
- **Direct nodes:** selecting a line, polyline, path, or Bézier curve immediately exposes anchors and control handles. No mode switch is needed. Drag anchors freely outside the old bounds, or set their X/Y in the inspector. Double-click a segment or use **Add node** to insert an anchor; select a node and press Delete to remove it. Paths retain at least two anchors. N / Enter remains an optional shortcut.
- **Polyline (P):** click successive points, then press Enter or double-click to finish. Escape discards the unfinished path.
- **Bézier (B):** click-drag each anchor to set its handles. Add as many segments as needed; Enter finishes. Anchors move their adjacent handles. Choose **Corner**, **Smooth** (linked direction, independent lengths), or **Symmetric** (equal, mirrored handles) in the inspector. Alt-drag unlinks an individual handle. Splitting a cubic preserves its exact shape. Convert a polyline to Bézier for handles, or convert a Bézier to straight segments between its anchors.
- **Transform on canvas:** drag the round handle above an object to rotate; Shift snaps to 15°. Resize handles, aspect locking, and horizontal/vertical flip work with transformed objects. Orange handles adjust rectangle corners, star inner radius, and arc endpoints.
- **Text:** double-click to edit in place; Ctrl/Cmd+Enter finishes and Escape cancels. The font picker offers categories, search, previews, a custom family field, and TTF/OTF/WOFF/WOFF2 import. Imported fonts are stored with the document and embedded in SVG exports. System font availability depends on the machine.
- **Paint:** fill and stroke support solid colors, linear gradients, and radial gradients. Add/remove color stops, set positions and opacity, reverse colors, choose presets, and set angle/radius and spread. **Edit gradient on canvas** exposes direction/center/radius handles and draggable color stops. Gradients export as native SVG paint servers, including strokes on horizontal lines.
- **Group:** marquee or Shift-select multiple layers, then Ctrl/Cmd+G. Ctrl/Cmd+Shift+G ungroups. Group resizing and rotation preserve child transforms, including affine transforms after ungrouping.
- **Inspector:** contextual geometry, typography, paint, stroke, and arrangement controls. Mixed values are shown explicitly, locked selections disable editing, and multi-selection offers alignment and grouping instead of assigning all objects the same position.
- **Layers:** show/hide, lock/unlock, double-click to rename, drag to reorder, and Shift-click to multi-select.
- **Context menu:** right-click artwork, layers, or workspace for clipboard, grouping, node, ordering, locking, and deletion actions. Use arrow keys, Home/End, Enter, or Escape; unavailable actions are disabled.
- **Pan/zoom and grid:** Space-drag or H to pan; Ctrl/Cmd-scroll zooms around the pointer. Press 1 to fit. Open **Workspace settings** in the upper-left canvas controls (also available with no selection in the inspector) to set grid size from 2–256 px, dots/lines, snapping, and marquee mode. These preferences persist across reloads. The grid follows artboard coordinates and is excluded from exports; at low zoom, intermediate grid marks are hidden for readability while snapping retains the chosen interval.
- **Undo/redo:** one history entry per drag or field edit, with up to 100 document snapshots. Creating a blank document or applying a template is also undoable.

The glass sidebars meet the topbar and extend flush to the outer and bottom browser edges. Panels collapse independently; canvas controls adapt to the available space. Reduced-motion preferences and a solid fallback for browsers without backdrop blur are supported.

## Import, export, and storage

- **Import SVG** opens a document as separate layers; dropping an SVG inserts it into the current document.
- Simple open SVG polylines, lines, and M/L/C paths are promoted to native editable nodes. Complex, closed, mixed-command, filtered, masked, or gradient-painted paths remain SVG layers to retain their rendering. Their node geometry is not converted.
- Gradients, definitions, inherited paint, transforms, and basic CSS rules are retained. Imported CSS is scoped to its artwork; scripts, event handlers, and external references are removed. SVG groups with compositing effects and advanced CSS rules are not guaranteed to round-trip exactly when split into individual layers.
- PNG/JPEG/WebP/GIF images, text, shapes, symbols, palettes, and the three existing starter compositions remain available.
- Export SVG or PNG at 1–4×, or copy SVG source. PNG output is limited to 64 megapixels to avoid oversized allocations. Import fonts to make exported SVG typography portable.
- Autosave uses `vectora-svg-studio-v3`. Documents from the previous v2/v1 keys load automatically when no v3 document exists. Legacy keys are retained. Browser storage belongs to its **origin**: use the same hostname and port to access previous local saves. Export artwork before changing origins or clearing browser data.

## Architecture

| Module                                    | Responsibility                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| `src/main.tsx`, `src/App.tsx`             | Application composition and lifecycle                                     |
| `src/model/types.ts`                      | Document, element, and view contracts                                     |
| `src/model/store.ts`                      | Document commands, selection, clipboard, undo/redo, and transactions      |
| `src/model/geometry.ts`                   | Affine transforms, bounds, path normalization, and exact cubic splitting  |
| `src/model/nodes.ts`, `hitTest.ts`        | Anchor constraints, path conversion, and geometric marquee hit testing    |
| `src/model/paint.ts`, `fonts.ts`          | Gradient color stops and embedded typefaces                               |
| `src/model/preferences.ts`                | Persistent grid and selection preferences                                 |
| `src/model/storage.ts`                    | Persistence and legacy document loading                                   |
| `src/model/elements.ts`, `templates.ts`   | Shape factories and starter content                                       |
| `src/model/context.tsx`, `useKeyboard.ts` | React subscription and keyboard commands                                  |
| `src/canvas/`                             | Pointer controller, canvas rendering, and selection/node overlays         |
| `src/components/`                         | Library, inspector, fields, toolbar, menus, and accessible dialogs        |
| `src/svg/`                                | SVG rendering, import, editable path conversion, text editing, and export |
| `src/styles/`                             | Shared controls, glass surfaces, panels, canvas, and overlays             |

React owns the application interface and selection overlays. An isolated SVG renderer owns only the artwork group, allowing imported SVG markup and the export renderer to share the same drawing implementation. Document commands are independent of React and tested without a browser.

## Verify

```sh
npm run build
npm test
npm run test:e2e
npm run format:check
```

Browser tests use installed Chrome by default. Set `PLAYWRIGHT_CHANNEL=msedge` to use Edge. Pure model tests cover transformed grouping, node constraints, exact Bézier subdivision, marquee modes, gradients, locks, history, and resizing. Browser tests exercise direct manipulation, typography, grid preferences, both selection modes, gradient exports (including raster pixel checks), imports, downloads, persistence, and flush desktop layouts. The embedded font case uses Windows Arial.
