/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Square, RotateCcw, ChevronRight } from 'lucide-react';

interface ControlPanelProps {
  isPlaying: boolean;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  runSimulation: () => void;
  pauseSimulation: () => void;
  stepSimulation: () => void;
  resetSimulation: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  runSimulation,
  pauseSimulation,
  stepSimulation,
  resetSimulation
}) => {
  return (
    <div className="border border-[#3e382d] bg-[#f4efe1] p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
      
      <div className="flex flex-wrap items-center gap-2">
        {!isPlaying ? (
          <button
            onClick={runSimulation}
            className="bg-[#faf8f2] hover:bg-[#eae3ce] text-[#9c3526] font-bold text-xs py-2 px-4 transition cursor-pointer flex items-center gap-1.5 border border-[#3e382d] uppercase tracking-wider"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            RUN PROGRAM
          </button>
        ) : (
          <button
            onClick={pauseSimulation}
            className="bg-[#9c3526] hover:bg-[#852a1e] text-white font-bold text-xs py-2 px-4 transition cursor-pointer flex items-center gap-1.5 border border-[#3e382d] uppercase tracking-wider"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            PAUSE
          </button>
        )}

        <button
          onClick={stepSimulation}
          disabled={isPlaying}
          className="disabled:opacity-45 bg-[#faf8f2] hover:bg-[#eae3ce] text-[#2e2a22] font-bold text-xs py-2 px-4 border border-[#3e382d] transition cursor-pointer flex items-center gap-1 uppercase tracking-wider"
        >
          <ChevronRight className="w-3.5 h-3.5" />
          STEP DEBUG
        </button>

        <button
          onClick={resetSimulation}
          className="bg-[#faf8f2] hover:bg-[#eae3ce] text-[#5c5341] font-bold text-xs py-2 px-3 border border-[#3e382d] transition cursor-pointer"
          title="Reset Simulation State"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Speed selector slider */}
      <div className="flex items-center gap-3 w-full sm:w-auto text-xs font-mono">
        <span className="text-[10px] uppercase font-bold text-[#8a7c62] tracking-wider">DELAY:</span>
        <input
          type="range"
          min="150"
          max="1500"
          step="50"
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          className="w-20 accent-[#9c3526] cursor-pointer"
        />
        <span className="text-[11px] font-mono text-[#5c5341] w-12 text-right">{playbackSpeed}ms</span>
      </div>

    </div>
  );
};
