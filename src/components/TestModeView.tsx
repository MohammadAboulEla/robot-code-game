/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Layers, Code, Play, RefreshCw, Activity } from 'lucide-react';
import { SensorReadout } from './SensorReadout';
import { IsometricVisualEngine } from './IsometricVisualEngine';
import type { GameWorldState } from '../robotInterpreter';
import type { RobotExpression, DialogueScript } from '../types/dialogueTypes';
import { tokenizePython } from '../utils/pythonTokenizer';

interface TestModeViewProps {
  onLaunchDialogue: (script: DialogueScript) => void;
}

type TestTool = 'robot' | 'cargo' | 'target' | 'obstacle';
type TabType = 'dialogue' | 'grid' | 'tokenizer' | 'vitals';

export const TestModeView: React.FC<TestModeViewProps> = ({ onLaunchDialogue }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dialogue');

  // ── Dialogue Tester State ──────────────────────────────────────────────────
  const [speaker, setSpeaker] = useState('PY-101');
  const [expression, setExpression] = useState<RobotExpression>('idle');
  const [dialogueText, setDialogueText] = useState(
    'Salutations, Programmer! Use move("left") or grab() commands to command R-07.'
  );

  const handleLaunchDialogue = () => {
    onLaunchDialogue({
      id: 'test-dialogue',
      lines: [
        {
          speaker,
          expression,
          text: dialogueText,
          requiresConfirm: true,
        },
      ],
    });
  };

  // ── Grid Visual Tester State ────────────────────────────────────────────────
  const [gridWidth, setGridWidth] = useState(4);
  const [gridHeight, setGridHeight] = useState(4);
  const [robotX, setRobotX] = useState(0);
  const [robotY, setRobotY] = useState(0);
  const [robotFacing, setRobotFacing] = useState<'up' | 'down' | 'left' | 'right'>('down');
  const [robotHolding, setRobotHolding] = useState(false);
  const [cargoX, setCargoX] = useState(1);
  const [cargoY, setCargoY] = useState(1);
  const [targetX, setTargetX] = useState(2);
  const [targetY, setTargetY] = useState(2);
  const [obstacles, setObstacles] = useState<{ x: number; y: number }[]>([{ x: 3, y: 0 }]);
  const [activeTool, setActiveTool] = useState<TestTool>('robot');

  const worldState: GameWorldState = {
    robot: { x: robotX, y: robotY, facing: robotFacing, holding: robotHolding },
    box: { x: cargoX, y: cargoY },
    target: { x: targetX, y: targetY },
    gridSize: { width: gridWidth, height: gridHeight },
    obstacles,
  };

  const handleTileClick = (x: number, y: number) => {
    if (activeTool === 'robot') {
      setRobotX(x);
      setRobotY(y);
    } else if (activeTool === 'cargo') {
      setCargoX(x);
      setCargoY(y);
    } else if (activeTool === 'target') {
      setTargetX(x);
      setTargetY(y);
    } else if (activeTool === 'obstacle') {
      const exists = obstacles.some(o => o.x === x && o.y === y);
      if (exists) {
        setObstacles(prev => prev.filter(o => !(o.x === x && o.y === y)));
      } else {
        setObstacles(prev => [...prev, { x, y }]);
      }
    }
  };

  const resetGridElements = () => {
    setRobotX(0);
    setRobotY(0);
    setCargoX(1);
    setCargoY(1);
    setTargetX(2);
    setTargetY(2);
    setObstacles([]);
  };

  // ── Tokenizer Tester State ─────────────────────────────────────────────────
  const [testCode, setTestCode] = useState(
    `# Test custom scripts here\nfor i in range(3):\n    move("left")\n    grab()\n    drop()`
  );

  // ── Vitals Sensor Tester State ──────────────────────────────────────────────
  const [vitalsUnitId, setVitalsUnitId] = useState('PY-101');
  const [vitalsEnergy, setVitalsEnergy] = useState(72);
  const [vitalsTemperature, setVitalsTemperature] = useState(45);

  const tokens = tokenizePython(testCode);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#dfd3b6] text-[#2e2a22] font-sans p-6 overflow-y-auto">
      
      {/* Unified Tabbed Panel Card Container */}
      <div className="w-full max-w-5xl mx-auto bg-[#f4efe1] border border-[#3e382d] shadow-md flex flex-col overflow-hidden animate-fade-in">
        
        {/* Compact Retro Navigation Tabs Header */}
        <div className="flex bg-[#eae3ce] border-b border-[#3e382d] shrink-0">
          <button
            onClick={() => setActiveTab('dialogue')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-bold border-b-2 transition uppercase tracking-wider cursor-pointer font-mono whitespace-nowrap px-4 ${
              activeTab === 'dialogue'
                ? 'border-[#9c3526] text-[#9c3526] bg-[#faf8f2]'
                : 'border-transparent text-[#5c5341] hover:text-[#2e2a22] hover:bg-[#faf8f2]/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dialogue System</span>
          </button>
          <button
            onClick={() => setActiveTab('grid')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-bold border-b-2 transition uppercase tracking-wider cursor-pointer font-mono whitespace-nowrap px-4 ${
              activeTab === 'grid'
                ? 'border-[#9c3526] text-[#9c3526] bg-[#faf8f2]'
                : 'border-transparent text-[#5c5341] hover:text-[#2e2a22] hover:bg-[#faf8f2]/30'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Isometric Grid</span>
          </button>
          <button
            onClick={() => setActiveTab('tokenizer')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-bold border-b-2 transition uppercase tracking-wider cursor-pointer font-mono whitespace-nowrap px-4 ${
              activeTab === 'tokenizer'
                ? 'border-[#9c3526] text-[#9c3526] bg-[#faf8f2]'
                : 'border-transparent text-[#5c5341] hover:text-[#2e2a22] hover:bg-[#faf8f2]/30'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Tokenizer / Editor</span>
          </button>
          <button
            onClick={() => setActiveTab('vitals')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-bold border-b-2 transition uppercase tracking-wider cursor-pointer font-mono whitespace-nowrap px-4 ${
              activeTab === 'vitals'
                ? 'border-[#9c3526] text-[#9c3526] bg-[#faf8f2]'
                : 'border-transparent text-[#5c5341] hover:text-[#2e2a22] hover:bg-[#faf8f2]/30'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Vitals Sensor</span>
          </button>
        </div>

        {/* Tab Panels Body */}
        <div className="flex-1 bg-[#f4efe1]">
          
          {/* dialogue tab */}
          {activeTab === 'dialogue' && (
            <div className="p-5 flex flex-col gap-4 max-w-2xl mx-auto w-full animate-fade-in">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-[#5c5341] font-bold">SPEAKER DISPLAY NAME</label>
                <input
                  type="text"
                  value={speaker}
                  onChange={e => setSpeaker(e.target.value)}
                  className="w-full bg-[#faf8f2] border border-[#3e382d] px-2.5 py-1.5 text-xs font-mono font-bold text-[#2e2a22]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-[#5c5341] font-bold">EXPRESSION PORTRAIT</label>
                <select
                  value={expression}
                  onChange={e => setExpression(e.target.value as RobotExpression)}
                  className="w-full bg-[#faf8f2] border border-[#3e382d] px-2 py-1.5 text-xs font-mono font-bold text-[#2e2a22]"
                >
                  <option value="idle">Idle (neutral)</option>
                  <option value="happy">Happy (smiling)</option>
                  <option value="excited">Excited (laughing)</option>
                  <option value="confused">Confused (perplexed)</option>
                  <option value="talking">Talking (active log)</option>
                  <option value="sad">Sad (glitch)</option>
                  <option value="crossed-arms">Crossed Arms (defensive)</option>
                  <option value="pointing">Pointing (instructional)</option>
                  <option value="angry">Angry (alarm)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-[#5c5341] font-bold">DIALOGUE TEXT BODY (HIGHLIGHT TESTABLE)</label>
                <textarea
                  value={dialogueText}
                  onChange={e => setDialogueText(e.target.value)}
                  rows={4}
                  className="w-full bg-[#faf8f2] border border-[#3e382d] p-2.5 text-xs font-mono font-bold text-[#2e2a22] resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setDialogueText('PROGRAMMER, please execute the move("right") and grab() instructions.')}
                  className="text-[9px] font-mono font-bold text-[#5c5341] bg-[#eae3ce] hover:bg-[#ded6be] border border-[#3e382d] py-1.5 px-2.5 cursor-pointer uppercase transition-colors"
                >
                  Preset 1 (API)
                </button>
                <button
                  onClick={() => setDialogueText('Establishing secure OPERATOR channel... Target CARGO BOX detected at Pad R-07.')}
                  className="text-[9px] font-mono font-bold text-[#5c5341] bg-[#eae3ce] hover:bg-[#ded6be] border border-[#3e382d] py-1.5 px-2.5 cursor-pointer uppercase transition-colors"
                >
                  Preset 2 (Lore)
                </button>
              </div>

              <button
                onClick={handleLaunchDialogue}
                className="w-full bg-[#9c3526] hover:bg-[#822c20] text-[#faf8f2] font-mono font-bold text-xs py-2.5 border border-[#3e382d] cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Test Dialogue</span>
              </button>
            </div>
          )}

          {/* grid tab */}
          {activeTab === 'grid' && (
            <div className="p-5 flex flex-col md:flex-row gap-6 animate-fade-in">
              {/* Controls (left) */}
              <div className="flex flex-col gap-4 w-full md:w-[320px] shrink-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-[#5c5341] font-bold">GRID WIDTH ({gridWidth})</label>
                    <input
                      type="range"
                      min="2"
                      max="6"
                      value={gridWidth}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setGridWidth(val);
                        resetGridElements();
                      }}
                      className="accent-[#9c3526]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-[#5c5341] font-bold">GRID HEIGHT ({gridHeight})</label>
                    <input
                      type="range"
                      min="2"
                      max="6"
                      value={gridHeight}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setGridHeight(val);
                        resetGridElements();
                      }}
                      className="accent-[#9c3526]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-[#5c5341] font-bold">EDITING TOOL (SELECT & TAP GRID TILES)</label>
                  <div className="grid grid-cols-4 border border-[#3e382d] select-none text-[10px] font-mono font-bold text-center">
                    <div
                      onClick={() => setActiveTool('robot')}
                      className={`py-1.5 cursor-pointer uppercase border-r border-[#3e382d] transition-colors ${
                        activeTool === 'robot' ? 'bg-[#9c3526] text-[#faf8f2]' : 'bg-[#faf8f2] text-[#5c5341] hover:bg-[#eae3ce]'
                      }`}
                    >
                      Robot
                    </div>
                    <div
                      onClick={() => setActiveTool('cargo')}
                      className={`py-1.5 cursor-pointer uppercase border-r border-[#3e382d] transition-colors ${
                        activeTool === 'cargo' ? 'bg-[#9c3526] text-[#faf8f2]' : 'bg-[#faf8f2] text-[#5c5341] hover:bg-[#eae3ce]'
                      }`}
                    >
                      Cargo
                    </div>
                    <div
                      onClick={() => setActiveTool('target')}
                      className={`py-1.5 cursor-pointer uppercase border-r border-[#3e382d] transition-colors ${
                        activeTool === 'target' ? 'bg-[#9c3526] text-[#faf8f2]' : 'bg-[#faf8f2] text-[#5c5341] hover:bg-[#eae3ce]'
                      }`}
                    >
                      Target
                    </div>
                    <div
                      onClick={() => setActiveTool('obstacle')}
                      className={`py-1.5 cursor-pointer uppercase transition-colors ${
                        activeTool === 'obstacle' ? 'bg-[#9c3526] text-[#faf8f2]' : 'bg-[#faf8f2] text-[#5c5341] hover:bg-[#eae3ce]'
                      }`}
                    >
                      Wall
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-[#5c5341] font-bold">ROBOT HEADING</label>
                    <select
                      value={robotFacing}
                      onChange={e => setRobotFacing(e.target.value as any)}
                      className="bg-[#faf8f2] border border-[#3e382d] px-2 py-1 text-xs font-mono font-bold text-[#2e2a22]"
                    >
                      <option value="up">Up (North-East)</option>
                      <option value="right">Right (South-East)</option>
                      <option value="down">Down (South-West)</option>
                      <option value="left">Left (North-West)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 items-start">
                    <label className="text-[10px] font-mono text-[#5c5341] font-bold">ROBOT STATE</label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-mono font-bold">
                      <input
                        type="checkbox"
                        checked={robotHolding}
                        onChange={e => setRobotHolding(e.target.checked)}
                        className="accent-[#9c3526] w-4 h-4 cursor-pointer"
                      />
                      <span>Holding Cargo</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={resetGridElements}
                  className="w-full mt-2 bg-[#faf8f2] hover:bg-[#eae3ce] text-[#5c5341] font-mono font-bold text-xs py-2 border border-[#3e382d] cursor-pointer flex items-center justify-center gap-2 uppercase transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Elements</span>
                </button>
              </div>

              {/* Viewport (right) */}
              <div className="flex-1 border border-[#3e382d] h-[400px] relative overflow-hidden bg-[#faf8f2]">
                <IsometricVisualEngine
                  worldState={worldState}
                  currentExpression={expression}
                  isSuccess={false}
                  errorMessage={null}
                  setErrorMessage={() => {}}
                  resetSimulation={() => {}}
                  hideWrapper={true}
                  onTileClick={handleTileClick}
                />
              </div>
            </div>
          )}

          {/* vitals tab */}
          {activeTab === 'vitals' && (
            <div className="p-5 flex flex-col md:flex-row gap-6 animate-fade-in">
              {/* Controls (left) */}
              <div className="flex flex-col gap-4 w-full md:w-[320px] shrink-0">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-[#5c5341] font-bold">UNIT IDENTIFIER</label>
                  <input
                    type="text"
                    value={vitalsUnitId}
                    onChange={e => setVitalsUnitId(e.target.value)}
                    className="w-full bg-[#faf8f2] border border-[#3e382d] px-2.5 py-1.5 text-xs font-mono font-bold text-[#2e2a22]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-[#5c5341] font-bold">ENERGY LEVEL ({vitalsEnergy}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={vitalsEnergy}
                    onChange={e => setVitalsEnergy(Number(e.target.value))}
                    className="accent-[#9c3526]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-[#5c5341] font-bold">CORE TEMPERATURE ({vitalsTemperature}°C)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={vitalsTemperature}
                    onChange={e => setVitalsTemperature(Number(e.target.value))}
                    className="accent-[#9c3526]"
                  />
                </div>

                {/* Quick presets */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-[#5c5341] font-bold">QUICK PRESETS</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => { setVitalsEnergy(95); setVitalsTemperature(32); }}
                      className="text-[9px] font-mono font-bold text-[#2d6a4f] bg-[#faf8f2] hover:bg-[#eae3ce] border border-[#3e382d] py-1.5 px-2 cursor-pointer uppercase transition-colors"
                    >
                      Healthy
                    </button>
                    <button
                      onClick={() => { setVitalsEnergy(30); setVitalsTemperature(78); }}
                      className="text-[9px] font-mono font-bold text-[#b8860b] bg-[#faf8f2] hover:bg-[#eae3ce] border border-[#3e382d] py-1.5 px-2 cursor-pointer uppercase transition-colors"
                    >
                      Caution
                    </button>
                    <button
                      onClick={() => { setVitalsEnergy(8); setVitalsTemperature(95); }}
                      className="text-[9px] font-mono font-bold text-[#9c3526] bg-[#faf8f2] hover:bg-[#eae3ce] border border-[#3e382d] py-1.5 px-2 cursor-pointer uppercase transition-colors"
                    >
                      Critical
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => { setVitalsUnitId('PY-101'); setVitalsEnergy(72); setVitalsTemperature(45); }}
                  className="w-full mt-2 bg-[#faf8f2] hover:bg-[#eae3ce] text-[#5c5341] font-mono font-bold text-xs py-2 border border-[#3e382d] cursor-pointer flex items-center justify-center gap-2 uppercase transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              {/* Live preview (right) */}
              <div className="flex-1 flex flex-col gap-3">
                <label className="text-[10px] font-mono text-[#5c5341] font-bold">LIVE PREVIEW — SENSOR READOUT COMPONENT</label>
                <div className="bg-[#2a2520] border border-[#3e382d] rounded-lg p-6 flex items-center justify-center min-h-[300px]">
                  <div className="w-full max-w-sm">
                    <SensorReadout
                      data={{
                        unitId: vitalsUnitId,
                        energy: vitalsEnergy,
                        temperature: vitalsTemperature,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* tokenizer tab */}
          {activeTab === 'tokenizer' && (
            <div className="p-5 flex flex-col md:flex-row gap-6 animate-fade-in">
              {/* Input editor (left) */}
              <div className="flex-1 flex flex-col gap-2 h-[450px]">
                <label className="text-[10px] font-mono text-[#5c5341] font-bold">INPUT PYTHON CODE SNIPPET</label>
                <textarea
                  value={testCode}
                  onChange={e => setTestCode(e.target.value)}
                  className="w-full flex-1 bg-[#faf8f2] border border-[#3e382d] p-3 text-xs font-mono text-[#2e2a22] resize-none"
                  style={{ tabSize: 4 }}
                />
              </div>

              {/* Output inspector (right) */}
              <div className="flex-1 flex flex-col gap-2 h-[450px]">
                <label className="text-[10px] font-mono text-[#5c5341] font-bold">PARSED TOKENS ({tokens.length})</label>
                <div className="flex-1 overflow-y-auto border border-[#3e382d] bg-[#faf8f2]">
                  <table className="w-full border-collapse font-mono text-[10px] text-left">
                    <thead>
                      <tr className="bg-[#eae3ce] border-b border-[#3e382d] text-[#5c5341] font-bold sticky top-0 z-10">
                        <th className="p-2 border-r border-[#3e382d]/30">TEXT</th>
                        <th className="p-2 border-r border-[#3e382d]/30">CLASSIFICATION</th>
                        <th className="p-2">PREVIEW</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tokens.map((token, i) => {
                        let textClass = "text-[#2e2a22]";
                        if (token.type === 'comment') {
                          textClass = "text-[#8a7c62] italic";
                        } else if (token.type === 'string') {
                          textClass = "text-[#4d7c0f] font-semibold";
                        } else if (token.type === 'number') {
                          textClass = "text-[#b8005b]";
                        } else if (token.type === 'keyword') {
                          textClass = "text-[#9c3526] font-bold";
                        } else if (token.type === 'function') {
                          textClass = "text-[#1a6596] font-bold";
                        } else if (token.type === 'punctuation') {
                          textClass = "text-[#5c5341]";
                        }
                        
                        const displayText = token.text.replace(/\n/g, '\\n').replace(/\s/g, '•');

                        return (
                          <tr key={i} className="border-b border-[#3e382d]/20 hover:bg-[#eae3ce]/20">
                            <td className="p-2 border-r border-[#3e382d]/30 font-bold max-w-[120px] truncate" title={token.text}>
                              {displayText}
                            </td>
                            <td className="p-2 border-r border-[#3e382d]/30 font-bold uppercase text-[#5c5341]">
                              {token.type}
                            </td>
                            <td className="p-2 font-bold">
                              <span className={textClass}>{token.text}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};
