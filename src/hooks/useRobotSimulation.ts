/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { INITIAL_WORLD_STATE, DEFAULT_PYTHON_CODE } from '../constants/gameConstants';
import { parsePython, PythonExecutor, cloneState, GameWorldState, VMAction } from '../robotInterpreter';

export function useRobotSimulation() {
  const [code, setCode] = useState(DEFAULT_PYTHON_CODE);
  const [worldState, setWorldState] = useState<GameWorldState>(cloneState(INITIAL_WORLD_STATE));
  
  // Execution state
  const [actionQueue, setActionQueue] = useState<VMAction[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(600); // ms per step
  const [executingLine, setExecutingLine] = useState<number | null>(null);
  
  // Console outputs
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  
  // Game outcomes
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize logs on mount
  useEffect(() => {
    setConsoleLogs([
      'System ready. Input your Python instructions and press "Run Program" to initiate the delivery protocol.'
    ]);
  }, []);

  const logMessage = (msg: string) => {
    setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const clearLogs = () => {
    setConsoleLogs([]);
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

  // Helper to load simple presets
  const loadSolutionPreset = () => {
    setCode(DEFAULT_PYTHON_CODE);
    resetSimulationStateOnly();
    setConsoleLogs(['Loaded default protocol solution template.']);
  };

  const loadBlankTemplate = () => {
    setCode(`# Start from scratch!
# Robot starts at (0, 0)
# Cargo box is at (1, 3)
# Target pad is at (3, 1)

`);
    resetSimulationStateOnly();
    setConsoleLogs(['Loaded blank sandbox workspace.']);
  };

  return {
    code,
    setCode,
    worldState,
    isPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    executingLine,
    consoleLogs,
    clearLogs,
    errorMessage,
    setErrorMessage,
    isSuccess,
    runSimulation,
    stepSimulation,
    pauseSimulation,
    resetSimulation,
    loadSolutionPreset,
    loadBlankTemplate,
    logMessage
  };
}
