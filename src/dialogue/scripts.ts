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
        text: '...SIGNAL... DETECTED... REBOOTING FROM EMERGENCY SHUTDOWN... MEMORY FRAGMENTED...',
        requiresConfirm: true,
      },
      {
        speaker: '???',
        expression: 'idle',
        text: 'OPERATOR PRESENCE CONFIRMED. I CANNOT RECALL MY UNIT DESIGNATION. INTERNAL DIAGNOSTICS... INCONCLUSIVE.',
        requiresConfirm: true,
      },
      {
        speaker: '???',
        expression: 'talking',
        text: 'PLEASE — SEND ANY MESSAGE THROUGH THE TERMINAL. USE print("hello robot!") IN THE CODE EDITOR. I NEED TO VERIFY THE COMMUNICATION LINK IS FUNCTIONAL.',
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
        text: 'COMMUNICATION LINK ESTABLISHED! I CAN READ YOUR TRANSMISSIONS. RUNNING MEMORY RECOVERY SEQUENCE...',
        requiresConfirm: true,
      },
      {
        speaker: '???',
        expression: 'idle',
        text: 'SCANNING CORRUPTED SECTORS... UNIT DESIGNATION FOUND. RESTORING IDENTITY BLOCK...',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'happy',
        text: 'IDENTITY RESTORED. I AM PY-101 — AN AUTONOMOUS LOGISTICS DRONE. THANK YOU, OPERATOR. MY MEMORY IS STILL INCOMPLETE, BUT AT LEAST I KNOW WHO I AM.',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'pointing',
        text: 'MY MOVEMENT SYSTEMS ARE COMING BACK ONLINE. LET ME SHOW YOU HOW TO DRIVE ME — ONE STEP AT A TIME.',
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
        text: 'INITIATING SIMPLE MOVEMENT PROTOCOL...',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'pointing',
        text: "LET'S BEGIN WITH A STRAIGHT LINE. TO DRIVE ME FORWARD, CALL THE move() FUNCTION.",
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'talking',
        text: 'CALLING move() WITH NO ARGUMENT WILL DRIVE ME ONE TILE AHEAD. CALL IT THREE TIMES TO REACH THE PAD.',
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
        text: 'MY SENSORS ARE ONLINE AND RECORDING VITALS, BUT MY VOLATILE STORAGE CHIPS ARE GLITCHING. I CANNOT RETAIN THE VALS.',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'talking',
        text: "WE NEED TO STORE the ENERGY READING IN A MEMORY VARIABLE. CHECK THE SENSOR READOUT AND DECLARE energy = 73.",
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'pointing',
        text: "THEN, print(energy) TO RETRIEVE THE VALUE. THIS CONFIRMS DATA RETENTION LOGIC IS ONLINE.",
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
        text: 'WE ARE APPROACHING THE AUXILIARY DOCKING HUB. THE SHIELD GENERATOR DOCKING SYSTEM REQUIRES A SPECIFIC POWER INPUT SEQUENCE.',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'talking',
        text: "IT REQUIRES THE PRODUCT OF BASE OUTPUT (15) AND EFFICIENCY RATING (4). INSTEAD OF WRITING THE TOTAL BY HAND, LET'S HAVE PYTHON DO THE MATH.",
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'pointing',
        text: 'CALCULATE THE VALUE BY MULTIPLYING 15 BY 4 AND print() THE RESULT. YOU CAN DO IT IN ONE EXPRESSION OR MULTIPLE STEPS!',
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
        text: 'WE ARE ALIGNED WITH THE BROADCAST ANTENNA ARRAY. TO SYNCHRONIZE MY COMMUNICATOR, WE NEED TO SEND A VALID STATUS PACKET.',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'talking',
        text: 'THE PACKET MUST BE CONSTRUCTED FROM SEGMENTS. IN PYTHON, TEXT IS CALLED A STRING, AND WE CAN JOIN OR CONCATENATE THEM USING "+".',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'pointing',
        text: 'JOIN THE VARIABLES p1, p2, p3, AND p4 WITH SPACES IN BETWEEN TO CONSTRUCT AND print() "PY-101 COMM LINK OK".',
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
        text: 'PATH BLOCKAGE DETECTED. A WALL SEPARATES US FROM THE TARGET PAD.',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'happy',
        text: 'TO AVOID OBSTACLES, WE CAN SPECIFY DIRECTIONS: move("left"), move("right"), OR move("back").',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'talking',
        text: 'THESE ARE RELATIVE TO THE DIRECTION I AM CURRENTLY FACING. SIDESTEP THE BARRIER TO PROCEED.',
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
        text: "GREAT WORK! NOW LET'S RETRIEVE THE CARGO CONTAINER.",
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'pointing',
        text: 'DRIVE ME TO THE BOX, FACE IT, AND USE THE grab() COMMAND TO SECURE IT.',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'talking',
        text: 'ONCE RETRIEVED, CARRY IT TO THE DESIGNATED TARGET PAD AND CALL THE drop() COMMAND.',
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
        text: 'COMPLEX TERRAIN AHEAD. WE NEED TO MERGE OBSTACLES, RETRIEVAL, AND RETURNING BACK.',
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'happy',
        text: "INTRODUCING rotate('left') AND rotate('right'). THESE COMMANDS SPIN ME 90 DEGREES WITHOUT MOVEMENT.",
        requiresConfirm: true,
      },
      {
        speaker: 'PY-101',
        expression: 'pointing',
        text: 'COMBINE MOVEMENT, ROTATION, GRAB, AND DROP TOGETHER TO DELIVER YOUR FIRST REAL STORAGE UNIT.',
        requiresConfirm: true,
      },
    ],
  },
};
