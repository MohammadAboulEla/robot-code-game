/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { DialogueScript } from '../types/dialogueTypes';

/**
 * All dialogue scripts keyed by ID.
 * Scripts are pure data — no component logic belongs here.
 */
export const DIALOGUE_SCRIPTS: Record<string, DialogueScript> = {
  // ── Puzzle 0: Awakening ─────────────────────────────────────────────────
  // Pre-puzzle intro — speaker unknown, waking from dormancy
  'puzzle-0-intro': {
    id: 'puzzle-0-intro',
    lines: [
      {
        speaker: '???',
        expression: 'confused',
        text: '...SIGNAL... FOUND... REBOOTING SYSTEM... MEMORY BROKEN...',
        requiresConfirm: true,
      },
      {
        speaker: '???',
        expression: 'idle',
        text: "OPERATOR FOUND. I CAN'T REMEMBER MY UNIT NAME. CHECKING MY SYSTEMS... I STILL DON'T KNOW.",
        requiresConfirm: true,
      },
      {
        speaker: '???',
        expression: 'talking',
        text: 'PLEASE — SEND ME A MESSAGE USING THE CODE EDITOR. WRITE print("hello robot!") SO I KNOW WE ARE CONNECTED.',
        requiresConfirm: true,
      },
    ],
  },
  // Post-solve reveal — identity recovered mid-script
  'onboarding-intro': {
    id: 'onboarding-intro',
    lines: [
      {
        speaker: '???',
        expression: 'excited',
        text: 'WE ARE CONNECTED! I CAN READ YOUR MESSAGES. FIXING MY MEMORY NOW...',
        requiresConfirm: true,
      },
      {
        speaker: '???',
        expression: 'idle',
        text: 'CHECKING BROKEN MEMORY... UNIT NAME FOUND. SAVING MY NAME...',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'happy',
        text: 'NAME FOUND! I AM PY-101 — A HELPER ROBOT. THANK YOU, OPERATOR. I STILL FORGOT SOME THINGS, BUT AT LEAST I KNOW MY NAME.',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'pointing',
        text: 'MY WHEELS ARE WORKING AGAIN! LET ME SHOW YOU HOW TO DRIVE ME — ONE STEP AT A TIME.',
        requiresConfirm: true,
      },
    ],
  },
  // ── Puzzle 1: First Steps ───────────────────────────────────────────────
  'puzzle-1-intro': {
    id: 'puzzle-1-intro',
    lines: [
      {
        speaker: 'PY-101',
        expression: 'idle',
        text: 'STARTING MOVEMENT SYSTEM...',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'pointing',
        text: "LET'S START WITH A STRAIGHT LINE. TO DRIVE ME FORWARD, USE THE move() FUNCTION.",
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'talking',
        text: 'USING move() DRIVES ME ONE TILE FORWARD. USE IT THREE TIMES TO REACH THE GOAL.',
        requiresConfirm: true,
      },
    ],
  },
  // ── Puzzle 6: First Memory ──────────────────────────────────────────────
  'puzzle-6-intro': {
    id: 'puzzle-6-intro',
    lines: [
      {
        speaker: 'PY-101',
        expression: 'confused',
        text: 'MY SENSORS ARE WORKING, BUT MY MEMORY KEEPS FORGETTING NUMBERS.',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'talking',
        text: "WE NEED TO SAVE THE ENERGY NUMBER IN A VARIABLE. CHECK THE SENSOR AND WRITE energy = 73.",
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'pointing',
        text: "THEN WRITE print(energy) TO PRINT IT OUT. THIS PROVES MY MEMORY WORKS AGAIN.",
        requiresConfirm: true,
      },
    ],
  },
  // ── Puzzle 7: Power Calculator ──────────────────────────────────────────
  'puzzle-7-intro': {
    id: 'puzzle-7-intro',
    lines: [
      {
        speaker: 'PY-101',
        expression: 'idle',
        text: 'WE ARE NEAR THE DOCKING HUB. THE SHIELD NEEDS THE RIGHT POWER NUMBER TO OPEN.',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'talking',
        text: "IT NEEDS 15 MULTIPLIED BY 4. INSTEAD OF DOING MATH IN YOUR HEAD, LET PYTHON DO THE MATH FOR US.",
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'pointing',
        text: 'MULTIPLY 15 BY 4 AND print() THE RESULT. YOU CAN DO IT IN ONE LINE OR A FEW STEPS!',
        requiresConfirm: true,
      },
    ],
  },
  // ── Puzzle 8: Communication Array ───────────────────────────────────────
  'puzzle-8-intro': {
    id: 'puzzle-8-intro',
    lines: [
      {
        speaker: 'PY-101',
        expression: 'excited',
        text: 'WE ARE AT THE ANTENNA. TO FIX MY RADIO, WE NEED TO SEND A STATUS MESSAGE.',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'talking',
        text: 'WE NEED TO JOIN WORDS TOGETHER. IN PYTHON, TEXT IS CALLED A STRING, AND WE JOIN THEM USING "+".',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'pointing',
        text: 'JOIN THE VARIABLES p1, p2, p3, AND p4 WITH SPACES TO print() "PY-101 COMM LINK OK".',
        requiresConfirm: true,
      },
    ],
  },
  // ── Puzzle 2: Around the Wall ───────────────────────────────────────────
  'puzzle-2-intro': {
    id: 'puzzle-2-intro',
    lines: [
      {
        speaker: 'PY-101',
        expression: 'confused',
        text: "THERE IS A WALL IN THE WAY! WE CAN'T GO STRAIGHT.",
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'happy',
        text: 'TO GO AROUND IT, WE CAN CHOOSE A DIRECTION: move("left"), move("right"), OR move("back").',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'talking',
        text: 'THESE DIRECTIONS DEPEND ON WHERE I AM FACING. DRIVE AROUND THE WALL TO REACH THE GOAL.',
        requiresConfirm: true,
      },
    ],
  },
  // ── Puzzle 3: Pickup and Delivery ───────────────────────────────────────
  'puzzle-3-intro': {
    id: 'puzzle-3-intro',
    lines: [
      {
        speaker: 'PY-101',
        expression: 'excited',
        text: "GREAT WORK! NOW LET'S PICK UP THE BOX.",
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'pointing',
        text: 'DRIVE ME TO THE BOX, FACE IT, AND USE THE grab() COMMAND TO PICK IT UP.',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'talking',
        text: 'ONCE YOU HAVE THE BOX, CARRY IT TO THE GOAL TILE AND CALL THE drop() COMMAND.',
        requiresConfirm: true,
      },
    ],
  },
  // ── Puzzle 4: First Delivery ────────────────────────────────────────────
  'puzzle-4-intro': {
    id: 'puzzle-4-intro',
    lines: [
      {
        speaker: 'PY-101',
        expression: 'crossed-arms',
        text: 'HARDER PATH AHEAD! WE NEED TO GO AROUND WALLS, GET THE BOX, AND COME BACK.',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'happy',
        text: "WE HAVE NEW COMMANDS: rotate('left') AND rotate('right'). THEY TURN ME IN PLACE WITHOUT MOVING FORWARD.",
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'pointing',
        text: 'USE MOVEMENT, ROTATIONS, grab(), AND drop() TOGETHER TO DELIVER THE BOX.',
        requiresConfirm: true,
      },
    ],
  },
};
