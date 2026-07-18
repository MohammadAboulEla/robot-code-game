/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { loadSaveData } from '../state/saveData';
import { ACHIEVEMENTS, getEarnedAchievements } from '../progression/achievements';

interface AchievementsPanelProps {
  onClose: () => void;
}

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ onClose }) => {
  const saveData = loadSaveData();
  const earnedIds = getEarnedAchievements(saveData);
  const completionPercentage = Math.round((earnedIds.length / ACHIEVEMENTS.length) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-10 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 bg-[#faf8f2] hover:bg-[#eae3ce] text-[#5c5341] hover:text-[#9c3526] border border-[#3e382d] transition cursor-pointer mr-1"
            title="Back to Mission Select"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="p-2.5 bg-amber-600/10 text-amber-800 border border-amber-600/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2e2a22] tracking-tight font-serif uppercase">
              System Achievements
            </h2>
            <p className="text-xs text-[#5c5341] mt-0.5">
              Verify database validation records and unlock custom compiler execution badges.
            </p>
          </div>
        </div>

        {/* Completion Counter */}
        <div className="bg-[#f4efe1] border border-[#3e382d] px-4 py-2 text-right self-start sm:self-auto min-w-[140px] font-mono">
          <div className="text-[10px] text-[#8a7c62] uppercase font-bold tracking-wider">COMPLETION:</div>
          <div className="text-base font-bold text-[#2e2a22] mt-0.5">
            {earnedIds.length} / {ACHIEVEMENTS.length} <span className="text-[10px] text-[#8a7c62]">({completionPercentage}%)</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#eae3ce] border border-[#3e382d] h-3.5 mb-8 rounded-none overflow-hidden p-0.5">
        <div 
          className="bg-amber-600 h-full border border-amber-800 transition-all duration-500 ease-out"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 gap-4">
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = earnedIds.includes(ach.id);

          return (
            <div
              key={ach.id}
              className={`border p-4 md:p-5 flex items-start gap-4 transition-all duration-200 ${
                isUnlocked
                  ? 'border-[#81a364] bg-[#f2f6ed] shadow-sm'
                  : 'border-[#3e382d]/20 bg-[#f4efe1]/40 opacity-70'
              }`}
            >
              {/* Badge Icon / Lock */}
              <div className={`
                flex-shrink-0 w-14 h-14 flex flex-col items-center justify-center border text-[9px] font-bold font-mono tracking-wider
                ${isUnlocked
                  ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-inner'
                  : 'bg-[#eae3ce]/50 border-[#3e382d]/20 text-[#8a7e6b]'
                }
              `}>
                {isUnlocked ? (
                  <>
                    <Award className="w-5 h-5 text-amber-700 mb-0.5" />
                    <span className="text-[8px] text-amber-800 scale-90">{ach.badgeName}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#8a7e6b] mb-0.5" />
                    <span className="text-[7px] text-[#8a7e6b] scale-90">LOCKED</span>
                  </>
                )}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-bold tracking-tight uppercase font-serif ${
                    isUnlocked ? 'text-[#2e2a22]' : 'text-[#8a7e6b]'
                  }`}>
                    {ach.title}
                  </h3>
                  {isUnlocked ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-bold uppercase bg-[#e2ebd5] text-[#4a6b2a] border border-[#81a364]/40 tracking-wider font-mono">
                      <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 inline-block" /> Unlocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-bold uppercase bg-[#eae3ce]/60 text-[#8a7e6b] border border-[#3e382d]/10 tracking-wider font-mono">
                      Locked
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${
                  isUnlocked ? 'text-[#5c5341] font-mono' : 'text-[#8a7e6b] font-mono italic'
                }`}>
                  {ach.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
