/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RobotState {
  x: number;
  y: number;
  holding: boolean;
  facing: 'up' | 'down' | 'left' | 'right';
}

export interface GameWorldState {
  robot: RobotState;
  box: { x: number; y: number };
  target: { x: number; y: number };
  gridSize: { width: number; height: number };
  obstacles: { x: number; y: number }[];
}

export interface VMAction {
  id: string;
  line: number;
  type: 'move' | 'rotate' | 'grab' | 'drop' | 'assign' | 'loop_step' | 'pass' | 'error' | 'success';
  args: any[];
  success: boolean;
  message?: string;
  beforeState: GameWorldState;
  afterState: GameWorldState;
}

export type Statement =
  | { type: 'command'; name: string; args: any[]; line: number }
  | { type: 'assign'; name: string; valueExpr: string; line: number }
  | { type: 'for'; iterator: string; rangeExpr: string; body: Statement[]; line: number }
  | { type: 'while'; conditionExpr: string; body: Statement[]; line: number }
  | { type: 'if'; conditionExpr: string; body: Statement[]; elseBody?: Statement[]; line: number }
  | { type: 'pass'; line: number };

interface Line {
  originalIndex: number;
  indent: number;
  text: string;
}

/**
 * Parses in-browser Python-like code into a simple AST of Statements.
 */
export function parsePython(code: string): Statement[] {
  const rawLines = code.split('\n');
  const lines: Line[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    // Strip comments starting with '#'
    const commentIndex = rawLine.indexOf('#');
    let cleanLine = commentIndex !== -1 ? rawLine.slice(0, commentIndex) : rawLine;
    
    // Check if line is empty/whitespace only
    if (cleanLine.trim() === '') {
      continue;
    }

    // Measure indent (number of spaces or tabs at the start)
    const matchIndent = rawLine.match(/^(\s*)/);
    const indent = matchIndent ? matchIndent[1].length : 0;

    lines.push({
      originalIndex: i,
      indent,
      text: cleanLine.trim()
    });
  }

  const [statements] = parseBlocks(lines, 0, 0);
  return statements;
}

function parseBlocks(lines: Line[], startIndex: number, parentIndent: number): [Statement[], number] {
  const statements: Statement[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i];
    
    if (line.indent < parentIndent) {
      break;
    }
    
    if (line.indent > parentIndent) {
      throw new Error(`Unexpected indentation at line ${line.originalIndex + 1}. Expected indent of ${parentIndent} spaces.`);
    }

    const text = line.text;
    const lineNum = line.originalIndex + 1;

    // 1. For loop
    if (text.startsWith('for ') && text.endsWith(':')) {
      const match = text.match(/^for\s+(\w+)\s+in\s+range\(([^)]+)\)\s*:$/);
      if (!match) {
        throw new Error(`Syntax Error on line ${lineNum}: Invalid for-loop syntax. Example: "for i in range(5):"`);
      }
      const iterator = match[1];
      const rangeExpr = match[2].trim();

      // Find children (lines with higher indentation)
      const childLines: Line[] = [];
      let j = i + 1;
      let childIndent = -1;
      while (j < lines.length) {
        const nextLine = lines[j];
        if (nextLine.indent <= line.indent) {
          break;
        }
        if (childIndent === -1) {
          childIndent = nextLine.indent;
        }
        childLines.push(nextLine);
        j++;
      }

      if (childLines.length === 0) {
        throw new Error(`Syntax Error on line ${lineNum}: Expected an indented block after "for".`);
      }

      const [body] = parseBlocks(childLines, 0, childIndent);
      statements.push({
        type: 'for',
        iterator,
        rangeExpr,
        body,
        line: lineNum
      });
      i = j;
      continue;
    }

    // 2. If statements
    if (text.startsWith('if ') && text.endsWith(':')) {
      const match = text.match(/^if\s+(.+)\s*:$/);
      if (!match) {
        throw new Error(`Syntax Error on line ${lineNum}: Invalid if statement syntax. Example: "if is_holding():"`);
      }
      const conditionExpr = match[1].trim();

      const childLines: Line[] = [];
      let j = i + 1;
      let childIndent = -1;
      while (j < lines.length) {
        const nextLine = lines[j];
        if (nextLine.indent <= line.indent) {
          break;
        }
        if (childIndent === -1) {
          childIndent = nextLine.indent;
        }
        childLines.push(nextLine);
        j++;
      }

      if (childLines.length === 0) {
        throw new Error(`Syntax Error on line ${lineNum}: Expected an indented block after "if".`);
      }

      const [body] = parseBlocks(childLines, 0, childIndent);

      // Check for else
      let elseBody: Statement[] | undefined;
      if (j < lines.length && lines[j].indent === line.indent && lines[j].text === 'else:') {
        const elseLineNum = lines[j].originalIndex + 1;
        const elseChildLines: Line[] = [];
        let k = j + 1;
        let elseChildIndent = -1;
        while (k < lines.length) {
          const nextLine = lines[k];
          if (nextLine.indent <= lines[j].indent) {
            break;
          }
          if (elseChildIndent === -1) {
            elseChildIndent = nextLine.indent;
          }
          elseChildLines.push(nextLine);
          k++;
        }

        if (elseChildLines.length === 0) {
          throw new Error(`Syntax Error on line ${elseLineNum}: Expected an indented block after "else:".`);
        }

        const [parsedElseBody] = parseBlocks(elseChildLines, 0, elseChildIndent);
        elseBody = parsedElseBody;
        j = k;
      }

      statements.push({
        type: 'if',
        conditionExpr,
        body,
        elseBody,
        line: lineNum
      });
      i = j;
      continue;
    }

    // 3. While statements
    if (text.startsWith('while ') && text.endsWith(':')) {
      const match = text.match(/^while\s+(.+)\s*:$/);
      if (!match) {
        throw new Error(`Syntax Error on line ${lineNum}: Invalid while loop syntax. Example: "while not is_holding():"`);
      }
      const conditionExpr = match[1].trim();

      const childLines: Line[] = [];
      let j = i + 1;
      let childIndent = -1;
      while (j < lines.length) {
        const nextLine = lines[j];
        if (nextLine.indent <= line.indent) {
          break;
        }
        if (childIndent === -1) {
          childIndent = nextLine.indent;
        }
        childLines.push(nextLine);
        j++;
      }

      if (childLines.length === 0) {
        throw new Error(`Syntax Error on line ${lineNum}: Expected an indented block after "while".`);
      }

      const [body] = parseBlocks(childLines, 0, childIndent);
      statements.push({
        type: 'while',
        conditionExpr,
        body,
        line: lineNum
      });
      i = j;
      continue;
    }

    // 4. Assignments
    if (text.includes('=')) {
      const parts = text.split('=');
      if (parts.length === 2) {
        const name = parts[0].trim();
        const expr = parts[1].trim();
        if (/^[a-zA-Z_]\w*$/.test(name)) {
          statements.push({
            type: 'assign',
            name,
            valueExpr: expr,
            line: lineNum
          });
          i++;
          continue;
        }
      }
    }

    // 5. Function calls
    const callMatch = text.match(/^([a-zA-Z_]\w*)\s*\((.*)\)$/);
    if (callMatch) {
      const name = callMatch[1];
      const argsStr = callMatch[2].trim();
      const args = argsStr ? argsStr.split(',').map(s => {
        const trimmed = s.trim();
        // String literal
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
          return trimmed.slice(1, -1);
        }
        // Number literal
        if (!isNaN(Number(trimmed))) {
          return Number(trimmed);
        }
        // Boolean or variable reference
        if (trimmed === 'True') return true;
        if (trimmed === 'False') return false;
        return { identifier: trimmed };
      }) : [];

      statements.push({
        type: 'command',
        name,
        args,
        line: lineNum
      });
      i++;
      continue;
    }

    if (text === 'pass') {
      statements.push({
        type: 'pass',
        line: lineNum
      });
      i++;
      continue;
    }

    throw new Error(`Syntax Error on line ${lineNum}: Unrecognized command "${text}".`);
  }

  return [statements, i];
}

/**
 * Deep clone of GameWorldState to prevent state mutation in action sequence
 */
export function cloneState(state: GameWorldState): GameWorldState {
  return {
    robot: { ...state.robot },
    box: { ...state.box },
    target: { ...state.target },
    gridSize: { ...state.gridSize },
    obstacles: state.obstacles.map(o => ({ ...o }))
  };
}

/**
 * Executes parsed AST statements virtually on initialWorldState and builds a detailed Action Queue.
 */
export class PythonExecutor {
  private variables: Map<string, any> = new Map();
  private state: GameWorldState;
  private actions: VMAction[] = [];
  private currentId = 0;
  private maxInstructions = 1000;
  private instructionCount = 0;

  constructor(initialState: GameWorldState) {
    this.state = cloneState(initialState);
  }

  private addAction(
    line: number,
    type: VMAction['type'],
    args: any[],
    success: boolean,
    message?: string,
    beforeState?: GameWorldState,
    afterState?: GameWorldState
  ) {
    this.currentId++;
    this.actions.push({
      id: `action_${this.currentId}`,
      line,
      type,
      args,
      success,
      message,
      beforeState: beforeState || cloneState(this.state),
      afterState: afterState || cloneState(this.state)
    });
  }

  private evalExpression(expr: any): any {
    if (expr && typeof expr === 'object' && 'identifier' in expr) {
      const varName = expr.identifier;
      if (!this.variables.has(varName)) {
        throw new Error(`NameError: name "${varName}" is not defined.`);
      }
      return this.variables.get(varName);
    }
    return expr;
  }

  private evalCondition(exprStr: string): boolean {
    const trimmed = exprStr.trim();
    if (trimmed === 'True') return true;
    if (trimmed === 'False') return false;

    // Negation: not is_holding()
    if (trimmed.startsWith('not ')) {
      const subExpr = trimmed.slice(4).trim();
      return !this.evalCondition(subExpr);
    }

    // sensory check: is_holding()
    if (trimmed === 'is_holding()') {
      return this.state.robot.holding;
    }

    // sensory check: can_move("direction")
    const canMoveMatch = trimmed.match(/^can_move\s*\(\s*(['"])(.+?)\1\s*\)$/);
    if (canMoveMatch) {
      const direction = canMoveMatch[2];
      return this.canMoveDirection(direction);
    }

    // evaluate numeric/variable expressions or equalities
    // support is_holding() == True etc.
    if (trimmed.includes('==')) {
      const parts = trimmed.split('==');
      if (parts.length === 2) {
        const left = this.evalCondition(parts[0].trim());
        const right = this.evalCondition(parts[1].trim());
        return left === right;
      }
    }

    // If it's a defined variable
    if (this.variables.has(trimmed)) {
      return !!this.variables.get(trimmed);
    }

    throw new Error(`RuntimeError: Condition "${exprStr}" is not recognized.`);
  }

  private getAbsoluteDirection(relativeDir: string): 'up' | 'down' | 'left' | 'right' {
    const headings: ('up' | 'right' | 'down' | 'left')[] = ['up', 'right', 'down', 'left'];
    const currentHeading = this.state.robot.facing;
    const idx = headings.indexOf(currentHeading);
    if (idx === -1) {
      throw new Error(`RuntimeError: Invalid robot facing orientation: ${currentHeading}`);
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

  private canMoveDirection(relativeDir: string): boolean {
    let absoluteDir: 'up' | 'down' | 'left' | 'right';
    try {
      absoluteDir = this.getAbsoluteDirection(relativeDir);
    } catch {
      return false;
    }

    let dx = 0;
    let dy = 0;
    if (absoluteDir === 'up') dy = -1;
    else if (absoluteDir === 'down') dy = 1;
    else if (absoluteDir === 'left') dx = -1;
    else if (absoluteDir === 'right') dx = 1;

    const nx = this.state.robot.x + dx;
    const ny = this.state.robot.y + dy;

    // Grid boundary check
    if (nx < 0 || nx >= this.state.gridSize.width || ny < 0 || ny >= this.state.gridSize.height) {
      return false;
    }

    // Obstacle check
    const hitObstacle = this.state.obstacles.some(o => o.x === nx && o.y === ny);
    if (hitObstacle) {
      return false;
    }

    return true;
  }

  public run(statements: Statement[]): VMAction[] {
    try {
      this.executeBlock(statements);
      
      // Final win condition check at end of script
      const boxOnTarget = this.state.box.x === this.state.target.x && this.state.box.y === this.state.target.y;
      if (boxOnTarget && !this.state.robot.holding) {
        this.addAction(
          statements[statements.length - 1]?.line || 1,
          'success',
          [],
          true,
          'Success! The box has been successfully delivered to the target pad!'
        );
      } else {
        // If script ended but box is not on target or still holding it
        let msg = 'Script finished, but the box is not on the target pad.';
        if (this.state.robot.holding) {
          msg = 'Script finished, but the robot is still holding the box.';
        }
        this.addAction(
          statements[statements.length - 1]?.line || 1,
          'pass',
          [],
          true,
          msg
        );
      }
    } catch (err: any) {
      const errMsg = err.message || 'An unknown error occurred during execution.';
      this.addAction(
        this.actions[this.actions.length - 1]?.line || 1,
        'error',
        [],
        false,
        errMsg
      );
    }
    return this.actions;
  }

  private executeBlock(statements: Statement[]) {
    for (const stmt of statements) {
      this.instructionCount++;
      if (this.instructionCount > this.maxInstructions) {
        throw new Error(`InfiniteLoopError: Program execution exceeded safe instruction limit of ${this.maxInstructions} operations.`);
      }

      const before = cloneState(this.state);

      if (stmt.type === 'pass') {
        this.addAction(stmt.line, 'pass', [], true, undefined, before, cloneState(this.state));
        continue;
      }

      if (stmt.type === 'assign') {
        const val = this.evalExpression(stmt.valueExpr);
        // support numbers or range/string expressions
        if (!isNaN(Number(stmt.valueExpr))) {
          this.variables.set(stmt.name, Number(stmt.valueExpr));
        } else {
          this.variables.set(stmt.name, val);
        }
        this.addAction(stmt.line, 'assign', [stmt.name, val], true, undefined, before, cloneState(this.state));
        continue;
      }

      if (stmt.type === 'for') {
        const rangeVal = Number(this.evalExpression(stmt.rangeExpr));
        if (isNaN(rangeVal)) {
          throw new Error(`TypeError: range() expects an integer, got "${stmt.rangeExpr}"`);
        }
        for (let i = 0; i < rangeVal; i++) {
          this.variables.set(stmt.iterator, i);
          this.executeBlock(stmt.body);
        }
        continue;
      }

      if (stmt.type === 'while') {
        let loopLimit = 0;
        while (this.evalCondition(stmt.conditionExpr)) {
          loopLimit++;
          if (loopLimit > 200) {
            throw new Error(`InfiniteLoopError: While loop on line ${stmt.line} exceeded limit of 200 iterations.`);
          }
          this.executeBlock(stmt.body);
        }
        continue;
      }

      if (stmt.type === 'if') {
        const cond = this.evalCondition(stmt.conditionExpr);
        if (cond) {
          this.executeBlock(stmt.body);
        } else if (stmt.elseBody) {
          this.executeBlock(stmt.elseBody);
        }
        continue;
      }

      if (stmt.type === 'command') {
        this.executeCommand(stmt.name, stmt.args, stmt.line, before);
      }
    }
  }

  private executeCommand(name: string, rawArgs: any[], line: number, beforeState: GameWorldState) {
    const args = rawArgs.map(arg => this.evalExpression(arg));

    if (name === 'move') {
      const relativeDir = args[0];
      if (relativeDir !== 'front' && relativeDir !== 'back' && relativeDir !== 'left' && relativeDir !== 'right') {
        throw new Error(`ValueError: move() requires one of "front", "back", "left", "right". Got: ${JSON.stringify(relativeDir)}`);
      }

      const absoluteDir = this.getAbsoluteDirection(relativeDir);

      let dx = 0;
      let dy = 0;
      if (absoluteDir === 'up') dy = -1;
      else if (absoluteDir === 'down') dy = 1;
      else if (absoluteDir === 'left') dx = -1;
      else if (absoluteDir === 'right') dx = 1;

      const nx = this.state.robot.x + dx;
      const ny = this.state.robot.y + dy;

      // Obstacle collision checking
      const hitObstacle = this.state.obstacles.some(o => o.x === nx && o.y === ny);
      if (hitObstacle) {
        this.addAction(
          line,
          'move',
          [relativeDir],
          false,
          `Collision! The robot crashed into an obstacle at grid coordinate (${nx}, ${ny}).`,
          beforeState,
          cloneState(this.state)
        );
        throw new Error(`CollisionError: Crashed into obstacle at (${nx}, ${ny}).`);
      }

      // Border bounds checking
      if (nx < 0 || nx >= this.state.gridSize.width || ny < 0 || ny >= this.state.gridSize.height) {
        this.addAction(
          line,
          'move',
          [relativeDir],
          false,
          `Boundary Collision! The robot attempted to walk off the grid at coordinate (${nx}, ${ny}).`,
          beforeState,
          cloneState(this.state)
        );
        throw new Error(`BoundaryError: Robot fell off the grid boundary at (${nx}, ${ny}).`);
      }

      this.state.robot.x = nx;
      this.state.robot.y = ny;

      // If robot is holding the box, move the box with the robot
      if (this.state.robot.holding) {
        this.state.box.x = nx;
        this.state.box.y = ny;
      }

      this.addAction(
        line,
        'move',
        [relativeDir],
        true,
        `Robot successfully moved ${relativeDir} to (${nx}, ${ny}).`,
        beforeState,
        cloneState(this.state)
      );
      return;
    }

    if (name === 'rotate') {
      const direction = args[0];
      if (direction !== 'left' && direction !== 'right') {
        throw new Error(`ValueError: rotate() requires either "left" or "right". Got: ${JSON.stringify(direction)}`);
      }

      const headings: ('up' | 'right' | 'down' | 'left')[] = ['up', 'right', 'down', 'left'];
      const currentHeading = this.state.robot.facing;
      const idx = headings.indexOf(currentHeading);
      if (idx === -1) {
        throw new Error(`RuntimeError: Invalid robot facing orientation: ${currentHeading}`);
      }

      let nextIdx = idx;
      if (direction === 'right') {
        nextIdx = (idx + 1) % 4;
      } else {
        nextIdx = (idx + 3) % 4;
      }
      const newHeading = headings[nextIdx];
      this.state.robot.facing = newHeading;

      this.addAction(
        line,
        'rotate',
        [direction],
        true,
        `Robot successfully rotated ${direction} to face ${newHeading}.`,
        beforeState,
        cloneState(this.state)
      );
      return;
    }

    if (name === 'grab') {
      if (this.state.robot.holding) {
        throw new Error(`RuntimeError: Robot is already holding the box! Can only hold one item.`);
      }

      let facedX = this.state.robot.x;
      let facedY = this.state.robot.y;
      if (this.state.robot.facing === 'up') facedY -= 1;
      else if (this.state.robot.facing === 'down') facedY += 1;
      else if (this.state.robot.facing === 'left') facedX -= 1;
      else if (this.state.robot.facing === 'right') facedX += 1;

      const isFacingBox = facedX === this.state.box.x && facedY === this.state.box.y;

      if (!isFacingBox) {
        const isWithBox = this.state.robot.x === this.state.box.x && this.state.robot.y === this.state.box.y;
        let errMsg = `Grab failed! The robot is not facing the cargo box at (${this.state.box.x}, ${this.state.box.y}).`;
        if (isWithBox) {
          errMsg = `Grab failed! The robot is standing directly on the cargo box. Step back and face it to grab it.`;
        } else {
          const isAdjacent = Math.abs(this.state.robot.x - this.state.box.x) + Math.abs(this.state.robot.y - this.state.box.y) === 1;
          if (isAdjacent) {
            errMsg = `Grab failed! The robot is adjacent to the box but facing ${this.state.robot.facing} instead of facing the box.`;
          }
        }

        this.addAction(
          line,
          'grab',
          [],
          false,
          errMsg,
          beforeState,
          cloneState(this.state)
        );
        throw new Error(`GrabError: Robot is not correctly facing the box to grab it.`);
      }

      this.state.robot.holding = true;
      this.state.box.x = this.state.robot.x;
      this.state.box.y = this.state.robot.y;

      this.addAction(
        line,
        'grab',
        [],
        true,
        `Grab successful! The robot is now holding the box.`,
        beforeState,
        cloneState(this.state)
      );
      return;
    }

    if (name === 'drop') {
      if (!this.state.robot.holding) {
        this.addAction(
          line,
          'drop',
          [],
          false,
          `Drop failed! The robot is not holding anything to drop.`,
          beforeState,
          cloneState(this.state)
        );
        throw new Error(`DropError: Robot is not holding the box.`);
      }

      this.state.robot.holding = false;
      this.state.box.x = this.state.robot.x;
      this.state.box.y = this.state.robot.y;

      this.addAction(
        line,
        'drop',
        [],
        true,
        `Drop successful! The robot dropped the box at (${this.state.robot.x}, ${this.state.robot.y}).`,
        beforeState,
        cloneState(this.state)
      );
      return;
    }

    throw new Error(`NameError: Command name "${name}" is not defined on the Robot API.`);
  }
}
