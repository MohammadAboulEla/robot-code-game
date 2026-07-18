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

The app is a single-page isometric "Robot Code Game": the user writes a Python-like script in an in-browser editor, which is parsed and executed against a fixed game world, then the resulting action queue is played back step-by-step on an isometric SVG grid.

There are only four source files and no routing/state library:

- `src/main.tsx` — mounts `<App />` in `StrictMode`. Nothing else.
- `src/App.tsx` — main App container integrating modular sub-components.
- `src/robotInterpreter.ts` — the parser + virtual machine. The core of the project.
- `src/index.css` — single `@import "tailwindcss";` (Tailwind v4 via `@tailwindcss/vite`, no config file, no `tailwind.config.*`).
- `src/types/gameTypes.ts` — shared TypeScript types (e.g., `PythonToken`).
- `src/constants/gameConstants.ts` — static configurations (`INITIAL_WORLD_STATE`, `DEFAULT_PYTHON_CODE`).
- `src/utils/` — helper functions for parsing/rendering:
  - `pythonTokenizer.ts` — regex-based syntax tokenizer.
  - `isometricHelpers.ts` — isometric projection coordinate calculations (`getIsoCoords`, `getTilePoints`).
- `src/hooks/useRobotSimulation.ts` — custom React hook encapsulating simulator compilation, action queues, execution states, timers, and outcome alerts.
- `src/components/` — presentational & interactive sub-components:
  - `Header.tsx`, `Ticker.tsx`, `Footer.tsx` — page scaffolding.
  - `CodeEditor.tsx` — editor text area, gutter numbers, and syntax highlighting overlay.
  - `ControlPanel.tsx` — action controllers (Run, Step Debug, Reset) and playback speed.
  - `ConsoleTerminal.tsx` — terminal logging output panel.
  - `SystemManual.tsx` — manual instructions and command APIs tabs.
  - `OrientationCompass.tsx` — direction compass indicator.
  - `IsometricVisualEngine.tsx` — SVG grid canvas, z-sorted rendering, and floating overlay alerts.

### The interpreter pipeline (`robotInterpreter.ts`)

This is the heart of the app and the most non-obvious part. The flow is:

1. **`parsePython(code)`** — hand-written tokenizer-free parser. It splits code into lines, strips `#` comments, measures indentation by raw leading whitespace, then recursively builds a `Statement[]` AST via `parseBlocks`. Supported statements: `for i in range(N):`, `while <cond>:`, `if <cond>:` / `else:`, assignments (`name = expr`), bare command calls, and `pass`. Indentation is structural — mismatched indents throw `Syntax Error` with the offending 1-based line number. Line numbers are preserved on each AST node (`stmt.line`) so the UI can highlight the executing source line.
2. **`new PythonExecutor(initialState)`** — constructs a VM over a *cloned* copy of the world state (`cloneState`). It never mutates the original.
3. **`executor.run(ast)`** — walks the AST, mutating `this.state` and pushing one `VMAction` per executed statement. Each `VMAction` carries `beforeState` + `afterState` snapshots (deep-cloned), the source `line`, a `success` boolean, and a human-readable `message`. Crucially, execution is **fully synchronous and upfront**: the entire program runs to completion (or error) before any UI playback begins. There is no async, no generators, no pausing mid-execution.
4. The returned `VMAction[]` is the **action queue** that `useRobotSimulation.ts` replays via `setTimeout` at `playbackSpeed` ms/step.

**Safety limits** (hardcoded, not configurable):
- Total instructions: `maxInstructions = 1000` → `InfiniteLoopError`.
- `while` loops: `200` iterations per loop → `InfiniteLoopError`.
- These throw, which `run()` catches and converts into a final `error` action rather than re-throwing.

**Robot API** (the only callable "commands", enforced in `executeCommand`):
- `move("front"|"back"|"left"|"right")` — directions are **relative to the robot's current heading**, not absolute grid directions. `getAbsoluteDirection` maps relative → absolute (`up`/`down`/`left`/`right`). Move fails hard (throws `CollisionError` / `BoundaryError`) on obstacles or grid edges — these are terminal.
- `rotate("left"|"right")` — 90° turn; updates `robot.facing`.
- `grab()` — must be adjacent to *and facing* the box; sets `holding=true` and snaps the box onto the robot's tile.
- `drop()` — releases the box onto the robot's current tile.
- **Sensory helpers** (usable in `if`/`while` conditions via `evalCondition`): `is_holding()`, `can_move("front"|...)`. Conditions also support `not`, `==`, and `True`/`False` literals. The condition evaluator is a small ad-hoc string matcher, not a real expression parser — only the specific forms in `evalCondition` are recognized; anything else throws `RuntimeError`.

**Win condition**: checked once at the end of `run()`: box on target tile and robot not holding it → emits a `success` action. Otherwise emits a `pass` action with a "not on target" / "still holding" message. The world state is **fixed** (`INITIAL_WORLD_STATE` in `src/constants/gameConstants.ts`, 5×5 grid with three obstacles in a wall at X=2); there is no level system and the world cannot be edited from the UI.

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

