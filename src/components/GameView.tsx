/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { PuzzleDefinition, CommandDefinition } from '../types/gameTypes';
import { useRobotSimulation } from '../hooks/useRobotSimulation';
import { CodeEditor } from './CodeEditor';
import { ControlPanel } from './ControlPanel';
import { ConsoleTerminal } from './ConsoleTerminal';
import { SystemManual } from './SystemManual';
import { OrientationCompass } from './OrientationCompass';
import { IsometricVisualEngine } from './IsometricVisualEngine';
import { ObjectiveCard } from './ObjectiveCard';
import { PlaygroundPanel } from './PlaygroundPanel';
import { SolutionsPanel } from './SolutionsPanel';
import { DebuggerPanel } from './DebuggerPanel';
import { Award } from 'lucide-react';

interface GameViewProps {
  puzzle: PuzzleDefinition;
  commandRegistry: Map<string, CommandDefinition>;
  unlockedCommandIds: string[];
  onPuzzleSolved: () => void;
  onBack: () => void;
  isPlaygroundMode?: boolean;
  playgroundProps?: {
    puzzles: PuzzleDefinition[];
    selectedPuzzle: PuzzleDefinition;
    onSelectPuzzle: (puzzle: PuzzleDefinition) => void;
    onHotReload: (newPuzzle: PuzzleDefinition) => void;
  };
}

export const GameView: React.FC<GameViewProps> = ({
  puzzle,
  commandRegistry,
  unlockedCommandIds,
  onPuzzleSolved,
  onBack,
  isPlaygroundMode = false,
  playgroundProps
}) => {
  const {
    code,
    setCode,
    worldState,
    isPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    executingLine,
    consoleLogs,
    clearLogs,
    errorMessage,
    setErrorMessage,
    isSuccess,
    runSimulation,
    stepSimulation,
    pauseSimulation,
    resetSimulation,
    actionQueue,
    currentIndex,
    isDebugMode,
    soundEnabled,
    toggleSound,
    unlockedAchievement,
    setUnlockedAchievement,
    savedSolutions,
    deleteSolution,
    loadSolution
  } = useRobotSimulation(puzzle, commandRegistry, onPuzzleSolved);

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {isPlaygroundMode && playgroundProps ? (
        // 3-Column Layout for Dev Playground Mode (4-4-4 span split)
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Column 1: Playground Control & JSON Panel */}
          <div className="lg:col-span-4 h-full">
            <PlaygroundPanel
              puzzles={playgroundProps.puzzles}
              selectedPuzzle={playgroundProps.selectedPuzzle}
              onSelectPuzzle={playgroundProps.onSelectPuzzle}
              onHotReload={playgroundProps.onHotReload}
              worldState={worldState}
              actionQueue={actionQueue}
            />
          </div>

          {/* Column 2: Code Editor, Control Panel, Debugger & Terminal */}
          <div className="lg:col-span-4 space-y-6">
            <CodeEditor 
              code={code} 
              setCode={setCode} 
              executingLine={executingLine} 
            />

            <ControlPanel 
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
              runSimulation={runSimulation}
              pauseSimulation={pauseSimulation}
              stepSimulation={stepSimulation}
              resetSimulation={resetSimulation}
              soundEnabled={soundEnabled}
              toggleSound={toggleSound}
            />

            {isDebugMode && (
              <DebuggerPanel
                actionQueue={actionQueue}
                currentIndex={currentIndex}
              />
            )}

            <ConsoleTerminal 
              consoleLogs={consoleLogs} 
              clearLogs={clearLogs} 
            />
          </div>

          {/* Column 3: Isometric Visualizer, Manual, and Support Panels */}
          <div className="lg:col-span-4 space-y-6">
            <IsometricVisualEngine 
              worldState={worldState}
              isSuccess={isSuccess}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              resetSimulation={resetSimulation}
              actionQueue={actionQueue}
              currentIndex={currentIndex}
              isDebugMode={isDebugMode}
            />

            <ObjectiveCard puzzle={puzzle} />

            <SolutionsPanel
              puzzle={puzzle}
              savedSolutions={savedSolutions}
              onLoadSolution={loadSolution}
              onDeleteSolution={deleteSolution}
              currentCode={code}
            />

            <SystemManual unlockedCommandIds={unlockedCommandIds} />

            <OrientationCompass facing={worldState.robot.facing} />
          </div>
        </div>
      ) : (
        // Standard 2-Column Layout for Players (6-6 span split)
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT Column: Code Editor, Terminal & APIs */}
          <div className="lg:col-span-6 space-y-6">
            <CodeEditor 
              code={code} 
              setCode={setCode} 
              executingLine={executingLine} 
            />

            <ControlPanel 
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
              runSimulation={runSimulation}
              pauseSimulation={pauseSimulation}
              stepSimulation={stepSimulation}
              resetSimulation={resetSimulation}
              soundEnabled={soundEnabled}
              toggleSound={toggleSound}
            />

            {isDebugMode && (
              <DebuggerPanel
                actionQueue={actionQueue}
                currentIndex={currentIndex}
              />
            )}

            <ConsoleTerminal 
              consoleLogs={consoleLogs} 
              clearLogs={clearLogs} 
            />

            <SystemManual unlockedCommandIds={unlockedCommandIds} />

            <OrientationCompass facing={worldState.robot.facing} />
          </div>

          {/* RIGHT Column: Isometric Simulator & Objective */}
          <div className="lg:col-span-6 space-y-6">
            <IsometricVisualEngine 
              worldState={worldState}
              isSuccess={isSuccess}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              resetSimulation={resetSimulation}
              actionQueue={actionQueue}
              currentIndex={currentIndex}
              isDebugMode={isDebugMode}
            />

            <ObjectiveCard puzzle={puzzle} />

            <SolutionsPanel
              puzzle={puzzle}
              savedSolutions={savedSolutions}
              onLoadSolution={loadSolution}
              onDeleteSolution={deleteSolution}
              currentCode={code}
            />
          </div>
        </div>
      )}

      {/* Floating Achievement Toast */}
      {unlockedAchievement && (
        <div className="fixed bottom-6 right-6 bg-[#2e2a22] border-2 border-amber-500 text-amber-100 p-4 shadow-2xl z-50 flex items-center gap-3 animate-slide-in-right max-w-sm font-mono">
          <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/40 flex-shrink-0">
            <Award className="w-6 h-6 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">Achievement Unlocked!</div>
            <h4 className="text-xs font-bold uppercase font-serif text-[#faf8f2] mt-0.5 truncate">{unlockedAchievement.title}</h4>
            <p className="text-[10px] text-amber-200/80 mt-0.5 leading-tight">{unlockedAchievement.description}</p>
          </div>
          <button 
            onClick={() => setUnlockedAchievement(null)}
            className="text-amber-500 hover:text-amber-300 ml-2 font-bold cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>
      )}
    </main>
  );
};
