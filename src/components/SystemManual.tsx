/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { COMMANDS } from '../game/commands/commands';

interface SystemManualProps {
  unlockedCommandIds: string[];
}

export const SystemManual: React.FC<SystemManualProps> = ({ unlockedCommandIds }) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'instructions'>('instructions');

  const isUnlocked = (cmdId: string) => unlockedCommandIds.includes(cmdId);

  const getCategoryLabel = (cmdId: string, category: string): string => {
    if (cmdId === 'move') return 'Motion';
    if (cmdId === 'rotate') return 'Orientation';
    if (cmdId === 'grab' || cmdId === 'drop') return 'Actuator';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const formatDocText = (text: string) => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="text-[#9c3526] bg-[#eae3ce]/50 px-1 font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-[#f4efe1] border border-[#3e382d] shadow-sm overflow-hidden">
      <div className="border-b border-[#3e382d] flex bg-[#eae3ce]">
        <button
          onClick={() => setActiveTab('instructions')}
          className={`flex-1 text-center py-2.5 text-xs font-bold border-b transition uppercase tracking-wider cursor-pointer font-mono ${
            activeTab === 'instructions' 
              ? 'border-[#9c3526] text-[#9c3526] bg-[#faf8f2]/60' 
              : 'border-transparent text-[#5c5341] hover:text-[#2e2a22]'
          }`}
        >
          System Manual
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`flex-1 text-center py-2.5 text-xs font-bold border-b transition uppercase tracking-wider cursor-pointer font-mono ${
            activeTab === 'docs' 
              ? 'border-[#9c3526] text-[#9c3526] bg-[#faf8f2]/60' 
              : 'border-transparent text-[#5c5341] hover:text-[#2e2a22]'
          }`}
        >
          Robot Commands API
        </button>
      </div>

      <div className="p-5 max-h-48 overflow-y-auto text-xs leading-relaxed text-[#2e2a22] bg-[#faf8f2] scrollbar-thin scrollbar-thumb-[#eae3ce] space-y-3.5">
        {activeTab === 'instructions' ? (
          <>
            <div className="flex gap-2.5">
              <div className="w-5 h-5 bg-[#9c3526]/10 text-[#9c3526] border border-[#9c3526]/30 rounded-none flex items-center justify-center shrink-0 font-bold font-mono">1</div>
              <p>Analyze map target locations and grid obstacles. View metrics on coordinate hover.</p>
            </div>
            <div className="flex gap-2.5">
              <div className="w-5 h-5 bg-[#9c3526]/10 text-[#9c3526] border border-[#9c3526]/30 rounded-none flex items-center justify-center shrink-0 font-bold font-mono">2</div>
              <p>Write automation commands. Leverage loops to construct repeating trajectories efficiently.</p>
            </div>
            <div className="flex gap-2.5">
              <div className="w-5 h-5 bg-[#9c3526]/10 text-[#9c3526] border border-[#9c3526]/30 rounded-none flex items-center justify-center shrink-0 font-bold font-mono">3</div>
              <p>Use the <strong>Step Debug</strong> interface to trace executions dynamically instruction-by-instruction.</p>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {COMMANDS.map((cmd) => {
              const unlocked = isUnlocked(cmd.id);
              return (
                <div 
                  key={cmd.id} 
                  className={`border-b border-[#eae3ce] pb-3 last:border-b-0 last:pb-0 ${
                    unlocked ? '' : 'opacity-60'
                  }`}
                >
                  <h4 className="font-mono font-bold text-[#9c3526] text-[13px] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      {!unlocked && <Lock className="w-3.5 h-3.5 text-[#8a7e6b]" />}
                      <span className={unlocked ? '' : 'text-[#8a7e6b]'}>{cmd.signature}</span>
                    </span>
                    <span className="text-[10px] text-[#5c5341] uppercase font-semibold font-sans">
                      {getCategoryLabel(cmd.id, cmd.category)}
                    </span>
                  </h4>
                  {unlocked ? (
                    <p className="text-[#5c5341] mt-1 leading-relaxed">
                      {formatDocText(cmd.docMarkdown)}
                    </p>
                  ) : (
                    <p className="text-[#8a7e6b] mt-1 leading-relaxed italic">
                      Solve training modules to unlock documentation and usage.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
