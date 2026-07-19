/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { DialogueScript } from '../types/dialogueTypes';
import { EXPRESSION_SPRITE_MAP } from '../types/dialogueTypes';
import spriteSheet from '../../assets/sprite.png';
import { tokenizePython } from '../utils/pythonTokenizer';

interface DialoguePopupProps {
  script: DialogueScript;
  onComplete: () => void;
}

/**
 * Formats the speaker name into the SPEKER [ROBOT UNIT ID: XXX] layout
 */
const formatSpeakerHeader = (speaker: string) => {
  // e.g. "SYSTEM DROID UNIT-R07" -> "SYSTEM DROID [ROBOT UNIT ID: R-07]"
  const match = speaker.match(/^(SYSTEM DROID)\s+(UNIT-R\d+)$/i);
  if (match) {
    return `${match[1]} [ROBOT UNIT ID: ${match[2].replace('UNIT-', '')}]`;
  }
  return speaker;
};

/**
 * Parser that tokenizes dialogue text and highlights python functions and keywords.
 */
const renderDialogueText = (text: string) => {
  // Regex to extract Python function calls and highlighted words
  const regex = /(\b(?:move|rotate|grab|drop|is_holding|can_move|range|print)\s*\([^)]*\))|(\b(?:PROGRAMMER|OPERATOR|PYTHON|CARGO(?:\s+BOX)?|ROBOT|A-1|UNIT\s+R-07|SYSTEM\s+DROID|SCRIPT|COMMANDS?|PROTOCOL|DELIVERY)\b)/gi;

  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    const isFunctionCall = /^(?:move|rotate|grab|drop|is_holding|can_move|range|print)\s*\(/i.test(part);
    if (isFunctionCall) {
      const tokens = tokenizePython(part);
      return (
        <span key={index} className="font-extrabold font-mono inline-block">
          {tokens.map((token, i) => {
            let colorClass = "text-[#2e2a22]";
            if (token.type === 'comment') {
              colorClass = "text-[#8a7c62] italic";
            } else if (token.type === 'string') {
              colorClass = "text-[#4d7c0f] font-semibold";
            } else if (token.type === 'number') {
              colorClass = "text-[#b8005b]";
            } else if (token.type === 'keyword') {
              colorClass = "text-[#9c3526] font-bold";
            } else if (token.type === 'function') {
              colorClass = "text-[#1a6596] font-bold";
            } else if (token.type === 'punctuation') {
              colorClass = "text-[#5c5341]";
            }
            return (
              <span key={i} className={colorClass}>
                {token.text}
              </span>
            );
          })}
        </span>
      );
    }

    const isTerm = /^(?:PROGRAMMER|OPERATOR|PYTHON|CARGO(?:\s+BOX)?|ROBOT|A-1|UNIT\s+R-07|SYSTEM\s+DROID|SCRIPT|COMMANDS?|PROTOCOL|DELIVERY)$/i.test(part);
    if (isTerm) {
      return (
        <span key={index} className="text-[#1a6596] font-extrabold">
          {part}
        </span>
      );
    }

    return <span key={index}>{part}</span>;
  });
};

/**
 * Skeuomorphic retro-futuristic dialogue popup mimicking the provided design references.
 */
export const DialoguePopup: React.FC<DialoguePopupProps> = ({ script, onComplete }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const line = script.lines[currentLineIndex];
  
  const isLastLine = currentLineIndex >= script.lines.length - 1;

  const handleNext = () => {
    if (!isLastLine) {
      setCurrentLineIndex(prev => prev + 1);
    }
  };

  // Keyboard navigation listener (Enter/Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isLastLine) {
          onComplete();
        } else {
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLastLine, onComplete]);

  if (!line) return null;

  const spriteCoords = EXPRESSION_SPRITE_MAP[line.expression];
  const bgPosX = spriteCoords.col * 50;
  const bgPosY = spriteCoords.row * 50;

  const handleAdvance = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLastLine) {
      onComplete();
    } else {
      handleNext();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex justify-center items-center bg-black/55 backdrop-blur-[1px] animate-fade-in"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Outer Metallic Bezel Frame */}
      <div 
        onClick={handleAdvance}
        className="relative w-[820px] min-h-[340px] flex flex-col bg-gradient-to-br from-[#c8c0ae] via-[#a89e8b] to-[#7c7260] border-3 border-[#3e382d] rounded-[28px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6),inset_0_2px_2px_rgba(255,255,255,0.45),inset_0_-2px_2px_rgba(0,0,0,0.45)] select-none cursor-pointer"
      >

        {/* Inner Recessed Panel Container */}
        <div className="m-3.5 p-4 bg-[#b5ad98] border-2 border-[#3e382d] rounded-[18px] shadow-[inset_0_4px_10px_rgba(0,0,0,0.3)] flex-1 flex gap-5 items-stretch min-h-0">
          
          {/* Left Column: Robot Portrait Viewport */}
          <div className="w-[240px] relative flex-shrink-0 flex items-center justify-center bg-[#ded9c6]/45 border border-[#3e382d]/30 rounded-xl overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]">
            <div
              style={{
                width: '260px',
                height: '260px',
                backgroundImage: `url(${spriteSheet})`,
                backgroundSize: '300% 300%',
                backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                imageRendering: 'auto',
                filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.25))',
              }}
              className="absolute bottom-1"
            />
          </div>

          {/* Right Column: Dialogue Terminal Screen Box */}
          <div className="flex-1 flex flex-col bg-[#eae5d3] border-2 border-[#3e382d] rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)]">
            {/* Screen Header Bar */}
            <div className="bg-[#72908a] border-b-2 border-[#3e382d] py-2 px-4 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#2e2a22] tracking-wider uppercase">
                {formatSpeakerHeader(line.speaker)}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse"></span>
                <span className="text-[9px] font-mono font-extrabold text-[#2e2a22]/70 uppercase tracking-widest">ONLINE</span>
              </div>
            </div>

            {/* Screen Content Area */}
            <div className="flex-1 p-5 flex flex-col justify-between">
              <p className="text-[13.5px] text-[#2e2a22] leading-relaxed font-mono font-bold select-text">
                {renderDialogueText(line.text)}
                <span className="inline-block w-2.5 h-4 bg-[#2e2a22] animate-pulse ml-1.5 align-middle"></span>
              </p>

              {/* Progress Indicator Block */}
              <div className="mt-4 shrink-0 flex justify-center items-center">
                <div className="bg-[#9c3526] hover:bg-[#822c20] text-[#faf8f2] font-bold text-[10px] py-2 px-6 border border-[#3e382d] cursor-pointer flex items-center justify-center uppercase tracking-wider transition-colors shadow-sm w-fit">
                  {isLastLine ? 'Press Enter to Close' : 'Press Enter to Continue'}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

