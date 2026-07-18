/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PythonToken } from '../types/gameTypes';

export const tokenizePython = (text: string): PythonToken[] => {
  const regex = /(#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+\b)|(\b(?:def|class|if|elif|else|for|while|in|import|from|return|and|or|not|True|False|None|pass)\b)|(\b(?:move|rotate|grab|drop|is_holding|can_move|range|print)\b)|([a-zA-Z_][a-zA-Z0-9_]*)|(\s+)|(.)/g;
  
  const tokens: PythonToken[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1] !== undefined) {
      tokens.push({ type: 'comment', text: match[1] });
    } else if (match[2] !== undefined) {
      tokens.push({ type: 'string', text: match[2] });
    } else if (match[3] !== undefined) {
      tokens.push({ type: 'number', text: match[3] });
    } else if (match[4] !== undefined) {
      tokens.push({ type: 'keyword', text: match[4] });
    } else if (match[5] !== undefined) {
      tokens.push({ type: 'function', text: match[5] });
    } else if (match[6] !== undefined) {
      tokens.push({ type: 'identifier', text: match[6] });
    } else if (match[7] !== undefined) {
      tokens.push({ type: 'whitespace', text: match[7] });
    } else if (match[8] !== undefined) {
      tokens.push({ type: 'punctuation', text: match[8] });
    }
  }
  return tokens;
};
