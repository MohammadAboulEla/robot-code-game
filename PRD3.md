# PRD3.md — Story Arc, Reordered Curriculum & Test-Mode-Driven Build Plan

## Relationship to previous plan files

This plan assumes `PRD.md` (foundation: command registry, puzzle loader, progression
tree, solution tracking, HUD shell) and `PRD2.md` (dialogue engine, `print()`, puzzles
`000`–`005`) are already implemented, plus the existing **Test Mode** (`TestModeView.tsx`,
reachable via `Ctrl+Shift+D` / `Ctrl+Alt+P` / `?dev=1`) and **Achievements system**
(`AchievementsPanel.tsx` + `achievements.ts`). This PRD does not re-describe that
infrastructure — it reuses it. New content is new registry entries, new puzzle data
files, new dialogue scripts, and new achievement entries, per the same additive
philosophy as `PRD.md`.

Two of your review notes changed the shape of the curriculum enough that they get their
own section before the milestones: (1) the identity mystery + a much shorter intro, and
(2) deferring every parameterized/advanced robot command until the *concept* of a
parameter has actually been taught. Re-reading `pre-PRD3.md`'s chapters against those two
notes surfaced a real sequencing problem worth flagging up front (see "Why the reorder"
below) rather than silently patching it.

Follow the same operating discipline as `AGENT_SYSTEM_PROMPT.md`: one milestone at a time,
verify Definition of Done, don't skip ahead.

---

## Why the reorder (read this before the milestone list)

Your notes ask to defer `move("left")`, `grab()`, `drop()`, and `rotate()` until the
player has "some concepts" first — specifically, until they understand what a parameter
*is*. But `pre-PRD3.md`'s Chapter 7 (functions with parameters) is where that concept gets
taught properly, and it sits deep in the archive arc, after variables, arithmetic,
strings, and lists. Deferring all four commands all the way to after Chapter 7 would
strand the player unable to do anything with the *robot itself* — no sidestep, no
rotation, no cargo — for a very long stretch of purely terminal/data puzzles. That's a
pacing risk for a game whose hook is watching a robot move on a grid.

The fix: split "understanding a parameter exists" from "building your own function with
parameters." The player already saw a parameterized call in Stage 0 —
`print("hello robot!")` *is* a function call with an argument, they just haven't been
told to notice it that way yet. So:

- A short, dedicated **bridge lesson** right after bare `move()` explicitly names what
  they already did instinctively with `print(...)` — "a command can take extra
  information inside the parentheses" — using something already familiar, not a new
  concept from scratch.
- That bridge lesson unlocks `move(direction)` **and** `rotate(direction)` together,
  since both are the same kind of command (one required directional parameter). This
  keeps grid mobility unlocked early without needing the full functions-and-definitions
  chapter yet.
- `grab()` / `drop()` get tied to the **Cargo Shelf** (lists) chapter instead — a
  stronger narrative fit than an arbitrary standalone unlock, since that chapter is
  already about managing physical cargo boxes as data.
- Chapter 7 (custom functions, multiple parameters) later **deepens** a concept the
  player already has a working intuition for, instead of introducing it cold — which is
  actually better pedagogy than teaching parameters from zero at that point.

If you disagree with any placement below, it's a one-line change to the table, not a
rewrite of this document's structure.

## Master Curriculum Order (supersedes the table in the README and the `000`–`005` order in `PRD2.md`)

Puzzle/node **id strings** below are new only where a new puzzle is introduced; existing
ids (`000-say-hello` … `005-around-the-bend`) are reused, not renamed — only their
*position/prerequisite chain* in the progression tree changes where noted, so no needless
file churn.

| # | Id | Title | Teaches | New robot command(s) unlocked | Notes |
|---|----|----|----|----|----|
| 0 | `000-say-hello` | Awakening | `print()` | — | Identity unknown (`???`) until solved; reveals name **PY-101** |
| 1 | `001-first-steps` | First Steps | sequencing | bare `move()` (defaults to front) | unchanged from `PRD2.md` |
| 2 | `006-first-memory` | First Memory | variables & data types | — | new; terminal/sensor puzzle, no grid required |
| 3 | `007-power-calculator` | Power Calculator | arithmetic | — | new |
| 4 | `008-comms-array` | Communication Array | strings & concatenation | — | new |
| 5 | `009-parameter-bridge` | Understanding Instructions | what a parameter is | `move(direction)`, `rotate(direction)` | reframes `002-around-the-wall`'s teaching moment; renumber this node ahead of the old `002` slot |
| 6 | `002-around-the-wall` | Around the Wall | applying the new parameter | — (uses commands unlocked above) | now a practice puzzle for node 5, not the teaching moment itself |
| 7 | `010-cargo-shelf` | Cargo Shelf | lists (define/access/modify/add-remove) | `grab()`, `drop()` | merges `pre-PRD3.md` Ch.4 with the old `003-pickup-and-delivery` unlock |
| 8 | `004-first-delivery` | First Delivery | composition/mastery, no new concept | — | unchanged puzzle content, now a payoff instead of an early wall |
| 9 | `005-around-the-bend` | Around the Bend | `if`/`else` | — | unchanged |
| 10 | `011-guard-patrol` | Guard Patrol | `for`, then `while` | — | pre-PRD3 Ch.6 |
| 11 | `012-subroutines` | Subroutines | `def`, calling functions, multiple parameters | — | pre-PRD3 Ch.7; explicitly reference the Stage-5 bridge lesson in dialogue |
| 12 | `013-unit-registry` | Unit Registry | dictionaries | — | pre-PRD3 Ch.8 |
| 13 | `014-unit-cloning` | Unit Cloning | classes | — | pre-PRD3 Ch.9 |
| 14 | `015-floppy-disk` | The Floppy Disk | file write/read | — | pre-PRD3 Ch.10 |
| 15 | `016-managed-failures` | Managed Failures | `try`/`except` | — | pre-PRD3 Ch.11 |
| 16 | `017-external-library` | External Library | `import` | — | pre-PRD3 Ch.12 |
| 17 | `018-rapid-processing` | Rapid Processing | list comprehensions | — | pre-PRD3 Ch.13 |
| 18 | `019-instant-automation` | Instant Automation | `lambda` + `map` | — | pre-PRD3 Ch.14 |
| 19 | `020-full-revival` | Full Revival (capstone) | review project | — | pre-PRD3 Ch.15 |

---

## Achievements — ground rule

Every milestone below states its achievement(s) explicitly, including "none needed" where
forcing one would feel arbitrary. Where an achievement rewards a *smarter-than-beginner*
solution, define the smarter path concretely (fewest instructions, using a loop instead of
repetition, using a comprehension instead of a loop, etc.) — reuse the metrics already
computed for the solution archive in `PRD.md` M4 rather than inventing new detection
logic. All entries are new rows in the existing `achievements.ts` registry — no changes to
how the achievement system itself works.

## Test Mode — ground rule

Where a milestone introduces a new visual element that doesn't exist in the game yet
(a vitals gauge, a floppy-disk slot, a cloned companion unit, a unit-registry card list),
prototype it in **Test Mode first**: add a new tab or extend an existing one in
`TestModeView.tsx` with fake/mock data so the visual can be iterated on and screenshotted
before the real puzzle, dialogue, and win-condition logic are wired up around it. This is
explicitly allowed to use throwaway/fake puzzle configs that never ship — the point is
de-risking the visual, not producing shippable content. Milestones that need this say so;
milestones that don't (pure logic/dialogue puzzles reusing existing visuals) skip it.

---

## Milestone 1 — Identity Mystery & Shortened Intro
**Status:** ✅ Done

**Steps:**
1. Update the onboarding `DialogueScript` (from `PRD2.md` M2) so the speaker name
   displays as `???` for all lines before the reveal — this is just the existing
   `speaker` string field on `DialogueLine`, no new schema needed (confirmed against
   `TestModeView.tsx`'s dialogue tester, which already treats `speaker` as free text).
2. Rewrite the opening lines to the "waking from dormancy, fragmented memory" tone
   agreed on earlier in this conversation, ending on the prompt to try `print(...)`.
3. On Puzzle 0 success, play a short second dialogue beat where the speaker name
   switches from `???` to **PY-101** mid-script — a visible "reveal" moment. A simple
   version (line N has `speaker: "???"`, line N+1 has `speaker: "PY-101"`) is enough;
   don't build new animation infrastructure for this unless it's trivial.
4. Cut the onboarding down to exactly two concepts before the story proper begins:
   `print()` (Puzzle 0) and bare `move()` (Puzzle 1) — remove any earlier dialogue that
   pre-explained later commands. Confirm Puzzle 1 still requires only bare `move()`,
   no parameters, per the existing `001-first-steps` definition.

**Achievement:** none needed — this is scene-setting, not a puzzle-skill moment.

**Definition of Done:**
- A fresh save shows `???` as the speaker through all of Puzzle 0's dialogue until the
  reveal line, which switches to `PY-101`.
- Nothing before Puzzle 1 teaches or references any command beyond `print()` and bare
  `move()`.

---

## Milestone 2 — Test Mode: Vitals & Sensor Prototyping Bench
**Status:** ✅ Done

**Why now:** Milestone 3 needs a temperature/energy sensor readout UI that doesn't exist
yet. Prototype it in Test Mode with fake values first, per the ground rule above.

**Steps:**
1. Add a new tab to `TestModeView.tsx` (alongside `dialogue`, `grid`, `tokenizer`) —
   e.g. `vitals` — with sliders/inputs for fake sensor values (energy %, temperature,
   an arbitrary "unit ID" string) and a live preview of whatever UI component will
   display them in-game (gauge, numeric readout, or whatever fits the vintage-terminal
   look — reuse existing type scale/colors, no new palette).
2. Iterate on the visual directly in this tab — this is explicitly a throwaway
   prototyping surface, so it's fine to try a few layouts before settling.
3. Once satisfied, extract the finalized display into a real, reusable component (e.g.
   `SensorReadout.tsx`) that both Test Mode and the real Milestone 3 puzzle can import —
   don't leave the final version only living inside `TestModeView.tsx`.

**Achievement:** none needed — internal tooling milestone, not player-facing.

**Definition of Done:**
- A `vitals` tab exists in Test Mode showing a working mock sensor readout with
  adjustable fake values.
- The finalized display component is extracted and importable outside Test Mode.

---

## Milestone 3 — First Memory & Power Calculator
**Status:** ☐ Not started

**Steps:**
1. Author `006-first-memory`: a puzzle using the `SensorReadout` component from
   Milestone 2 with real (not fake) values driven by the puzzle's own state; goal is
   storing a shown value in a variable and using it later in the same program (print it,
   or reference it again), per `pre-PRD3.md` Chapter 1's dialogue and framing.
2. Author `007-power-calculator`: arithmetic puzzle per Chapter 2's framing (generator
   panel, compute the exact required value). Decide whether operator precedence
   (`*` before `+`) is tested here or reserved for a later puzzle — note the decision
   in the puzzle file's comments either way.
3. Attach both puzzles' dialogue scripts per the chapter content already drafted in
   `pre-PRD3.md` (reused as-is, adapt only for `???`→`PY-101` naming already resolved
   by Milestone 1).

**Achievement:** add **"Single-Line Solver"** (or similar) for `007-power-calculator` —
awarded when the solving program computes and prints the answer in one expression rather
than storing intermediate results across multiple `print()`/variable steps. Detect this
off the existing lines-of-code metric from `PRD.md` M4 (e.g. solved in ≤2 non-comment
lines) rather than parsing the AST for "was this one expression" — simpler and reuses
existing infrastructure.

**Definition of Done:**
- Both puzzles solvable and gated correctly in the tree, appearing after `001-first-steps`
  and before the parameter bridge.
- The achievement fires correctly for a compact solution and does not fire for a verbose
  multi-step one.

---

## Milestone 4 — Communication Array
**Status:** ☐ Not started

**Steps:**
1. Author `008-comms-array` per `pre-PRD3.md` Chapter 3: fragmented message
   variables that need concatenating before "sending."
2. Reuse the terminal/console output for the "sent message" confirmation — no new
   visual component needed here, unlike Milestone 2/3.

**Achievement:** none needed, unless you want a light one for using an f-string /
formatted approach over plain `+` concatenation if the interpreter supports it by this
point — optional, note as a "maybe" rather than committing without confirming interpreter
support first.

**Definition of Done:** puzzle solvable, correctly gated after `007-power-calculator`.

---

## Milestone 5 — Parameter Bridge & Around the Wall
**Status:** ☐ Not started

**Steps:**
1. Author the bridge dialogue for `009-parameter-bridge`: explicitly point back at
   `print("hello robot!")` from Puzzle 0 as the player's first (unlabeled) use of a
   parameter, then generalize: "some commands need to be told *which way*, the same way
   I needed to be told *what* to say."
2. Unlock `move(direction)` and `rotate(direction)` together as this node's reward —
   update the command registry gating so both become available from the same tree node,
   not two separate unlocks.
3. Re-point `002-around-the-wall` to sit immediately after this node as the practice
   puzzle (its existing content/obstacle layout is reused as-is — this is a tree-position
   change, not a puzzle content change).

**Achievement:** **"No Wasted Steps"** — awarded when `002-around-the-wall` is solved at
or under its `parMetrics` instruction count (reuses the existing par-comparison logic from
`PRD.md` M4, no new detection needed).

**Definition of Done:**
- `move(direction)` and `rotate(direction)` are both usable only after
  `009-parameter-bridge` is solved, not before.
- `002-around-the-wall` still plays correctly in its new tree position.
- Achievement fires correctly against the existing par metric.

---

## Milestone 6 — Test Mode: Cargo/List Visual Prototyping (if needed)
**Status:** ☐ Not started

**Steps:**
1. Check whether the existing `IsometricVisualEngine` + `grid` tab in Test Mode already
   supports everything Milestone 7 needs (multiple cargo items as a visible "shelf,"
   not just the single box + single target it currently models). If yes, skip to
   Milestone 7 — don't build unneeded tooling.
2. If the cargo-shelf visual needs more than one box/slot rendered simultaneously
   (likely, since Chapter 4 is about a list of shelf items), extend the `grid` tab's
   fake-element tools to place multiple cargo items at once, or add a dedicated `shelf`
   tab, whichever is less invasive to the existing tester.

**Achievement:** none needed — tooling milestone.

**Definition of Done:** confirmed decision (skip or build) documented, and if built, a
working multi-item cargo visual exists in Test Mode before Milestone 7 starts.

---

## Milestone 7 — Cargo Shelf (Lists) & Cargo Operations Unlock
**Status:** ☐ Not started

**Steps:**
1. Author `010-cargo-shelf` with its four sub-lessons (define/access/modify/add-remove)
   per `pre-PRD3.md` Chapter 4, using the visual confirmed/built in Milestone 6.
2. Unlock `grab()` and `drop()` as this node's reward instead of their original
   `003-pickup-and-delivery` placement — retire `003-pickup-and-delivery` as a standalone
   node (fold its teaching moment into this one) rather than keeping a redundant node;
   note in the tree data if any existing save-data references to `003` need a migration
   fallback.

**Achievement:** **"Batch Handler"** — awarded when a later cargo-heavy puzzle (or this
one, if its final sub-lesson involves 3+ items) is solved using a loop over the list
instead of repeating manual `grab()`/`drop()` calls per item — the smarter-than-beginner
pattern this chapter is explicitly building toward. Detect via instruction-count vs.
line-count ratio (a loop solving N items in a handful of lines vs. N nearly-identical
line blocks) reusing existing metrics rather than new AST inspection.

**Definition of Done:**
- `grab()`/`drop()` unlock exactly at this node, not before.
- No dangling reference to a now-retired `003-pickup-and-delivery` node breaks existing
  save data (test against an old save if one exists from `PRD2.md` testing).
- Achievement fires on the loop-based solution and not on the manual repetition solution.

---

## Milestone 8 — First Delivery as Composition Payoff
**Status:** ☐ Not started

**Steps:**
1. Re-point `004-first-delivery` to sit after `010-cargo-shelf` in the tree (content
   unchanged — same grid, same obstacles, same objective).
2. Adjust its intro dialogue to explicitly frame it as a payoff ("everything I've
   relearned, all at once") rather than the original generic objective framing, since it
   is no longer the *first* real puzzle.

**Achievement:** keep/confirm the existing par-based achievement from `PRD.md` M6/M4 era
if one already exists for this puzzle; if none exists yet, add **"Full Circle"** for
beating par here specifically, since this is now a deliberate milestone moment.

**Definition of Done:** puzzle plays identically to before at the new tree position; new
framing dialogue plays on load.

---

## Milestone 9 — Around the Bend (if/else)
**Status:** ☐ Not started

**Steps:** confirm this node (already implemented per `PRD2.md`) needs no content
changes beyond its tree position now sitting after `004-first-delivery` — verify only,
don't rewrite working content without reason.

**Achievement:** none needed (already whatever was decided during original
implementation, if anything).

**Definition of Done:** tree position confirmed correct; no regressions.

---

## Milestone 10 — Guard Patrol (for / while)
**Status:** ☐ Not started

**Steps:** author `011-guard-patrol` per `pre-PRD3.md` Chapter 6 — the two sub-lessons
(`for` with a visible lap counter, `while` with a visible energy gauge reaching zero).
This can reuse the `SensorReadout`-style component from Milestone 2/3 for the energy
gauge — check before building a new visual.

**Achievement:** **"Efficient Patrol"** — beat `parMetrics` instructions on the `while`
sub-lesson specifically, since an inefficient `while` condition (e.g. checking the wrong
thing, or an unnecessarily long loop body) is the natural beginner mistake this lesson
exists to correct.

**Definition of Done:** both sub-lessons solvable and correctly gated; achievement fires
on par-beating solutions only.

---

## Milestone 11 — Subroutines (functions & parameters, deepened)
**Status:** ☐ Not started

**Steps:**
1. Author `012-subroutines` per Chapter 7, but adjust the opening dialogue to explicitly
   reference the Stage-5 parameter bridge ("you already learned commands can take
   details — now you'll learn to write your own that do") instead of re-teaching the
   concept from zero.
2. Cover: `def`, calling a function, and a function with multiple parameters, per the
   chapter's existing content.

**Achievement:** **"Reusable Routine"** — awarded when a solution defines and calls a
function at least twice with different arguments in the same program (rewards actually
using reusability, not just satisfying the puzzle's minimum requirement once).

**Definition of Done:** puzzle solvable; achievement fires only on genuine reuse (2+
calls with varying arguments), not a single definition-and-call.

---

## Milestone 12 — Unit Registry (dictionaries)
**Status:** ☐ Not started

**Steps:** author `013-unit-registry` per Chapter 8's directory/phonebook-style UI concept.
Check Milestone 2's `SensorReadout`/card-style component for reuse before building a new
card layout for unit entries.

**Achievement:** none needed unless a clear smarter-path exists (e.g., checking key
existence before access to avoid a crash) — optional, decide during authoring.

**Definition of Done:** puzzle solvable, correctly gated after `012-subroutines`.

---

## Milestone 13 — Test Mode: Companion Unit Visual Prototyping
**Status:** ☐ Not started

**Why now:** Milestone 14 (classes) climaxes in a new robot unit visually appearing on
the grid — this needs prototyping before the real puzzle, since it's a brand-new sprite
composition on the isometric engine, not a reskin of existing elements.

**Steps:**
1. Add a `companion` (or similar) test in Test Mode: fake inputs for a second unit's
   name/type/position, rendered via `IsometricVisualEngine` alongside the primary robot,
   confirming z-sorting, scale, and visual distinction (e.g. a color/size variant) work
   before real class-instantiation logic exists.
2. Iterate until the "second unit appears" moment looks and reads clearly, then hand off
   to Milestone 14.

**Achievement:** none needed — tooling milestone.

**Definition of Done:** a convincingly-rendered second unit appears in Test Mode's grid
tab from fake inputs, sharing the existing isometric engine and visual language.

---

## Milestone 14 — Unit Cloning (classes)
**Status:** ☐ Not started

**Steps:** author `014-unit-cloning` per Chapter 9, using the companion visual confirmed
in Milestone 13 for the "new unit appears" payoff moment on `class`/object instantiation.

**Achievement:** **"First Sibling"** (or similar) — one-time achievement tied to this
specific story beat rather than a generic optimization metric, since the moment itself
(not efficiency) is the point of this milestone.

**Definition of Done:** puzzle solvable; the companion unit renders correctly using the
Milestone 13 prototype; achievement fires on first successful class instantiation.

---

## Milestone 15 — Test Mode: Floppy Disk & Persistent Storage Prototyping
**Status:** ☐ Not started

**Steps:** add a fake "read/write" toggle + mock disk-light indicator (green/red) to Test
Mode before building `015-floppy-disk`, since this is a new physical prop + new
read/write-state visual feedback not present anywhere else in the game yet.

**Achievement:** none needed — tooling milestone.

**Definition of Done:** a convincing mock disk prop with working read/write light-state
toggle exists in Test Mode.

---

## Milestone 16 — The Floppy Disk (file I/O)
**Status:** ☐ Not started

**Steps:** author `015-floppy-disk` per Chapter 10, reusing the Milestone 15 prop. Note:
"file write/read" here should be sandboxed to an in-memory/simulated filesystem the
puzzle controls (not real browser disk access) — confirm this against how the existing
VM sandbox already works before assuming real file APIs are involved.

**Achievement:** **"Nothing Forgotten"** — awarded for successfully reading back exactly
what was written earlier in the same solution (rewards correctly pairing write/read,
which is the actual skill being tested, not just calling both functions).

**Definition of Done:** puzzle solvable using the simulated file API; prop/light feedback
matches Milestone 15's prototype; achievement fires only on a correct write→read pairing.

---

## Milestone 17 — Managed Failures (try/except) → Full Revival Capstone
**Status:** ☐ Not started

**Steps:**
1. Author `016-managed-failures` (Chapter 11), `017-external-library` (Chapter 12),
   `018-rapid-processing` (Chapter 13), and `019-instant-automation` (Chapter 14) as four
   puzzles in sequence per their existing chapter content — none of these need new visual
   prototyping (they reuse terminal output, existing grid, and existing cargo-list
   visuals), so no Test Mode milestone precedes this one.
2. Author `020-full-revival`, the multi-stage capstone per Chapter 15, combining
   variables, lists/dicts, loops/conditionals, functions, a class instantiation, file
   I/O, and error handling into one extended puzzle, per the chapter's "network
   reactivation" framing.

**Achievements:**
- **"Graceful Recovery"** on `016-managed-failures` — solution catches a specific
  exception type rather than a bare `except:` (rewards precision over "catch everything"
  beginner habit).
- **"Modular Thinker"** on `017-external-library` — uses `from module import name`
  rather than importing the whole module for a single function (a real, checkable
  smarter-than-beginner pattern).
- **"One-Liner"** on `018-rapid-processing` — solves using a comprehension instead of an
  equivalent `for` loop (compare against the puzzle's own `parMetrics`, tuned so the loop
  solution exceeds it and the comprehension solution meets it).
- **"Network Reactivated"** — one-time capstone completion achievement on
  `020-full-revival`, separate from any of the per-stage optimization achievements.

**Definition of Done:** all five puzzles solvable in sequence, correctly gated; each
listed achievement fires on its specific pattern and not on a merely-passing solution
that doesn't demonstrate it.

---

## Milestone Dependency Summary

```
PRD.md + PRD2.md (existing foundation, dialogue engine, achievements, test mode)
  └─ M1  identity mystery + shortened intro
       └─ M2  test-mode vitals prototyping
            └─ M3  first memory + power calculator
                 └─ M4  communication array
                      └─ M5  parameter bridge + around the wall
                           └─ M6  test-mode cargo/list prototyping (if needed)
                                └─ M7  cargo shelf + grab/drop unlock
                                     └─ M8  first delivery (payoff, repositioned)
                                          └─ M9  around the bend (verify only)
                                               └─ M10 guard patrol (for/while)
                                                    └─ M11 subroutines (functions)
                                                         └─ M12 unit registry (dicts)
                                                              └─ M13 test-mode companion prototyping
                                                                   └─ M14 unit cloning (classes)
                                                                        └─ M15 test-mode floppy disk prototyping
                                                                             └─ M16 floppy disk (file I/O)
                                                                                  └─ M17 errors → import → comprehensions → lambda → capstone
```

Strictly linear on purpose — this is a single guided curriculum, not a branching tree, so
parallelizing milestones across sessions is not recommended here the way it was for parts
of `PRD.md`.