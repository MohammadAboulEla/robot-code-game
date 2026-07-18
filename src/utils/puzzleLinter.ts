/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PuzzleDefinition } from '../types/gameTypes';
import { ALL_COMMAND_IDS } from '../game/commands/commands';

export interface LintResult {
  errors: string[];
  warnings: string[];
}

/**
 * Checks if there is a path from `start` to `end` in a grid with `obstacles`.
 * Uses standard Breadth-First Search (BFS).
 */
function checkPath(
  start: { x: number; y: number },
  end: { x: number; y: number },
  gridSize: { width: number; height: number },
  obstacles: { x: number; y: number }[]
): boolean {
  const { width, height } = gridSize;
  const queue: { x: number; y: number }[] = [start];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  const obstacleSet = new Set(obstacles.map(o => `${o.x},${o.y}`));

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.x === end.x && current.y === end.y) {
      return true;
    }

    // Standard 4-way movement neighbors
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ];

    for (const n of neighbors) {
      if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
        const key = `${n.x},${n.y}`;
        if (!visited.has(key) && !obstacleSet.has(key)) {
          visited.add(key);
          queue.push(n);
        }
      }
    }
  }

  return false;
}

/**
 * Lints a PuzzleDefinition to verify correctness and playability.
 */
export function lintPuzzle(puzzle: PuzzleDefinition): LintResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const { gridSize, obstacles, robotStart, cargo, targets, allowedCommandIds } = puzzle;

  // 1. Grid size bounds valid
  if (!gridSize || typeof gridSize.width !== 'number' || typeof gridSize.height !== 'number') {
    errors.push('Grid size is missing or invalid.');
  } else if (gridSize.width <= 0 || gridSize.height <= 0) {
    errors.push(`Grid size bounds must be positive (got ${gridSize.width}x${gridSize.height}).`);
  }

  const w = gridSize?.width || 0;
  const h = gridSize?.height || 0;

  const inBounds = (x: number, y: number) => x >= 0 && x < w && y >= 0 && y < h;

  // 2. Robot start position
  if (!robotStart || typeof robotStart.x !== 'number' || typeof robotStart.y !== 'number') {
    errors.push('Robot start position is missing or invalid.');
  } else {
    if (!inBounds(robotStart.x, robotStart.y)) {
      errors.push(`Robot start position (${robotStart.x}, ${robotStart.y}) is out of bounds for ${w}x${h} grid.`);
    }
  }

  // 3. Cargo list
  if (!cargo || !Array.isArray(cargo) || cargo.length === 0) {
    errors.push('Puzzle must have at least one cargo box.');
  } else {
    cargo.forEach((c, idx) => {
      if (!inBounds(c.x, c.y)) {
        errors.push(`Cargo box #${idx + 1} at (${c.x}, ${c.y}) is out of bounds.`);
      }
    });
  }

  // 4. Targets list
  if (!targets || !Array.isArray(targets) || targets.length === 0) {
    errors.push('Puzzle must have at least one target pad.');
  } else {
    targets.forEach((t, idx) => {
      if (!inBounds(t.x, t.y)) {
        errors.push(`Target pad #${idx + 1} at (${t.x}, ${t.y}) is out of bounds.`);
      }
    });
  }

  // 5. Obstacles bounds
  if (obstacles && Array.isArray(obstacles)) {
    obstacles.forEach((o, idx) => {
      if (!inBounds(o.x, o.y)) {
        errors.push(`Obstacle #${idx + 1} at (${o.x}, ${o.y}) is out of bounds.`);
      }
    });
  }

  // 6. Collision checks (overlap)
  const obstacleSet = new Set(obstacles?.map(o => `${o.x},${o.y}`) || []);

  if (robotStart && obstacleSet.has(`${robotStart.x},${robotStart.y}`)) {
    errors.push(`Robot starting position (${robotStart.x}, ${robotStart.y}) is on an obstacle.`);
  }

  if (cargo && Array.isArray(cargo)) {
    cargo.forEach((c, idx) => {
      if (obstacleSet.has(`${c.x},${c.y}`)) {
        errors.push(`Cargo box #${idx + 1} at (${c.x}, ${c.y}) is on an obstacle.`);
      }
    });
  }

  if (targets && Array.isArray(targets)) {
    targets.forEach((t, idx) => {
      if (obstacleSet.has(`${t.x},${t.y}`)) {
        errors.push(`Target pad #${idx + 1} at (${t.x}, ${t.y}) is on an obstacle.`);
      }
    });
  }

  // 7. Allowed command registry existence
  if (allowedCommandIds && Array.isArray(allowedCommandIds)) {
    allowedCommandIds.forEach(cmdId => {
      if (!ALL_COMMAND_IDS.includes(cmdId)) {
        errors.push(`Command "${cmdId}" does not exist in the command registry.`);
      }
    });
  } else {
    errors.push('Puzzle does not define any allowedCommandIds.');
  }

  // 8. Path Reachability checks (only if grid and basics are valid)
  if (
    errors.length === 0 &&
    robotStart &&
    cargo &&
    cargo[0] &&
    targets &&
    targets[0]
  ) {
    const robotStartPos = { x: robotStart.x, y: robotStart.y };
    const cargoPos = { x: cargo[0].x, y: cargo[0].y };
    const targetPos = { x: targets[0].x, y: targets[0].y };
    const obstaclePoints = obstacles || [];

    // Check robot -> cargo reachability
    const canRobotReachCargo = checkPath(robotStartPos, cargoPos, gridSize, obstaclePoints);
    if (!canRobotReachCargo) {
      errors.push(`Robot starting position (${robotStart.x}, ${robotStart.y}) cannot reach Cargo box (${cargoPos.x}, ${cargoPos.y}) due to obstacles.`);
    }

    // Check cargo -> target reachability (since robot has to move cargo to target)
    const canCargoReachTarget = checkPath(cargoPos, targetPos, gridSize, obstaclePoints);
    if (!canCargoReachTarget) {
      errors.push(`Cargo box (${cargoPos.x}, ${cargoPos.y}) cannot reach Target pad (${targetPos.x}, ${targetPos.y}) due to obstacles.`);
    }
  }

  return { errors, warnings };
}
