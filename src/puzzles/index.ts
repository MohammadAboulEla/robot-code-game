/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PuzzleDefinition } from '../types/gameTypes';
import { PUZZLE_001_FIRST_DELIVERY } from './001-first-delivery';
import { PUZZLE_002_AROUND_THE_BEND } from './002-around-the-bend';

/**
 * Ordered array of all puzzles in the game.
 * New puzzles are appended here — the order defines the default display order.
 */
export const PUZZLES: PuzzleDefinition[] = [
  PUZZLE_001_FIRST_DELIVERY,
  PUZZLE_002_AROUND_THE_BEND
];

export function getPuzzleById(id: string): PuzzleDefinition | undefined {
  return PUZZLES.find(p => p.id === id);
}
