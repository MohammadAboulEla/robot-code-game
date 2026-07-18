/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Compass } from 'lucide-react';

interface OrientationCompassProps {
  facing: 'up' | 'down' | 'left' | 'right';
}

export const OrientationCompass: React.FC<OrientationCompassProps> = ({
  facing
}) => {
  const getAbsoluteDirectionName = (currentFacing: string, relative: string): string => {
    const headings = ['up', 'right', 'down', 'left'];
    const idx = headings.indexOf(currentFacing);
    if (idx === -1) return '';
    let targetIdx = idx;
    if (relative === 'front') targetIdx = idx;
    else if (relative === 'right') targetIdx = (idx + 1) % 4;
    else if (relative === 'back') targetIdx = (idx + 2) % 4;
    else if (relative === 'left') targetIdx = (idx + 3) % 4;
    
    const abs = headings[targetIdx];
    if (abs === 'up') return 'Up-Right (North)';
    if (abs === 'down') return 'Down-Left (South)';
    if (abs === 'left') return 'Up-Left (West)';
    if (abs === 'right') return 'Down-Right (East)';
    return '';
  };

  return (
    <div className="bg-[#f4efe1] border border-[#3e382d] p-4 shadow-sm">
      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#9c3526]" />
          <span className="text-xs font-bold text-[#2e2a22] tracking-wider uppercase font-mono">Robot Orientation Compass</span>
        </div>
        <span className="text-[10px] text-[#5c5341] bg-[#faf8f2] px-2 py-0.5 border border-[#3e382d] font-mono uppercase">
          Active Facing: {facing}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
        <div className="bg-[#faf8f2] p-2 border border-[#3e382d]/50 flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[#9c3526] font-bold">"front"</span>
            <span className="text-[10px] text-[#8a7c62]">heading</span>
          </div>
          <span className="text-[11px] text-[#5c5341] mt-0.5">→ {getAbsoluteDirectionName(facing, 'front')}</span>
        </div>
        <div className="bg-[#faf8f2] p-2 border border-[#3e382d]/50 flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[#9c3526] font-bold">"right"</span>
            <span className="text-[10px] text-[#8a7c62]">+90° right</span>
          </div>
          <span className="text-[11px] text-[#5c5341] mt-0.5">→ {getAbsoluteDirectionName(facing, 'right')}</span>
        </div>
        <div className="bg-[#faf8f2] p-2 border border-[#3e382d]/50 flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[#9c3526] font-bold">"back"</span>
            <span className="text-[10px] text-[#8a7c62]">reverse</span>
          </div>
          <span className="text-[11px] text-[#5c5341] mt-0.5">→ {getAbsoluteDirectionName(facing, 'back')}</span>
        </div>
        <div className="bg-[#faf8f2] p-2 border border-[#3e382d]/50 flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[#9c3526] font-bold">"left"</span>
            <span className="text-[10px] text-[#8a7c62]">-90° left</span>
          </div>
          <span className="text-[11px] text-[#5c5341] mt-0.5">→ {getAbsoluteDirectionName(facing, 'left')}</span>
        </div>
      </div>
    </div>
  );
};
