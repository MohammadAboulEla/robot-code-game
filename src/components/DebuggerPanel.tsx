/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { VMAction } from '../robotInterpreter';
import { Cpu, Terminal, ArrowRight, CheckCircle2, AlertOctagon } from 'lucide-react';

interface DebuggerPanelProps {
  actionQueue: VMAction[];
  currentIndex: number;
  hideHeader?: boolean;
}

export const DebuggerPanel: React.FC<DebuggerPanelProps> = ({
  actionQueue,
  currentIndex,
  hideHeader = false
}) => {
  const isIdle = actionQueue.length === 0 || currentIndex === -1;

  if (isIdle) {
    return (
      <div className={`flex flex-col items-center justify-center text-center h-full min-h-[140px] p-4 ${hideHeader ? '' : 'border border-[#3e382d] bg-[#f4efe1]'}`}>
        <Cpu className="w-8 h-8 text-[#8a7c62]/60 mb-2 animate-pulse" />
        <h3 className="text-xs font-bold text-[#2e2a22] uppercase tracking-wider font-mono">Debug Monitor: Idle</h3>
        <p className="text-[11px] text-[#8a7c62] mt-1 font-mono max-w-[240px]">
          Press "Step Debug" or run the program to monitor VM execution state.
        </p>
      </div>
    );
  }

  const currentAction = actionQueue[currentIndex];
  if (!currentAction) return null;

  const { beforeState, afterState, type, args, success, message, line, variables = {} } = currentAction;

  // Compute state changes between beforeState and afterState
  const diffs: { label: string; from: string; to: string }[] = [];

  if (beforeState.robot.x !== afterState.robot.x || beforeState.robot.y !== afterState.robot.y) {
    diffs.push({
      label: 'Robot Position',
      from: `(${beforeState.robot.x}, ${beforeState.robot.y})`,
      to: `(${afterState.robot.x}, ${afterState.robot.y})`
    });
  }

  if (beforeState.robot.facing !== afterState.robot.facing) {
    diffs.push({
      label: 'Robot Facing',
      from: beforeState.robot.facing.toUpperCase(),
      to: afterState.robot.facing.toUpperCase()
    });
  }

  if (beforeState.robot.holding !== afterState.robot.holding) {
    diffs.push({
      label: 'Robot Cargo Status',
      from: beforeState.robot.holding ? 'HOLDING' : 'EMPTY',
      to: afterState.robot.holding ? 'HOLDING' : 'EMPTY'
    });
  }

  if (beforeState.box.x !== afterState.box.x || beforeState.box.y !== afterState.box.y) {
    diffs.push({
      label: 'Cargo Box Location',
      from: `(${beforeState.box.x}, ${beforeState.box.y})`,
      to: `(${afterState.box.x}, ${afterState.box.y})`
    });
  }

  // Check if current action is condition check or variable assignment
  const isConditionCheck = type === 'loop_step' || type === 'if_step';
  const condExpr = isConditionCheck ? String(args[0]) : '';
  const condResult = isConditionCheck ? Boolean(args[1]) : false;

  const isAssignment = type === 'assign';
  const assignedVar = isAssignment ? String(args[0]) : '';

  const content = (
    <div className={`grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#3e382d] ${hideHeader ? 'flex-1 min-h-0' : 'h-[200px]'}`}>
      {/* Left Side: Step Summary & World State Diffs */}
      <div className="p-4 flex flex-col justify-between overflow-y-auto scrollbar-thin">
        <div className="space-y-3">
          <div>
            <div className="text-[10px] text-[#8a7c62] uppercase font-bold tracking-wider mb-1">Current Action:</div>
            <div className="flex items-center gap-2 font-bold text-[#2e2a22] bg-[#faf8f2] p-2 border border-[#3e382d]">
              {type === 'move' && <span className="text-[#1a6596]">move()</span>}
              {type === 'rotate' && <span className="text-[#1a6596]">rotate("{args[0]}")</span>}
              {type === 'grab' && <span className="text-[#1a6596]">grab()</span>}
              {type === 'drop' && <span className="text-[#1a6596]">drop()</span>}
              {type === 'pass' && <span className="text-[#8a7c62]">pass</span>}
              {type === 'assign' && (
                <span className="text-[#9c3526]">{args[0]} = {JSON.stringify(args[1])}</span>
              )}
              {type === 'loop_step' && (
                <span className="text-[#c27c13]">while {args[0]}</span>
              )}
              {type === 'if_step' && (
                <span className="text-[#c27c13]">if {args[0]}</span>
              )}
              {type === 'error' && <span className="text-[#9c3526]">Runtime Error</span>}
              {type === 'success' && <span className="text-[#4a6b2a]">Goal Accomplished</span>}
            </div>
          </div>

          {/* Condition Evaluation Details */}
          {isConditionCheck && (
            <div className="bg-[#faf8f2] border border-[#3e382d] p-2 flex justify-between items-center">
              <span className="text-[10px] text-[#5c5341] truncate max-w-[140px]">Check: <code className="font-bold">{condExpr}</code></span>
              <span className={`px-1.5 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${
                condResult 
                  ? 'bg-[#e2ebd5] border-[#81a364] text-[#4a6b2a]' 
                  : 'bg-[#fbebeb] border-[#d88] text-[#9c3526]'
              }`}>
                {condResult ? 'True' : 'False'}
              </span>
            </div>
          )}

          {/* State Diffs */}
          <div>
            <div className="text-[10px] text-[#8a7c62] uppercase font-bold tracking-wider mb-1">State Diffs:</div>
            {diffs.length > 0 ? (
              <div className="space-y-1 bg-[#faf8f2]/60 p-2 border border-[#3e382d] border-dashed">
                {diffs.map((d, idx) => (
                  <div key={`diff-${idx}`} className="flex justify-between items-center text-[10px] text-[#5c5341]">
                    <span className="font-bold">{d.label}:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 line-through">{d.from}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-[#9c3526]" />
                      <span className="font-bold text-[#2e2a22]">{d.to}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-[#8a7c62] italic bg-[#faf8f2]/30 p-2 border border-[#3e382d] border-dashed">
                No spatial grid changes.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Variable Watch & Execution Outcomes */}
      <div className="p-4 flex flex-col justify-between overflow-y-auto scrollbar-thin">
        <div className="flex-1 space-y-3">
          <div className="text-[10px] text-[#8a7c62] uppercase font-bold tracking-wider">Variable Watch:</div>
          
          {Object.keys(variables).length > 0 ? (
            <div className="border border-[#3e382d] bg-[#faf8f2] divide-y divide-[#3e382d]">
              {Object.entries(variables).map(([name, val]) => {
                const isUpdated = isAssignment && assignedVar === name;
                return (
                  <div 
                    key={`var-${name}`} 
                    className={`flex justify-between items-center p-1.5 transition-colors duration-300 text-[11px] ${
                      isUpdated ? 'bg-[#9c3526]/10 font-bold' : ''
                    }`}
                  >
                    <span className="text-[#2e2a22] font-semibold">{name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#5c5341]">{JSON.stringify(val)}</span>
                      {isUpdated && (
                        <span className="bg-[#9c3526] text-white text-[8px] font-bold px-1 uppercase tracking-wider animate-pulse">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-[10px] text-[#8a7c62] italic bg-[#faf8f2]/30 p-2 border border-[#3e382d] border-dashed">
              No active variables defined.
            </div>
          )}
        </div>

        {/* Outcome Status / Failure Reasons */}
        {!success && (
          <div className="mt-2 bg-[#fbebeb] border border-[#f5c6cb] p-2 flex items-start gap-1.5 text-[#9c3526]">
            <AlertOctagon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <div className="text-[10px] leading-tight">
              <span className="font-bold">FAILED:</span> {message}
            </div>
          </div>
        )}
        {type === 'success' && (
          <div className="mt-2 bg-[#e2ebd5] border border-[#c3e6cb] p-2 flex items-start gap-1.5 text-[#4a6b2a]">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <div className="text-[10px] leading-tight font-bold">
              COMPLETED: Puzzle goal successfully solved!
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (hideHeader) {
    return content;
  }

  return (
    <div className="border border-[#3e382d] bg-[#f4efe1] shadow-sm flex flex-col text-xs font-mono">
      {/* Header bar */}
      <div className="border-b border-[#3e382d] bg-[#eae3ce] px-4 py-2.5 flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#9c3526]" />
          <span className="font-bold text-[#2e2a22] uppercase tracking-wider">Debugger Monitor</span>
        </div>
        <span className="bg-[#faf8f2] px-2 py-0.5 border border-[#3e382d] text-[#5c5341] font-bold text-[10px]">
          STEP {currentIndex + 1} OF {actionQueue.length} (LINE {line})
        </span>
      </div>
      {content}
    </div>
  );
};
