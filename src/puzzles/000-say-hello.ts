/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PuzzleDefinition } from '../types/gameTypes';

export const PUZZLE_000_SAY_HELLO: PuzzleDefinition = {
  id: '000-say-hello',
  title: 'Say Hello',
  description:
    'Establish communication with the robot. Use the print command to send a message to the Console Output Terminal.',
  gridSize: { width: 3, height: 3 },
  obstacles: [],
  robotStart: { x: 1, y: 1, facing: 'down' },
  cargo: [],
  targets: [],
  allowedCommandIds: ['print'],
  successCondition: 'any-print',
  starterCode: `# Onboarding Protocol
#
# Available commands:
#   print(message)
#
# Task: Write your first command to say hello to the robot.
# Example: print("hello robot!")

`,
  parMetrics: { instructions: 1, lines: 1 }
};
