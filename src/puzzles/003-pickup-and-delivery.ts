/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PuzzleDefinition } from '../types/gameTypes';

export const PUZZLE_003_PICKUP_AND_DELIVERY: PuzzleDefinition = {
  id: '003-pickup-and-delivery',
  title: 'Pickup and Delivery',
  description:
    'Retrieve the cargo crate using grab() and deliver it to the target pad at (0, 2) using drop(). No rotation is required.',
  gridSize: { width: 3, height: 3 },
  obstacles: [],
  robotStart: { x: 1, y: 0, facing: 'right' },
  cargo: [{ x: 2, y: 0 }],
  targets: [{ x: 0, y: 2 }],
  allowedCommandIds: ['move', 'grab', 'drop'],
  successCondition: 'cargo-delivery',
  starterCode: `# Pickup and Delivery
#
# Retrieve the crate at (2, 0) and deliver it to the pad at (0, 2).
#
# Available commands:
#   move(direction) - moves relative: "front", "back", "left", "right"
#   grab()          - secures cargo adjacent to and in front of robot
#   drop()          - releases cargo at robot's current position
#
# Hint: You start facing the cargo box. Grab it, then navigate backwards and sideways.

`,
  parMetrics: { instructions: 5, lines: 5 }
};
