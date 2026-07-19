/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PuzzleDefinition } from '../types/gameTypes';
import { PUZZLE_000_SAY_HELLO } from './000-say-hello';
import { PUZZLE_001_FIRST_STEPS } from './001-first-steps';
import { PUZZLE_006_FIRST_MEMORY } from './006-first-memory';
import { PUZZLE_007_POWER_CALCULATOR } from './007-power-calculator';
import { PUZZLE_008_COMMS_ARRAY } from './008-comms-array';
import { PUZZLE_002_AROUND_THE_WALL } from './002-around-the-wall';
import { PUZZLE_003_PICKUP_AND_DELIVERY } from './003-pickup-and-delivery';
import { PUZZLE_004_FIRST_DELIVERY } from './001-first-delivery';
import { PUZZLE_005_AROUND_THE_BEND } from './002-around-the-bend';

/**
 * Ordered array of all puzzles in the game.
 * New puzzles are appended here — the order defines the default display order.
 */
export const PUZZLES: PuzzleDefinition[] = [
  PUZZLE_000_SAY_HELLO,
  PUZZLE_001_FIRST_STEPS,
  PUZZLE_006_FIRST_MEMORY,
  PUZZLE_007_POWER_CALCULATOR,
  PUZZLE_008_COMMS_ARRAY,
  PUZZLE_002_AROUND_THE_WALL,
  PUZZLE_003_PICKUP_AND_DELIVERY,
  PUZZLE_004_FIRST_DELIVERY,
  PUZZLE_005_AROUND_THE_BEND
];

export function getPuzzleById(id: string): PuzzleDefinition | undefined {
  return PUZZLES.find(p => p.id === id);
}
