/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface SensorData {
  /** Unit identifier string, e.g. "PY-101" */
  unitId: string;
  /** Energy percentage 0–100 */
  energy: number;
  /** Temperature in degrees (arbitrary units) */
  temperature: number;
}

interface SensorReadoutProps {
  data: SensorData;
}

/**
 * Returns a status color class based on a value's position in a range.
 * green(ok) → amber(caution) → red(critical)
 */
const getLevelColor = (value: number, cautionBelow: number, criticalBelow: number) => {
  if (value <= criticalBelow) return { bar: 'bg-[#9c3526]', text: 'text-[#9c3526]', label: 'CRITICAL' };
  if (value <= cautionBelow) return { bar: 'bg-[#b8860b]', text: 'text-[#b8860b]', label: 'CAUTION' };
  return { bar: 'bg-[#2d6a4f]', text: 'text-[#2d6a4f]', label: 'NOMINAL' };
};

const getTempColor = (temp: number) => {
  if (temp >= 90) return { bar: 'bg-[#9c3526]', text: 'text-[#9c3526]', label: 'OVERHEAT' };
  if (temp >= 70) return { bar: 'bg-[#b8860b]', text: 'text-[#b8860b]', label: 'ELEVATED' };
  return { bar: 'bg-[#2d6a4f]', text: 'text-[#2d6a4f]', label: 'NOMINAL' };
};

/**
 * Vintage terminal-style sensor readout panel.
 * Displays unit ID, energy gauge, and temperature gauge.
 * Designed to match the game's retro-futuristic aesthetic.
 */
export const SensorReadout: React.FC<SensorReadoutProps> = ({ data }) => {
  const energyLevel = getLevelColor(data.energy, 40, 15);
  const tempLevel = getTempColor(data.temperature);

  return (
    <div className="bg-[#1a1814] border-2 border-[#3e382d] rounded-lg shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] font-mono select-none overflow-hidden">

      {/* Header strip */}
      <div className="bg-[#2a2520] border-b border-[#3e382d] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2d6a4f] animate-pulse shadow-[0_0_6px_rgba(45,106,79,0.6)]" />
          <span className="text-[10px] font-bold text-[#8a7c62] tracking-widest uppercase">
            Unit Vitals Monitor
          </span>
        </div>
        <span className="text-[10px] font-bold text-[#5c5341] tracking-wider">
          LIVE
        </span>
      </div>

      <div className="p-4 flex flex-col gap-4">

        {/* Unit ID plate */}
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-bold text-[#5c5341] tracking-widest uppercase w-20 shrink-0">
            UNIT ID
          </span>
          <div className="flex-1 bg-[#0d0c0a] border border-[#3e382d] px-3 py-1.5 rounded">
            <span className="text-sm font-extrabold text-[#e8c547] tracking-wider">
              {data.unitId || '—'}
            </span>
          </div>
        </div>

        {/* Energy gauge */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-[#5c5341] tracking-widest uppercase">
              ENERGY
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-extrabold tracking-wider uppercase ${energyLevel.text}`}>
                {energyLevel.label}
              </span>
              <span className="text-xs font-extrabold text-[#faf8f2]">
                {Math.round(data.energy)}%
              </span>
            </div>
          </div>
          <div className="h-3 bg-[#0d0c0a] border border-[#3e382d] rounded-sm overflow-hidden">
            <div
              className={`h-full ${energyLevel.bar} transition-all duration-300 ease-out`}
              style={{ width: `${Math.max(0, Math.min(100, data.energy))}%` }}
            />
          </div>
          {/* Tick marks */}
          <div className="flex justify-between px-0.5">
            {[0, 25, 50, 75, 100].map(tick => (
              <span key={tick} className="text-[7px] font-bold text-[#5c5341]">
                {tick}
              </span>
            ))}
          </div>
        </div>

        {/* Temperature gauge */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-[#5c5341] tracking-widest uppercase">
              CORE TEMP
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-extrabold tracking-wider uppercase ${tempLevel.text}`}>
                {tempLevel.label}
              </span>
              <span className="text-xs font-extrabold text-[#faf8f2]">
                {Math.round(data.temperature)}°C
              </span>
            </div>
          </div>
          <div className="h-3 bg-[#0d0c0a] border border-[#3e382d] rounded-sm overflow-hidden">
            <div
              className={`h-full ${tempLevel.bar} transition-all duration-300 ease-out`}
              style={{ width: `${Math.max(0, Math.min(100, data.temperature))}%` }}
            />
          </div>
          <div className="flex justify-between px-0.5">
            {[0, 25, 50, 75, 100].map(tick => (
              <span key={tick} className="text-[7px] font-bold text-[#5c5341]">
                {tick}°
              </span>
            ))}
          </div>
        </div>

        {/* Status indicator strip */}
        <div className="flex items-center gap-3 pt-1 border-t border-[#3e382d]/50">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                data.energy <= 15 ? 'bg-[#9c3526] animate-pulse' : 'bg-[#2d6a4f]'
              }`}
            />
            <span className="text-[8px] font-bold text-[#5c5341] tracking-wider uppercase">PWR</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                data.temperature >= 90 ? 'bg-[#9c3526] animate-pulse' : 'bg-[#2d6a4f]'
              }`}
            />
            <span className="text-[8px] font-bold text-[#5c5341] tracking-wider uppercase">THERM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2d6a4f]" />
            <span className="text-[8px] font-bold text-[#5c5341] tracking-wider uppercase">COMMS</span>
          </div>
        </div>

      </div>
    </div>
  );
};
