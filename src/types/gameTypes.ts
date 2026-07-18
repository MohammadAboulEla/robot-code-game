/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PythonToken {
  type: 'comment' | 'string' | 'number' | 'keyword' | 'function' | 'identifier' | 'whitespace' | 'punctuation';
  text: string;
}
