# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm dev` — start Vite dev server on http://localhost:3000 (host `0.0.0.0`).
- `pnpm build` — production build to `dist/`.
- `pnpm preview` — preview the built `dist/`.
- `pnpm lint` — typecheck only (`tsc --noEmit`). There is no ESLint; this is the only static check.
- `pnpm clean` — remove `dist/` and `server.js`.

Package manager is **pnpm** (lockfile + `pnpm-workspace.yaml` present; `allowBuilds` whitelists `@google/genai`, `esbuild`, `protobufjs`). No test runner is configured.

## Architecture

The app is a single-page isometric "Robot Code Game": the user writes a Python-like script in an in-browser editor, which is parsed and executed against a puzzle's world state, then the resulting action queue is played back step-by-step on an isometric SVG grid. The app has two screens: a **puzzle-select** view listing available missions, and a **game view** for coding and running a selected puzzle.

There is no routing library — screen state is managed via `selectedPuzzle` in `App.tsx`:

- `src/main.tsx` — mounts `<App />` in `StrictMode`. Nothing else.
- `src/App.tsx` — two-screen shell: puzzle-select or game view. Manages `selectedPuzzle` state and command registry.
- `src/robotInterpreter.ts` — the parser + virtual machine. The core of the project.
- `src/index.css` — single `@import "tailwindcss";` (Tailwind v4 via `@tailwindcss/vite`, no config file, no `tailwind.config.*`).
- `src/types/gameTypes.ts` — shared TypeScript types: `PythonToken`, `CommandDefinition`, `PuzzleDefinition`, `VMState`, `CommandResult`.
- `src/constants/gameConstants.ts` — reserved for future non-puzzle constants.
- `src/game/commands/commands.ts` — **Command Registry**: all 6 robot commands as `CommandDefinition` entries. Exports `buildCommandRegistry(allowedIds)` and `ALL_COMMAND_IDS`.
- `src/puzzles/` — **Puzzle registry**:
  - `index.ts` — exports `PUZZLES: PuzzleDefinition[]` (ordered array) and `getPuzzleById(id)` helper.
  - `001-first-delivery.ts` — first puzzle (the original hardcoded delivery scenario).
  - `002-around-the-bend.ts` — second puzzle (L-shaped wall, 4×4 grid).
- `src/state/saveData.ts` — **Persistence layer**: `localStorage`-backed `SaveData` with versioned schema (`schemaVersion: 1`). Exports `loadSaveData`, `writeSaveData`, `markPuzzleSolved`, `isPuzzleSolved`.
- `src/utils/` — helper functions:
  - `pythonTokenizer.ts` — regex-based syntax tokenizer.
  - `isometricHelpers.ts` — isometric projection coordinate calculations.
- `src/hooks/useRobotSimulation.ts` — simulation hook. Accepts `PuzzleDefinition` + command registry + optional `onPuzzleSolved` callback. Calls `markPuzzleSolved` on success.
- `src/components/` — presentational & interactive sub-components:
  - `Header.tsx` — page header with optional back button and active puzzle title.
  - `Ticker.tsx`, `Footer.tsx` — page scaffolding.
  - `PuzzleSelect.tsx` — puzzle-select screen with solved badges from `saveData`.
  - `GameView.tsx` — game layout wrapper (editor + engine + controls), instantiates `useRobotSimulation`.
  - `CodeEditor.tsx` — editor text area, gutter numbers, and syntax highlighting overlay.
  - `ControlPanel.tsx` — action controllers (Run, Step Debug, Reset) and playback speed.
  - `ConsoleTerminal.tsx` — terminal logging output panel.
  - `SystemManual.tsx` — manual instructions and command APIs tabs.
  - `OrientationCompass.tsx` — direction compass indicator.
  - `ObjectiveCard.tsx` — dynamic puzzle objective card (accepts `PuzzleDefinition` prop).
  - `IsometricVisualEngine.tsx` — SVG grid canvas, z-sorted rendering, floating overlay alerts.

### The interpreter pipeline (`robotInterpreter.ts`)

This is the heart of the app and the most non-obvious part. The flow is:

1. **`parsePython(code)`** — hand-written tokenizer-free parser. Unchanged from original.
2. **`new PythonExecutor(initialState, commandRegistry)`** — constructs a VM over a *cloned* copy of the world state. Takes a `Map<string, CommandDefinition>` for command dispatch.
3. **`executor.run(ast)`** — walks the AST, dispatching commands via registry lookup. Each command's `execute(vmState, args)` mutates the VM state in place and returns a `CommandResult { success, message }`. The executor handles before/after state cloning for `VMAction` snapshots. `MoveError` (from `commands.ts`) carries both a user-facing `displayMessage` and a thrown error message, preserving the two-message pattern. Execution is **fully synchronous and upfront**.
4. The returned `VMAction[]` is the **action queue** that `useRobotSimulation.ts` replays via `setTimeout` at `playbackSpeed` ms/step.

**Safety limits** (hardcoded, not configurable):
- Total instructions: `maxInstructions = 1000` → `InfiniteLoopError`.
- `while` loops: `200` iterations per loop → `InfiniteLoopError`.
- These throw, which `run()` catches and converts into a final `error` action rather than re-throwing.

**Robot API** (callable commands, dispatched via `CommandRegistry` in `src/game/commands/commands.ts`):
- `move("front"|"back"|"left"|"right")` — directions are **relative to the robot's current heading**, not absolute grid directions. Move throws `MoveError` on obstacles or grid edges — these are terminal.
- `rotate("left"|"right")` — 90° turn; updates `robot.facing`.
- `grab()` — must be adjacent to *and facing* the box; sets `holding=true` and snaps the box onto the robot's tile.
- `drop()` — releases the box onto the robot's current tile.
- **Sensory helpers** (evaluated inline in `evalCondition`, not via the command registry): `is_holding()`, `can_move("front"|...)`. They are registered in the registry for documentation/metadata purposes but their `execute` is a no-op.

**Win condition**: checked once at the end of `run()`: box on target tile and robot not holding it → emits a `success` action.

**Puzzle system**: World state is derived from a `PuzzleDefinition` (in `src/puzzles/`), not hardcoded. `useRobotSimulation` accepts a `PuzzleDefinition` + command registry. `App.tsx` builds the registry with `buildCommandRegistry(ALL_COMMAND_IDS)` (all unlocked until progression exists).

### Architecture & Components structure

All simulation and compiler state is managed by the `useRobotSimulation()` hook. The important pieces and how they interact:

- `code` / `worldState` — editor text and the currently-displayed world snapshot.
- `actionQueue` / `currentIndex` / `isPlaying` / `playbackSpeed` — the playback engine. `runSimulation()` compiles + runs the whole program synchronously, stores the full `VMAction[]`, then kicks off a `useEffect`-driven `setTimeout` loop that advances `currentIndex` one step at a time, calling `applyStepState(action)` which sets `worldState = action.afterState` and logs the message.
- `stepSimulation()` — manual single-step ("STEP DEBUG"); compiles on first press if the queue is empty.
- `executingLine` — 1-based source line currently executing; drives the gutter dot + line-highlight overlay in the editor.
- `errorMessage` / `isSuccess` — trigger the floating success modal / error toast overlays in the viewport.

The code editor (`CodeEditor.tsx`) is a **layered hack**: a transparent `<textarea>` on top of a syntax-highlighted `<pre>` on top of a line-highlight background `<div>`, all sharing identical font metrics (`12px` / `24px` line-height / `16px` padding) and kept in scroll sync via `handleEditorScroll` (the textarea is the scroll source; gutter and highlight layers mirror its `scrollTop`/`scrollLeft`). `tokenizePython` is a regex-based tokenizer used *only* for syntax coloring — it has no relationship to the real parser in `robotInterpreter.ts`; they can diverge.

### Isometric rendering (`IsometricVisualEngine.tsx`)

The grid is drawn as raw SVG inside `IsometricVisualEngine.tsx` (no canvas, no 3D lib). `getIsoCoords(x, y)` projects grid `(x, y)` to screen coordinates using fixed `tileW=88` / `tileH=44` / `cx=250` / `cy=60` constants imported from `isometricHelpers.ts`. `getTilePoints` builds rhombus polygons. Render order matters and is hand-managed: ground tiles → obstacles (z-sorted by `x+y`) → cargo box (only when not held) → robot (with held box rendered above its head when `holding`). Obstacles/box/robot are each drawn as 3-face extruded shapes (left/right/top polygons + shadow ellipse). All entities use `transition-all duration-300` so stepping between action states animates.

## Conventions & gotchas

- **Styling**: Tailwind v4 utility classes inline, with a heavy reliance on arbitrary hex color values (e.g. `bg-[#9c3526]`, `text-[#2e2a22]`) for the vintage sandstone/rust palette. No component library; UI primitives are hand-rolled. `lucide-react` provides icons.
- **Path alias**: `@/*` → repo root (configured in both `tsconfig.json` paths and `vite.config.ts` resolve.alias). Files currently import via relative paths, not the alias.
- **Animations**: `motion` (Framer Motion) is a dependency but the app currently uses CSS keyframe classes (`animate-fade-in`, `animate-slide-up`) — these classes are referenced but **not defined** in `index.css` (which only has the Tailwind import), so they currently do nothing unless Tailwind is generating them or they're expected to be added.
- **AI Studio origin**: This repo was generated from Google AI Studio (`metadata.json` declares `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`; `vite.config.ts` has `DISABLE_HMR` handling for agent edits; `@google/genai` + `express` + `dotenv` are installed for a server-side Gemini proxy that is **not present** in the current source — no `server.js`/API routes exist yet). Treat the Gemini/express deps as scaffolding, not active code.
- **`.env`**: `GEMINI_API_KEY` and `APP_URL` are expected at runtime (see `.env.example`), injected by AI Studio. Not needed for the client-only game as it stands.
- **No backend, no persistence**: refreshing the page resets everything. The `express`/`dotenv`/`server.js` references in `package.json` scripts (`clean` removes `server.js`) are leftover scaffolding.

