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
    loadSolutionPreset,
    loadBlankTemplate,
    actionQueue,
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

          {/* Column 2: Code Editor, Control Panel & Terminal */}
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
            />

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
            />

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
    </main>
  );
};
