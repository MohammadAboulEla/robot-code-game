/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import type { DialogueScript } from '../types/dialogueTypes';
import { EXPRESSION_SPRITE_MAP } from '../types/dialogueTypes';
import spriteSheet from '../../assets/sprite.jpeg';

interface DialoguePopupProps {
  script: DialogueScript;
  onComplete: () => void;
}

/**
 * Modal dialogue popup with robot portrait, "[NEW TRANSMISSION]" header,
 * message text, and confirm button. Advances through script lines sequentially.
 */
export const DialoguePopup: React.FC<DialoguePopupProps> = ({ script, onComplete }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const line = script.lines[currentLineIndex];
  if (!line) return null;

  const spriteCoords = EXPRESSION_SPRITE_MAP[line.expression];
  // Each cell is 33.333% of the 3×3 sheet
  const bgPosX = spriteCoords.col * 50;
  const bgPosY = spriteCoords.row * 50;

  const handleConfirm = () => {
    if (currentLineIndex < script.lines.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
    >
      <div
        className="bg-[#f4efe1] border-2 border-[#3e382d] shadow-2xl max-w-xl w-full mx-4 animate-bubble"
        style={{ boxShadow: '0 0 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)' }}
      >
        {/* Transmission header bar */}
        <div className="bg-[#2e2a22] px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#9c3526] animate-pulse" style={{ borderRadius: '1px' }} />
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#9c3526] uppercase">
              New Transmission
            </span>
          </div>
          <span className="text-[9px] font-mono text-[#5c5341]">
            {currentLineIndex + 1} / {script.lines.length}
          </span>
        </div>

        {/* Content area */}
        <div className="flex gap-0">
          {/* Left: Robot portrait */}
          <div className="flex flex-col items-center justify-center p-4 border-r border-[#eae3ce] bg-[#eae3ce]/40 shrink-0"
               style={{ width: '140px' }}
          >
            <div
              className="w-[100px] h-[100px] border-2 border-[#3e382d] bg-white"
              style={{
                backgroundImage: `url(${spriteSheet})`,
                backgroundSize: '300% 300%',
                backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                imageRendering: 'auto',
              }}
            />
            <div className="mt-2 text-center">
              <div className="text-[10px] font-mono font-bold text-[#2e2a22] uppercase tracking-wider">
                {line.speaker}
              </div>
              <div className="text-[8px] font-mono text-[#5c5341] uppercase tracking-widest">
                // UNIT
              </div>
            </div>
          </div>

          {/* Right: Message + confirm */}
          <div className="flex-1 flex flex-col p-4 min-w-0">
            <p className="text-sm text-[#2e2a22] leading-relaxed font-mono flex-1">
              {line.text}
            </p>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-[#9c3526] hover:bg-[#852a1e] text-[#faf8f2] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#3e382d] cursor-pointer transition-colors"
              >
                {currentLineIndex < script.lines.length - 1 ? 'Continue ▸' : 'Confirm ▸'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
