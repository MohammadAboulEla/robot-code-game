/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import type { PuzzleDefinition } from './types/gameTypes';
import { PUZZLES } from './puzzles';
import { buildCommandRegistry, ALL_COMMAND_IDS } from './game/commands/commands';
import { getUnlockedCommandIds, getUnlockedNodeIds } from './state/saveData';
import { Header } from './components/Header';
import { Ticker } from './components/Ticker';
import { PuzzleSelect } from './components/PuzzleSelect';
import { GameView } from './components/GameView';
import { Footer } from './components/Footer';

export default function App() {
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleDefinition | null>(null);
  // Force re-render of puzzle select when a puzzle is solved (to update badges/unlocks)
  const [solvedCounter, setSolvedCounter] = useState(0);

  // Compute unlocked node and command IDs from save data, re-run whenever solvedCounter updates
  const unlockedNodeIds = useMemo(() => getUnlockedNodeIds(), [solvedCounter]);
  const unlockedCommandIds = useMemo(() => getUnlockedCommandIds(), [solvedCounter]);

  // Intersect allowedCommandIds with unlockedCommandIds at runtime
  const commandRegistry = useMemo(() => {
    if (!selectedPuzzle) return buildCommandRegistry([]);
    const effectiveIds = selectedPuzzle.allowedCommandIds.filter(id => unlockedCommandIds.includes(id));
    return buildCommandRegistry(effectiveIds);
  }, [selectedPuzzle, unlockedCommandIds]);

  const handleBackToPuzzles = useCallback(() => {
    setSelectedPuzzle(null);
  }, []);

  const handlePuzzleSolved = useCallback(() => {
    setSolvedCounter(c => c + 1);
  }, []);

  return (
    <div id="game-container" className="min-h-screen bg-[#dfd3b6] text-[#2e2a22] font-sans antialiased selection:bg-[#9c3526]/20 selection:text-[#2e2a22] pb-12">
      
      {/* Vintage Header bar */}
      <Header 
        onLoadSolutionPreset={selectedPuzzle ? undefined : undefined}
        onLoadBlankTemplate={selectedPuzzle ? undefined : undefined}
        showBackButton={!!selectedPuzzle}
        onBack={handleBackToPuzzles}
        puzzleTitle={selectedPuzzle?.title}
      />

      {/* Retro horizontal status ticker */}
      <Ticker />

      {selectedPuzzle ? (
        <GameView
          key={selectedPuzzle.id}
          puzzle={selectedPuzzle}
          commandRegistry={commandRegistry}
          unlockedCommandIds={unlockedCommandIds}
          onPuzzleSolved={handlePuzzleSolved}
          onBack={handleBackToPuzzles}
        />
      ) : (
        <PuzzleSelect
          key={`puzzle-select-${solvedCounter}`}
          puzzles={PUZZLES}
          unlockedNodeIds={unlockedNodeIds}
          unlockedCommandIds={unlockedCommandIds}
          onSelectPuzzle={setSelectedPuzzle}
        />
      )}

      {/* Retro aesthetic status foot-rail */}
      <Footer />

    </div>
  );
}
