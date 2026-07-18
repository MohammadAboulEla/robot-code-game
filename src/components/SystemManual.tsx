/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

export const SystemManual: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'docs' | 'instructions'>('instructions');

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
            <div className="border-b border-[#eae3ce] pb-3">
              <h4 className="font-mono font-bold text-[#9c3526] text-[13px] flex items-center justify-between">
                <span>move(direction)</span>
                <span className="text-[10px] text-[#5c5341] uppercase font-semibold font-sans">Motion</span>
              </h4>
              <p className="text-[#5c5341] mt-1 leading-relaxed">
                Moves the unit one tile in relative direction: <code className="text-[#9c3526] bg-[#eae3ce]/50 px-1 font-mono">"front"</code>, <code className="text-[#9c3526] bg-[#eae3ce]/50 px-1 font-mono">"back"</code>, <code className="text-[#9c3526] bg-[#eae3ce]/50 px-1 font-mono">"left"</code>, or <code className="text-[#9c3526] bg-[#eae3ce]/50 px-1 font-mono">"right"</code> based on its current heading. Returns <code className="font-bold">True</code> on success, aborts on obstacle impact.
              </p>
            </div>

            <div className="border-b border-[#eae3ce] pb-3">
              <h4 className="font-mono font-bold text-[#9c3526] text-[13px] flex items-center justify-between">
                <span>rotate(direction)</span>
                <span className="text-[10px] text-[#5c5341] uppercase font-semibold font-sans">Orientation</span>
              </h4>
              <p className="text-[#5c5341] mt-1 leading-relaxed">
                Turns the robot 90 degrees in the specified direction: <code className="text-[#9c3526] bg-[#eae3ce]/50 px-1 font-mono">"left"</code> (counter-clockwise) or <code className="text-[#9c3526] bg-[#eae3ce]/50 px-1 font-mono">"right"</code> (clockwise).
              </p>
            </div>

            <div className="border-b border-[#eae3ce] pb-3">
              <h4 className="font-mono font-bold text-[#9c3526] text-[13px] flex items-center justify-between">
                <span>grab()</span>
                <span className="text-[10px] text-[#5c5341] uppercase font-semibold font-sans">Actuator</span>
              </h4>
              <p className="text-[#5c5341] mt-1 leading-relaxed">
                Clamps claws on the box. Unit must be on an adjacent tile and correctly facing the amber container cargo.
              </p>
            </div>

            <div className="border-b border-[#eae3ce] pb-3">
              <h4 className="font-mono font-bold text-[#9c3526] text-[13px] flex items-center justify-between">
                <span>drop()</span>
                <span className="text-[10px] text-[#5c5341] uppercase font-semibold font-sans">Actuator</span>
              </h4>
              <p className="text-[#5c5341] mt-1 leading-relaxed">
                Releases the held box onto current coordinate. Success checks are run instantly if dropped on target node.
              </p>
            </div>

            <div className="border-b border-[#eae3ce] pb-3">
              <h4 className="font-mono font-bold text-[#9c3526] text-[13px]">is_holding()</h4>
              <p className="text-[#5c5341] mt-1 leading-relaxed">
                Verifies clamp status. Returns <code className="font-bold">True</code> if holding container, <code className="font-bold">False</code> otherwise.
              </p>
            </div>

            <div>
              <h4 className="font-mono font-bold text-[#9c3526] text-[13px]">can_move(direction)</h4>
              <p className="text-[#5c5341] mt-1 leading-relaxed">
                Probes safety status for next relative move (<code className="text-[#9c3526] bg-[#eae3ce]/50 px-1 font-mono">"front"</code>, <code className="text-[#9c3526] bg-[#eae3ce]/50 px-1 font-mono">"back"</code>, <code className="text-[#9c3526] bg-[#eae3ce]/50 px-1 font-mono">"left"</code>, or <code className="text-[#9c3526] bg-[#eae3ce]/50 px-1 font-mono">"right"</code>). Returns <code className="font-bold">True</code> if trajectory is free, <code className="font-bold">False</code> if walls/obstacles prevent entry.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
