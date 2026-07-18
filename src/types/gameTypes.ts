/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PythonToken {
  type: 'comment' | 'string' | 'number' | 'keyword' | 'function' | 'identifier' | 'whitespace' | 'punctuation';
  text: string;
}

import type { GameWorldState } from '../robotInterpreter';

/**
 * Mutable view of the VM's world state passed to command execute functions.
 * Commands mutate this in place; the executor handles before/after cloning.
 */
export interface VMState {
  robot: GameWorldState['robot'];
  box: GameWorldState['box'];
  target: GameWorldState['target'];
  gridSize: GameWorldState['gridSize'];
  obstacles: GameWorldState['obstacles'];
}

export interface CommandResult {
  success: boolean;
  message: string;
}

export interface CommandDefinition {
  id: string;
  label: string;
  signature: string;
  docMarkdown: string;
  category: 'movement' | 'sensor' | 'control';
  execute: (vm: VMState, args: any[]) => CommandResult;
}

export interface PuzzleDefinition {
  id: string;
  title: string;
  description: string;
  gridSize: { width: number; height: number };
  obstacles: { x: number; y: number }[];
  robotStart: { x: number; y: number; facing: 'up' | 'down' | 'left' | 'right' };
  cargo: { x: number; y: number }[];
  targets: { x: number; y: number }[];
  allowedCommandIds: string[];
  starterCode: string;
  parMetrics?: { instructions: number; lines: number };
}
