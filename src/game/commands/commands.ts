/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CommandDefinition, VMState, CommandResult } from '../../types/gameTypes';

// ── Shared helpers ──────────────────────────────────────────────────────────

function getAbsoluteDirection(
  facing: 'up' | 'down' | 'left' | 'right',
  relativeDir: string
): 'up' | 'down' | 'left' | 'right' {
  const headings: ('up' | 'right' | 'down' | 'left')[] = ['up', 'right', 'down', 'left'];
  const idx = headings.indexOf(facing);
  if (idx === -1) {
    throw new Error(`RuntimeError: Invalid robot facing orientation: ${facing}`);
  }

  let targetIdx = idx;
  if (relativeDir === 'front') {
    targetIdx = idx;
  } else if (relativeDir === 'right') {
    targetIdx = (idx + 1) % 4;
  } else if (relativeDir === 'back') {
    targetIdx = (idx + 2) % 4;
  } else if (relativeDir === 'left') {
    targetIdx = (idx + 3) % 4;
  } else {
    throw new Error(`ValueError: Invalid relative direction "${relativeDir}". Must be "front", "back", "left", or "right".`);
  }

  return headings[targetIdx];
}

// ── Command implementations ─────────────────────────────────────────────────

function executeMove(vm: VMState, args: any[]): CommandResult {
  const relativeDir = args[0];
  if (relativeDir !== 'front' && relativeDir !== 'back' && relativeDir !== 'left' && relativeDir !== 'right') {
    throw new Error(`ValueError: move() requires one of "front", "back", "left", "right". Got: ${JSON.stringify(relativeDir)}`);
  }

  const absoluteDir = getAbsoluteDirection(vm.robot.facing, relativeDir);

  let dx = 0;
  let dy = 0;
  if (absoluteDir === 'up') dy = -1;
  else if (absoluteDir === 'down') dy = 1;
  else if (absoluteDir === 'left') dx = -1;
  else if (absoluteDir === 'right') dx = 1;

  const nx = vm.robot.x + dx;
  const ny = vm.robot.y + dy;

  // Obstacle collision
  const hitObstacle = vm.obstacles.some(o => o.x === nx && o.y === ny);
  if (hitObstacle) {
    throw new MoveError(
      `Collision! The robot crashed into an obstacle at grid coordinate (${nx}, ${ny}).`,
      `CollisionError: Crashed into obstacle at (${nx}, ${ny}).`
    );
  }

  // Boundary check
  if (nx < 0 || nx >= vm.gridSize.width || ny < 0 || ny >= vm.gridSize.height) {
    throw new MoveError(
      `Boundary Collision! The robot attempted to walk off the grid at coordinate (${nx}, ${ny}).`,
      `BoundaryError: Robot fell off the grid boundary at (${nx}, ${ny}).`
    );
  }

  vm.robot.x = nx;
  vm.robot.y = ny;

  // Move box with robot if holding
  if (vm.robot.holding) {
    vm.box.x = nx;
    vm.box.y = ny;
  }

  return {
    success: true,
    message: `Robot successfully moved ${relativeDir} to (${nx}, ${ny}).`
  };
}

function executeRotate(vm: VMState, args: any[]): CommandResult {
  const direction = args[0];
  if (direction !== 'left' && direction !== 'right') {
    throw new Error(`ValueError: rotate() requires either "left" or "right". Got: ${JSON.stringify(direction)}`);
  }

  const headings: ('up' | 'right' | 'down' | 'left')[] = ['up', 'right', 'down', 'left'];
  const idx = headings.indexOf(vm.robot.facing);
  if (idx === -1) {
    throw new Error(`RuntimeError: Invalid robot facing orientation: ${vm.robot.facing}`);
  }

  let nextIdx = idx;
  if (direction === 'right') {
    nextIdx = (idx + 1) % 4;
  } else {
    nextIdx = (idx + 3) % 4;
  }
  const newHeading = headings[nextIdx];
  vm.robot.facing = newHeading;

  return {
    success: true,
    message: `Robot successfully rotated ${direction} to face ${newHeading}.`
  };
}

function executeGrab(vm: VMState, _args: any[]): CommandResult {
  if (vm.robot.holding) {
    throw new Error(`RuntimeError: Robot is already holding the box! Can only hold one item.`);
  }

  let facedX = vm.robot.x;
  let facedY = vm.robot.y;
  if (vm.robot.facing === 'up') facedY -= 1;
  else if (vm.robot.facing === 'down') facedY += 1;
  else if (vm.robot.facing === 'left') facedX -= 1;
  else if (vm.robot.facing === 'right') facedX += 1;

  const isFacingBox = facedX === vm.box.x && facedY === vm.box.y;

  if (!isFacingBox) {
    const isWithBox = vm.robot.x === vm.box.x && vm.robot.y === vm.box.y;
    let errMsg = `Grab failed! The robot is not facing the cargo box at (${vm.box.x}, ${vm.box.y}).`;
    if (isWithBox) {
      errMsg = `Grab failed! The robot is standing directly on the cargo box. Step back and face it to grab it.`;
    } else {
      const isAdjacent = Math.abs(vm.robot.x - vm.box.x) + Math.abs(vm.robot.y - vm.box.y) === 1;
      if (isAdjacent) {
        errMsg = `Grab failed! The robot is adjacent to the box but facing ${vm.robot.facing} instead of facing the box.`;
      }
    }

    throw new MoveError(errMsg, `GrabError: Robot is not correctly facing the box to grab it.`);
  }

  vm.robot.holding = true;
  vm.box.x = vm.robot.x;
  vm.box.y = vm.robot.y;

  return {
    success: true,
    message: `Grab successful! The robot is now holding the box.`
  };
}

function executeDrop(vm: VMState, _args: any[]): CommandResult {
  if (!vm.robot.holding) {
    throw new MoveError(
      `Drop failed! The robot is not holding anything to drop.`,
      `DropError: Robot is not holding the box.`
    );
  }

  vm.robot.holding = false;
  vm.box.x = vm.robot.x;
  vm.box.y = vm.robot.y;

  return {
    success: true,
    message: `Drop successful! The robot dropped the box at (${vm.robot.x}, ${vm.robot.y}).`
  };
}

// ── MoveError: carries both a user-facing message and a thrown error message ─

export class MoveError extends Error {
  public readonly displayMessage: string;
  constructor(displayMessage: string, thrownMessage: string) {
    super(thrownMessage);
    this.displayMessage = displayMessage;
  }
}

// ── Registry ────────────────────────────────────────────────────────────────

export const COMMANDS: CommandDefinition[] = [
  {
    id: 'move',
    label: 'move',
    signature: 'move("front" | "back" | "left" | "right")',
    docMarkdown: 'Moves the robot one tile in the specified **relative** direction (relative to robot\'s current heading). Throws on obstacle collision or grid boundary.',
    category: 'movement',
    execute: executeMove
  },
  {
    id: 'rotate',
    label: 'rotate',
    signature: 'rotate("left" | "right")',
    docMarkdown: 'Rotates the robot 90° in the specified direction without moving.',
    category: 'movement',
    execute: executeRotate
  },
  {
    id: 'grab',
    label: 'grab',
    signature: 'grab()',
    docMarkdown: 'Grabs the cargo box. Robot must be adjacent to and facing the box.',
    category: 'movement',
    execute: executeGrab
  },
  {
    id: 'drop',
    label: 'drop',
    signature: 'drop()',
    docMarkdown: 'Drops the held cargo box at the robot\'s current position.',
    category: 'movement',
    execute: executeDrop
  },
  {
    id: 'is_holding',
    label: 'is_holding',
    signature: 'is_holding() → True/False',
    docMarkdown: 'Returns `True` if the robot is currently holding a box, `False` otherwise. Usable in `if`/`while` conditions.',
    category: 'sensor',
    execute: (_vm, _args) => ({ success: true, message: '' }) // sensor — evaluated via evalCondition, not executeCommand
  },
  {
    id: 'can_move',
    label: 'can_move',
    signature: 'can_move("front" | "back" | "left" | "right") → True/False',
    docMarkdown: 'Returns `True` if the robot can move in the given relative direction without hitting an obstacle or boundary.',
    category: 'sensor',
    execute: (_vm, _args) => ({ success: true, message: '' }) // sensor — evaluated via evalCondition, not executeCommand
  }
];

export const ALL_COMMAND_IDS: string[] = COMMANDS.map(c => c.id);

/**
 * Build a command registry Map filtered to only the allowed command IDs.
 * Pass `ALL_COMMAND_IDS` to unlock everything.
 */
export function buildCommandRegistry(allowedIds: string[]): Map<string, CommandDefinition> {
  const registry = new Map<string, CommandDefinition>();
  const allowedSet = new Set(allowedIds);
  for (const cmd of COMMANDS) {
    if (allowedSet.has(cmd.id)) {
      registry.set(cmd.id, cmd);
    }
  }
  return registry;
}
