/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ── Robot Expression Types ──────────────────────────────────────────────────

export type RobotExpression =
  | 'happy'
  | 'idle'
  | 'excited'
  | 'confused'
  | 'talking'
  | 'sad'
  | 'crossed-arms'
  | 'pointing'
  | 'angry';

/**
 * Sprite sheet is a 3×3 grid in assets/sprite.jpeg.
 * Each cell maps to a row/col coordinate for CSS background-position.
 */
export const EXPRESSION_SPRITE_MAP: Record<RobotExpression, { row: number; col: number }> = {
  'happy':       { row: 0, col: 0 },
  'idle':        { row: 0, col: 1 },
  'excited':     { row: 0, col: 2 },
  'confused':    { row: 1, col: 0 },
  'talking':     { row: 1, col: 1 },
  'sad':         { row: 1, col: 2 },
  'crossed-arms':{ row: 2, col: 0 },
  'pointing':    { row: 2, col: 1 },
  'angry':       { row: 2, col: 2 },
};

// ── Dialogue Data Schema ────────────────────────────────────────────────────

export interface DialogueLine {
  speaker: string;
  expression: RobotExpression;
  text: string;
  requiresConfirm: boolean;
}

export interface DialogueScript {
  id: string;
  lines: DialogueLine[];
}

// ── Trigger System ──────────────────────────────────────────────────────────

export type DialogueTrigger = 'puzzleLoad' | 'puzzleSolved' | 'commandFirstUsed';

export interface DialogueTriggerDef {
  trigger: DialogueTrigger;
  scriptId: string;
  /** Required when trigger is 'puzzleLoad' or 'puzzleSolved' */
  puzzleId?: string;
  /** Required when trigger is 'commandFirstUsed' */
  commandId?: string;
}
