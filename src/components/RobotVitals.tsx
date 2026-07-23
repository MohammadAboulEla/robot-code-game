/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface RobotVitalsProps {
  energy: number;
  temperature: number;
}

/** Single vertical thermometer-style gauge, filled from the bottom. */
const Gauge: React.FC<{
  label: string;
  value: number;
  fillFrom: string;
  fillTo: string;
}> = ({ label, value, fillFrom, fillTo }) => {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-[6px] font-mono font-extrabold text-[#5c5341] uppercase tracking-wider text-center leading-none">
        {label}
      </span>
      <div className="relative w-2.5 h-16 bg-[#0d0c0a] border border-[#3e382d] rounded-full overflow-hidden">
        {/* Fill grows from the bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-300 ease-out"
          style={{
            height: `${pct}%`,
            background: `linear-gradient(to top, ${fillFrom}, ${fillTo})`,
          }}
        />
        {/* Level marker line */}
        <div
          className="absolute left-0 right-0 h-[2px] bg-[#faf8f2] shadow-[0_0_2px_rgba(0,0,0,0.6)] transition-all duration-300 ease-out"
          style={{ bottom: `calc(${pct}% - 1px)` }}
        />
      </div>
    </div>
  );
};

/**
 * Compact vertical vitals panel shown under the robot avatar overlay.
 * Replaces the horizontal "Unit Vitals Monitor" readout.
 */
export const RobotVitals: React.FC<RobotVitalsProps> = ({ energy, temperature }) => (
  <div className="bg-[#faf8f2]/95 border-x border-b border-[#3e382d] px-1.5 py-2 flex gap-1.5 w-[60px] select-none">
    <Gauge label="Energy" value={energy} fillFrom="#1b4332" fillTo="#52b788" />
    <Gauge label="Core Temp" value={temperature} fillFrom="#b8860b" fillTo="#9c3526" />
  </div>
);
