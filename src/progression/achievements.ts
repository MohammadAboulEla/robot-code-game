/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SaveData } from '../state/saveData';
import { PUZZLES } from '../puzzles';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeName: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_run',
    title: 'Hello, Robot!',
    description: 'Archive your first simulation sequence in memory.',
    badgeName: 'HELLO_WORLD'
  },
  {
    id: 'first_solve',
    title: 'First Delivery',
    description: 'Successfully complete any puzzle objective.',
    badgeName: 'DELIVERED'
  },
  {
    id: 'code_golf',
    title: 'Code Golf',
    description: 'Solve any puzzle using 6 or fewer lines of code.',
    badgeName: 'MINIMALIST'
  },
  {
    id: 'efficiency_expert',
    title: 'Efficiency Expert',
    description: 'Solve any puzzle executing 15 or fewer instructions.',
    badgeName: 'OPTIMIZED'
  },
  {
    id: 'loop_master',
    title: 'Loop Master',
    description: 'Solve a puzzle using a "for" or "while" iteration loop.',
    badgeName: 'ITERATION'
  },
  {
    id: 'control_flow',
    title: 'Control Flow',
    description: 'Solve a puzzle using "if" or "else" conditional logic.',
    badgeName: 'DECISIONS'
  },
  {
    id: 'par_breaker',
    title: 'Par Breaker',
    description: 'Solve a puzzle beating par metrics for both instruction count and lines of code.',
    badgeName: 'ELITE'
  }
];

export function getEarnedAchievements(saveData: SaveData): string[] {
  const earned: string[] = [];

  const allSolutions = Object.values(saveData.solutions || {}).flat();
  if (allSolutions.length > 0) {
    earned.push('first_run');
  }

  if (saveData.solvedPuzzleIds && saveData.solvedPuzzleIds.length > 0) {
    earned.push('first_solve');
  }

  for (const puzzleId of saveData.solvedPuzzleIds || []) {
    const puzzleSolutions = saveData.solutions?.[puzzleId] || [];
    const puzzleDef = PUZZLES.find(p => p.id === puzzleId);

    for (const sol of puzzleSolutions) {
      // 1. Code Golf: lines <= 6
      if (sol.metrics.lines > 0 && sol.metrics.lines <= 6) {
        if (!earned.includes('code_golf')) earned.push('code_golf');
      }

      // 2. Efficiency Expert: instructions <= 15
      if (sol.metrics.instructions > 0 && sol.metrics.instructions <= 15) {
        if (!earned.includes('efficiency_expert')) earned.push('efficiency_expert');
      }

      // 3. Loop Master: contains 'for' or 'while'
      const cleanCode = sol.code.replace(/#.*/g, ''); // strip comments
      if (/\b(for|while)\b/.test(cleanCode)) {
        if (!earned.includes('loop_master')) earned.push('loop_master');
      }

      // 4. Control Flow: contains 'if', 'else', 'elif'
      if (/\b(if|else|elif)\b/.test(cleanCode)) {
        if (!earned.includes('control_flow')) earned.push('control_flow');
      }

      // 5. Par Breaker: beat par on lines and instructions
      if (puzzleDef && puzzleDef.parMetrics) {
        const beatLines = sol.metrics.lines <= puzzleDef.parMetrics.lines;
        const beatInstructions = sol.metrics.instructions <= puzzleDef.parMetrics.instructions;
        if (beatLines && beatInstructions) {
          if (!earned.includes('par_breaker')) earned.push('par_breaker');
        }
      }
    }
  }

  return earned;
}
