# Robot Code Game — PRD 2: Story, Character Dialogue & Beginner Curriculum

## Relationship to PRD.md

This is a second, independent plan file — not a replacement for `PRD.md`. It assumes the
foundation from `PRD.md` already exists and reuses it rather than duplicating it:

- **Command Registry** (M0 in `PRD.md`) — new commands introduced here (`print`) are new
  registry entries, not special-cased VM logic.
- **PuzzleDefinition + puzzle loader** (M0/M1) — new beginner puzzles here are new data
  files, same schema, same loader.
- **Progression / research tree** (M2) — dialogue-driven unlocks here plug into the
  existing tree/node system; this PRD does not invent a second progression mechanism.
- **Solution tracking, HUD shell, tabbed inspector** (M4, M8, M9) — untouched by this PRD
  except where a milestone below explicitly says otherwise.

Follow the same operating rules as `AGENT_SYSTEM_PROMPT.md`: one milestone at a time, in
order, verify Definition of Done before checking it off, don't skip ahead.

## Premise

The game gets a light narrative frame: the player is an operator who makes a deal with an
autonomous AI unit (the robot). The robot is assigned delivery/logistics tasks by "command"
and needs the player to write the Python that carries them out — so the robot teaches the
player Python, one command at a time, through in-fiction dialogue rather than dry tutorial
text. The existing "PROTOCOL OBJECTIVE" framing stays as the *task brief*; the new dialogue
system is the *teacher*, sitting on top of it.

## Curriculum redesign (first five puzzles, replacing the current single hard first puzzle)

The current puzzle #1 ("drive to (1,3), grab, navigate obstacles, drop at (3,1)") is too
much for a true first puzzle — it silently assumes the player already knows loops, relative
movement, and the full command set. Replace the front of the curriculum with:

1. **Puzzle 0 — "Say hello"**: the only valid program is `print("hello robot!")` (or any
   `print(...)` call — decide exact matching rule in Milestone 2). Success triggers the
   robot's first appearance and opening dialogue. No grid objective yet.
2. **Puzzle 1 — "First steps"**: teach `move()` with no argument behaving as forward/front.
   Goal is reachable only by calling it exactly 3 times (or "at least 3", decide in M3) in a
   straight line, no obstacles, no rotation needed.
3. **Puzzle 2 — "Around the wall"**: introduce `move("left"/"right"/"back")` as a
   parameter. One obstacle forces a sidestep-then-forward path. This is the first puzzle
   requiring an argument at all.
4. **Puzzle 3 — "Pickup and delivery"**: introduce `grab()` and `drop()` in a simple
   layout (no obstacle combination yet — isolate the new commands).
5. **Puzzle 4 — current puzzle #1** ("First delivery") becomes the first *composition*
   puzzle: combine movement, rotation, obstacles, grab, and drop together, as the payoff
   for everything taught in 0–3.

Existing puzzles from `PRD.md`'s later milestones shift down to make room; renumber
`PuzzleDefinition.id`s accordingly in Milestone 3 below.

---

## Milestone 1 — Dialogue Engine & Character Popup
**Status:** ☑ Completed

**Steps:**
1. Slice `assets/sprite.webp` into named expression frames (e.g. `idle`, `happy`,
   `talking`, `thinking`, `confused`, `annoyed`, `crossed-arms`, `pointing`, `angry` — match
   whatever the sheet actually contains) and store as individual image assets or a CSS
   sprite-sheet with coordinate map; add a `RobotExpression` type enumerating them.
2. Build a `DialoguePopup` component matching the "[NEW TRANSMISSION]" style already
   mocked in your reference image: character portrait + name/unit tag on the left,
   message text + confirm button on the right, modal-over-dimmed-background presentation.
   Reuse existing color palette/typography — no new visual language.
3. Define a `DialogueScript` data schema: ordered list of `{ speaker, expression, text,
   requiresConfirm }` lines, keyed by a trigger id. Scripts are data files (mirrors the
   `PuzzleDefinition` pattern) — no dialogue content hardcoded into components.
4. Build a trigger system: dialogue scripts can fire on `puzzleLoad`, `puzzleSolved`,
   `commandFirstUsed(commandId)`, or a manual `sendDialogue(scriptId)` call. Keep this
   generic — future dialogue (hints, failures, easter eggs) reuses the same trigger hooks.
5. Sequencing: multiple dialogue lines within one script play one at a time, each
   requiring the confirm button (or auto-advance after a delay — decide and note the
   choice), before the popup closes and gameplay resumes.

**Definition of Done:**
- A test dialogue script with 2–3 lines and at least two different expressions plays
  correctly end-to-end from a manual trigger call.
- The popup visually matches the existing UI language (same palette, borders, type scale).
- No dialogue content or trigger logic is hardcoded outside the data files.

---

## Milestone 2 — `print()` Command & Puzzle 0 ("Say hello")
**Status:** ☑ Completed

**Steps:**
1. Add `print` as a new `CommandDefinition` in the registry (per `PRD.md`'s M0 pattern):
   takes one string/expression argument, writes to the existing Console Output Terminal,
   does not affect `VMState` (no movement/grid side effects) — it's the first command
   that's purely observational.
2. Decide and implement match rules for Puzzle 0's success condition: exact string match
   on `"hello robot!"`, or any non-empty `print(...)` call — pick one, document the choice
   in the puzzle's own definition/comments, since this is the very first thing a brand-new
   player types and should not feel unfairly strict.
3. Author `PuzzleDefinition` for Puzzle 0: minimal/no grid focus, starter code empty or a
   commented hint, `allowedCommandIds: ["print"]` only.
4. Wire Puzzle 0's success to fire the onboarding `DialogueScript` from Milestone 1: the
   robot's first appearance, its self-introduction as an AI unit assigned tasks, and the
   "deal" premise with the player.
5. Confirm this integrates with the existing progression tree (M2 in `PRD.md`) as the
   tree's actual root node, replacing whatever currently sits first.

**Definition of Done:**
- A fresh save starts on Puzzle 0 with only `print` available.
- Solving it (per the chosen match rule) triggers the robot's onboarding dialogue and then
  unlocks Puzzle 1.

---

## Milestone 3 — Beginner Puzzle Track (Puzzles 1–4) & Renumbering
**Status:** ☑ Completed

**Steps:**
1. Author Puzzle 1 ("First steps"): straight-line goal reachable by 3+ calls to bare
   `move()`. Confirm `allowedCommandIds` excludes `rotate`/`grab`/`drop`/parameterized
   move so the player can't accidentally skip ahead.
2. Author Puzzle 2 ("Around the wall"): single obstacle, requires exactly one
   `move("left")` or `move("right")` call plus forward moves. Unlock `move` with direction
   arguments as this puzzle's associated tree node.
3. Author Puzzle 3 ("Pickup and delivery"): isolate `grab()`/`drop()` with no obstacle
   combination — the goal is understanding the two commands, not navigation difficulty.
4. Re-point the existing "First delivery" puzzle to be Puzzle 4, and update any
   `PuzzleDefinition.id` references, save-data puzzle ordering, and progression tree node
   order accordingly so existing solved-state logic and solution archives (M4 in
   `PRD.md`) still resolve to the correct puzzle.
5. Attach a short dialogue trigger (via Milestone 1's system) at the start of Puzzles 1–3
   introducing that puzzle's new concept in the robot's voice, consistent with Puzzle 0's
   onboarding tone — this is the "robot teaches Python" mechanic in practice.

**Definition of Done:**
- Fresh save progresses: Puzzle 0 → dialogue → Puzzle 1 → Puzzle 2 (new command unlocked
  mid-flow via dialogue) → Puzzle 3 → Puzzle 4 (the original first puzzle), each gated
  correctly by the command registry.
- No regressions to existing solution-tracking/archive data for the puzzle now at
  position 4.

---

## Milestone 4 — Tree as Knowledge Recap
**Status:** ☑ Completed

**Steps:**
1. Extend each progression tree node (from `PRD.md` M2) with a `recapText` or
   `recapDialogueRef` field — a short summary of what the robot taught at that node,
   sourced from (or paraphrasing) the actual dialogue lines from Milestones 1–3.
2. Update the tree UI so selecting an unlocked node shows this recap alongside the
   command doc already shown there — framed as "what the robot told you," not just an API
   reference.
3. Keep this purely additive to the existing tree screen — no new navigation pattern.

**Definition of Done:**
- Revisiting any unlocked tree node shows both the command's technical doc (existing) and
  a short in-character recap of the lesson (new), without needing to re-trigger the
  original dialogue popup.

---

## Milestone 5 — Expression Mapping & Game-Event Juice
**Status:** ☑ Completed

**Steps:**
1. Map remaining sprite expressions to concrete game events beyond onboarding dialogue:
   e.g. success → happy/thumbs-up-equivalent, `InfiniteLoopError`/crash → confused or
   annoyed, idle/waiting-for-input → idle frame, wrong-answer-but-not-crash → thinking.
2. Add a small persistent "robot avatar" indicator (not a full popup) reflecting current
   expression during normal play, so the character feels present even when not actively
   talking — small addition, must not compete with the HUD/viewport work from `PRD.md`
   M9 (no new always-visible panel; a compact avatar in the existing HUD strip is enough).
3. Keep full dialogue popups reserved for actual teaching moments (Milestones 1–4) —
   don't overuse the modal interrupt for routine success/fail feedback; that's what the
   ambient expression indicator is for.

**Definition of Done:**
- At least 4 distinct game events map to distinct expressions.
- The ambient avatar updates without ever blocking gameplay with a modal, reserving modals
  for genuine dialogue content only.

---

## Milestone Dependency Summary

```
PRD.md (M0–M4, M6, M8, M9 already done)
  └─ PRD2 M1 (dialogue engine)
       └─ PRD2 M2 (print + puzzle 0)
            └─ PRD2 M3 (puzzles 1-4 + renumbering)
                 ├─ PRD2 M4 (tree recap)
                 └─ PRD2 M5 (expression/event mapping)
```

Note: `PRD.md`'s M5 (puzzle editor) and M7 (content scale) remain skipped/deferred; once
this curriculum redesign lands, M5's puzzle editor becomes considerably more valuable
since new puzzles will also need attached dialogue — worth revisiting after PRD2 is done.