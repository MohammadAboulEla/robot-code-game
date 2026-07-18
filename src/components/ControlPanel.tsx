/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Square, RotateCcw, ChevronRight, Volume2, VolumeX } from 'lucide-react';

interface ControlPanelProps {
  isPlaying: boolean;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  runSimulation: () => void;
  pauseSimulation: () => void;
  stepSimulation: () => void;
  resetSimulation: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  runSimulation,
  pauseSimulation,
  stepSimulation,
  resetSimulation,
  soundEnabled,
  toggleSound
}) => {
  return (
    <div className="border border-[#3e382d] bg-[#faf8f2] shadow-sm flex flex-col md:flex-row md:divide-x divide-[#3e382d] select-none font-mono">
      
      {/* Group 1: Execution Control */}
      <div className="flex-grow p-3.5 bg-[#eae3ce]/20 flex flex-col gap-2 min-w-[280px]">
        <div className="text-[9px] uppercase font-bold text-[#8a7c62] tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#9c3526] rounded-full inline-block"></span>
          Execution Control
        </div>
        <div className="flex items-center gap-2 w-full">
          {!isPlaying ? (
            <button
              onClick={runSimulation}
              className="flex-1 bg-[#9c3526] hover:bg-[#822c20] text-[#faf8f2] font-bold text-[10px] sm:text-xs py-2 px-3 border border-[#3e382d] transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#3e382d] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#3e382d] uppercase tracking-wider"
            >
              <Play className="w-3 h-3 fill-current" />
              RUN PROGRAM
            </button>
          ) : (
            <button
              onClick={pauseSimulation}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] sm:text-xs py-2 px-3 border border-[#3e382d] transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#3e382d] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#3e382d] uppercase tracking-wider"
            >
              <Square className="w-3 h-3 fill-current" />
              PAUSE
            </button>
          )}

          <button
            onClick={stepSimulation}
            disabled={isPlaying}
            className="flex-1 disabled:opacity-40 disabled:cursor-not-allowed bg-[#faf8f2] hover:bg-[#eae3ce] text-[#2e2a22] font-bold text-[10px] sm:text-xs py-2 px-3 border border-[#3e382d] transition cursor-pointer flex items-center justify-center gap-1 shadow-[2px_2px_0px_#3e382d] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#3e382d] uppercase tracking-wider"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            STEP DEBUG
          </button>

          <button
            onClick={resetSimulation}
            className="p-2 bg-[#faf8f2] hover:bg-[#eae3ce] text-[#5c5341] border border-[#3e382d] transition cursor-pointer flex items-center justify-center shadow-[2px_2px_0px_#3e382d] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#3e382d]"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Group 2: Interface Configuration */}
      <div className="p-3.5 flex flex-col gap-2 flex-shrink-0 flex-initial">
        <div className="text-[9px] uppercase font-bold text-[#8a7c62] tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#8a7c62] rounded-full inline-block"></span>
          Interface Setup
        </div>
        <div className="flex items-center justify-between gap-3 h-full">
          {/* Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-[#8a7c62] w-8">SPEED:</span>
            <input
              type="range"
              min="150"
              max="1500"
              step="50"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="w-20 accent-[#9c3526] cursor-pointer h-1.5 bg-[#eae3ce]/70 rounded appearance-none"
            />
            <span className="text-[10px] text-[#5c5341] font-bold w-12 text-right">{playbackSpeed}ms</span>
          </div>

          {/* Divider line */}
          <div className="h-5 w-[1px] bg-[#3e382d]/25"></div>

          {/* Audio toggle button */}
          <button
            onClick={toggleSound}
            className={`p-1.5 border transition cursor-pointer flex items-center justify-center shadow-[2px_2px_0px_#3e382d] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#3e382d] ${
              soundEnabled 
                ? 'bg-[#e2ebd5] border-[#81a364] text-[#4a6b2a] hover:bg-[#d6e2c6]' 
                : 'bg-[#faf8f2] border-[#3e382d] text-[#8a7c62] hover:bg-[#eae3ce]'
            }`}
            title={soundEnabled ? "Mute Sound Effects" : "Unmute Sound Effects"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

    </div>
  );
};
