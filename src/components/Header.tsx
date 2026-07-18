/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Cpu, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onLoadSolutionPreset: () => void;
  onLoadBlankTemplate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSolutionPreset,
  onLoadBlankTemplate
}) => {
  return (
    <header id="game-header" className="border-b border-[#3e382d] bg-[#f4efe1]/90 backdrop-blur px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#9c3526]/10 text-[#9c3526] rounded border border-[#9c3526]/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#2e2a22] flex items-center gap-2 uppercase font-serif">
              Robot Code Game
              <span className="inline-flex items-center rounded-none bg-[#9c3526]/10 px-2 py-0.5 text-[10px] font-bold text-[#9c3526] ring-1 ring-inset ring-[#9c3526]/20">
                SYSTEM V1.0
              </span>
            </h1>
            <p className="text-xs text-[#5c5341] font-mono">Autonomous Isometric Grid Programming Simulator</p>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono">
          <span className="text-xs font-semibold text-[#8a7c62] hidden sm:inline">CONTROL PANEL:</span>
          <button 
            onClick={onLoadSolutionPreset}
            className="text-xs font-semibold bg-[#faf8f2] hover:bg-[#eae3ce] text-[#9c3526] px-3.5 py-1.5 border border-[#3e382d] transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            LOAD PROTOCOL
          </button>
          <button 
            onClick={onLoadBlankTemplate}
            className="text-xs font-semibold bg-[#faf8f2] hover:bg-[#eae3ce] text-[#5c5341] hover:text-[#2e2a22] px-3.5 py-1.5 border border-[#3e382d] transition cursor-pointer"
          >
            BLANK WORKSPACE
          </button>
        </div>
      </div>
    </header>
  );
};
