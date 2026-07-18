/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useRobotSimulation } from './hooks/useRobotSimulation';
import { PUZZLE_001_FIRST_DELIVERY } from './puzzles/001-first-delivery';
import { buildCommandRegistry, ALL_COMMAND_IDS } from './game/commands/commands';
import { Header } from './components/Header';
import { Ticker } from './components/Ticker';
import { CodeEditor } from './components/CodeEditor';
import { ControlPanel } from './components/ControlPanel';
import { ConsoleTerminal } from './components/ConsoleTerminal';
import { SystemManual } from './components/SystemManual';
import { OrientationCompass } from './components/OrientationCompass';
import { IsometricVisualEngine } from './components/IsometricVisualEngine';
import { ObjectiveCard } from './components/ObjectiveCard';
import { Footer } from './components/Footer';

export default function App() {
  // All commands unlocked until progression system exists (M2)
  const commandRegistry = useMemo(() => buildCommandRegistry(ALL_COMMAND_IDS), []);

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
    loadBlankTemplate
  } = useRobotSimulation(PUZZLE_001_FIRST_DELIVERY, commandRegistry);

  return (
    <div id="game-container" className="min-h-screen bg-[#dfd3b6] text-[#2e2a22] font-sans antialiased selection:bg-[#9c3526]/20 selection:text-[#2e2a22] pb-12">
      
      {/* Vintage Header bar */}
      <Header 
        onLoadSolutionPreset={loadSolutionPreset} 
        onLoadBlankTemplate={loadBlankTemplate} 
      />

      {/* Retro horizontal status ticker */}
      <Ticker />

      {/* Main dashboard grid */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT Column: Code Editor, Terminal & APIs (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Python Code IDE Box */}
            <CodeEditor 
              code={code} 
              setCode={setCode} 
              executingLine={executingLine} 
            />

            {/* Retro Control Action Buttons Tray */}
            <ControlPanel 
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
              runSimulation={runSimulation}
              pauseSimulation={pauseSimulation}
              stepSimulation={stepSimulation}
              resetSimulation={resetSimulation}
            />

            {/* Console Output Terminal */}
            <ConsoleTerminal 
              consoleLogs={consoleLogs} 
              clearLogs={clearLogs} 
            />

            {/* API reference instructions widget */}
            <SystemManual />

            {/* Compass directional guide */}
            <OrientationCompass facing={worldState.robot.facing} />

          </div>

          {/* RIGHT Column: Mission Objective & Isometric Simulator Ground (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Isometric Viewport */}
            <IsometricVisualEngine 
              worldState={worldState}
              isSuccess={isSuccess}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              resetSimulation={resetSimulation}
            />

            {/* Mission Objective Card */}
            <ObjectiveCard />

          </div>

        </div>
      </main>

      {/* Retro aesthetic status foot-rail */}
      <Footer />

    </div>
  );
}
