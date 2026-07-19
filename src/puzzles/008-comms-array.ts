/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PuzzleDefinition } from '../types/gameTypes';

export const PUZZLE_008_COMMS_ARRAY: PuzzleDefinition = {
  id: '008-comms-array',
  title: 'Communication Array',
  description:
    'Reconstruct the transmission status signal by concatenating the fragmented string variables with spaces, then print the result.',
  gridSize: { width: 3, height: 3 },
  obstacles: [],
  robotStart: { x: 1, y: 1, facing: 'down' },
  cargo: [],
  targets: [],
  allowedCommandIds: ['print'],
  successCondition: 'print-exact',
  expectedOutput: 'PY-101 COMM LINK OK',
  starterCode: `# Communication Array
#
# Fragmented transmission segments are declared below.
#
# Available commands:
#   print(message)
#
# Task: Concatenate the variables with spaces between them and print the final message.
# Expected output: "PY-101 COMM LINK OK"
# Example: print(p1 + " " + p2 + ...)

p1 = "PY-101"
p2 = "COMM"
p3 = "LINK"
p4 = "OK"

`,
  parMetrics: { instructions: 1, lines: 1 }
};
