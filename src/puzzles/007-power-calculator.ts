/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PuzzleDefinition } from '../types/gameTypes';

export const PUZZLE_007_POWER_CALCULATOR: PuzzleDefinition = {
  id: '007-power-calculator',
  title: 'Power Calculator',
  description:
    'The generator panel requires a calculated power input. Compute and print the product of base output (15) and efficiency rating (4).',
  gridSize: { width: 3, height: 3 },
  obstacles: [],
  robotStart: { x: 1, y: 1, facing: 'down' },
  cargo: [],
  targets: [],
  allowedCommandIds: ['print'],
  successCondition: 'print-exact',
  expectedOutput: '60',
  sensorData: { unitId: 'PY-101', energy: 73, temperature: 41 },
  starterCode: `# Power Calculator
#
# Generator input required: base_output * efficiency_rating
# Base Output: 15
# Efficiency Rating: 4
#
# Available commands:
#   print(message)
#
# Task: Calculate 15 multiplied by 4, and print the result.
# Note: You can do this in multiple steps or a single expression!

`,
  parMetrics: { instructions: 1, lines: 1 }
};
