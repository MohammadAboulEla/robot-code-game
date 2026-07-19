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
    <div 
      className="fixed inset-0 z-[100] flex flex-col justify-end items-center pb-6 bg-black/45 animate-fade-in"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Wrapper: relative so portrait can overlap the left edge */}
      <div className="relative" style={{ width: '680px' }}>

          {/* Robot portrait — absolutely positioned, overlapping left edge */}
          <div
            className="absolute z-10"
            style={{
              width: '350px',
              height: '350px',
              left: '-150px',
              bottom: '-50px',
              backgroundImage: `url(${spriteSheet})`,
              backgroundSize: '300% 300%',
              backgroundPosition: `${bgPosX}% ${bgPosY}%`,
              imageRendering: 'auto',
              filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.45))',
            }}
          />

          {/* Name plate tab — centered above the box */}
          <div className="flex justify-center mb-[-2px] relative z-0">
            <div
              className="px-6 py-1.5"
              style={{
                backgroundColor: '#3e382d',
                borderRadius: '6px 6px 0 0',
                borderTop: '2px solid #2e2a22',
                borderLeft: '2px solid #2e2a22',
                borderRight: '2px solid #2e2a22',
              }}
            >
              <span className="text-[11px] font-mono font-bold tracking-[0.15em] text-[#faf8f2] uppercase">
                {line.speaker}
              </span>
            </div>
          </div>

          {/* Dialogue box — fixed dimensions */}
          <div
            className="animate-bubble"
            style={{
              width: '680px',
              height: '180px',
              backgroundColor: '#f4efe1',
              border: '2px solid #2e2a22',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.5)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Text content — left padding clears the portrait */}
            <div className="flex-1 overflow-y-auto" style={{ paddingLeft: '130px', paddingRight: '20px', paddingTop: '16px', paddingBottom: '8px' }}>
              <p className="text-[13px] text-[#2e2a22] leading-[1.7] font-mono font-bold uppercase"
                style={{ letterSpacing: '0.03em' }}
              >
                {line.text}
              </p>
            </div>

            {/* Button row */}
            <div className="flex justify-end gap-2 px-5 pb-4 shrink-0">
              {!isLastLine && (
                <button onClick={handleNext} className="dialogue-btn">
                  Next
                </button>
              )}
              {/* Temporarily disabled Skip button:
              {!isLastLine && (
                <button onClick={handleSkip} className="dialogue-btn">
                  Skip
                </button>
              )}
              */}
              {/* Close button only appears on the last line to prevent premature closing */}
              {isLastLine && (
                <button onClick={onComplete} className="dialogue-btn">
                  Close
                </button>
              )}
              {/* Original Close button (always visible):
              <button onClick={onComplete} className="dialogue-btn">
                Close
              </button>
              */}
            </div>
          </div>
        </div>
      </div>
  );
};
