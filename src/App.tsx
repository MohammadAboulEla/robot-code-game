/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { PuzzleDefinition } from './types/gameTypes';
import { PUZZLES } from './puzzles';
import { buildCommandRegistry, ALL_COMMAND_IDS } from './game/commands/commands';
import { getUnlockedCommandIds, getUnlockedNodeIds } from './state/saveData';
import { Header } from './components/Header';
import { Ticker } from './components/Ticker';
import { PuzzleSelect } from './components/PuzzleSelect';
import { GameView } from './components/GameView';

export default function App() {
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleDefinition | null>(null);
  // Force re-render of puzzle select when a puzzle is solved (to update badges/unlocks)
  const [solvedCounter, setSolvedCounter] = useState(0);

  // Playground Mode states
  const [isPlaygroundMode, setIsPlaygroundMode] = useState(false);
  const [playgroundPuzzle, setPlaygroundPuzzle] = useState<PuzzleDefinition | null>(null);
  const [playgroundReloadCounter, setPlaygroundReloadCounter] = useState(0);

  // Detect ?dev=1 query parameter
  const isDevUrlParam = useMemo(() => {
    return new URLSearchParams(window.location.search).get('dev') === '1';
  }, []);

  // Keyboard shortcut listener to toggle playground mode (Ctrl+Shift+D or Ctrl+Alt+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isToggleCombo = 
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') ||
        (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'p');
      
      if (isToggleCombo) {
        e.preventDefault();
        setIsPlaygroundMode(prev => {
          const next = !prev;
          if (next) {
            // Initialize playground puzzle if none is selected
            setPlaygroundPuzzle(selectedPuzzle || PUZZLES[0]);
          }
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPuzzle]);

  const handleTogglePlaygroundMode = useCallback(() => {
    setIsPlaygroundMode(prev => {
      const next = !prev;
      if (next) {
        setPlaygroundPuzzle(selectedPuzzle || PUZZLES[0]);
      }
      return next;
    });
  }, [selectedPuzzle]);

  // Compute unlocked node and command IDs from save data, re-run whenever solvedCounter updates
  const unlockedNodeIds = useMemo(() => getUnlockedNodeIds(), [solvedCounter]);
  const unlockedCommandIds = useMemo(() => getUnlockedCommandIds(), [solvedCounter]);

  // Active puzzle definition depending on mode
  const activePuzzle = isPlaygroundMode ? playgroundPuzzle : selectedPuzzle;

  // Intersect allowedCommandIds with unlockedCommandIds at runtime (or unlock all in playground)
  const commandRegistry = useMemo(() => {
    if (isPlaygroundMode) {
      return buildCommandRegistry(ALL_COMMAND_IDS);
    }
    if (!selectedPuzzle) return buildCommandRegistry([]);
    const effectiveIds = selectedPuzzle.allowedCommandIds.filter(id => unlockedCommandIds.includes(id));
    return buildCommandRegistry(effectiveIds);
  }, [selectedPuzzle, unlockedCommandIds, isPlaygroundMode]);

  const handleBackToPuzzles = useCallback(() => {
    setSelectedPuzzle(null);
    setIsPlaygroundMode(false);
  }, []);

  const handlePuzzleSolved = useCallback(() => {
    setSolvedCounter(c => c + 1);
  }, []);

  // Playground puzzle selection and JSON reload helpers
  const handleSelectPlaygroundPuzzle = useCallback((puzzle: PuzzleDefinition) => {
    setPlaygroundPuzzle(puzzle);
    setPlaygroundReloadCounter(c => c + 1);
  }, []);

  const handleHotReloadPlaygroundPuzzle = useCallback((newPuzzle: PuzzleDefinition) => {
    setPlaygroundPuzzle(newPuzzle);
    setPlaygroundReloadCounter(c => c + 1);
  }, []);

  return (
    <div id="game-container" className="h-screen w-screen flex flex-col overflow-hidden bg-[#dfd3b6] text-[#2e2a22] font-sans antialiased selection:bg-[#9c3526]/20 selection:text-[#2e2a22]">
      
      {/* Vintage Header bar */}
      <Header 
        showBackButton={!!activePuzzle}
        onBack={handleBackToPuzzles}
        puzzleTitle={activePuzzle?.title}
        isDev={isDevUrlParam}
        isPlaygroundActive={isPlaygroundMode}
        onTogglePlayground={handleTogglePlaygroundMode}
      />

      {/* Retro horizontal status ticker */}
      <Ticker />

      {activePuzzle ? (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <GameView
            key={isPlaygroundMode ? `playground-${activePuzzle.id}-${playgroundReloadCounter}` : activePuzzle.id}
            puzzle={activePuzzle}
            commandRegistry={commandRegistry}
            unlockedCommandIds={isPlaygroundMode ? ALL_COMMAND_IDS : unlockedCommandIds}
            onPuzzleSolved={handlePuzzleSolved}
            onBack={handleBackToPuzzles}
            isPlaygroundMode={isPlaygroundMode}
            // Playground specific props
            playgroundProps={
              isPlaygroundMode && playgroundPuzzle ? {
                puzzles: PUZZLES,
                selectedPuzzle: playgroundPuzzle,
                onSelectPuzzle: handleSelectPlaygroundPuzzle,
                onHotReload: handleHotReloadPlaygroundPuzzle
              } : undefined
            }
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <PuzzleSelect
            key={`puzzle-select-${solvedCounter}`}
            puzzles={PUZZLES}
            unlockedNodeIds={unlockedNodeIds}
            unlockedCommandIds={unlockedCommandIds}
            onSelectPuzzle={setSelectedPuzzle}
          />
        </div>
      )}

    </div>
  );
}

