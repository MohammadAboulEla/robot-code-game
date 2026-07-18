/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameWorldState } from '../robotInterpreter';

export const INITIAL_WORLD_STATE: GameWorldState = {
  robot: {
    x: 0,
    y: 0,
    holding: false,
    facing: 'down'
  },
  box: {
    x: 1,
    y: 3
  },
  target: {
    x: 3,
    y: 1
  },
  gridSize: {
    width: 5,
    height: 5
  },
  obstacles: [
    { x: 2, y: 1 },
    { x: 2, y: 2 },
    { x: 2, y: 3 }
  ]
};

export const DEFAULT_PYTHON_CODE = `# Robot Code Game - Delivery Protocol
#
# Available commands:
#   move("front" | "back" | "left" | "right")
#   rotate("left" | "right")
#   grab()
#   drop()
#
# Sensory helpers:
#   is_holding() -> returns True/False
#   can_move("front" | "back" | "left" | "right") -> returns True/False
#
# Task: Drive to the cargo box at (1, 3), rotate to face it, grab it,
# navigate around the obstacles at X=2, and drop
# the cargo container precisely on the target pad at (3, 1).

# Let's move down the left side of the screen to reach (0, 3)
for i in range(3):
    move("front")

# Rotate left to face the cargo box at (1, 3)
rotate("left")

# Retrieve the storage container
grab()

# Navigate around the obstacle barrier from the bottom
# Since we are facing right, moving right is "down" relative to robot, moving front is "right"
move("right") # moves down to (0, 4)
for i in range(3):
    move("front") # moves right to (3, 4)

# Rotate left to face up/North
rotate("left")

for i in range(3):
    move("front") # moves up to (3, 1)

# Unload the container on the target pad
drop()
`;
