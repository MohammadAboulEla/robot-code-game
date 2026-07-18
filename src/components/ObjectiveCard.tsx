/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award } from 'lucide-react';

export const ObjectiveCard: React.FC = () => {
  return (
    <div className="border-2 border-dashed border-[#9c3526]/50 bg-[#faf8f2] p-6 shadow-sm relative overflow-hidden">
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-[#9c3526]/10 text-[#9c3526] border border-[#9c3526]/20 mt-0.5">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#2e2a22] tracking-tight font-serif uppercase">PROTOCOL OBJECTIVE: Cargo Relocation</h2>
          <p className="text-xs text-[#5c5341] mt-2 leading-relaxed">
            The robot starts at coordinate <strong className="text-[#9c3526] font-mono">(0, 0)</strong>. Direct it to drive across the floor grid, stand adjacent to the Amber storage cargo at <strong className="text-[#9c3526] font-mono">(1, 3)</strong> and rotate to face it to retrieve it, maneuver safely around the basalt pillar obstructions at <strong className="text-[#5c5341] font-mono">X = 2</strong>, and deliver the cargo down cleanly on the target coordinate pad at <strong className="text-[#9c3526] font-mono">(3, 1)</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
