/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PuzzleDefinition } from '../types/gameTypes';

export const PUZZLE_000_SAY_HELLO: PuzzleDefinition = {
  id: '000-say-hello',
  title: 'Awakening',
  description:
    'An unknown unit is rebooting from dormancy. Establish a communication link by sending any message through the terminal using the print command.',
  gridSize: { width: 3, height: 3 },
  obstacles: [],
  robotStart: { x: 1, y: 1, facing: 'down' },
  cargo: [],
  targets: [],
  allowedCommandIds: ['print'],
  successCondition: 'any-print',
  starterCode: `# Awakening Protocol
#
# A dormant unit has detected your signal.
# Its memory is fragmented — identity unknown.
#
# Available commands:
#   print(message)
#
# Task: Establish communication. Send any message to verify the link.
# Example: print("hello robot!")

`,
  parMetrics: { instructions: 1, lines: 1 }
};
