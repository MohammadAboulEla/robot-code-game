/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trash2, Play, GitCompare, Award } from 'lucide-react';
import type { PuzzleDefinition, SavedSolution } from '../types/gameTypes';

interface SolutionsPanelProps {
  puzzle: PuzzleDefinition;
  savedSolutions: SavedSolution[];
  onLoadSolution: (code: string) => void;
  onDeleteSolution: (timestamp: number) => void;
  currentCode: string;
}

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

function diffLines(oldStr: string, newStr: string): DiffLine[] {
  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');
  
  const dp: number[][] = Array(oldLines.length + 1)
    .fill(null)
    .map(() => Array(newLines.length + 1).fill(0));
  
  for (let i = 1; i <= oldLines.length; i++) {
    for (let j = 1; j <= newLines.length; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  const diff: DiffLine[] = [];
  let i = oldLines.length;
  let j = newLines.length;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      diff.unshift({ type: 'unchanged', text: oldLines[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({ type: 'added', text: newLines[j - 1] });
      j--;
    } else {
      diff.unshift({ type: 'removed', text: oldLines[i - 1] });
      i--;
    }
  }
  
  return diff;
}

function formatTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  
  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

export const SolutionsPanel: React.FC<SolutionsPanelProps> = ({
  puzzle,
  savedSolutions,
  onLoadSolution,
  onDeleteSolution,
  currentCode
}) => {
  const [sortBy, setSortBy] = useState<'instructions' | 'lines' | 'steps'>('instructions');
  const [comparingSolution, setComparingSolution] = useState<SavedSolution | null>(null);

  const bestInstructions = savedSolutions.length > 0 
    ? Math.min(...savedSolutions.map(s => s.metrics.instructions)) 
    : null;
  const bestLines = savedSolutions.length > 0 
    ? Math.min(...savedSolutions.map(s => s.metrics.lines)) 
    : null;
  const bestSteps = savedSolutions.length > 0 
    ? Math.min(...savedSolutions.map(s => s.metrics.steps)) 
    : null;

  const sortedSolutions = [...savedSolutions].sort((a, b) => {
    return a.metrics[sortBy] - b.metrics[sortBy];
  });

  const parInstructions = puzzle.parMetrics?.instructions;
  const parLines = puzzle.parMetrics?.lines;

  const isBeatInstructions = bestInstructions !== null && parInstructions !== undefined && bestInstructions <= parInstructions;
  const isBeatLines = bestLines !== null && parLines !== undefined && bestLines <= parLines;

  return (
    <div className="bg-[#f4efe1] border border-[#3e382d] shadow-sm overflow-hidden flex flex-col">
      <div className="border-b border-[#3e382d] bg-[#eae3ce] px-4 py-2.5 flex justify-between items-center">
        <h3 className="text-xs font-bold text-[#2e2a22] font-mono uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#9c3526]" />
          Protocol Archive & Metrics
        </h3>
        {savedSolutions.length > 0 && (
          <div className="flex gap-1 items-center">
            <span className="text-[10px] text-[#5c5341] font-mono mr-1">Sort:</span>
            {(['instructions', 'lines', 'steps'] as const).map(metric => (
              <button
                key={metric}
                onClick={() => setSortBy(metric)}
                className={`text-[9px] font-bold font-mono px-2 py-0.5 border cursor-pointer uppercase transition ${
                  sortBy === metric
                    ? 'bg-[#9c3526] text-[#faf8f2] border-[#9c3526]'
                    : 'bg-[#faf8f2]/60 text-[#5c5341] border-[#3e382d]/20 hover:bg-[#eae3ce]'
                }`}
              >
                {metric.substring(0, 5)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-[#faf8f2] space-y-4">
        {/* Par Metrics Summary Card */}
        <div className="grid grid-cols-3 gap-2 bg-[#f4efe1]/60 border border-[#3e382d]/20 p-2.5">
          <div className="text-center border-r border-[#3e382d]/10 last:border-r-0">
            <div className="text-[9px] font-bold uppercase text-[#5c5341] font-mono">Instructions</div>
            <div className="text-base font-bold text-[#2e2a22] font-mono mt-0.5">
              {bestInstructions !== null ? bestInstructions : '--'}
              <span className="text-[10px] text-[#8a7e6b] font-normal"> / {parInstructions || '--'}</span>
            </div>
            {parInstructions && bestInstructions !== null && (
              <div className={`text-[9px] font-bold font-mono mt-0.5 uppercase ${isBeatInstructions ? 'text-[#4d7c0f]' : 'text-[#9c3526]'}`}>
                {isBeatInstructions ? '★ Beat Par' : 'Over Par'}
              </div>
            )}
          </div>

          <div className="text-center border-r border-[#3e382d]/10 last:border-r-0">
            <div className="text-[9px] font-bold uppercase text-[#5c5341] font-mono">Lines of Code</div>
            <div className="text-base font-bold text-[#2e2a22] font-mono mt-0.5">
              {bestLines !== null ? bestLines : '--'}
              <span className="text-[10px] text-[#8a7e6b] font-normal"> / {parLines || '--'}</span>
            </div>
            {parLines && bestLines !== null && (
              <div className={`text-[9px] font-bold font-mono mt-0.5 uppercase ${isBeatLines ? 'text-[#4d7c0f]' : 'text-[#9c3526]'}`}>
                {isBeatLines ? '★ Beat Par' : 'Over Par'}
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="text-[9px] font-bold uppercase text-[#5c5341] font-mono">Fastest Steps</div>
            <div className="text-base font-bold text-[#2e2a22] font-mono mt-0.5">
              {bestSteps !== null ? bestSteps : '--'}
            </div>
            <div className="text-[9px] text-[#8a7e6b] font-mono mt-0.5">
              {bestSteps !== null ? 'Record' : 'No run yet'}
            </div>
          </div>
        </div>

        {/* Diff Comparison View */}
        {comparingSolution && (
          <div className="border border-[#3e382d] bg-[#2e2a22] text-[#faf8f2] p-3 flex flex-col space-y-2">
            <div className="flex justify-between items-center border-b border-[#3e382d]/50 pb-1.5">
              <span className="text-[10px] font-bold uppercase font-mono text-[#eae3ce] flex items-center gap-1">
                <GitCompare className="w-3.5 h-3.5 text-[#9c3526]" />
                Diff View (Archive vs Current)
              </span>
              <button
                onClick={() => setComparingSolution(null)}
                className="text-[#8a7e6b] hover:text-[#faf8f2] text-xs font-bold font-mono border border-transparent hover:border-[#8a7e6b] px-1 cursor-pointer"
              >
                ✕ CLOSE
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto font-mono text-[11px] leading-relaxed bg-[#1b1915] p-2 border border-[#3e382d]/40 scrollbar-thin scrollbar-thumb-[#3e382d] scrollbar-track-[#1b1915]">
              {diffLines(comparingSolution.code, currentCode).map((line, idx) => {
                if (line.type === 'added') {
                  return (
                    <div key={idx} className="bg-emerald-950/30 text-emerald-400 border-l border-emerald-500 pl-1.5 my-0.5 font-mono">
                      + {line.text || ' '}
                    </div>
                  );
                }
                if (line.type === 'removed') {
                  return (
                    <div key={idx} className="bg-rose-950/30 text-rose-400 border-l border-rose-500 pl-1.5 my-0.5 font-mono">
                      - {line.text || ' '}
                    </div>
                  );
                }
                return (
                  <div key={idx} className="text-[#a89f8d] pl-1.5 opacity-80 font-mono">
                    &nbsp;&nbsp;{line.text || ' '}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* List of Solutions */}
        <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-[#eae3ce]">
          {sortedSolutions.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#8a7e6b] italic font-mono bg-[#f4efe1]/40 border border-dashed border-[#3e382d]/10">
              No protocol runs archived. Complete the simulation goal to record a solution.
            </div>
          ) : (
            sortedSolutions.map((sol) => {
              const runNumber = savedSolutions.findIndex(s => s.timestamp === sol.timestamp) + 1;
              const solBeatInstr = parInstructions !== undefined && sol.metrics.instructions <= parInstructions;
              const solBeatLines = parLines !== undefined && sol.metrics.lines <= parLines;

              return (
                <div
                  key={sol.timestamp}
                  className="bg-[#f4efe1]/50 hover:bg-[#eae3ce]/50 border border-[#3e382d]/10 p-2.5 flex justify-between items-center transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#2e2a22] font-mono">
                        RUN #{runNumber}
                      </span>
                      <span className="text-[9px] text-[#8a7e6b] font-mono">
                        ({formatTime(sol.timestamp)})
                      </span>
                    </div>
                    
                    <div className="flex gap-3 text-[10px] text-[#5c5341] font-mono">
                      <span className={solBeatInstr ? 'text-emerald-700 font-bold' : ''}>
                        I: {sol.metrics.instructions}
                      </span>
                      <span className={solBeatLines ? 'text-emerald-700 font-bold' : ''}>
                        L: {sol.metrics.lines}
                      </span>
                      <span>
                        S: {sol.metrics.steps}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => setComparingSolution(sol)}
                      title="Compare diff"
                      className="p-1 text-[#5c5341] hover:text-[#2e2a22] bg-[#faf8f2] border border-[#3e382d]/20 hover:bg-[#eae3ce] cursor-pointer"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onLoadSolution(sol.code)}
                      title="Load into Editor"
                      className="p-1 text-[#4d7c0f] hover:text-[#3f6212] bg-[#faf8f2] border border-[#3e382d]/20 hover:bg-[#eae3ce] cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-[#4d7c0f]" />
                    </button>
                    <button
                      onClick={() => onDeleteSolution(sol.timestamp)}
                      title="Delete archived run"
                      className="p-1 text-[#9c3526] hover:text-[#852a1e] bg-[#faf8f2] border border-[#3e382d]/20 hover:bg-[#eae3ce] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
