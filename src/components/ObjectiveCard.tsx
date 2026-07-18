/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award } from 'lucide-react';
import type { PuzzleDefinition } from '../types/gameTypes';

interface ObjectiveCardProps {
  puzzle: PuzzleDefinition;
}

export const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ puzzle }) => {
  return (
    <div className="border-2 border-dashed border-[#9c3526]/50 bg-[#faf8f2] p-6 shadow-sm relative overflow-hidden">
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-[#9c3526]/10 text-[#9c3526] border border-[#9c3526]/20 mt-0.5">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#2e2a22] tracking-tight font-serif uppercase">
            PROTOCOL OBJECTIVE: {puzzle.title}
          </h2>
          <p className="text-xs text-[#5c5341] mt-2 leading-relaxed">
            {puzzle.description}
          </p>
          <div className="flex items-center gap-3 mt-3 text-[10px] text-[#8a7e6b] font-mono">
            <span>Grid: {puzzle.gridSize.width}×{puzzle.gridSize.height}</span>
            <span>·</span>
            <span>Start: ({puzzle.robotStart.x}, {puzzle.robotStart.y})</span>
            <span>·</span>
            <span>Target: ({puzzle.targets[0].x}, {puzzle.targets[0].y})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
