/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef } from 'react';
import type { DialogueScript, DialogueTrigger } from '../types/dialogueTypes';
import { DIALOGUE_SCRIPTS } from '../dialogue/scripts';
import { DIALOGUE_TRIGGERS } from '../dialogue/triggers';

/**
 * Manages dialogue state: active script, trigger matching, and session dedup.
 */
export function useDialogue() {
  const [activeScript, setActiveScript] = useState<DialogueScript | null>(null);
  // Track which scripts have already fired this session to avoid re-triggering
  const firedScriptsRef = useRef<Set<string>>(new Set());

  const sendDialogue = useCallback((scriptId: string) => {
    const script = DIALOGUE_SCRIPTS[scriptId];
    if (script) {
      setActiveScript(script);
    }
  }, []);

  const dismissDialogue = useCallback(() => {
    setActiveScript(null);
  }, []);

  const fireDialogueTrigger = useCallback((
    trigger: DialogueTrigger,
    context?: { puzzleId?: string; commandId?: string }
  ) => {
    const match = DIALOGUE_TRIGGERS.find(t => {
      if (t.trigger !== trigger) return false;
      if (trigger === 'puzzleLoad' || trigger === 'puzzleSolved') {
        return t.puzzleId === context?.puzzleId;
      }
      if (trigger === 'commandFirstUsed') {
        return t.commandId === context?.commandId;
      }
      return true;
    });

    if (match && !firedScriptsRef.current.has(match.scriptId)) {
      firedScriptsRef.current.add(match.scriptId);
      sendDialogue(match.scriptId);
    }
  }, [sendDialogue]);

  return {
    activeScript,
    setActiveScript,
    sendDialogue,
    dismissDialogue,
    fireDialogueTrigger,
  };
}
