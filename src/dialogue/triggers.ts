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
    scriptId: 'test-intro',
    puzzleId: '001-first-delivery',
  },
];
