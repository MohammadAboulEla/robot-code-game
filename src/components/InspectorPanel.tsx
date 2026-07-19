/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, Code, Compass, Archive, Layers, Target } from 'lucide-react';
import { SystemInstructions, RobotCommandsList } from './SystemManual';
import { OrientationCompass } from './OrientationCompass';
import { SolutionsPanel } from './SolutionsPanel';
import { IsometricVisualEngine } from './IsometricVisualEngine';
import { ObjectiveCard } from './ObjectiveCard';
import type { PuzzleDefinition, SavedSolution } from '../types/gameTypes';
import type { GameWorldState, VMAction } from '../robotInterpreter';
import { EXPRESSION_SPRITE_MAP, RobotExpression } from '../types/dialogueTypes';
import spriteSheet from '../../assets/sprite.png';

interface InspectorPanelProps {
  puzzle: PuzzleDefinition;
  unlockedCommandIds: string[];
  facing: 'up' | 'down' | 'left' | 'right';
  savedSolutions: SavedSolution[];
  onLoadSolution: (code: string) => void;
  onDeleteSolution: (timestamp: number) => void;
  currentCode: string;
  isPlaying: boolean;
  
  // Visual Engine Props
  worldState: GameWorldState;
  isSuccess: boolean;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;
  resetSimulation: () => void;
  actionQueue?: VMAction[];
  currentIndex?: number;
  isDebugMode?: boolean;
}

type TabType = 'visual' | 'objective' | 'manual' | 'commands' | 'compass' | 'archive';

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  puzzle,
  unlockedCommandIds,
  facing,
  savedSolutions,
  onLoadSolution,
  onDeleteSolution,
  currentCode,
  isPlaying,
  
  worldState,
  isSuccess,
  errorMessage,
  setErrorMessage,
  resetSimulation,
  actionQueue,
  currentIndex,
  isDebugMode = false
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('visual');

  // Reset tab to Visual Engine on puzzle load/reload
  useEffect(() => {
    setActiveTab('visual');
  }, [puzzle.id]);

  // If simulation starts playing or is debugged, switch to visual tab
  useEffect(() => {
    if (currentIndex !== undefined && currentIndex > 0) {
      setActiveTab('visual');
    }
  }, [currentIndex]);

  const getAmbientExpression = (): RobotExpression => {
    if (isSuccess) return 'excited';
    if (errorMessage) {
      if (
        errorMessage.includes('InfiniteLoopError') || 
        errorMessage.includes('Collision') || 
        errorMessage.includes('Boundary') || 
        errorMessage.includes('crashed')
      ) {
        return 'confused';
      }
      return 'sad';
    }
    if (isPlaying) return 'talking';
    return 'idle';
  };

  const currentExpression = getAmbientExpression();
  const spriteCoords = EXPRESSION_SPRITE_MAP[currentExpression];
  const bgPosX = spriteCoords.col * 50;
  const bgPosY = spriteCoords.row * 50;

  return (
    <div className="bg-[#f4efe1]/90 border border-[#3e382d] shadow-sm overflow-hidden text-[11px] leading-relaxed text-[#5c5341] flex flex-col flex-1 min-h-0 h-full font-sans">
      {/* Tabs list styled in vintage retro theme */}
      <div className="border-b border-[#3e382d] flex justify-between items-center bg-[#eae3ce] overflow-x-auto scrollbar-none shrink-0">
        <div className="flex flex-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex-1 min-w-[65px] flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-bold border-b-2 transition uppercase tracking-wider cursor-pointer font-mono whitespace-nowrap px-2.5 ${
              activeTab === 'visual'
                ? 'border-[#9c3526] text-[#9c3526] bg-[#faf8f2]/60'
                : 'border-transparent text-[#5c5341] hover:text-[#2e2a22]'
            }`}
          >
            <Layers className="w-3 h-3 shrink-0" />
            <span>Visual</span>
          </button>
          <button
            onClick={() => setActiveTab('objective')}
            className={`flex-1 min-w-[65px] flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-bold border-b-2 transition uppercase tracking-wider cursor-pointer font-mono whitespace-nowrap px-2.5 ${
              activeTab === 'objective'
                ? 'border-[#9c3526] text-[#9c3526] bg-[#faf8f2]/60'
                : 'border-transparent text-[#5c5341] hover:text-[#2e2a22]'
            }`}
          >
            <Target className="w-3 h-3 shrink-0" />
            <span>Objective</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 min-w-[65px] flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-bold border-b-2 transition uppercase tracking-wider cursor-pointer font-mono whitespace-nowrap px-2.5 ${
              activeTab === 'manual'
                ? 'border-[#9c3526] text-[#9c3526] bg-[#faf8f2]/60'
                : 'border-transparent text-[#5c5341] hover:text-[#2e2a22]'
            }`}
          >
            <BookOpen className="w-3 h-3 shrink-0" />
            <span>Manual</span>
          </button>
          <button
            onClick={() => setActiveTab('commands')}
            className={`flex-1 min-w-[65px] flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-bold border-b-2 transition uppercase tracking-wider cursor-pointer font-mono whitespace-nowrap px-2.5 ${
              activeTab === 'commands'
                ? 'border-[#9c3526] text-[#9c3526] bg-[#faf8f2]/60'
                : 'border-transparent text-[#5c5341] hover:text-[#2e2a22]'
            }`}
          >
            <Code className="w-3 h-3 shrink-0" />
            <span>Commands</span>
          </button>
          <button
            onClick={() => setActiveTab('compass')}
            className={`flex-1 min-w-[65px] flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-bold border-b-2 transition uppercase tracking-wider cursor-pointer font-mono whitespace-nowrap px-2.5 ${
              activeTab === 'compass'
                ? 'border-[#9c3526] text-[#9c3526] bg-[#faf8f2]/60'
                : 'border-transparent text-[#5c5341] hover:text-[#2e2a22]'
            }`}
          >
            <Compass className="w-3 h-3 shrink-0" />
            <span>Compass</span>
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`flex-1 min-w-[65px] flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-bold border-b-2 transition uppercase tracking-wider cursor-pointer font-mono whitespace-nowrap px-2.5 ${
              activeTab === 'archive'
                ? 'border-[#9c3526] text-[#9c3526] bg-[#faf8f2]/60'
                : 'border-transparent text-[#5c5341] hover:text-[#2e2a22]'
            }`}
          >
            <Archive className="w-3 h-3 shrink-0" />
            <span>Archive</span>
          </button>
        </div>

        {/* Compact Ambient Avatar */}
        <div className="pr-3 flex items-center gap-1.5 shrink-0 border-l border-[#3e382d]/15 pl-3 h-[30px]">
          <div
            className="w-[20px] h-[20px] border border-[#3e382d] bg-white rounded-none select-none"
            style={{
              backgroundImage: `url(${spriteSheet})`,
              backgroundSize: '300% 300%',
              backgroundPosition: `${bgPosX}% ${bgPosY}%`,
              imageRendering: 'auto',
            }}
            title={`R-07 Status: ${currentExpression.toUpperCase()}`}
          />
          <span className="text-[8px] font-mono font-bold text-[#9c3526] uppercase animate-pulse select-none">
            {currentExpression}
          </span>
        </div>
      </div>

      {/* Tab Panels content, taking remaining height for visual engine */}
      <div className="flex-grow flex-1 min-h-0 bg-[#faf8f2] flex flex-col overflow-hidden">
        {activeTab === 'visual' && (
          <IsometricVisualEngine 
            worldState={worldState}
            isSuccess={isSuccess}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            resetSimulation={resetSimulation}
            actionQueue={actionQueue}
            currentIndex={currentIndex}
            isDebugMode={isDebugMode}
            hideWrapper={true}
          />
        )}
        
        {activeTab === 'objective' && (
          <div className="p-4 overflow-y-auto flex-1 select-text">
            <ObjectiveCard puzzle={puzzle} hideWrapper={true} />
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="p-4 overflow-y-auto flex-1 space-y-3.5 select-text">
            <SystemInstructions />
          </div>
        )}

        {activeTab === 'commands' && (
          <div className="p-4 overflow-y-auto flex-1 select-text">
            <RobotCommandsList unlockedCommandIds={unlockedCommandIds} />
          </div>
        )}

        {activeTab === 'compass' && (
          <div className="p-4 overflow-y-auto flex-1 select-text">
            <OrientationCompass facing={facing} hideWrapper={true} />
          </div>
        )}

        {activeTab === 'archive' && (
          <div className="p-4 overflow-y-auto flex-1 select-text">
            <SolutionsPanel
              puzzle={puzzle}
              savedSolutions={savedSolutions}
              onLoadSolution={onLoadSolution}
              onDeleteSolution={onDeleteSolution}
              currentCode={currentCode}
              isTabbed={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};
