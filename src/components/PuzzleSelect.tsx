/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, Lock, ChevronRight, Map } from 'lucide-react';
import type { PuzzleDefinition } from '../types/gameTypes';
import { isPuzzleSolved } from '../state/saveData';

interface PuzzleSelectProps {
  puzzles: PuzzleDefinition[];
  onSelectPuzzle: (puzzle: PuzzleDefinition) => void;
}

export const PuzzleSelect: React.FC<PuzzleSelectProps> = ({ puzzles, onSelectPuzzle }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-[#9c3526]/10 text-[#9c3526] border border-[#9c3526]/20">
          <Map className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#2e2a22] tracking-tight font-serif uppercase">
            Mission Select
          </h2>
          <p className="text-xs text-[#5c5341] mt-0.5">
            Choose a protocol to execute. Complete missions to unlock new capabilities.
          </p>
        </div>
      </div>

      {/* Puzzle list */}
      <div className="space-y-3">
        {puzzles.map((puzzle, index) => {
          const solved = isPuzzleSolved(puzzle.id);

          return (
            <button
              key={puzzle.id}
              id={`puzzle-card-${puzzle.id}`}
              onClick={() => onSelectPuzzle(puzzle)}
              className="w-full text-left group border border-[#3e382d]/40 bg-[#f4efe1] hover:bg-[#faf8f2] hover:border-[#9c3526]/50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4 p-4 md:p-5">
                {/* Index badge */}
                <div className={`
                  flex-shrink-0 w-10 h-10 flex items-center justify-center border text-sm font-bold font-mono
                  ${solved
                    ? 'bg-[#e2ebd5] border-[#81a364] text-[#4a6b2a]'
                    : 'bg-[#f4efe1] border-[#3e382d]/30 text-[#5c5341]'
                  }
                `}>
                  {solved
                    ? <CheckCircle2 className="w-5 h-5 text-[#4a6b2a]" />
                    : String(index + 1).padStart(2, '0')
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#2e2a22] tracking-tight font-serif uppercase group-hover:text-[#9c3526] transition-colors">
                      {puzzle.title}
                    </h3>
                    {solved && (
                      <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold uppercase bg-[#e2ebd5] text-[#4a6b2a] border border-[#81a364]/40 tracking-wider">
                        Solved
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5c5341] mt-1 leading-relaxed line-clamp-2">
                    {puzzle.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-[#8a7e6b] font-mono">
                    <span>Grid: {puzzle.gridSize.width}×{puzzle.gridSize.height}</span>
                    <span>·</span>
                    <span>Obstacles: {puzzle.obstacles.length}</span>
                    {puzzle.parMetrics && (
                      <>
                        <span>·</span>
                        <span>Par: {puzzle.parMetrics.instructions} ops</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-[#8a7e6b] group-hover:text-[#9c3526] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Lock placeholder for future puzzles */}
      <div className="mt-3 border border-dashed border-[#3e382d]/20 bg-[#f4efe1]/50 p-4 flex items-center gap-4 opacity-50">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-[#3e382d]/20 bg-[#eae3ce]">
          <Lock className="w-4 h-4 text-[#8a7e6b]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#8a7e6b] tracking-tight font-serif uppercase">
            More missions coming soon
          </h3>
          <p className="text-xs text-[#8a7e6b] mt-0.5">
            Complete existing protocols to unlock new challenges and commands.
          </p>
        </div>
      </div>
    </div>
  );
};
