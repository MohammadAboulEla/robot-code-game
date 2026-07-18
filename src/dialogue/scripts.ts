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
  'test-intro': {
    id: 'test-intro',
    lines: [
      {
        speaker: 'R-07',
        expression: 'idle',
        text: 'Incoming transmission detected. Establishing secure channel...',
        requiresConfirm: true,
      },
      {
        speaker: 'R-07',
        expression: 'happy',
        text: 'Connection established! I am Unit R-07, autonomous logistics drone. I have been assigned to this sector for cargo delivery operations.',
        requiresConfirm: true,
      },
      {
        speaker: 'R-07',
        expression: 'pointing',
        text: 'I will need your help writing the movement protocols. Ready when you are, Operator.',
        requiresConfirm: true,
      },
    ],
  },
};
