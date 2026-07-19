/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cpu, ArrowLeft, Maximize2, Minimize2, Hammer } from 'lucide-react';

interface HeaderProps {
  onLoadSolutionPreset?: () => void;
  onLoadBlankTemplate?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  puzzleTitle?: string;
  isDev?: boolean;
  isPlaygroundActive?: boolean;
  onTogglePlayground?: () => void;
  onResetProgress?: () => void;
  isTestModeActive?: boolean;
  onToggleTestMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  showBackButton,
  onBack,
  puzzleTitle,
  isDev,
  isPlaygroundActive,
  onTogglePlayground,
  onResetProgress,
  isTestModeActive,
  onToggleTestMode
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <header id="game-header" className="border-b border-[#3e382d] bg-[#f4efe1] px-4 py-1.5 select-none shrink-0 z-50">
      <div className="flex justify-between items-center w-full">
        {/* Left HUD: Title & Active Protocol */}
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              onClick={onBack}
              className="p-1 bg-[#faf8f2] hover:bg-[#eae3ce] text-[#5c5341] hover:text-[#9c3526] border border-[#3e382d] cursor-pointer"
              title="Exit Protocol"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#9c3526]" />
            <span className="text-xs font-bold font-mono tracking-widest text-[#2e2a22] uppercase">
              R-CODE.SYS
            </span>
            <span className="text-[10px] text-[#5c5341] opacity-60 font-mono">|</span>
            <span className="text-[10px] font-mono text-[#5c5341]">
              {isPlaygroundActive
                ? `PLAYTEST: ${puzzleTitle ? puzzleTitle.toUpperCase() : 'SANDBOX'}`
                : puzzleTitle
                ? `ACTIVE PROTOCOL: ${puzzleTitle.toUpperCase()}`
                : 'STANDBY_'}
            </span>
          </div>
        </div>

        {/* Right HUD: Game Controls */}
        <div className="flex items-center gap-2">
          {isDev && (
            <div className="flex items-center gap-1.5 border border-dashed border-[#9c3526]/40 px-1.5 py-0.5 bg-[#9c3526]/5 rounded-none mr-1">
              <span className="text-[9px] font-mono font-bold text-[#9c3526] uppercase">DEV:</span>
              {onTogglePlayground && (
                <button
                  onClick={onTogglePlayground}
                  title={isPlaygroundActive ? "Exit Playground Mode" : "Enter Playground Mode"}
                  className={`px-1.5 py-0.5 text-[9px] font-mono border border-[#3e382d] cursor-pointer transition uppercase font-bold ${
                    isPlaygroundActive
                      ? 'bg-[#9c3526] text-[#faf8f2] hover:bg-[#822c20]'
                      : 'bg-[#faf8f2] text-[#5c5341] hover:bg-[#eae3ce]'
                  }`}
                >
                  {isPlaygroundActive ? "Exit Playground" : "Playground"}
                </button>
              )}
              {onToggleTestMode && (
                <button
                  onClick={onToggleTestMode}
                  title={isTestModeActive ? "Exit Test Mode" : "Enter Test Mode"}
                  className={`px-1.5 py-0.5 text-[9px] font-mono border border-[#3e382d] cursor-pointer transition uppercase font-bold ${
                    isTestModeActive
                      ? 'bg-[#9c3526] text-[#faf8f2] hover:bg-[#822c20]'
                      : 'bg-[#faf8f2] text-[#5c5341] hover:bg-[#eae3ce]'
                  }`}
                >
                  {isTestModeActive ? "Exit Test Mode" : "Test Mode"}
                </button>
              )}
              {onResetProgress && (
                <button
                  onClick={onResetProgress}
                  title="Reset all player progress, saved solutions, and achievements"
                  className="px-1.5 py-0.5 text-[9px] font-mono bg-[#faf8f2] text-[#9c3526] hover:bg-[#9c3526] hover:text-[#faf8f2] border border-[#3e382d] cursor-pointer transition uppercase font-bold"
                >
                  Reset Progress
                </button>
              )}
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="p-1 bg-[#faf8f2] text-[#5c5341] hover:bg-[#eae3ce] border border-[#3e382d] cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
