/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getCommandIdsFromNodes, getNodesUnlockedByPuzzle } from '../progression/tree';

export interface SavedSolution {
  code: string;
  timestamp: number;
  label?: string;
}

export interface SaveData {
  schemaVersion: number;
  unlockedNodeIds: string[];
  solvedPuzzleIds: string[];
  solutions: Record<string, SavedSolution[]>;
}

const STORAGE_KEY = 'robot-code-game-save';
const CURRENT_SCHEMA_VERSION = 1;

function createDefaultSaveData(): SaveData {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    unlockedNodeIds: ['basics'],
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
    // if (parsed.schemaVersion < CURRENT_SCHEMA_VERSION) { ... }

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
