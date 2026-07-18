/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Award, ChevronDown, ChevronUp } from 'lucide-react';
import type { PuzzleDefinition } from '../types/gameTypes';

interface ObjectiveCardProps {
  puzzle: PuzzleDefinition;
  hideWrapper?: boolean;
}

export const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ puzzle, hideWrapper = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-expand when a puzzle loads or reloads
  useEffect(() => {
    setIsExpanded(true);
  }, [puzzle.id]);

  const targetCoords = puzzle.targets && puzzle.targets[0]
    ? `(${puzzle.targets[0].x}, ${puzzle.targets[0].y})`
    : 'N/A';

  return (
    <div className={`relative overflow-hidden transition-all duration-200 ${
      hideWrapper ? '' : 'border-2 border-dashed border-[#9c3526]/50 bg-[#faf8f2] shadow-sm'
    }`}>
      {/* Header / Clickable Toggle Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#eae3ce]/20 select-none"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-1 bg-[#9c3526]/10 text-[#9c3526] border border-[#9c3526]/20 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-[#2e2a22] tracking-tight font-serif uppercase truncate">
              PROTOCOL OBJECTIVE: {puzzle.title} {!isExpanded && <span className="text-[#8a7e6b] font-mono font-normal normal-case ml-2">· Target: {targetCoords}</span>}
            </h2>
          </div>
        </div>
        <div className="text-[#5c5341] hover:text-[#9c3526] transition-colors p-0.5">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-0 border-t border-dashed border-[#9c3526]/30">
          <p className="text-xs text-[#5c5341] mt-3 leading-relaxed">
            {puzzle.description}
          </p>
          <div className="flex items-center gap-3 mt-3 text-[10px] text-[#8a7e6b] font-mono">
            <span>Grid: {puzzle.gridSize.width}×{puzzle.gridSize.height}</span>
            <span>·</span>
            <span>Start: ({puzzle.robotStart.x}, {puzzle.robotStart.y})</span>
            <span>·</span>
            <span>Target: {targetCoords}</span>
          </div>
        </div>
      )}
    </div>
  );
};
