/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getCommandIdsFromNodes, getNodesUnlockedByPuzzle } from '../progression/tree';
import type { SavedSolution, SolutionMetrics } from '../types/gameTypes';

export interface SaveData {
  schemaVersion: number;
  unlockedNodeIds: string[];
  solvedPuzzleIds: string[];
  solutions: Record<string, SavedSolution[]>;
}

const STORAGE_KEY = 'robot-code-game-save';
const CURRENT_SCHEMA_VERSION = 2;

function createDefaultSaveData(): SaveData {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    unlockedNodeIds: ['print'],
    solvedPuzzleIds: [],
    solutions: {}
  };
}

export function loadSaveData(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSaveData();

    const parsed = JSON.parse(raw);
    // Basic validation — if schema is missing or wrong type, reset
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.schemaVersion !== 'number'
    ) {
      return createDefaultSaveData();
    }

    // Future: migrate from older schema versions here
    if (parsed.schemaVersion === 1) {
      if (parsed.solutions) {
        for (const puzzleId of Object.keys(parsed.solutions)) {
          const list = parsed.solutions[puzzleId];
          if (Array.isArray(list)) {
            parsed.solutions[puzzleId] = list.map((sol: any) => {
              if (sol && !sol.metrics) {
                const lines = sol.code ? sol.code.split('\n').filter((l: string) => {
                  const clean = l.split('#')[0].trim();
                  return clean.length > 0;
                }).length : 0;
                return {
                  ...sol,
                  metrics: {
                    instructions: 0,
                    lines,
                    steps: 0
                  }
                };
              }
              return sol;
            });
          }
        }
      }
      parsed.schemaVersion = 2;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }

    // Ensure 'print' is unlocked in all saves since it's the new root
    if (parsed.unlockedNodeIds && !parsed.unlockedNodeIds.includes('print')) {
      parsed.unlockedNodeIds.push('print');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }

    // Sync unlocked nodes for solved puzzles in case the progression tree definitions were changed
    if (parsed.solvedPuzzleIds && parsed.unlockedNodeIds) {
      let updated = false;
      for (const puzzleId of parsed.solvedPuzzleIds) {
        const nodes = getNodesUnlockedByPuzzle(puzzleId);
        for (const node of nodes) {
          if (!parsed.unlockedNodeIds.includes(node.id)) {
            parsed.unlockedNodeIds.push(node.id);
            updated = true;
          }
        }
      }
      if (updated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    }

    return parsed as SaveData;
  } catch {
    return createDefaultSaveData();
  }
}

export function writeSaveData(data: SaveData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function markPuzzleSolved(puzzleId: string): void {
  const data = loadSaveData();
  let updated = false;
  if (!data.solvedPuzzleIds.includes(puzzleId)) {
    data.solvedPuzzleIds.push(puzzleId);
    updated = true;
  }
  
  // Unlock nodes associated with this puzzle
  const newlyUnlocked = getNodesUnlockedByPuzzle(puzzleId);
  for (const node of newlyUnlocked) {
    if (!data.unlockedNodeIds.includes(node.id)) {
      data.unlockedNodeIds.push(node.id);
      updated = true;
    }
  }

  if (updated) {
    writeSaveData(data);
  }
}

export function isPuzzleSolved(puzzleId: string): boolean {
  const data = loadSaveData();
  return data.solvedPuzzleIds.includes(puzzleId);
}

export function unlockNode(nodeId: string): void {
  const data = loadSaveData();
  if (!data.unlockedNodeIds.includes(nodeId)) {
    data.unlockedNodeIds.push(nodeId);
    writeSaveData(data);
  }
}

/**
 * Resolve all unlocked tree nodes into a flat list of command IDs.
 */
export function getUnlockedCommandIds(): string[] {
  const data = loadSaveData();
  return getCommandIdsFromNodes(data.unlockedNodeIds);
}

export function getUnlockedNodeIds(): string[] {
  const data = loadSaveData();
  return data.unlockedNodeIds;
}

export function savePuzzleSolution(
  puzzleId: string,
  code: string,
  metrics: SolutionMetrics,
  label?: string
): void {
  const data = loadSaveData();
  if (!data.solutions) {
    data.solutions = {};
  }
  if (!data.solutions[puzzleId]) {
    data.solutions[puzzleId] = [];
  }

  const existingIndex = data.solutions[puzzleId].findIndex(s => s.code === code);
  
  const newSolution: SavedSolution = {
    code,
    metrics,
    timestamp: Date.now(),
    label
  };

  if (existingIndex !== -1) {
    data.solutions[puzzleId][existingIndex] = newSolution;
  } else {
    data.solutions[puzzleId].push(newSolution);
  }

  // Limit solutions to top 20, keeping newest
  if (data.solutions[puzzleId].length > 20) {
    data.solutions[puzzleId].sort((a, b) => b.timestamp - a.timestamp);
    data.solutions[puzzleId] = data.solutions[puzzleId].slice(0, 20);
  }

  writeSaveData(data);
}

export function deletePuzzleSolution(puzzleId: string, timestamp: number): void {
  const data = loadSaveData();
  if (data.solutions && data.solutions[puzzleId]) {
    data.solutions[puzzleId] = data.solutions[puzzleId].filter(s => s.timestamp !== timestamp);
    writeSaveData(data);
  }
}

export function getSavedSolutions(puzzleId: string): SavedSolution[] {
  const data = loadSaveData();
  if (!data.solutions) return [];
  return data.solutions[puzzleId] || [];
}

export function resetSaveData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

