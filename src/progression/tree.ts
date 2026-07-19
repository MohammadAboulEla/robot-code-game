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
  /** Short summary of what the robot taught at this node. */
  recapText?: string;
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
    id: 'print',
    title: 'Console Print',
    unlocksCommandIds: ['print'],
    docMarkdown:
      '## Console Print\n\n' +
      'Use `print(message)` to print text messages to the Console Output Terminal.\n\n' +
      'It allows basic operator-to-robot diagnostic communication.',
    prerequisiteNodeIds: [],
    // Always available on a fresh save
    recapText: 'ESTABLISHED OPERATOR CHANNEL. SYSTEM DROID ONLINE AND MONITORING TRANSCRIPT LOGS.'
  },
  {
    id: 'basics',
    title: 'Basic Movement',
    unlocksCommandIds: ['move'],
    docMarkdown:
      '## Basic Movement\n\n' +
      'Allows you to instruct the robot to move 1 tile forward using `move()` without any parameters.',
    prerequisiteNodeIds: ['print'],
    unlockedByPuzzleId: '000-say-hello',
    recapText: 'move() DRIVES THE UNIT FORWARD BY ONE GRID TILE ALONG ITS CURRENT HEADING.'
  },
  {
    id: 'move-directions',
    title: 'Directional Movement',
    unlocksCommandIds: [],
    docMarkdown:
      '## Directional Movement\n\n' +
      'Allows you to specify relative directions when calling `move(direction)`:\n\n' +
      '- `move("front")` / `move()`\n' +
      '- `move("left")`\n' +
      '- `move("right")`\n' +
      '- `move("back")`',
    prerequisiteNodeIds: ['basics'],
    unlockedByPuzzleId: '001-first-steps',
    recapText: 'move("left"), move("right"), AND move("back") SIDE-STEP RELATIVE TO THE DRONE\'S HEADING.'
  },
  {
    id: 'rotation',
    title: 'Robot Rotation',
    unlocksCommandIds: ['rotate'],
    docMarkdown:
      '## Robot Rotation\n\n' +
      'Allows you to turn the robot in place 90 degrees using `rotate(direction)`:\n\n' +
      '- `rotate("left")`\n' +
      '- `rotate("right")`',
    prerequisiteNodeIds: ['move-directions'],
    unlockedByPuzzleId: '002-around-the-wall',
    recapText: 'rotate("left") AND rotate("right") SPIN THE UNIT 90 DEGREES IN-PLACE.'
  },
  {
    id: 'grab-drop',
    title: 'Cargo Operations',
    unlocksCommandIds: ['grab', 'drop'],
    docMarkdown:
      '## Cargo Operations\n\n' +
      'Allows retrieval and loading of storage crates:\n\n' +
      '- `grab()`: picks up cargo directly in front of the robot\n' +
      '- `drop()`: releases cargo at the robot\'s current tile',
    prerequisiteNodeIds: ['rotation'],
    unlockedByPuzzleId: '003-pickup-and-delivery',
    recapText: 'grab() SECURES THE ADJACENT CRATE IN FRONT. drop() RELEASES IT ON THE DRONE\'S CURRENT COORDINATE.'
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
    prerequisiteNodeIds: ['grab-drop'],
    unlockedByPuzzleId: '004-first-delivery',
    recapText: 'is_holding() DETECTS CARGO. can_move(direction) SENSES BOUNDARIES AND WALLS BEFORE WE COLLIDE.'
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
    unlockedByPuzzleId: '005-around-the-bend',
    recapText: 'if/else STRUCTURES ALLOW FOR REACTIVE SUB-ROUTINES BASED ON SENSOR FEEDBACK.'
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
