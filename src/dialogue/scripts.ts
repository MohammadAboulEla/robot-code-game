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
  'onboarding-intro': {
    id: 'onboarding-intro',
    lines: [
      {
        speaker: 'SYSTEM DROID UNIT-R07',
        expression: 'idle',
        text: 'INCOMING SIGNAL CONFIRMED. ESTABLISHING SECURE OPERATOR CHANNEL...',
        requiresConfirm: true,
      },
      {
        speaker: 'SYSTEM DROID UNIT-R07',
        expression: 'happy',
        text: 'UNIT R-07 ONLINE. I AM AN AUTONOMOUS LOGISTICS DRONE ASSIGNED TO THIS SECTOR. I NEED AN OPERATOR — SOMEONE TO WRITE MY MOVEMENT PROTOCOLS IN PYTHON.',
        requiresConfirm: true,
      },
      {
        speaker: 'SYSTEM DROID UNIT-R07',
        expression: 'talking',
        text: "HERE'S THE DEAL: I HANDLE THE HARDWARE, YOU WRITE THE CODE. TOGETHER WE DELIVER CARGO ACROSS INCREASINGLY COMPLEX TERRAIN.",
        requiresConfirm: true,
      },
      {
        speaker: 'SYSTEM DROID UNIT-R07',
        expression: 'pointing',
        text: "YOUR FIRST REAL MISSION IS READY. I'LL TEACH YOU THE COMMANDS AS WE GO. LET'S GET TO WORK, OPERATOR.",
        requiresConfirm: true,
      },
    ],
  },
  'puzzle-1-intro': {
    id: 'puzzle-1-intro',
    lines: [
      {
        speaker: 'SYSTEM DROID UNIT-R07',
        expression: 'idle',
        text: 'INITIATING SIMPLE MOVEMENT PROTOCOL...',
        requiresConfirm: true,
      },
      {
        speaker: 'SYSTEM DROID UNIT-R07',
        expression: 'pointing',
        text: "LET'S BEGIN WITH A STRAIGHT LINE. TO DRIVE ME FORWARD, CALL THE move() FUNCTION.",
        requiresConfirm: true,
      },
      {
        speaker: 'SYSTEM DROID UNIT-R07',
        expression: 'talking',
        text: 'CALLING move() WITH NO ARGUMENT WILL DRIVE ME ONE TILE AHEAD. CALL IT THREE TIMES TO REACH THE PAD.',
        requiresConfirm: true,
      },
    ],
  },
  'puzzle-2-intro': {
    id: 'puzzle-2-intro',
    lines: [
      {
        speaker: 'SYSTEM DROID UNIT-R07',
        expression: 'confused',
        text: 'PATH BLOCKAGE DETECTED. A WALL SEPARATES US FROM THE TARGET PAD.',
        requiresConfirm: true,
      },
      {
        speaker: 'SYSTEM DROID UNIT-R07',
        expression: 'happy',
        text: 'TO AVOID OBSTACLES, WE CAN SPECIFY DIRECTIONS: move("left"), move("right"), OR move("back").',
        requiresConfirm: true,
      },
      {
        speaker: 'SYSTEM DROID UNIT-R07',
        expression: 'talking',
        text: 'THESE ARE RELATIVE TO THE DIRECTION I AM CURRENTLY FACING. SIDESTEP THE BARRIER TO PROCEED.',
        requiresConfirm: true,
      },
    ],
  },
  'puzzle-3-intro': {
    id: 'puzzle-3-intro',
    lines: [
      {
        speaker: 'SYSTEM DROID UNIT-R07',
        expression: 'excited',
        text: "GREAT WORK! NOW LET'S RETRIEVE THE CARGO CONTAINER.",
        requiresConfirm: true,
      },
      {
        speaker: 'SYSTEM DROID UNIT-R07',
        expression: 'pointing',
        text: 'DRIVE ME TO THE BOX, FACE IT, AND USE THE grab() COMMAND TO SECURE IT.',
        requiresConfirm: true,
      },
      {
        speaker: 'SYSTEM DROID UNIT-R07',
        expression: 'talking',
        text: 'ONCE RETRIEVED, CARRY IT TO THE DESIGNATED TARGET PAD AND CALL THE drop() COMMAND.',
        requiresConfirm: true,
      },
    ],
  },
  'puzzle-4-intro': {
    id: 'puzzle-4-intro',
    lines: [
      {
        speaker: 'SYSTEM DROID UNIT-R07',
        expression: 'crossed-arms',
        text: 'COMPLEX TERRAIN AHEAD. WE NEED TO MERGE OBSTACLES, RETRIEVAL, AND RETURNING BACK.',
        requiresConfirm: true,
      },
      {
        speaker: 'SYSTEM DROID UNIT-R07',
        expression: 'happy',
        text: "INTRODUCING rotate('left') AND rotate('right'). THESE COMMANDS SPIN ME 90 DEGREES WITHOUT MOVEMENT.",
        requiresConfirm: true,
      },
      {
        speaker: 'SYSTEM DROID UNIT-R07',
        expression: 'pointing',
        text: 'COMBINE MOVEMENT, ROTATION, GRAB, AND DROP TOGETHER TO DELIVER YOUR FIRST REAL STORAGE UNIT.',
        requiresConfirm: true,
      },
    ],
  },
};
