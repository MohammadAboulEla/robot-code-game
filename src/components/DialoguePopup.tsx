/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import type { DialogueScript } from '../types/dialogueTypes';
import { EXPRESSION_SPRITE_MAP } from '../types/dialogueTypes';
import spriteSheet from '../../assets/sprite.png';

interface DialoguePopupProps {
  script: DialogueScript;
  onComplete: () => void;
}

/**
 * Bottom-anchored game dialogue box with large robot portrait on the left,
 * name plate, message text, and NEXT / SKIP / CLOSE buttons.
 */
export const DialoguePopup: React.FC<DialoguePopupProps> = ({ script, onComplete }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const line = script.lines[currentLineIndex];
  if (!line) return null;

  const spriteCoords = EXPRESSION_SPRITE_MAP[line.expression];
  const bgPosX = spriteCoords.col * 50;
  const bgPosY = spriteCoords.row * 50;

  const isLastLine = currentLineIndex >= script.lines.length - 1;

  const handleNext = () => {
    if (!isLastLine) {
      setCurrentLineIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    // Jump to last line
    setCurrentLineIndex(script.lines.length - 1);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] pointer-events-none animate-fade-in">
      <div className="pointer-events-auto flex items-end max-w-3xl mx-auto px-4 pb-6">

        {/* Robot portrait — large, overlapping the box */}
        <div className="relative z-10 shrink-0 -mr-2 mb-0" style={{ width: '180px' }}>
          <div
            className="w-[170px] h-[170px]"
            style={{
              backgroundImage: `url(${spriteSheet})`,
              backgroundSize: '300% 300%',
              backgroundPosition: `${bgPosX}% ${bgPosY}%`,
              imageRendering: 'auto',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
            }}
          />
        </div>

        {/* Dialogue box */}
        <div className="flex-1 min-w-0 -ml-4 mb-0 animate-bubble">
          {/* Name plate tab */}
          <div
            className="inline-block px-5 py-1.5 ml-8 relative"
            style={{
              backgroundColor: '#3e382d',
              borderRadius: '6px 6px 0 0',
              borderTop: '2px solid #2e2a22',
              borderLeft: '2px solid #2e2a22',
              borderRight: '2px solid #2e2a22',
              bottom: '-2px',
              position: 'relative',
            }}
          >
            <span className="text-[11px] font-mono font-bold tracking-[0.15em] text-[#faf8f2] uppercase">
              {line.speaker}
            </span>
          </div>

          {/* Text body */}
          <div
            style={{
              backgroundColor: '#f4efe1',
              border: '2px solid #2e2a22',
              borderRadius: '0 8px 8px 8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.5)',
            }}
          >
            <div className="px-5 pt-4 pb-3">
              <p className="text-[13px] text-[#2e2a22] leading-[1.7] font-mono font-bold uppercase"
                style={{ letterSpacing: '0.03em' }}
              >
                {line.text}
              </p>
            </div>

            {/* Button row */}
            <div className="flex justify-end gap-2 px-5 pb-4">
              {!isLastLine && (
                <button
                  onClick={handleNext}
                  className="dialogue-btn"
                >
                  Next
                </button>
              )}
              {!isLastLine && (
                <button
                  onClick={handleSkip}
                  className="dialogue-btn"
                >
                  Skip
                </button>
              )}
              <button
                onClick={onComplete}
                className="dialogue-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
