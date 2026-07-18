/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, Code, Compass, Archive } from 'lucide-react';
import { SystemInstructions, RobotCommandsList } from './SystemManual';
import { OrientationCompass } from './OrientationCompass';
import { SolutionsPanel } from './SolutionsPanel';
import type { PuzzleDefinition, SavedSolution } from '../types/gameTypes';

interface InspectorPanelProps {
  puzzle: PuzzleDefinition;
  unlockedCommandIds: string[];
  facing: 'up' | 'down' | 'left' | 'right';
  savedSolutions: SavedSolution[];
  onLoadSolution: (code: string) => void;
  onDeleteSolution: (timestamp: number) => void;
  currentCode: string;
}

type TabType = 'manual' | 'commands' | 'compass' | 'archive';

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  puzzle,
  unlockedCommandIds,
  facing,
  savedSolutions,
  onLoadSolution,
  onDeleteSolution,
  currentCode
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('manual');

  // Reset tab to Manual on puzzle load
  useEffect(() => {
    setActiveTab('manual');
  }, [puzzle.id]);

  return (
    <div className="bg-[#f4efe1]/90 border border-[#3e382d] shadow-sm overflow-hidden text-[11px] leading-relaxed text-[#5c5341] flex flex-col font-sans">
      {/* Tabs list styled in vintage retro theme */}
      <div className="border-b border-[#3e382d] flex bg-[#eae3ce] overflow-x-auto scrollbar-none shrink-0">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 min-w-[70px] flex items-center justify-center gap-1 py-2 text-[10px] font-bold border-b-2 transition uppercase tracking-wider cursor-pointer font-mono whitespace-nowrap px-2 ${
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
          className={`flex-1 min-w-[70px] flex items-center justify-center gap-1 py-2 text-[10px] font-bold border-b-2 transition uppercase tracking-wider cursor-pointer font-mono whitespace-nowrap px-2 ${
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
          className={`flex-1 min-w-[70px] flex items-center justify-center gap-1 py-2 text-[10px] font-bold border-b-2 transition uppercase tracking-wider cursor-pointer font-mono whitespace-nowrap px-2 ${
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
          className={`flex-1 min-w-[70px] flex items-center justify-center gap-1 py-2 text-[10px] font-bold border-b-2 transition uppercase tracking-wider cursor-pointer font-mono whitespace-nowrap px-2 ${
            activeTab === 'archive'
              ? 'border-[#9c3526] text-[#9c3526] bg-[#faf8f2]/60'
              : 'border-transparent text-[#5c5341] hover:text-[#2e2a22]'
          }`}
        >
          <Archive className="w-3 h-3 shrink-0" />
          <span>Archive</span>
        </button>
      </div>

      {/* Tab Panels content, muted relative to primary engine/editor */}
      <div className="p-4 max-h-56 overflow-y-auto bg-[#faf8f2] scrollbar-thin scrollbar-thumb-[#eae3ce] space-y-3 flex-1 select-text">
        {activeTab === 'manual' && <div className="space-y-3.5"><SystemInstructions /></div>}
        {activeTab === 'commands' && <RobotCommandsList unlockedCommandIds={unlockedCommandIds} />}
        {activeTab === 'compass' && <OrientationCompass facing={facing} hideWrapper={true} />}
        {activeTab === 'archive' && (
          <SolutionsPanel
            puzzle={puzzle}
            savedSolutions={savedSolutions}
            onLoadSolution={onLoadSolution}
            onDeleteSolution={onDeleteSolution}
            currentCode={currentCode}
            isTabbed={true}
          />
        )}
      </div>
    </div>
  );
};
