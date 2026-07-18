/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronRight, Code, Play, RefreshCw, Terminal } from 'lucide-react';
import type { PuzzleDefinition } from '../types/gameTypes';
import type { GameWorldState, VMAction } from '../robotInterpreter';
import { lintPuzzle } from '../utils/puzzleLinter';

interface PlaygroundPanelProps {
  puzzles: PuzzleDefinition[];
  selectedPuzzle: PuzzleDefinition;
  onSelectPuzzle: (puzzle: PuzzleDefinition) => void;
  onHotReload: (newPuzzle: PuzzleDefinition) => void;
  worldState: GameWorldState;
  actionQueue: VMAction[];
}

export const PlaygroundPanel: React.FC<PlaygroundPanelProps> = ({
  puzzles,
  selectedPuzzle,
  onSelectPuzzle,
  onHotReload,
  worldState,
  actionQueue
}) => {
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  // Collapsible section states
  const [isJsonOpen, setIsJsonOpen] = useState(true);
  const [isLinterOpen, setIsLinterOpen] = useState(true);
  const [isVmStateOpen, setIsVmStateOpen] = useState(false);
  const [isActionQueueOpen, setIsActionQueueOpen] = useState(false);

  // Sync textarea text when selectedPuzzle changes
  useEffect(() => {
    setJsonText(JSON.stringify(selectedPuzzle, null, 2));
    setJsonError(null);
  }, [selectedPuzzle]);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
  };

  const handleHotReload = () => {
    try {
      const parsed = JSON.parse(jsonText) as PuzzleDefinition;
      // Basic duck-typing check
      if (!parsed.id || !parsed.title || !parsed.gridSize) {
        throw new Error('Missing essential PuzzleDefinition fields (id, title, or gridSize).');
      }
      setJsonError(null);
      onHotReload(parsed);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax.');
    }
  };

  // Perform linting on the current loaded puzzle
  const { errors, warnings } = lintPuzzle(selectedPuzzle);

  return (
    <aside className="border border-[#3e382d] bg-[#f4efe1] p-4 font-mono text-xs text-[#2e2a22] space-y-4 shadow-md w-full h-full max-h-[85vh] overflow-y-auto">
      {/* Panel Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-[#3e382d]/30 text-[#9c3526]">
        <Terminal className="w-4 h-4" />
        <span className="font-bold uppercase tracking-wider text-sm font-serif">Playground Diagnostics</span>
      </div>

      {/* 1. Puzzle selector */}
      <div className="space-y-1">
        <label className="block text-[10px] font-bold text-[#5c5341] uppercase tracking-wider">
          Active Test Target
        </label>
        <div className="relative">
          <select
            value={selectedPuzzle.id}
            onChange={(e) => {
              const selected = puzzles.find((p) => p.id === e.target.value);
              if (selected) {
                onSelectPuzzle(selected);
              }
            }}
            className="w-full bg-[#faf8f2] border border-[#3e382d] p-2 pr-8 text-xs text-[#2e2a22] focus:outline-none focus:border-[#9c3526] rounded-none cursor-pointer appearance-none"
          >
            {puzzles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.id})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-[#5c5341] pointer-events-none" />
        </div>
      </div>

      {/* 2. Puzzle Linter Output */}
      <div className="border border-[#3e382d]/20 bg-[#faf8f2] p-3 space-y-2">
        <button
          onClick={() => setIsLinterOpen(!isLinterOpen)}
          className="w-full flex items-center justify-between text-left font-bold text-[10px] uppercase tracking-wider text-[#5c5341] cursor-pointer"
        >
          <span>Puzzle Linter Status</span>
          <span>{isLinterOpen ? '[-]' : '[+]'}</span>
        </button>

        {isLinterOpen && (
          <div className="space-y-2 pt-1">
            {jsonError ? (
              <div className="flex gap-2 p-2 bg-red-100/50 border border-red-300 text-red-800 rounded-none">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <div>
                  <div className="font-bold">JSON Syntax Error:</div>
                  <div className="text-[10px] leading-relaxed break-all">{jsonError}</div>
                </div>
              </div>
            ) : errors.length === 0 ? (
              <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-300 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-bold text-[10px] uppercase">LINTER: Passed (Valid Configuration)</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="font-bold text-red-800 text-[10px] uppercase">
                  Linter: {errors.length} Critical Error{errors.length > 1 ? 's' : ''}
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1 bg-red-50/50 border border-red-200 p-2 text-[10px] text-red-900 leading-normal">
                  {errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-red-600 font-bold">•</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {warnings.length > 0 && !jsonError && (
              <div className="space-y-1">
                <div className="font-bold text-amber-800 text-[10px] uppercase">
                  Warnings ({warnings.length})
                </div>
                <div className="max-h-20 overflow-y-auto space-y-1 bg-amber-50/50 border border-amber-200 p-2 text-[10px] text-amber-900 leading-normal">
                  {warnings.map((warn, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Live Puzzle Definition Editor (JSON) */}
      <div className="border border-[#3e382d]/20 bg-[#faf8f2] p-3 space-y-2">
        <button
          onClick={() => setIsJsonOpen(!isJsonOpen)}
          className="w-full flex items-center justify-between text-left font-bold text-[10px] uppercase tracking-wider text-[#5c5341] cursor-pointer"
        >
          <span className="flex items-center gap-1">
            <Code className="w-3.5 h-3.5" />
            Puzzle JSON Definition
          </span>
          <span>{isJsonOpen ? '[-]' : '[+]'}</span>
        </button>

        {isJsonOpen && (
          <div className="space-y-2 pt-1">
            <textarea
              value={jsonText}
              onChange={handleJsonChange}
              rows={12}
              className="w-full bg-[#eae3ce]/30 border border-[#3e382d]/50 p-2 text-[10px] leading-relaxed text-[#2e2a22] font-mono focus:outline-none focus:border-[#9c3526] rounded-none resize-y"
              placeholder="Paste or edit PuzzleDefinition JSON..."
            />
            <button
              onClick={handleHotReload}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border border-[#3e382d] bg-[#f4efe1] hover:bg-[#eae3ce]/50 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-[#9c3526]" />
              Hot-Reload Configuration
            </button>
          </div>
        )}
      </div>

      {/* 4. VM State Inspector */}
      <div className="border border-[#3e382d]/20 bg-[#faf8f2] p-3 space-y-2">
        <button
          onClick={() => setIsVmStateOpen(!isVmStateOpen)}
          className="w-full flex items-center justify-between text-left font-bold text-[10px] uppercase tracking-wider text-[#5c5341] cursor-pointer"
        >
          <span>Raw VM World State</span>
          <span>{isVmStateOpen ? '[-]' : '[+]'}</span>
        </button>

        {isVmStateOpen && (
          <pre className="p-2 bg-[#eae3ce]/20 border border-[#3e382d]/30 text-[9px] leading-relaxed overflow-x-auto text-[#5c5341]">
            {JSON.stringify(worldState, null, 2)}
          </pre>
        )}
      </div>

      {/* 5. Action Queue Inspector */}
      <div className="border border-[#3e382d]/20 bg-[#faf8f2] p-3 space-y-2">
        <button
          onClick={() => setIsActionQueueOpen(!isActionQueueOpen)}
          className="w-full flex items-center justify-between text-left font-bold text-[10px] uppercase tracking-wider text-[#5c5341] cursor-pointer"
        >
          <span>VM Action Queue ({actionQueue.length} steps)</span>
          <span>{isActionQueueOpen ? '[-]' : '[+]'}</span>
        </button>

        {isActionQueueOpen && (
          <pre className="p-2 bg-[#eae3ce]/20 border border-[#3e382d]/30 text-[9px] leading-relaxed overflow-x-auto text-[#5c5341] max-h-56 overflow-y-auto">
            {JSON.stringify(
              actionQueue.map((act) => ({
                line: act.line,
                type: act.type,
                args: act.args,
                success: act.success,
                message: act.message
              })),
              null,
              2
            )}
          </pre>
        )}
      </div>
    </aside>
  );
};
