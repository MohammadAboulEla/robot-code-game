/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PuzzleDefinition } from '../types/gameTypes';

export const PUZZLE_006_FIRST_MEMORY: PuzzleDefinition = {
  id: '006-first-memory',
  title: 'First Memory',
  description:
    'Your sensors indicate the robot\'s energy level. Store the energy level value in a variable and print it to establish data retention.',
  gridSize: { width: 3, height: 3 },
  obstacles: [],
  robotStart: { x: 1, y: 1, facing: 'down' },
  cargo: [],
  targets: [],
  allowedCommandIds: ['print'],
  successCondition: 'print-exact',
  expectedOutput: '73',
  sensorData: { unitId: 'PY-101', energy: 73, temperature: 38 },
  starterCode: `# First Memory
#
# The vitals monitor shows the robot's energy is at 73.
#
# Available commands:
#   print(message)
#
# Task: Store the energy value in a variable, then print the variable.
# Example:
#   energy = 73
#   print(energy)

`,
  parMetrics: { instructions: 2, lines: 2 }
};
