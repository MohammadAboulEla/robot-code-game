/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Terminal, Cpu } from 'lucide-react';
import { DebuggerPanel } from './DebuggerPanel';
import type { VMAction } from '../robotInterpreter';

interface ConsoleTerminalProps {
  consoleLogs: string[];
  clearLogs: () => void;
  actionQueue: VMAction[];
  currentIndex: number;
  isDebugMode?: boolean;
}

export const ConsoleTerminal: React.FC<ConsoleTerminalProps> = ({
  consoleLogs,
  clearLogs,
  actionQueue,
  currentIndex,
  isDebugMode = false
}) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'debugger'>('terminal');

  return (
    <div className="bg-[#f4efe1] border border-[#3e382d] shadow-sm overflow-hidden flex flex-col h-full font-mono text-xs text-[#2e2a22]">
      {/* Header Tabs */}
      <div className="border-b border-[#3e382d] bg-[#eae3ce] flex justify-between items-center shrink-0">
        <div className="flex">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold border-r border-[#3e382d] transition uppercase tracking-wider cursor-pointer ${
              activeTab === 'terminal'
                ? 'bg-[#faf8f2] text-[#9c3526]'
                : 'text-[#5c5341] hover:bg-[#eae3ce]/50 hover:text-[#2e2a22]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>
          
          <button
            onClick={() => setActiveTab('debugger')}
            className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold border-r border-[#3e382d] transition uppercase tracking-wider cursor-pointer ${
              activeTab === 'debugger'
                ? 'bg-[#faf8f2] text-[#9c3526]'
                : 'text-[#5c5341] hover:bg-[#eae3ce]/50 hover:text-[#2e2a22]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Debugger</span>
          </button>
        </div>

        <div className="px-4 py-1.5">
          {activeTab === 'terminal' ? (
            <button 
              onClick={clearLogs}
              className="text-[10px] text-[#9c3526] hover:text-[#852a1e] uppercase font-bold cursor-pointer"
            >
              Clear Logs
            </button>
          ) : (
            actionQueue.length > 0 && currentIndex !== -1 && (
              <span className="bg-[#faf8f2] px-2 py-0.5 border border-[#3e382d] text-[#5c5341] font-bold text-[9px]">
                STEP {currentIndex + 1} OF {actionQueue.length}
              </span>
            )
          )}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="flex-grow flex-1 min-h-0 bg-[#faf8f2] flex flex-col overflow-hidden">
        {activeTab === 'terminal' && (
          <div className="p-4 flex-grow overflow-y-auto space-y-1.5">
            {consoleLogs.map((log, index) => (
              <div key={`log-${index}`} className="border-l-2 border-[#eae3ce] pl-2.5">
                {log}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'debugger' && (
          <div className="flex-grow flex-1 min-h-0 flex flex-col overflow-hidden">
            <DebuggerPanel
              actionQueue={actionQueue}
              currentIndex={currentIndex}
              hideHeader={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};
