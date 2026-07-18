/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TreeNode {
  id: string;
  title: string;
  /** Command IDs this node grants when unlocked. Empty for pure language-feature nodes. */
  unlocksCommandIds: string[];
  /** Markdown documentation shown when the node is unlocked. */
  docMarkdown: string;
  /** Nodes that must be unlocked before this one can be unlocked. */
  prerequisiteNodeIds: string[];
  /** Puzzle ID whose completion unlocks this node. Undefined for auto-unlocked nodes. */
  unlockedByPuzzleId?: string;
}

/**
 * The research/progression tree, ordered to match real Python pedagogy:
 * sequencing → conditionals → for → while → functions → lists.
 *
 * Nodes without `unlockedByPuzzleId` are auto-seeded in fresh save data.
 * Future interpreter features (functions, lists) are listed as placeholders
 * with a note — they won't be unlockable until the interpreter supports them.
 */
export const TREE_NODES: TreeNode[] = [
  {
    id: 'basics',
    title: 'Basic Movement',
    unlocksCommandIds: ['move', 'rotate', 'grab', 'drop'],
    docMarkdown:
      '## Basic Movement\n\n' +
      'The four fundamental robot commands. `move()` drives one tile in a relative direction, ' +
      '`rotate()` turns the robot 90°, `grab()` picks up adjacent cargo, and `drop()` releases it.\n\n' +
      'Combined with `for` loops you can already write compact navigation sequences.',
    prerequisiteNodeIds: [],
    // No unlockedByPuzzleId — always available on a fresh save
  },
  {
    id: 'sensors',
    title: 'Sensor Functions',
    unlocksCommandIds: ['is_holding', 'can_move'],
    docMarkdown:
      '## Sensor Functions\n\n' +
      '`is_holding()` returns `True` when the robot is carrying cargo.\n\n' +
      '`can_move(direction)` probes whether a move in the given relative direction would succeed ' +
      '(no obstacle, no boundary). Use these in `if`/`while` conditions to write adaptive code.',
    prerequisiteNodeIds: ['basics'],
    unlockedByPuzzleId: '001-first-delivery',
  },
  {
    id: 'conditionals',
    title: 'Conditionals (if/else)',
    unlocksCommandIds: [],
    docMarkdown:
      '## Conditionals\n\n' +
      '```python\nif condition:\n    # runs when True\nelse:\n    # runs when False\n```\n\n' +
      'Branch your code based on sensor readings. Combine with `is_holding()` and `can_move()` ' +
      'to react to the world state instead of hardcoding every step.',
    prerequisiteNodeIds: ['sensors'],
    unlockedByPuzzleId: '002-around-the-bend',
  },
  // ── Future nodes (interpreter support needed) ─────────────────────────
  // {
  //   id: 'for-loops',
  //   title: 'For Loops',
  //   unlocksCommandIds: [],
  //   docMarkdown: '...',
  //   prerequisiteNodeIds: ['conditionals'],
  //   unlockedByPuzzleId: 'TBD',
  // },
  // {
  //   id: 'while-loops',
  //   title: 'While Loops',
  //   unlocksCommandIds: [],
  //   docMarkdown: '...',
  //   prerequisiteNodeIds: ['for-loops'],
  //   unlockedByPuzzleId: 'TBD',
  // },
];

/**
 * Look up tree nodes that are unlocked by solving a specific puzzle.
 */
export function getNodesUnlockedByPuzzle(puzzleId: string): TreeNode[] {
  return TREE_NODES.filter(n => n.unlockedByPuzzleId === puzzleId);
}

/**
 * Given a set of unlocked node IDs, compute the flat list of command IDs the player has access to.
 */
export function getCommandIdsFromNodes(unlockedNodeIds: string[]): string[] {
  const set = new Set(unlockedNodeIds);
  const commandIds: string[] = [];
  for (const node of TREE_NODES) {
    if (set.has(node.id)) {
      commandIds.push(...node.unlocksCommandIds);
    }
  }
  return commandIds;
}
