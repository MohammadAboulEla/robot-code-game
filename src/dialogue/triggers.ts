/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { DialogueTriggerDef } from '../types/dialogueTypes';

/**
 * Trigger registry: maps game events to dialogue scripts.
 * Order matters — first matching trigger wins for a given event.
 */
export const DIALOGUE_TRIGGERS: DialogueTriggerDef[] = [
  {
    trigger: 'puzzleLoad',
    scriptId: 'puzzle-0-intro',
    puzzleId: '000-say-hello',
  },
  {
    trigger: 'puzzleSolved',
    scriptId: 'onboarding-intro',
    puzzleId: '000-say-hello',
  },
  {
    trigger: 'puzzleLoad',
    scriptId: 'puzzle-1-intro',
    puzzleId: '001-first-steps',
  },
  {
    trigger: 'puzzleLoad',
    scriptId: 'puzzle-6-intro',
    puzzleId: '006-first-memory',
  },
  {
    trigger: 'puzzleLoad',
    scriptId: 'puzzle-7-intro',
    puzzleId: '007-power-calculator',
  },
  {
    trigger: 'puzzleLoad',
    scriptId: 'puzzle-8-intro',
    puzzleId: '008-comms-array',
  },
  {
    trigger: 'puzzleLoad',
    scriptId: 'puzzle-2-intro',
    puzzleId: '002-around-the-wall',
  },
  {
    trigger: 'puzzleLoad',
    scriptId: 'puzzle-3-intro',
    puzzleId: '003-pickup-and-delivery',
  },
  {
    trigger: 'puzzleLoad',
    scriptId: 'puzzle-4-intro',
    puzzleId: '004-first-delivery',
  },
];
