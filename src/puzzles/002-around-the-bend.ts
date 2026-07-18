/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PuzzleDefinition } from '../types/gameTypes';

export const PUZZLE_002_AROUND_THE_BEND: PuzzleDefinition = {
  id: '002-around-the-bend',
  title: 'Around the Bend',
  description:
    'Navigate the robot around an L-shaped obstacle wall to reach the cargo box, then deliver it to the target pad on the other side.',
  gridSize: { width: 4, height: 4 },
  obstacles: [
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 2 }
  ],
  robotStart: { x: 0, y: 0, facing: 'down' },
  cargo: [{ x: 2, y: 0 }],
  targets: [{ x: 0, y: 3 }],
  allowedCommandIds: ['move', 'rotate', 'grab', 'drop', 'is_holding', 'can_move'],
  starterCode: `# Around the Bend
#
# The cargo box is at (2, 0), behind the wall.
# Deliver it to the target pad at (0, 3).
#
# Hint: Go around the L-shaped wall from the bottom.
#
# Available commands:
#   move("front" | "back" | "left" | "right")
#   rotate("left" | "right")
#   grab()
#   drop()

`,
  parMetrics: { instructions: 14, lines: 8 }
};
