/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import type { PuzzleDefinition, CommandDefinition } from '../types/gameTypes';
import { parsePython, PythonExecutor, cloneState, GameWorldState, VMAction } from '../robotInterpreter';
import { markPuzzleSolved, savePuzzleSolution, deletePuzzleSolution, getSavedSolutions, loadSaveData } from '../state/saveData';
import type { SavedSolution } from '../types/gameTypes';
import { isSoundEnabled, setSoundEnabled, playSynthSound } from '../utils/audio';
import { ACHIEVEMENTS, getEarnedAchievements } from '../progression/achievements';
import type { Achievement } from '../progression/achievements';

/**
 * Derives a GameWorldState from a PuzzleDefinition.
 * Uses the first cargo/target entry (single-box puzzle model).
 */
function puzzleToWorldState(puzzle: PuzzleDefinition): GameWorldState {
  return {
    robot: {
      x: puzzle.robotStart.x,
      y: puzzle.robotStart.y,
      holding: false,
      facing: puzzle.robotStart.facing
    },
    box: puzzle.cargo && puzzle.cargo.length > 0 ? { x: puzzle.cargo[0].x, y: puzzle.cargo[0].y } : { x: -1, y: -1 },
    target: puzzle.targets && puzzle.targets.length > 0 ? { x: puzzle.targets[0].x, y: puzzle.targets[0].y } : { x: -1, y: -1 },
    gridSize: { ...puzzle.gridSize },
    obstacles: puzzle.obstacles.map(o => ({ ...o }))
  };
}

export function useRobotSimulation(
  puzzle: PuzzleDefinition,
  commandRegistry: Map<string, CommandDefinition>,
  onPuzzleSolved?: () => void
) {
  const initialWorld = puzzleToWorldState(puzzle);

  const [code, setCode] = useState(puzzle.starterCode);
  const [worldState, setWorldState] = useState<GameWorldState>(cloneState(initialWorld));
  
  // Sound preference state
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(isSoundEnabled());
  // Newly unlocked achievement toast notification
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);

  // Execution state
  const [actionQueue, setActionQueue] = useState<VMAction[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false);
  const isDebugActiveRef = useRef<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(600); // ms per step
  const [executingLine, setExecutingLine] = useState<number | null>(null);
  
  // Console outputs
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  
  // Game outcomes
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [savedSolutions, setSavedSolutions] = useState<SavedSolution[]>([]);

  useEffect(() => {
    setSavedSolutions(getSavedSolutions(puzzle.id));
  }, [puzzle.id]);

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

  const applyStepState = (action: VMAction, currentActions: VMAction[] = actionQueue) => {
    const isDebug = isDebugActiveRef.current;

    // Log step outcomes
    if (action.message) {
      if (action.success) {
        logMessage(`Line ${action.line}: ${action.message}`);
      } else {
        logMessage(`❌ Line ${action.line} Error: ${action.message}`);
        setErrorMessage(action.message);
        setIsPlaying(false);
        if (isDebug) {
          playSynthSound('fail');
        }
      }
    } else if (!action.success) {
      if (isDebug) {
        playSynthSound('fail');
      }
    }

    // Play step sounds for normal successful instructions
    if (isDebug && action.success && action.type !== 'success' && action.type !== 'error') {
      playSynthSound('step');
    }

    // Handle special statuses
    if (action.type === 'success' && action.success) {
      setIsSuccess(true);
      setIsPlaying(false);
      logMessage(`🏆 Protocol Complete: SUCCESS!`);
      
      const linesCount = code.split('\n').filter(line => {
        const clean = line.split('#')[0].trim();
        return clean.length > 0;
      }).length;
      
      const physicalActions = currentActions.filter(
        a => a.type === 'move' || a.type === 'rotate' || a.type === 'grab' || a.type === 'drop'
      ).length;
      
      const metrics = {
        instructions: currentActions.length,
        lines: linesCount,
        steps: physicalActions
      };
      
      // Capture achievements earned before this solution is saved
      const beforeEarned = getEarnedAchievements(loadSaveData());

      savePuzzleSolution(puzzle.id, code, metrics);
      setSavedSolutions(getSavedSolutions(puzzle.id));

      markPuzzleSolved(puzzle.id);
      onPuzzleSolved?.();

      if (isDebug) {
        // Capture achievements earned after saving
        const afterEarned = getEarnedAchievements(loadSaveData());
        const newlyUnlocked = afterEarned.filter(id => !beforeEarned.includes(id));

        if (newlyUnlocked.length > 0) {
          playSynthSound('achievement');
          const nextAch = ACHIEVEMENTS.find(a => a.id === newlyUnlocked[0]);
          if (nextAch) {
            setUnlockedAchievement(nextAch);
            setTimeout(() => {
              setUnlockedAchievement(null);
            }, 4000);
          }
        } else {
          playSynthSound('success');
        }
      }
    }

    setWorldState(action.afterState);
  };

  // Run the full Python simulator
  const runSimulation = () => {
    isDebugActiveRef.current = false;
    setIsDebugMode(false);
    resetSimulationStateOnly();
    
    try {
      const ast = parsePython(code);
      const executor = new PythonExecutor(initialWorld, commandRegistry, puzzle.successCondition);
      const actions = executor.run(ast);
      
      if (actions.length === 0) {
        throw new Error('No executable actions found. Make sure to call a robot API function!');
      }

      setActionQueue(actions);
      setCurrentIndex(0);
      setIsPlaying(true);
      setExecutingLine(actions[0].line);
      applyStepState(actions[0], actions);
      
      logMessage(`Compiled successfully. Initiating sequence with ${actions.length} instructions...`);
    } catch (err: any) {
      const msg = err.message || 'Syntax Error: Verification failed.';
      setErrorMessage(msg);
      logMessage(`❌ Compilation Error: ${msg}`);
    }
  };

  // Run a single step (Debug mode)
  const stepSimulation = () => {
    isDebugActiveRef.current = true;
    setIsDebugMode(true);

    // If not compiled yet, compile first
    if (actionQueue.length === 0) {
      try {
        const ast = parsePython(code);
        const executor = new PythonExecutor(initialWorld, commandRegistry, puzzle.successCondition);
        const actions = executor.run(ast);
        if (actions.length === 0) {
          throw new Error('No instructions generated.');
        }
        setActionQueue(actions);
        setCurrentIndex(0);
        setExecutingLine(actions[0].line);
        applyStepState(actions[0], actions);
        logMessage(`Debug step loaded. Line ${actions[0].line}: Executing...`);
        return;
      } catch (err: any) {
        const msg = err.message || 'Syntax Verification failed.';
        setErrorMessage(msg);
        logMessage(`❌ Compile Error: ${msg}`);
        playSynthSound('fail');
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
    setWorldState(cloneState(initialWorld));
    
    setIsDebugMode(false);
    isDebugActiveRef.current = false;
  };

  const resetSimulation = () => {
    resetSimulationStateOnly();
    setConsoleLogs(['System state restored to reference. Workspace cleaned. Ready for initialization.']);
  };

  // Helper to load simple presets
  const loadSolutionPreset = () => {
    setCode(puzzle.starterCode);
    resetSimulationStateOnly();
    setConsoleLogs(['Loaded default protocol solution template.']);
  };

  const loadBlankTemplate = () => {
    const cargoStr = puzzle.cargo && puzzle.cargo.length > 0 ? `Cargo box is at (${puzzle.cargo[0].x}, ${puzzle.cargo[0].y})` : 'No cargo box';
    const targetStr = puzzle.targets && puzzle.targets.length > 0 ? `Target pad is at (${puzzle.targets[0].x}, ${puzzle.targets[0].y})` : 'No target pad';
    setCode(`# Start from scratch!
# Robot starts at (${puzzle.robotStart.x}, ${puzzle.robotStart.y})
# ${cargoStr}
# ${targetStr}

`);
    resetSimulationStateOnly();
    setConsoleLogs(['Loaded blank sandbox workspace.']);
  };

  const deleteSolution = (timestamp: number) => {
    deletePuzzleSolution(puzzle.id, timestamp);
    setSavedSolutions(getSavedSolutions(puzzle.id));
    logMessage('Deleted archived protocol sequence.');
  };

  const loadSolution = (solutionCode: string) => {
    setCode(solutionCode);
    resetSimulationStateOnly();
    setConsoleLogs(['Loaded archived protocol sequence from memory database.']);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabledState(next);
    setSoundEnabled(next);
    playSynthSound('step'); // play a quick test blip
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
    logMessage,
    actionQueue,
    currentIndex,
    isDebugMode,
    soundEnabled,
    toggleSound,
    unlockedAchievement,
    setUnlockedAchievement,
    savedSolutions,
    deleteSolution,
    loadSolution
  };
}
