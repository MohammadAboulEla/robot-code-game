# Robot Code Game — Product & Engineering Plan

## How to use this file

This is an execution plan for Claude Code. Work **one milestone at a time, in order**.
Within a milestone, work through its steps in order. Do not start a milestone until the
previous one's "Definition of Done" is fully met — later milestones assume earlier ones
are solid, and skipping ahead will force rework.

Rule of thumb when giving this to Claude Code: paste only the milestone you want done next
("Execute Milestone 2 from PLAN.md"), not the whole file. Update the checkboxes as you go
so state persists across sessions.

---

## Vision

A browser game where players learn real Python by programming a robot through an isometric
grid world. Progression is a **research tree**: solving puzzles unlocks new commands,
language features, and their documentation — mirroring how a real language is learned
(sequence → conditionals → loops → functions → data structures), not unlocked arbitrarily.
Debugging is part of the fun (step-through, visual state), and — like Zachtronics games —
solving isn't the end: players can submit multiple solutions and compare them on real
metrics (instruction count, steps, lines of code), competing against themselves and others.

## Design Pillars

1. **Puzzles are data, not code.** Anyone (including you, in a hidden dev playground) can
   spin up a new puzzle without touching game logic.
2. **Commands are unlockable, not hardcoded.** The interpreter's API surface is a registry;
   the research tree just toggles what's "installed."
3. **Learning follows real Python pedagogy.** Tree order: sequencing → variables →
   conditionals → loops (for → while) → functions → lists/dicts → composition. Each node
   links to real docs content, not just a command name.
4. **Optimization is part of the game.** Every solved puzzle records metrics; players can
   keep multiple solutions and compare them (fewest instructions, fewest lines, fastest).
5. **Everything is inspectable/expandable.** New puzzle = new JSON file. New command = one
   registry entry. New tree node = one config entry. No editing core VM logic to add content.

---

## Architecture Principles (apply throughout, not a milestone by itself)

- **Puzzle World State** becomes a parameterized `PuzzleDefinition` (grid size, obstacles,
  start pos/facing, cargo boxes, targets, allowed commands, par metrics) instead of the
  single hardcoded `INITIAL_WORLD_STATE`.
- **Command Registry**: `robotInterpreter.ts` stops hardcoding which commands exist. A
  `CommandRegistry` (id → implementation + metadata: name, doc content, unlock node id)
  is passed into `PythonExecutor`. Locked commands simply aren't in the registry passed to
  a given puzzle run, and the parser reports "unknown command" the same way it does today
  for typos — reusing existing error handling, not inventing a new one.
- **Persistence**: introduce `localStorage`-backed (or IndexedDB, decide in M1) save data:
  unlocked nodes, solved puzzles, saved solutions per puzzle. No backend required for v1.
- **Everything new is additive**: existing `App.tsx`/`useRobotSimulation.ts` behavior for
  the current single scripted puzzle must keep working after M0/M1 — it becomes "puzzle #1"
  in the new system, not a special case.

---

## Milestone Roadmap

### Milestone 0 — Foundation Refactor (Command Registry + Puzzle Definition)
**Status:** ☑ Done

**Why this is first:** every later milestone (progression, editor, playground, solution
tracking) depends on commands and puzzles being data-driven instead of hardcoded. Doing
this later means rewriting the interpreter's call sites multiple times.

**Steps:**
1. Define `CommandDefinition` type in `src/types/gameTypes.ts`: `id`, `label`, `signature`,
   `docMarkdown`, `execute(vm, args)`, `category` (movement/sensor/control).
2. Move the current 6 commands (`move`, `rotate`, `grab`, `drop`, `is_holding`,
   `can_move`) out of `robotInterpreter.ts` into `src/game/commands/` as registry entries,
   one file per command or one grouped file — your call, but keep implementations pure
   functions over `VMState` so they're independently testable.
3. Change `PythonExecutor` constructor to accept `(initialState, commandRegistry:
   Map<string, CommandDefinition>)`. `executeCommand` looks up the registry instead of a
   switch statement.
4. Define `PuzzleDefinition` type: `id`, `title`, `description`, `gridSize`, `obstacles`,
   `robotStart {x,y,facing}`, `cargo[]`, `targets[]`, `allowedCommandIds[]`,
   `starterCode`, `parMetrics {instructions, lines}` (optional, used later for scoring).
5. Move `INITIAL_WORLD_STATE`/`DEFAULT_PYTHON_CODE` out of `gameConstants.ts` into a
   `puzzles/001-first-delivery.ts` (or `.json`) matching `PuzzleDefinition`, and delete the
   hardcoded constant once the game boots from it.
6. Update `useRobotSimulation.ts` to take a `PuzzleDefinition` + resolved command registry
   as input instead of assuming the one global world state.
7. Verify: existing gameplay (the delivery puzzle shown in your screenshot) still works
   identically, just now sourced from a `PuzzleDefinition` + full command registry (all
   commands unlocked, since progression doesn't exist yet).

**Definition of Done:**
- No file references `INITIAL_WORLD_STATE` or a hardcoded command switch anymore.
- Adding a hypothetical 7th command requires only a new registry entry, zero edits to
  `PythonExecutor`'s control flow.
- The existing puzzle plays exactly as it does today.

---

### Milestone 1 — Puzzle Loader & Multi-Puzzle Shell
**Status:** ☑ Done

**Steps:**
1. Create `src/puzzles/index.ts` exporting an ordered array/registry of all
   `PuzzleDefinition`s (start with just the one from M0).
2. Add a lightweight puzzle-select screen (list of puzzles with title/description/lock
   status placeholder — lock logic comes in M2) that loads the chosen `PuzzleDefinition`
   into `useRobotSimulation`.
3. Add `localStorage` persistence layer: `src/state/saveData.ts` with typed
   `SaveData { unlockedNodeIds: string[], solvedPuzzleIds: string[], solutions:
   Record<puzzleId, SavedSolution[]> }`, load/save helpers, versioned schema (add a
   `schemaVersion` field now so future migrations don't break old saves).
4. Wire "puzzle solved" (existing success action) to mark the puzzle solved in save data.

**Definition of Done:** you can add a second `PuzzleDefinition` file, have it appear in a
puzzle list, and solve it independently of puzzle #1, with progress persisted across a
page refresh.

---

### Milestone 2 — Research Tree / Progression System
**Status:** ☑ Done

**Steps:**
1. Design the tree data: `src/progression/tree.ts` — array of `TreeNode { id, title,
   unlocksCommandIds: string[], docMarkdown, prerequisiteNodeIds: string[],
   unlockedByPuzzleId: string }`. Order nodes to match real Python pedagogy (sequencing →
   `if`/`else` → `for` → `while` → functions → lists, matching your existing parser
   support order and leaving room for future ones like functions/lists which the
   interpreter doesn't support yet — flag those as future interpreter work, don't fake it).
2. Solving a puzzle unlocks the node(s) it maps to (via `unlockedByPuzzleId`), which adds
   their `unlocksCommandIds` to the player's active command registry going forward.
3. Each `PuzzleDefinition.allowedCommandIds` is intersected with the player's unlocked
   commands at runtime, so a puzzle can never accidentally expose a not-yet-unlocked
   command even if misconfigured — belt and suspenders.
4. Build a simple tree visualization screen (can be minimal/list-based first, visual graph
   later) showing locked/unlocked nodes and linking to each node's doc content.
5. Gate the `SystemManual` command-API tabs (existing component) to only show docs for
   unlocked commands, with locked ones visible-but-greyed to create the "I want that"
   pull.

**Definition of Done:** a fresh save only has puzzle #1's commands unlocked; solving it
unlocks the next node and its command(s) become usable (and documented) in puzzle #2.

---

### Milestone 3 — Dev Playground Mode (hidden, for building/testing puzzles)
**Status:** ☑ Done

**Why now:** you need this before building the visual editor (M5) and before content
scales — it's your own testing tool, so build it as soon as multi-puzzle + registry exist.

**Steps:**
1. Add a hidden route/flag (e.g. `?dev=1` query param or a keybind) that opens a
   "Playground" panel, gated out of production builds via env flag if desired.
2. Playground lets you: pick any `PuzzleDefinition` (including unfinished ones), run it
   with **all** commands unlocked regardless of save data, hot-reload puzzle JSON without
   full page refresh, and see raw VM state/action queue as JSON (not just the isometric
   view) for debugging interpreter behavior.
3. Add a "puzzle linter": on load, validate a `PuzzleDefinition` (reachable target,
   `allowedCommandIds` all exist in registry, grid bounds valid, robot start not on an
   obstacle) and surface errors in the playground UI.

**Definition of Done:** you can drop a new puzzle file in `src/puzzles/`, open the
playground, and immediately playtest it fully unlocked, with validation errors caught
before you ever hand it to the progression system.

---

### Milestone 4 — Solution Tracking & Optimization Metrics
**Status:** ☑ Done

**Steps:**
1. On puzzle success, compute metrics already available from the action queue: total
   `VMAction` count (instructions executed), source lines used (non-blank/non-comment),
   and steps-to-solve. Extend `VMAction`/run result with a summary object if not already
   convenient.
2. Extend `SavedSolution { code, metrics, timestamp, label? }` and store multiple per
   puzzle in save data (cap count or let the user manage/delete).
3. Build a "Solutions" panel per puzzle: list saved solutions sorted by a chosen metric
   (fewest instructions / fewest lines / fastest), diff-view or just re-load a past
   solution's code into the editor.
4. Compare against `parMetrics` from the `PuzzleDefinition` (if set) to show "beat par" /
   optimization goals, Zachtronics-style.

**Definition of Done:** solving the same puzzle twice with different code keeps both
solutions, and you can see which one is more "efficient" by the chosen metric.

---

### Milestone 5 — In-App Puzzle Editor (SKIP FOR NOW)
**Status:** ☐ Not started

**Steps:**
1. Visual grid editor: click-to-toggle obstacles, place robot start + facing, place cargo
   and target tiles, set grid size — outputs a valid `PuzzleDefinition` object.
2. Command/feature picker: checkbox list of which registry commands and tree-node
   prerequisites a puzzle requires — this is what makes it usable both as your own
   creation tool and (later, optionally) a community puzzle-sharing feature.
3. Export/import: serialize to JSON (download) and load from JSON (upload), so puzzles can
   be authored outside the app and dropped into `src/puzzles/` for permanent inclusion, or
   loaded ad hoc in the playground.
4. Reuse the M3 linter here live, so invalid puzzles can't be exported.

**Definition of Done:** you (or eventually a player) can build a brand-new puzzle entirely
through UI, export it, and load it back into the playground without hand-writing JSON.

---
### Milestone 6 — Debugging & Feedback Polish ("debugging is fun")
**Status:** ☑ Done

**Steps:**
1. Improve step-debugger: show variable/state diffs per step (not just world-state
   animation), highlight *why* a step failed (which condition/branch was taken) — surface
   the existing `beforeState`/`afterState` diff, don't invent new VM tracking.
2. Add lightweight juice: success/fail animations, a short "here's what changed" toast per
   step in step mode, sound-optional feedback hooks (stub if no audio yet).
3. Add achievements/badges layer (e.g. "solved with under N instructions", "first while
   loop") driven off the M4 metrics — purely additive, no new VM logic required.

**Definition of Done:** stepping through code feels informative and satisfying, not just a
slower version of Run.

---

### Milestone 7 — Content Expansion & Sharing (optional, do once core loop is fun) (SKIP FOR NOW)
**Status:** ☐ Not started

**Steps:**
1. Bulk-author a real puzzle set (10–20) using the M5 editor, ordered to match the tree
   from M2, filling in genuinely new interpreter features as needed (functions, lists) —
   each new language feature is its own mini-milestone under this one when you get here.
2. Optional: puzzle sharing via export/import JSON files or a simple community gallery
   (can stay local-file-based for a long time before needing a backend).

**Definition of Done:** a new player can go from puzzle 1 to a genuinely complete beginner
Python curriculum using only in-game content.

---

## Milestone Dependency Summary

```
M0 (registry + puzzle model)
  └─ M1 (multi-puzzle + saves)
       ├─ M2 (progression tree)
       ├─ M3 (dev playground)
       └─ M4 (solution tracking)
            └─ M5 (puzzle editor)
                 └─ M6 (debug/feedback polish)
                      └─ M7 (content scale + sharing)
```

M2, M3, and M4 can be built in parallel once M1 is done if you want to parallelize across
sessions, but M0 → M1 must be sequential and complete first.

Milestone 8 — UI/UX Reorganization: Collapse the Scattered Panels
Status: ☑ Done
Why this is needed: the current layout stacks Objective, System Manual, Robot Commands API, Orientation Compass, and Protocol Archive & Metrics as always-visible panels competing for the same space. None of this touches game logic — it's purely presentation/IA — so it's safe to do independently of the interpreter/progression work, but it should happen before content scales (M7), since more puzzles + more unlocked commands will only make an unorganized panel stack worse.
Steps:

Convert the "PROTOCOL OBJECTIVE" card into a collapsible recall bar: auto-expanded once when a puzzle loads (or reloads), then collapses to a single-line summary (puzzle title + target coordinates) with a chevron/tap-to-expand affordance. Preserve the full objective text/grid/start/target details in the expanded state — don't drop content, just default it to collapsed after first view.
Merge System Manual, Robot Commands API, Orientation Compass, and Protocol Archive & Metrics into a single tabbed "Inspector" panel component. Each becomes one tab's content instead of its own stacked card. Preserve all existing functionality inside each tab exactly as-is (locked/unlocked command greying from M2, solution sorting/archive actions from M4, etc.) — this is a container change, not a content change.
Order the tabs by real usage frequency, not build order: Manual → Commands API → Compass → Archive & Metrics. Default-select the Manual tab on puzzle load.
Keep the code editor and isometric visual engine as the only two panels that are always fully visible and never collapse/tab — everything else routes through the recall bar or the Inspector tabs.
Visually de-emphasize the Inspector panel relative to the editor/isometric pair (smaller type scale and/or muted card background is enough — no new color palette), so the primary gameplay surface reads as primary at a glance.
Do not change the existing color palette, iconography, or overall vintage-terminal visual style — this milestone is layout/IA only.

Definition of Done:

Only two panels are permanently visible without user interaction: code editor and isometric visual engine.
Objective info is fully reachable but defaults to a one-line collapsed state after the initial view.
Manual, Commands API, Compass, and Archive & Metrics are reachable via tabs within one Inspector panel, in that order, with zero loss of existing functionality (locked-command greying, solution list/sort/delete/replay actions, compass direction mappings all still work).
No visual/color regressions — a screenshot side-by-side with the current UI should read as "same game, tidier layout," not a reskin.

Milestone 9 — Game-Shell Viewport: Fixed Window, HUD Header, No Page Scroll
Status: ☐ Not started
Why this is needed: the app currently behaves like a webpage — the whole page scrolls vertically, and the top bar reads as website chrome (logo + title + nav-style buttons in a horizontal bar). A desktop game convention is a fixed window: the viewport itself never scrolls, a slim HUD bar sits at the top with iconography instead of nav-link-style buttons, and only specific internal regions (console log, archive list) scroll when their content overflows. This milestone depends on M8 being done — fewer always-visible panels makes it realistic to fit everything in one fixed viewport without cramming.
Steps:

Lock the page itself: html, body, #root get height: 100% / 100dvh and overflow: hidden. The entire app renders inside one fixed-size shell (flex or CSS grid) that never grows taller than the viewport — no matter how much code, console output, or archive data exists.
Redesign the top bar as a HUD strip, not a website header: shrink it in height, replace the back-arrow/title/button row layout with a convention closer to a game's title bar — e.g. system icon + protocol name on the left, small icon-only controls (playground, settings, fullscreen) on the right, no breadcrumb-style "back to X" text link. Icons over labels where the action is common (matches game HUD conventions like a pause/menu icon rather than a nav link).
Any panel whose content can legitimately exceed its box (console output log, archive/solutions list, long code files) gets its own internal scroll container with a fixed height — scrollbar lives inside that panel, never on the page. Style scrollbars minimally (thin, low-contrast) so they read as part of the game UI, not a browser default.
Make the main layout viewport-relative (%/fr/vh units via CSS grid) instead of content-driven (auto height stacking). Panels resize to fit the window rather than the window growing to fit panels.
Add a fullscreen toggle (Fullscreen API) in the HUD bar — standard expectation for a "game," even a browser-based one.
Test at a few common desktop resolutions (1366×768 up to 1920×1080) to confirm nothing requires page-level scrolling at any of them; if content genuinely can't fit at the smallest target resolution, decide per-panel what collapses (tie back to M8's Inspector tabs and objective recall bar) rather than letting the page scroll.

Definition of Done:

html/body never scroll under any window size in the test list; only explicitly designated internal panels (console, archive list) can scroll, and only within their own bounded box.
The top bar is visually and functionally a HUD (compact, icon-forward, no nav-link styling) rather than a webpage header.
Resizing the browser window resizes/reflows the game shell like a resizable game window, not a responsive webpage.
A fullscreen toggle exists and works.
No change to the color palette or overall vintage-terminal art style — this milestone is shell/viewport mechanics only.