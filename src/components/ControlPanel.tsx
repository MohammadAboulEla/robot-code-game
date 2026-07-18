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
    <div className="border border-[#3e382d] bg-[#eae3ce] shadow-sm flex items-center justify-between select-none font-mono px-2 py-1 shrink-0 h-9">
      {/* Left side: execution controls */}
      <div className="flex items-center gap-1.5">
        {!isPlaying ? (
          <button
            onClick={runSimulation}
            className="bg-[#9c3526] hover:bg-[#822c20] text-[#faf8f2] font-bold text-[10px] py-1 px-2.5 border border-[#3e382d] cursor-pointer flex items-center gap-1 uppercase tracking-wider transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Run Program</span>
          </button>
        ) : (
          <button
            onClick={pauseSimulation}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] py-1 px-2.5 border border-[#3e382d] cursor-pointer flex items-center gap-1 uppercase tracking-wider transition-colors"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Pause</span>
          </button>
        )}

        <button
          onClick={stepSimulation}
          disabled={isPlaying}
          className="disabled:opacity-40 disabled:cursor-not-allowed bg-[#faf8f2] hover:bg-[#eae3ce] text-[#2e2a22] font-bold text-[10px] py-1 px-2.5 border border-[#3e382d] cursor-pointer flex items-center gap-1 uppercase tracking-wider transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Step Debug</span>
        </button>

        <button
          onClick={resetSimulation}
          className="py-1 px-2.5 bg-[#faf8f2] hover:bg-[#eae3ce] text-[#5c5341] border border-[#3e382d] cursor-pointer flex items-center justify-center transition-colors"
          title="Reset Simulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right side: configuration controls */}
      <div className="flex items-center gap-3">
        {/* Speed Slider */}
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-bold text-[#5c5341] tracking-wider">SPEED:</span>
          <input
            type="range"
            min="150"
            max="1500"
            step="50"
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="w-16 accent-[#9c3526] cursor-pointer h-1 bg-[#faf8f2] border border-[#3e382d]/30 appearance-none"
          />
          <span className="text-[9px] text-[#2e2a22] font-bold w-10 text-right">{playbackSpeed}ms</span>
        </div>

        {/* Vertical divider */}
        <div className="h-4 w-[1px] bg-[#3e382d]/25"></div>

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          className={`py-1 px-2.5 border transition-colors cursor-pointer flex items-center justify-center ${
            soundEnabled 
              ? 'bg-[#e2ebd5] border-[#81a364] text-[#4a6b2a] hover:bg-[#d6e2c6]' 
              : 'bg-[#faf8f2] border-[#3e382d] text-[#8a7c62] hover:bg-[#eae3ce]'
          }`}
          title={soundEnabled ? "Mute" : "Unmute"}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
