/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PuzzleDefinition } from '../types/gameTypes';

export const PUZZLE_002_AROUND_THE_WALL: PuzzleDefinition = {
  id: '002-around-the-wall',
  title: 'Around the Wall',
  description:
    'Navigate the robot around the wall using relative direction arguments: move("left"), move("right"), or move("back").',
  gridSize: { width: 4, height: 4 },
  obstacles: [{ x: 0, y: 1 }],
  robotStart: { x: 0, y: 0, facing: 'down' },
  cargo: [],
  targets: [{ x: 0, y: 2 }],
  allowedCommandIds: ['move'],
  successCondition: 'robot-on-target',
  starterCode: `# Around the Wall
#
# Direct path is blocked at (0, 1) by an obstacle barrier.
#
# Available commands:
#   move(direction) - moves the robot one tile relative to current facing heading.
#                     options: "front", "left", "right", "back"
#
# Task: Drive around the obstacle to reach the target pad at (0, 2).

`,
  parMetrics: { instructions: 4, lines: 4 }
};
