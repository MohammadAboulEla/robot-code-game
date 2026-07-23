/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PuzzleDefinition } from '../types/gameTypes';

export const PUZZLE_001_FIRST_STEPS: PuzzleDefinition = {
  id: '001-first-steps',
  title: 'First Steps',
  description:
    'Instruct the robot to move forward 3 times to reach the target pad at (0, 3).',
  gridSize: { width: 1, height: 4 },
  obstacles: [],
  robotStart: { x: 0, y: 0, facing: 'down' },
  cargo: [],
  targets: [{ x: 0, y: 3 }],
  allowedCommandIds: ['move'],
  successCondition: 'robot-on-target',
  starterCode: `# First Steps
#
# Available commands:
#   move() - Moves the robot 1 tile forward relative to its heading.
#
# Task: Drive the robot to the target pad at (0, 3) by calling move() exactly 3 times.

`,
  parMetrics: { instructions: 3, lines: 3 }
};
