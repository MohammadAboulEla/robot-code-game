/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CommandDefinition } from './types/gameTypes';
import { MoveError } from './game/commands/commands';

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
  type: 'move' | 'rotate' | 'grab' | 'drop' | 'assign' | 'loop_step' | 'pass' | 'error' | 'success' | 'if_step' | 'print';
  args: any[];
  success: boolean;
  message?: string;
  beforeState: GameWorldState;
  afterState: GameWorldState;
  variables?: Record<string, any>;
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
    const eqIdx = text.indexOf('=');
    if (eqIdx !== -1 && text[eqIdx + 1] !== '=' && text[eqIdx - 1] !== '=' && text[eqIdx - 1] !== '!' && text[eqIdx - 1] !== '<' && text[eqIdx - 1] !== '>') {
      const name = text.slice(0, eqIdx).trim();
      const expr = text.slice(eqIdx + 1).trim();
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
  private commandRegistry: Map<string, CommandDefinition>;
  private successCondition: 'cargo-delivery' | 'any-print' | 'robot-on-target' | 'print-exact';
  private hasPrinted = false;
  private expectedOutput?: string;
  private printedValues: string[] = [];

  constructor(
    initialState: GameWorldState,
    commandRegistry: Map<string, CommandDefinition>,
    successCondition: 'cargo-delivery' | 'any-print' | 'robot-on-target' | 'print-exact' = 'cargo-delivery',
    expectedOutput?: string
  ) {
    this.state = cloneState(initialState);
    this.commandRegistry = commandRegistry;
    this.successCondition = successCondition;
    this.expectedOutput = expectedOutput;
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
      afterState: afterState || cloneState(this.state),
      variables: Object.fromEntries(this.variables)
    });
  }

  private evalExpression(expr: any): any {
    if (expr && typeof expr === 'object' && 'identifier' in expr) {
      return evaluateArithmetic(expr.identifier, this.variables);
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
      return this.canMoveInDirection(direction);
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

  /**
   * Inline can_move check for evalCondition. Stays here because it's a
   * condition-evaluator builtin, not a callable command.
   */
  private canMoveInDirection(relativeDir: string): boolean {
    const headings: ('up' | 'right' | 'down' | 'left')[] = ['up', 'right', 'down', 'left'];
    const idx = headings.indexOf(this.state.robot.facing);
    if (idx === -1) return false;

    let targetIdx = idx;
    if (relativeDir === 'front') targetIdx = idx;
    else if (relativeDir === 'right') targetIdx = (idx + 1) % 4;
    else if (relativeDir === 'back') targetIdx = (idx + 2) % 4;
    else if (relativeDir === 'left') targetIdx = (idx + 3) % 4;
    else return false;

    const absDir = headings[targetIdx];
    let dx = 0, dy = 0;
    if (absDir === 'up') dy = -1;
    else if (absDir === 'down') dy = 1;
    else if (absDir === 'left') dx = -1;
    else if (absDir === 'right') dx = 1;

    const nx = this.state.robot.x + dx;
    const ny = this.state.robot.y + dy;

    if (nx < 0 || nx >= this.state.gridSize.width || ny < 0 || ny >= this.state.gridSize.height) return false;
    if (this.state.obstacles.some(o => o.x === nx && o.y === ny)) return false;
    return true;
  }

  public run(statements: Statement[]): VMAction[] {
    try {
      this.executeBlock(statements);
      
      // Final win condition check at end of script
      let isWin = false;
      let winMessage = '';

      if (this.successCondition === 'any-print') {
        isWin = this.hasPrinted;
        winMessage = isWin 
          ? 'Success! You executed a print command and communicated with the robot!'
          : 'Failed. You need to print a message to succeed.';
      } else if (this.successCondition === 'print-exact') {
        const lastPrint = this.printedValues[this.printedValues.length - 1];
        isWin = lastPrint === this.expectedOutput;
        winMessage = isWin
          ? `Success! Exact value matching confirmed: "${this.expectedOutput}" printed.`
          : `Failed. Expected terminal output: "${this.expectedOutput}", got: "${lastPrint || ''}".`;
      } else if (this.successCondition === 'robot-on-target') {
        isWin = this.state.robot.x === this.state.target.x && this.state.robot.y === this.state.target.y;
        winMessage = 'Success! The robot successfully reached the target destination!';
      } else {
        const boxOnTarget = this.state.box.x === this.state.target.x && this.state.box.y === this.state.target.y;
        isWin = boxOnTarget && !this.state.robot.holding;
        winMessage = 'Success! The box has been successfully delivered to the target pad!';
      }

      if (isWin) {
        this.addAction(
          statements[statements.length - 1]?.line || 1,
          'success',
          [],
          true,
          winMessage
        );
      } else {
        let msg = 'Script finished, but the box is not on the target pad.';
        if (this.successCondition === 'any-print') {
          msg = 'Script finished, but no print command was executed.';
        } else if (this.successCondition === 'print-exact') {
          const lastPrint = this.printedValues[this.printedValues.length - 1];
          msg = `Script finished, but did not print the expected output: "${this.expectedOutput}". Got: "${lastPrint || ''}".`;
        } else if (this.state.robot.holding) {
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
        const val = evaluateArithmetic(stmt.valueExpr, this.variables);
        this.variables.set(stmt.name, val);
        this.addAction(stmt.line, 'assign', [stmt.name, val], true, undefined, before, cloneState(this.state));
        continue;
      }

      if (stmt.type === 'for') {
        const rangeVal = Number(evaluateArithmetic(stmt.rangeExpr, this.variables));
        if (isNaN(rangeVal)) {
          throw new Error(`TypeError: range() expects an integer, got "${stmt.rangeExpr}"`);
        }
        for (let i = 0; i < rangeVal; i++) {
          const iterBefore = cloneState(this.state);
          this.variables.set(stmt.iterator, i);
          this.addAction(
            stmt.line,
            'assign',
            [stmt.iterator, i],
            true,
            undefined,
            iterBefore,
            cloneState(this.state)
          );
          this.executeBlock(stmt.body);
        }
        continue;
      }

      if (stmt.type === 'while') {
        let loopLimit = 0;
        while (true) {
          const checkBefore = cloneState(this.state);
          const cond = this.evalCondition(stmt.conditionExpr);
          this.addAction(
            stmt.line,
            'loop_step',
            [stmt.conditionExpr, cond],
            true,
            `While check: "${stmt.conditionExpr}" evaluates to ${cond ? 'True' : 'False'}`,
            checkBefore,
            cloneState(this.state)
          );
          if (!cond) break;

          loopLimit++;
          if (loopLimit > 200) {
            throw new Error(`InfiniteLoopError: While loop on line ${stmt.line} exceeded limit of 200 iterations.`);
          }
          this.executeBlock(stmt.body);
        }
        continue;
      }

      if (stmt.type === 'if') {
        const checkBefore = cloneState(this.state);
        const cond = this.evalCondition(stmt.conditionExpr);
        this.addAction(
          stmt.line,
          'if_step',
          [stmt.conditionExpr, cond],
          true,
          `If check: "${stmt.conditionExpr}" evaluates to ${cond ? 'True' : 'False'}`,
          checkBefore,
          cloneState(this.state)
        );
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

    const cmdDef = this.commandRegistry.get(name);
    if (!cmdDef) {
      throw new Error(`NameError: Command name "${name}" is not defined on the Robot API.`);
    }

    try {
      const result = cmdDef.execute(this.state, args);
      if (name === 'print') {
        this.hasPrinted = true;
        this.printedValues.push(args[0] !== undefined ? String(args[0]) : '');
      }
      const actionType = (name === 'move' || name === 'rotate' || name === 'grab' || name === 'drop' || name === 'print')
        ? name as VMAction['type']
        : 'pass';
      this.addAction(
        line,
        actionType,
        args,
        result.success,
        result.message,
        beforeState,
        cloneState(this.state)
      );
    } catch (err: any) {
      if (err instanceof MoveError) {
        // MoveError carries a user-facing display message for the action
        // and a thrown message for the error action
        const actionType = (name === 'move' || name === 'rotate' || name === 'grab' || name === 'drop' || name === 'print')
          ? name as VMAction['type']
          : 'pass';
        this.addAction(
          line,
          actionType,
          args,
          false,
          err.displayMessage,
          beforeState,
          cloneState(this.state)
        );
      }
      throw err;
    }
  }
}

// ── Arithmetic Expression Evaluator Helpers ──────────────────────────────

function tokenizeExpr(str: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < str.length) {
    const char = str[i];
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    // String literal
    if (char === '"' || char === "'") {
      const quote = char;
      let val = '';
      i++;
      while (i < str.length && str[i] !== quote) {
        val += str[i];
        i++;
      }
      if (i >= str.length) {
        throw new Error("SyntaxError: EOL while scanning string literal");
      }
      i++; // skip quote
      tokens.push(JSON.stringify(val));
      continue;
    }
    // Number literal
    if (/\d/.test(char) || (char === '.' && i + 1 < str.length && /\d/.test(str[i + 1]))) {
      let val = '';
      while (i < str.length && (/\d/.test(str[i]) || str[i] === '.')) {
        val += str[i];
        i++;
      }
      tokens.push(val);
      continue;
    }
    // Identifier
    if (/[a-zA-Z_]/.test(char)) {
      let val = '';
      while (i < str.length && /[a-zA-Z0-9_]/.test(str[i])) {
        val += str[i];
        i++;
      }
      tokens.push(val);
      continue;
    }
    // Parentheses
    if (char === '(' || char === ')') {
      tokens.push(char);
      i++;
      continue;
    }
    // Double character operators: //
    if (char === '/' && i + 1 < str.length && str[i + 1] === '/') {
      tokens.push('//');
      i += 2;
      continue;
    }
    // Single character operators: +, -, *, /, %
    if ('+-*/%'.includes(char)) {
      tokens.push(char);
      i++;
      continue;
    }
    throw new Error(`SyntaxError: Unknown character in expression: "${char}"`);
  }
  return tokens;
}

function evaluateArithmetic(exprStr: string, variables: Map<string, any>): any {
  const tokens = tokenizeExpr(exprStr);
  if (tokens.length === 0) {
    throw new Error("SyntaxError: Empty expression");
  }

  const outputQueue: any[] = [];
  const operatorStack: string[] = [];
  const precedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '//': 2,
    '%': 2,
  };

  for (const token of tokens) {
    if (token.startsWith('"') && token.endsWith('"')) {
      outputQueue.push(JSON.parse(token));
    } else if (!isNaN(Number(token))) {
      outputQueue.push(Number(token));
    } else if (token === 'True') {
      outputQueue.push(true);
    } else if (token === 'False') {
      outputQueue.push(false);
    } else if (precedence[token] !== undefined) {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== '(' &&
        precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
      ) {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.push(token);
    } else if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        outputQueue.push(operatorStack.pop());
      }
      if (operatorStack.length === 0) {
        throw new Error("SyntaxError: Mismatched parentheses");
      }
      operatorStack.pop();
    } else {
      if (!variables.has(token)) {
        throw new Error(`NameError: name "${token}" is not defined.`);
      }
      outputQueue.push(variables.get(token));
    }
  }

  while (operatorStack.length > 0) {
    const op = operatorStack.pop();
    if (op === '(' || op === ')') {
      throw new Error("SyntaxError: Mismatched parentheses");
    }
    outputQueue.push(op);
  }

  const stack: any[] = [];
  for (const item of outputQueue) {
    if (precedence[item] !== undefined) {
      if (stack.length < 2) {
        throw new Error("SyntaxError: Invalid expression");
      }
      const b = stack.pop();
      const a = stack.pop();
      let res: any;
      if (item === '+') {
        res = a + b;
      } else if (item === '-') {
        res = a - b;
      } else if (item === '*') {
        res = a * b;
      } else if (item === '/') {
        res = a / b;
      } else if (item === '//') {
        res = Math.floor(a / b);
      } else if (item === '%') {
        res = a % b;
      }
      stack.push(res);
    } else {
      stack.push(item);
    }
  }

  if (stack.length !== 1) {
    throw new Error("SyntaxError: Invalid expression");
  }
  return stack[0];
}

