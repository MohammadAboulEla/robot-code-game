/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Terminal } from 'lucide-react';

interface ConsoleTerminalProps {
  consoleLogs: string[];
  clearLogs: () => void;
}

export const ConsoleTerminal: React.FC<ConsoleTerminalProps> = ({
  consoleLogs,
  clearLogs
}) => {
  return (
    <div className="bg-[#f4efe1] border border-[#3e382d] shadow-sm overflow-hidden flex flex-col h-full">
      <div className="border-b border-[#3e382d] px-4 py-2.5 bg-[#eae3ce] flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#9c3526]" />
          <span className="text-xs font-bold text-[#2e2a22] uppercase font-mono">Console Output Terminal</span>
        </div>
        <button 
          onClick={clearLogs}
          className="text-[10px] text-[#9c3526] hover:text-[#852a1e] uppercase font-bold font-mono"
        >
          Clear Logs
        </button>
      </div>
      <div className="p-4 flex-1 overflow-y-auto font-mono text-xs text-[#2e2a22] space-y-1.5 bg-[#faf8f2] leading-relaxed scrollbar-thin scrollbar-thumb-[#eae3ce]">
        {consoleLogs.map((log, index) => (
          <div key={`log-${index}`} className="border-l-2 border-[#eae3ce] pl-2.5">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};
