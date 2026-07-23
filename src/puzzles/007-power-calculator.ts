/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PuzzleDefinition } from '../types/gameTypes';

export const PUZZLE_007_POWER_CALCULATOR: PuzzleDefinition = {
  id: '007-power-calculator',
  title: 'Power Calculator',
  description:
    'The generator needs its total power output. Store the two readings in variables, multiply them, and print the result.',
  gridSize: { width: 3, height: 3 },
  obstacles: [],
  robotStart: { x: 1, y: 1, facing: 'down' },
  cargo: [],
  targets: [],
  allowedCommandIds: ['print'],
  successCondition: 'print-exact',
  expectedOutput: '60',
  starterCode: `# Power Calculator
#
# The generator panel needs a TOTAL power value before it will start:
#     total = base output x efficiency rating
#
#     Base output ...... 15
#     Efficiency ....... 4
#
# In Python, "*" means multiply.  Example:   print(2 * 3)   ->   6
#
# The two values are already stored in variables below (just like
# last mission). Finish the last line: print them multiplied together.

base_output = 15
efficiency = 4

print()
`,
  parMetrics: { instructions: 3, lines: 3 }
};
