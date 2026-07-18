/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Code, 
  Terminal, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Navigation, 
  Compass, 
  Cpu, 
  BookOpen, 
  Award,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  parsePython, 
  PythonExecutor, 
  cloneState, 
  GameWorldState, 
  VMAction 
} from './robotInterpreter';

const INITIAL_WORLD_STATE: GameWorldState = {
  robot: {
    x: 0,
    y: 0,
    holding: false,
    facing: 'down'
  },
  box: {
    x: 1,
    y: 3
  },
  target: {
    x: 3,
    y: 1
  },
  gridSize: {
    width: 5,
    height: 5
  },
  obstacles: [
    { x: 2, y: 1 },
    { x: 2, y: 2 },
    { x: 2, y: 3 }
  ]
};

const DEFAULT_PYTHON_CODE = `# Robot Code Game - Delivery Protocol
#
# Available commands:
#   move("front" | "back" | "left" | "right")
#   rotate("left" | "right")
#   grab()
#   drop()
#
# Sensory helpers:
#   is_holding() -> returns True/False
#   can_move("front" | "back" | "left" | "right") -> returns True/False
#
# Task: Drive to the cargo box at (1, 3), rotate to face it, grab it,
# navigate around the obstacles at X=2, and drop
# the cargo container precisely on the target pad at (3, 1).

# Let's move down the left side of the screen to reach (0, 3)
for i in range(3):
    move("front")

# Rotate left to face the cargo box at (1, 3)
rotate("left")

# Retrieve the storage container
grab()

# Navigate around the obstacle barrier from the bottom
# Since we are facing right, moving right is "down" relative to robot, moving front is "right"
move("right") # moves down to (0, 4)
for i in range(3):
    move("front") # moves right to (3, 4)

# Rotate left to face up/North
rotate("left")

for i in range(3):
    move("front") # moves up to (3, 1)

# Unload the container on the target pad
drop()
`;

interface PythonToken {
  type: 'comment' | 'string' | 'number' | 'keyword' | 'function' | 'identifier' | 'whitespace' | 'punctuation';
  text: string;
}

const tokenizePython = (text: string): PythonToken[] => {
  const regex = /(#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+\b)|(\b(?:def|class|if|elif|else|for|while|in|import|from|return|and|or|not|True|False|None|pass)\b)|(\b(?:move|rotate|grab|drop|is_holding|can_move|range|print)\b)|([a-zA-Z_][a-zA-Z0-9_]*)|(\s+)|(.)/g;
  
  const tokens: PythonToken[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1] !== undefined) {
      tokens.push({ type: 'comment', text: match[1] });
    } else if (match[2] !== undefined) {
      tokens.push({ type: 'string', text: match[2] });
    } else if (match[3] !== undefined) {
      tokens.push({ type: 'number', text: match[3] });
    } else if (match[4] !== undefined) {
      tokens.push({ type: 'keyword', text: match[4] });
    } else if (match[5] !== undefined) {
      tokens.push({ type: 'function', text: match[5] });
    } else if (match[6] !== undefined) {
      tokens.push({ type: 'identifier', text: match[6] });
    } else if (match[7] !== undefined) {
      tokens.push({ type: 'whitespace', text: match[7] });
    } else if (match[8] !== undefined) {
      tokens.push({ type: 'punctuation', text: match[8] });
    }
  }
  return tokens;
};

export default function App() {
  const [code, setCode] = useState(DEFAULT_PYTHON_CODE);
  const [worldState, setWorldState] = useState<GameWorldState>(cloneState(INITIAL_WORLD_STATE));
  
  // Execution state
  const [actionQueue, setActionQueue] = useState<VMAction[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(600); // ms per step
  const [executingLine, setExecutingLine] = useState<number | null>(null);
  
  // Console outputs
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'System ready. Input your Python instructions and press "Run Program" to initiate the delivery protocol.'
  ]);
  
  // Game outcomes
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  // UI Helpers
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'docs' | 'instructions'>('instructions');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineGutterRef = useRef<HTMLDivElement>(null);
  const highlightBgRef = useRef<HTMLDivElement>(null);
  const codeHighlightRef = useRef<HTMLPreElement>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync scroll between textarea, line numbers gutter, and line highlights background
  const handleEditorScroll = () => {
    if (textareaRef.current) {
      const scrollTop = textareaRef.current.scrollTop;
      const scrollLeft = textareaRef.current.scrollLeft;
      if (lineGutterRef.current) {
        lineGutterRef.current.scrollTop = scrollTop;
      }
      if (highlightBgRef.current) {
        highlightBgRef.current.scrollTop = scrollTop;
      }
      if (codeHighlightRef.current) {
        codeHighlightRef.current.scrollTop = scrollTop;
        codeHighlightRef.current.scrollLeft = scrollLeft;
      }
    }
  };

  // Sync scrolling whenever the code itself updates, in case layout/rendering changes
  useEffect(() => {
    handleEditorScroll();
  }, [code]);

  // Helper to load simple presets
  const loadSolutionPreset = () => {
    setCode(DEFAULT_PYTHON_CODE);
    resetSimulation();
    logMessage('Loaded default protocol solution template.');
  };

  const loadBlankTemplate = () => {
    setCode(`# Start from scratch!
# Robot starts at (0, 0)
# Cargo box is at (1, 3)
# Target pad is at (3, 1)

`);
    resetSimulation();
    logMessage('Loaded blank sandbox workspace.');
  };

  const logMessage = (msg: string) => {
    setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Run the full Python simulator
  const runSimulation = () => {
    resetSimulationStateOnly();
    
    try {
      const ast = parsePython(code);
      const executor = new PythonExecutor(INITIAL_WORLD_STATE);
      const actions = executor.run(ast);
      
      if (actions.length === 0) {
        throw new Error('No executable actions found. Make sure to call move(), grab(), or drop()!');
      }

      setActionQueue(actions);
      setCurrentIndex(0);
      setIsPlaying(true);
      setExecutingLine(actions[0].line);
      applyStepState(actions[0]);
      
      logMessage(`Compiled successfully. Initiating sequence with ${actions.length} instructions...`);
    } catch (err: any) {
      const msg = err.message || 'Syntax Error: Verification failed.';
      setErrorMessage(msg);
      logMessage(`❌ Compilation Error: ${msg}`);
    }
  };

  // Run a single step (Debug mode)
  const stepSimulation = () => {
    // If not compiled yet, compile first
    if (actionQueue.length === 0) {
      try {
        const ast = parsePython(code);
        const executor = new PythonExecutor(INITIAL_WORLD_STATE);
        const actions = executor.run(ast);
        if (actions.length === 0) {
          throw new Error('No instructions generated.');
        }
        setActionQueue(actions);
        setCurrentIndex(0);
        setExecutingLine(actions[0].line);
        applyStepState(actions[0]);
        logMessage(`Debug step loaded. Line ${actions[0].line}: Executing...`);
        return;
      } catch (err: any) {
        const msg = err.message || 'Syntax Verification failed.';
        setErrorMessage(msg);
        logMessage(`❌ Compile Error: ${msg}`);
        return;
      }
    }

    // Advance index
    const nextIndex = currentIndex + 1;
    if (nextIndex >= actionQueue.length) {
      logMessage('Execution finished. No further steps available.');
      setIsPlaying(false);
      return;
    }

    setCurrentIndex(nextIndex);
    const action = actionQueue[nextIndex];
    setExecutingLine(action.line);
    applyStepState(action);
  };

  const applyStepState = (action: VMAction) => {
    // Log step outcomes
    if (action.message) {
      if (action.success) {
        logMessage(`Line ${action.line}: ${action.message}`);
      } else {
        logMessage(`❌ Line ${action.line} Error: ${action.message}`);
        setErrorMessage(action.message);
        setIsPlaying(false);
      }
    }

    // Handle special statuses
    if (action.type === 'success' && action.success) {
      setIsSuccess(true);
      setIsPlaying(false);
      logMessage(`🏆 Protocol Complete: SUCCESS!`);
    }

    setWorldState(action.afterState);
  };

  // Playback timer loop
  useEffect(() => {
    if (isPlaying && currentIndex >= 0 && currentIndex < actionQueue.length) {
      playbackTimerRef.current = setTimeout(() => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < actionQueue.length) {
          setCurrentIndex(nextIndex);
          const nextAction = actionQueue[nextIndex];
          setExecutingLine(nextAction.line);
          applyStepState(nextAction);
        } else {
          setIsPlaying(false);
        }
      }, playbackSpeed);
    }

    return () => {
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
      }
    };
  }, [isPlaying, currentIndex, actionQueue, playbackSpeed]);

  const pauseSimulation = () => {
    setIsPlaying(false);
    logMessage('Playback paused by operator.');
  };

  const resetSimulationStateOnly = () => {
    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
    }
    setIsPlaying(false);
    setActionQueue([]);
    setCurrentIndex(-1);
    setExecutingLine(null);
    setErrorMessage(null);
    setIsSuccess(false);
    setWorldState(cloneState(INITIAL_WORLD_STATE));
  };

  const resetSimulation = () => {
    resetSimulationStateOnly();
    setConsoleLogs(['System state restored to reference. Workspace cleaned. Ready for initialization.']);
  };

  // Isometric SVG projections
  const tileW = 88;
  const tileH = 44;
  const cx = 250; // SVG center point horizontally
  const cy = 60;  // SVG start offset vertically

  const getIsoCoords = (x: number, y: number) => {
    const sx = cx + (x - y) * (tileW / 2);
    const sy = cy + (x + y) * (tileH / 2);
    return { x: sx, y: sy };
  };

  // Construct polygons for flat isometric tiles
  const getTilePoints = (x: number, y: number) => {
    const { x: sx, y: sy } = getIsoCoords(x, y);
    const top = `${sx},${sy - tileH / 2}`;
    const right = `${sx + tileW / 2},${sy}`;
    const bottom = `${sx},${sy + tileH / 2}`;
    const left = `${sx - tileW / 2},${sy}`;
    return `${top} ${right} ${bottom} ${left}`;
  };

  // Split lines of code for custom editor numbers
  const codeLines = code.split('\n');

  return (
    <div id="game-container" className="min-h-screen bg-[#dfd3b6] text-[#2e2a22] font-sans antialiased selection:bg-[#9c3526]/20 selection:text-[#2e2a22] pb-12">
      
      {/* Vintage Header bar */}
      <header id="game-header" className="border-b border-[#3e382d] bg-[#f4efe1]/90 backdrop-blur px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#9c3526]/10 text-[#9c3526] rounded border border-[#9c3526]/30">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#2e2a22] flex items-center gap-2 uppercase font-serif">
                Robot Code Game
                <span className="inline-flex items-center rounded-none bg-[#9c3526]/10 px-2 py-0.5 text-[10px] font-bold text-[#9c3526] ring-1 ring-inset ring-[#9c3526]/20">
                  SYSTEM V1.0
                </span>
              </h1>
              <p className="text-xs text-[#5c5341] font-mono">Autonomous Isometric Grid Programming Simulator</p>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono">
            <span className="text-xs font-semibold text-[#8a7c62] hidden sm:inline">CONTROL PANEL:</span>
            <button 
              onClick={loadSolutionPreset}
              className="text-xs font-semibold bg-[#faf8f2] hover:bg-[#eae3ce] text-[#9c3526] px-3.5 py-1.5 border border-[#3e382d] transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              LOAD PROTOCOL
            </button>
            <button 
              onClick={loadBlankTemplate}
              className="text-xs font-semibold bg-[#faf8f2] hover:bg-[#eae3ce] text-[#5c5341] hover:text-[#2e2a22] px-3.5 py-1.5 border border-[#3e382d] transition cursor-pointer"
            >
              BLANK WORKSPACE
            </button>
          </div>
        </div>
      </header>

      {/* Retro horizontal status ticker */}
      <div className="border-b border-[#3e382d] bg-[#eae3ce] py-2 px-6 text-center text-xs font-mono text-[#5c5341] tracking-wide">
        autonomous transport protocol · every step carries instructions · tap grid nodes to retrieve coordinate metrics
      </div>

      {/* Main dashboard grid */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT Column: Code Editor, Terminal & APIs (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Python Code IDE Box */}
            <div className="bg-[#faf8f2] border border-[#3e382d] shadow-sm flex flex-col">
              
              {/* Header Editor Controls */}
              <div className="border-b border-[#3e382d] bg-[#eae3ce] px-4 py-2.5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#9c3526]" />
                  <span className="text-xs font-bold text-[#2e2a22] tracking-wider uppercase font-mono">In-Browser Python Editor</span>
                </div>
                <span className="text-[10px] bg-[#faf8f2] px-2 py-0.5 border border-[#3e382d] text-[#5c5341] font-mono font-bold">
                  PYTHON 3 CORE
                </span>
              </div>

              {/* Synchronized Gutter and Textarea Editor */}
              <div className="flex bg-[#faf8f2] h-[400px] relative text-xs font-mono">
                
                {/* 1. Gutter Line Numbers */}
                <div 
                  ref={lineGutterRef}
                  className="w-11 bg-[#eae3ce]/55 border-r border-[#3e382d] text-[#8a7c62] select-none text-right py-4 pr-3.5 overflow-hidden font-mono"
                  style={{ lineHeight: '24px' }}
                >
                  {codeLines.map((_, i) => {
                    const isCurrent = executingLine === (i + 1);
                    return (
                      <div 
                        key={`line-gutter-${i}`}
                        className={`transition-colors duration-200 flex justify-end items-center gap-1 h-6 ${
                          isCurrent ? 'text-[#9c3526] font-bold' : ''
                        }`}
                        style={{ height: '24px', lineHeight: '24px' }}
                      >
                        {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#9c3526] inline-block"></span>}
                        <span>{i + 1}</span>
                      </div>
                    );
                  })}
                </div>

                {/* 2. Text Editor & Execution highlighting background layer */}
                <div className="flex-1 relative overflow-hidden h-full">
                  
                  {/* Highlight Line Background Overlay */}
                  <div 
                    ref={highlightBgRef}
                    className="absolute inset-0 pointer-events-none py-4 select-none font-mono overflow-hidden h-full"
                    style={{ lineHeight: '24px' }}
                  >
                    {codeLines.map((_, i) => {
                      const isCurrent = executingLine === (i + 1);
                      return (
                        <div 
                          key={`line-bg-${i}`}
                          className={`w-full h-6 border-l-2 ${
                            isCurrent 
                              ? 'bg-[#9c3526]/10 border-[#9c3526]' 
                              : 'border-transparent'
                          }`}
                          style={{ height: '24px' }}
                        />
                      );
                    })}
                  </div>

                  {/* Syntax Highlighted Code Overlay */}
                  <pre
                    ref={codeHighlightRef}
                    className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-transparent select-none"
                    style={{
                      tabSize: 4,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      fontSize: '12px',
                      lineHeight: '24px',
                      padding: '16px',
                      margin: 0,
                      border: 'none',
                      boxSizing: 'border-box',
                      whiteSpace: 'pre',
                      color: '#2e2a22',
                    }}
                  >
                    <code>
                      {tokenizePython(code).map((token, i) => {
                        let className = "text-[#2e2a22]"; // default charcoal
                        if (token.type === 'comment') {
                          className = "text-[#8a7c62] italic";
                        } else if (token.type === 'string') {
                          className = "text-[#4d7c0f] font-semibold";
                        } else if (token.type === 'number') {
                          className = "text-[#b8005b]";
                        } else if (token.type === 'keyword') {
                          className = "text-[#9c3526] font-bold";
                        } else if (token.type === 'function') {
                          className = "text-[#1a6596] font-bold";
                        } else if (token.type === 'punctuation') {
                          className = "text-[#5c5341]";
                        }
                        return (
                          <span key={`token-${i}`} className={className}>
                            {token.text}
                          </span>
                        );
                      })}
                    </code>
                  </pre>

                  {/* Actual Textarea Element */}
                  <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onScroll={handleEditorScroll}
                    className="absolute inset-0 w-full h-full bg-transparent resize-none focus:outline-none overflow-auto scrollbar-thin scrollbar-thumb-[#eae3ce] selection:bg-[#9c3526]/20"
                    placeholder="# Write your robot automation logic here..."
                    spellCheck="false"
                    style={{
                      tabSize: 4,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      fontSize: '12px',
                      lineHeight: '24px',
                      padding: '16px',
                      margin: 0,
                      border: 'none',
                      boxSizing: 'border-box',
                      whiteSpace: 'pre',
                      color: code ? 'transparent' : 'inherit',
                      WebkitTextFillColor: code ? 'transparent' : 'inherit',
                      caretColor: '#9c3526',
                    }}
                  />
                </div>

              </div>

            </div>

            {/* Retro Control Action Buttons Tray (Styled like bottom buttons in math plotter) */}
            <div className="border border-[#3e382d] bg-[#f4efe1] p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              
              <div className="flex flex-wrap items-center gap-2">
                {!isPlaying ? (
                  <button
                    onClick={runSimulation}
                    className="bg-[#faf8f2] hover:bg-[#eae3ce] text-[#9c3526] font-bold text-xs py-2 px-4 transition cursor-pointer flex items-center gap-1.5 border border-[#3e382d] uppercase tracking-wider"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    RUN PROGRAM
                  </button>
                ) : (
                  <button
                    onClick={pauseSimulation}
                    className="bg-[#9c3526] hover:bg-[#852a1e] text-white font-bold text-xs py-2 px-4 transition cursor-pointer flex items-center gap-1.5 border border-[#3e382d] uppercase tracking-wider"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    PAUSE
                  </button>
                )}

                <button
                  onClick={stepSimulation}
                  disabled={isPlaying}
                  className="disabled:opacity-45 bg-[#faf8f2] hover:bg-[#eae3ce] text-[#2e2a22] font-bold text-xs py-2 px-4 border border-[#3e382d] transition cursor-pointer flex items-center gap-1 uppercase tracking-wider"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  STEP DEBUG
                </button>

                <button
                  onClick={resetSimulation}
                  className="bg-[#faf8f2] hover:bg-[#eae3ce] text-[#5c5341] font-bold text-xs py-2 px-3 border border-[#3e382d] transition cursor-pointer"
                  title="Reset Simulation State"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Speed selector slider */}
              <div className="flex items-center gap-3 w-full sm:w-auto text-xs font-mono">
                <span className="text-[10px] uppercase font-bold text-[#8a7c62] tracking-wider">DELAY:</span>
                <input
                  type="range"
                  min="150"
                  max="1500"
                  step="50"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="w-20 accent-[#9c3526] cursor-pointer"
                />
                <span className="text-[11px] font-mono text-[#5c5341] w-12 text-right">{playbackSpeed}ms</span>
              </div>

            </div>

            {/* Console Output Terminal */}
            <div className="bg-[#f4efe1] border border-[#3e382d] shadow-sm overflow-hidden">
              <div className="border-b border-[#3e382d] px-4 py-2.5 bg-[#eae3ce] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#9c3526]" />
                  <span className="text-xs font-bold text-[#2e2a22] uppercase font-mono">Console Output Terminal</span>
                </div>
                <button 
                  onClick={() => setConsoleLogs([])}
                  className="text-[10px] text-[#9c3526] hover:text-[#852a1e] uppercase font-bold font-mono"
                >
                  Clear Logs
                </button>
              </div>
              <div className="p-4 h-40 overflow-y-auto font-mono text-xs text-[#2e2a22] space-y-1.5 bg-[#faf8f2] leading-relaxed scrollbar-thin scrollbar-thumb-[#eae3ce]">
                {consoleLogs.map((log, index) => (
                  <div key={`log-${index}`} className="border-l-2 border-[#eae3ce] pl-2.5">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* API reference instructions widget */}
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

            {/* Compass directional guide */}
            <div className="bg-[#f4efe1] border border-[#3e382d] p-4 shadow-sm">
              <div className="flex items-center gap-3 justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#9c3526]" />
                  <span className="text-xs font-bold text-[#2e2a22] tracking-wider uppercase font-mono">Robot Orientation Compass</span>
                </div>
                <span className="text-[10px] text-[#5c5341] bg-[#faf8f2] px-2 py-0.5 border border-[#3e382d] font-mono uppercase">
                  Active Facing: {worldState.robot.facing}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
                {(() => {
                  const getAbsoluteDirectionName = (facing: string, relative: string): string => {
                    const headings = ['up', 'right', 'down', 'left'];
                    const idx = headings.indexOf(facing);
                    if (idx === -1) return '';
                    let targetIdx = idx;
                    if (relative === 'front') targetIdx = idx;
                    else if (relative === 'right') targetIdx = (idx + 1) % 4;
                    else if (relative === 'back') targetIdx = (idx + 2) % 4;
                    else if (relative === 'left') targetIdx = (idx + 3) % 4;
                    
                    const abs = headings[targetIdx];
                    if (abs === 'up') return 'Up-Right (North)';
                    if (abs === 'down') return 'Down-Left (South)';
                    if (abs === 'left') return 'Up-Left (West)';
                    if (abs === 'right') return 'Down-Right (East)';
                    return '';
                  };

                  return (
                    <>
                      <div className="bg-[#faf8f2] p-2 border border-[#3e382d]/50 flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[#9c3526] font-bold">"front"</span>
                          <span className="text-[10px] text-[#8a7c62]">heading</span>
                        </div>
                        <span className="text-[11px] text-[#5c5341] mt-0.5">→ {getAbsoluteDirectionName(worldState.robot.facing, 'front')}</span>
                      </div>
                      <div className="bg-[#faf8f2] p-2 border border-[#3e382d]/50 flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[#9c3526] font-bold">"right"</span>
                          <span className="text-[10px] text-[#8a7c62]">+90° right</span>
                        </div>
                        <span className="text-[11px] text-[#5c5341] mt-0.5">→ {getAbsoluteDirectionName(worldState.robot.facing, 'right')}</span>
                      </div>
                      <div className="bg-[#faf8f2] p-2 border border-[#3e382d]/50 flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[#9c3526] font-bold">"back"</span>
                          <span className="text-[10px] text-[#8a7c62]">reverse</span>
                        </div>
                        <span className="text-[11px] text-[#5c5341] mt-0.5">→ {getAbsoluteDirectionName(worldState.robot.facing, 'back')}</span>
                      </div>
                      <div className="bg-[#faf8f2] p-2 border border-[#3e382d]/50 flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[#9c3526] font-bold">"left"</span>
                          <span className="text-[10px] text-[#8a7c62]">-90° left</span>
                        </div>
                        <span className="text-[11px] text-[#5c5341] mt-0.5">→ {getAbsoluteDirectionName(worldState.robot.facing, 'left')}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

          </div>

          {/* RIGHT Column: Mission Objective & Isometric Simulator Ground (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Isometric Viewport */}
            <div className="bg-[#f4efe1] border border-[#3e382d] shadow-sm relative flex flex-col overflow-hidden">
              
              {/* Viewport Header */}
              <div className="border-b border-[#3e382d] px-4 py-3 bg-[#eae3ce] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#9c3526]" />
                  <span className="text-xs font-bold text-[#2e2a22] tracking-wider uppercase font-mono">Isometric Visual Engine</span>
                </div>
                <div className="text-xs text-[#5c5341] font-mono">
                  {hoveredTile ? `TILE MAP: [${hoveredTile.x}, ${hoveredTile.y}]` : 'Hover grid for coordinates'}
                </div>
              </div>

              {/* Isometric Render Window */}
              <div className="relative w-full aspect-[5/3.2] bg-[#faf8f2] flex items-center justify-center p-4">
                
                <svg 
                  viewBox="0 0 500 320" 
                  className="w-full h-full max-w-lg filter drop-shadow-[0_4px_8px_rgba(62,56,45,0.15)]"
                >
                  <defs>
                    {/* Glowing effect filter using matching retro warmth */}
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="1.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* 1. Ground Level Render Grid */}
                  <g id="iso-ground">
                    {Array.from({ length: INITIAL_WORLD_STATE.gridSize.height }).map((_, y) => 
                      Array.from({ length: INITIAL_WORLD_STATE.gridSize.width }).map((_, x) => {
                        const isHovered = hoveredTile?.x === x && hoveredTile?.y === y;
                        const isTarget = INITIAL_WORLD_STATE.target.x === x && INITIAL_WORLD_STATE.target.y === y;
                        
                        // Retro warm sandstone tiles
                        let fill = '#eae3ce'; // primary tile sand
                        let stroke = '#c4bda3'; // grid lines
                        
                        if ((x + y) % 2 === 0) {
                          fill = '#e4dbbf'; // offset darker sand
                        }

                        // Hover tile state
                        if (isHovered) {
                          fill = '#fbf9f4';
                        }

                        // Target colors
                        if (isTarget) {
                          const hasCargo = worldState.box.x === x && worldState.box.y === y && !worldState.robot.holding;
                          fill = hasCargo ? '#e2ebd5' : '#f0e8db'; // sage green success vs warm clay
                          stroke = hasCargo ? '#81a364' : '#9c3526';
                        }

                        return (
                          <g key={`tile-${x}-${y}`}>
                            {/* Flat coordinate rhombus tile */}
                            <polygon
                              points={getTilePoints(x, y)}
                              fill={fill}
                              stroke={stroke}
                              strokeWidth={isHovered ? '1.5' : '0.8'}
                              onMouseEnter={() => setHoveredTile({ x, y })}
                              onMouseLeave={() => setHoveredTile(null)}
                              className="transition-colors duration-150 cursor-pointer"
                            />
                            
                            {/* Concentric targets indicators */}
                            {isTarget && (
                              <g pointerEvents="none">
                                <ellipse 
                                  cx={getIsoCoords(x, y).x} 
                                  cy={getIsoCoords(x, y).y} 
                                  rx={tileW / 3} 
                                  ry={tileH / 3} 
                                  fill="none" 
                                  stroke={worldState.box.x === x && worldState.box.y === y && !worldState.robot.holding ? '#81a364' : '#9c3526'} 
                                  strokeWidth="1.2" 
                                  strokeDasharray="4,2"
                                />
                                <circle 
                                  cx={getIsoCoords(x, y).x} 
                                  cy={getIsoCoords(x, y).y} 
                                  r="3"
                                  fill={worldState.box.x === x && worldState.box.y === y && !worldState.robot.holding ? '#81a364' : '#9c3526'} 
                                />
                              </g>
                            )}
                          </g>
                        );
                      })
                    )}
                  </g>

                  {/* 2. Obstacles rendering (z-sorted by coordinate sum to avoid overlaps) */}
                  <g id="iso-obstacles" pointerEvents="none">
                    {INITIAL_WORLD_STATE.obstacles
                      .sort((a, b) => (a.x + a.y) - (b.x + b.y))
                      .map((obs) => {
                        const { x: sx, y: sy } = getIsoCoords(obs.x, obs.y);
                        const h = 32; // height of the pillar obstacle

                        return (
                          <g key={`obs-${obs.x}-${obs.y}`} className="transition-all duration-300">
                            {/* Shadow under the wall */}
                            <ellipse cx={sx} cy={sy + 4} rx="24" ry="10" fill="#2e2a22" fillOpacity="0.15" />

                            {/* Left Side Face (Wood/Basalt bronze brown) */}
                            <polygon
                              points={`${sx - tileW / 2},${sy - h} ${sx},${sy - tileH / 2 - h + tileH} ${sx},${sy + tileH / 2} ${sx - tileW / 2},${sy}`}
                              fill="#5c5345" 
                              stroke="#2e2a22"
                              strokeWidth="0.8"
                            />
                            
                            {/* Right Side Face */}
                            <polygon
                              points={`${sx},${sy - tileH / 2 - h + tileH} ${sx + tileW / 2},${sy - h} ${sx + tileW / 2},${sy} ${sx},${sy + tileH / 2}`}
                              fill="#4a4235" 
                              stroke="#2e2a22"
                              strokeWidth="0.8"
                            />

                            {/* Top Face */}
                            <polygon
                              points={`${sx},${sy - tileH / 2 - h} ${sx + tileW / 2},${sy - h} ${sx},${sy + tileH / 2 - h} ${sx - tileW / 2},${sy - h}`}
                              fill="#7e725f" 
                              stroke="#2e2a22"
                              strokeWidth="0.8"
                            />

                            {/* Fine physical grid lines on top of the obstacles */}
                            <line x1={sx} y1={sy - 14} x2={sx} y2={sy + 22} stroke="#3e382d" strokeWidth="0.8" strokeOpacity="0.4" />
                          </g>
                        );
                      })}
                  </g>

                  {/* 3. Static or Unheld Box (Cargo Container) */}
                  {!worldState.robot.holding && (
                    <g id="cargo-box" pointerEvents="none">
                      {(() => {
                        const { x: sx, y: sy } = getIsoCoords(worldState.box.x, worldState.box.y);
                        const h = 22; // box height
                        const bSize = 20; // box half-width offset

                        return (
                          <g className="transition-all duration-300">
                            {/* Box Shadow */}
                            <ellipse cx={sx} cy={sy + 3} rx="16" ry="6" fill="#2e2a22" fillOpacity="0.2" />

                            {/* Left side face */}
                            <polygon
                              points={`${sx - bSize},${sy - h} ${sx},${sy - bSize / 2 - h + bSize} ${sx},${sy + bSize / 2} ${sx - bSize},${sy}`}
                              fill="#d97706" // Amber
                              stroke="#92400e"
                              strokeWidth="0.8"
                            />
                            
                            {/* Right side face */}
                            <polygon
                              points={`${sx},${sy - bSize / 2 - h + bSize} ${sx + bSize},${sy - h} ${sx + bSize},${sy} ${sx},${sy + bSize / 2}`}
                              fill="#92400e" // Shadow Amber
                              stroke="#78350f"
                              strokeWidth="0.8"
                            />

                            {/* Top face */}
                            <polygon
                              points={`${sx},${sy - bSize / 2 - h} ${sx + bSize},${sy - h} ${sx},${sy + bSize / 2 - h} ${sx - bSize},${sy - h}`}
                              fill="#f59e0b" // Highlight Amber
                              stroke="#d97706"
                              strokeWidth="0.8"
                            />

                            {/* Crate accents */}
                            <line x1={sx - bSize} y1={sy - h} x2={sx} y2={sy + bSize / 2} stroke="#78350f" strokeWidth="0.8" />
                            <line x1={sx + bSize} y1={sy - h} x2={sx} y2={sy + bSize / 2} stroke="#78350f" strokeWidth="0.8" />
                          </g>
                        );
                      })()}
                    </g>
                  )}

                  {/* 4. Robot Assembly */}
                  <g id="robot-unit" pointerEvents="none">
                    {(() => {
                      const { x: sx, y: sy } = getIsoCoords(worldState.robot.x, worldState.robot.y);
                      
                      // Face coordinates offsets based on directional vectors
                      let eyeOffsetX = 0;
                      let eyeOffsetY = -15;
                      if (worldState.robot.facing === 'down') {
                        eyeOffsetX = -5;
                        eyeOffsetY = -13;
                      } else if (worldState.robot.facing === 'right') {
                        eyeOffsetX = 5;
                        eyeOffsetY = -13;
                      } else if (worldState.robot.facing === 'up') {
                        eyeOffsetX = 4;
                        eyeOffsetY = -17;
                      } else if (worldState.robot.facing === 'left') {
                        eyeOffsetX = -4;
                        eyeOffsetY = -17;
                      }

                      // Classic warm bulb color
                      let signalColor = '#9c3526'; // primary theme rust red
                      if (isSuccess) signalColor = '#10b981'; // victory green
                      if (errorMessage) signalColor = '#dc2626'; // failure red

                      return (
                        <g className="transition-all duration-300">
                          {/* Ambient shadow */}
                          <ellipse cx={sx} cy={sy + 3} rx="18" ry="7" fill="#2e2a22" fillOpacity="0.15" />

                          {/* Base mechanical track layer */}
                          <ellipse cx={sx} cy={sy - 1} rx="12" ry="6" fill="#3e382d" stroke="#2e2a22" strokeWidth="0.8" />
                          <ellipse cx={sx} cy={sy - 3} rx="10" ry="5" fill="#5c5341" stroke="#3e382d" strokeWidth="0.8" />

                          {/* Main support neck */}
                          <line x1={sx} y1={sy - 3} x2={sx} y2={sy - 14} stroke="#8a7c62" strokeWidth="4.5" />

                          {/* Spherical Robot Head Body */}
                          <circle cx={sx} cy={sy - 16} r="10" fill="#eae3ce" stroke="#2e2a22" strokeWidth="0.8" />

                          {/* Digital faceplate mask & glowing eye visible only when facing down or right */}
                          {(worldState.robot.facing === 'down' || worldState.robot.facing === 'right') && (
                            <>
                              <ellipse cx={sx + eyeOffsetX / 1.5} cy={sy - 15} rx="6" ry="3" fill="#2e2a22" />
                              <circle cx={sx + eyeOffsetX} cy={sy - 15} r="2.2" fill="#e65100" style={{ filter: 'url(#glow)' }} />
                            </>
                          )}

                          {/* Upper mechanical antenna */}
                          <line x1={sx} y1={sy - 26} x2={sx} y2={sy - 31} stroke="#5c5341" strokeWidth="1.2" />
                          
                          {/* Signal Antenna Glow Bulb */}
                          <circle 
                            cx={sx} 
                            cy={sy - 31} 
                            r="2.5" 
                            fill={signalColor} 
                            style={{ filter: 'url(#glow)' }} 
                          />

                          {/* 5. Render held box container slightly shifted above head */}
                          {worldState.robot.holding && (
                            <g id="held-box">
                              {(() => {
                                const bxY = sy - 22; // lowered so it sits neatly in the claws/hands
                                const bSize = 16;
                                const h = 16;
                                return (
                                  <g>
                                    {/* Small mechanical grapple claw holding the box */}
                                    <path 
                                      d={`M ${sx - 8} ${sy - 20} Q ${sx - 12} ${bxY + 4} ${sx - 6} ${bxY + 10}`} 
                                      fill="none" 
                                      stroke="#3e382d" 
                                      strokeWidth="1.8" 
                                    />
                                    <path 
                                      d={`M ${sx + 8} ${sy - 20} Q ${sx + 12} ${bxY + 4} ${sx + 6} ${bxY + 10}`} 
                                      fill="none" 
                                      stroke="#3e382d" 
                                      strokeWidth="1.8" 
                                    />

                                    {/* Left face */}
                                    <polygon
                                      points={`${sx - bSize},${bxY - h} ${sx},${bxY - bSize / 2 - h + bSize} ${sx},${bxY + bSize / 2} ${sx - bSize},${bxY}`}
                                      fill="#d97706"
                                      stroke="#78350f"
                                      strokeWidth="0.8"
                                    />
                                    
                                    {/* Right face */}
                                    <polygon
                                      points={`${sx},${bxY - bSize / 2 - h + bSize} ${sx + bSize},${bxY - h} ${sx + bSize},${bxY} ${sx},${bxY + bSize / 2}`}
                                      fill="#92400e"
                                      stroke="#78350f"
                                      strokeWidth="0.8"
                                    />

                                    {/* Top face */}
                                    <polygon
                                      points={`${sx},${bxY - bSize / 2 - h} ${sx + bSize},${bxY - h} ${sx},${bxY + bSize / 2 - h} ${sx - bSize},${bxY - h}`}
                                      fill="#f59e0b"
                                      stroke="#d97706"
                                      strokeWidth="0.8"
                                    />
                                    
                                    {/* Box visual decoration */}
                                    <line x1={sx - bSize} y1={bxY - h} x2={sx} y2={bxY + bSize / 2} stroke="#78350f" strokeWidth="0.8" />
                                    <line x1={sx + bSize} y1={bxY - h} x2={sx} y2={bxY + bSize / 2} stroke="#78350f" strokeWidth="0.8" />
                                  </g>
                                );
                              })()}
                            </g>
                          )}
                        </g>
                      );
                    })()}
                  </g>
                </svg>

                {/* Outcome Floating Modals (Success & Error feedback overlay) */}
                {isSuccess && (
                  <div className="absolute inset-0 bg-[#2e2a22]/40 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-[#faf8f2] border border-[#3e382d] p-6 rounded-none max-w-sm text-center shadow-lg relative overflow-hidden">
                      <div className="w-12 h-12 bg-[#81a364]/10 text-[#4d7c0f] rounded-none flex items-center justify-center mx-auto mb-4 border border-[#81a364]/30 shadow-sm">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-[#2e2a22] font-serif uppercase">OBJECTIVE ACHIEVED!</h3>
                      <p className="text-xs text-[#5c5341] mt-2 leading-relaxed font-mono">
                        Sequence successful. Your Python controller navigated all obstacle grids perfectly and deposited the container correctly.
                      </p>
                      <div className="mt-5 flex gap-3">
                        <button 
                          onClick={resetSimulation}
                          className="flex-1 bg-[#faf8f2] hover:bg-[#eae3ce] text-[#9c3526] font-bold text-xs py-2.5 px-4 border border-[#3e382d] transition cursor-pointer font-mono"
                        >
                          TINKER FURTHER
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="absolute inset-x-4 bottom-4 bg-[#faf8f2] border-l-4 border-[#9c3526] p-4 shadow-md animate-slide-up">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-[#9c3526]/10 text-[#9c3526] border border-[#9c3526]/20 mt-0.5">
                        <XCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-[#2e2a22] uppercase tracking-wider font-mono">SIMULATION HALTED</h4>
                        <p className="text-xs text-[#5c5341] mt-1 font-mono">{errorMessage}</p>
                      </div>
                      <button 
                        onClick={() => setErrorMessage(null)}
                        className="text-[#9c3526] hover:text-[#852a1e] text-xs font-bold px-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status footer bar mimicking the math plotter's display */}
              <div className="border-t border-[#3e382d] bg-[#eae3ce] p-3 text-xs font-mono text-[#5c5341] flex justify-between items-center px-4">
                <div>
                  ROBOT STATE · POS = <span className="font-bold text-[#9c3526]">({worldState.robot.x}, {worldState.robot.y})</span> · FACING = <span className="font-bold text-[#9c3526] uppercase">{worldState.robot.facing}</span>
                </div>
                <div>
                  CARGO CLAMPED = <span className="font-bold text-[#9c3526]">{worldState.robot.holding ? 'TRUE' : 'FALSE'}</span>
                </div>
              </div>

            </div>

            {/* Mission Objective Card (Styled exactly as the beautiful dashed note box in the image) */}
            <div className="border-2 border-dashed border-[#9c3526]/50 bg-[#faf8f2] p-6 shadow-sm relative overflow-hidden">
              <div className="flex items-start gap-3.5">
                <div className="p-2 bg-[#9c3526]/10 text-[#9c3526] border border-[#9c3526]/20 mt-0.5">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#2e2a22] tracking-tight font-serif uppercase">PROTOCOL OBJECTIVE: Cargo Relocation</h2>
                  <p className="text-xs text-[#5c5341] mt-2 leading-relaxed">
                    The robot starts at coordinate <strong className="text-[#9c3526] font-mono">(0, 0)</strong>. Direct it to drive across the floor grid, stand adjacent to the Amber storage cargo at <strong className="text-[#9c3526] font-mono">(1, 3)</strong> and rotate to face it to retrieve it, maneuver safely around the basalt pillar obstructions at <strong className="text-[#5c5341] font-mono">X = 2</strong>, and deliver the cargo down cleanly on the target coordinate pad at <strong className="text-[#9c3526] font-mono">(3, 1)</strong>.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Retro aesthetic status foot-rail */}
      <footer className="border-t border-[#3e382d] bg-[#eae3ce]/50 mt-12 py-6 text-center text-xs text-[#5c5341] font-mono">
        <p>© 2026 ROBOT AUTONOMY RESEARCH DIVISION. ALL CORE PROTOCOLS ACTIVE AND COMPILATION SECURED.</p>
      </footer>

    </div>
  );
}
