import React, { useState } from 'react';
import { Layers, CheckCircle2, XCircle } from 'lucide-react';
import { GameWorldState, VMAction } from '../robotInterpreter';
import { tileW, tileH, getIsoCoords, getTilePoints } from '../utils/isometricHelpers';
import spriteSheet from '../../assets/sprite.png';
import { EXPRESSION_SPRITE_MAP, RobotExpression } from '../types/dialogueTypes';

interface IsometricVisualEngineProps {
  worldState: GameWorldState;
  isSuccess: boolean;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;
  resetSimulation: () => void;
  actionQueue?: VMAction[];
  currentIndex?: number;
  isDebugMode?: boolean;
  hideWrapper?: boolean;
  onNextMission?: () => void;
  isPlaying?: boolean;
}

function getActionToastMessage(action: VMAction): string {
  switch (action.type) {
    case 'move':
      return action.success ? 'Robot moved forward.' : 'Movement blocked!';
    case 'rotate':
      return `Robot rotated ${action.args[0]}.`;
    case 'grab':
      return action.success ? 'Cargo picked up.' : 'Grab failed: no cargo!';
    case 'drop':
      return action.success ? 'Cargo deposited.' : 'Drop failed: not holding!';
    case 'assign':
      return `Variable set: ${action.args[0]} = ${action.args[1]}`;
    case 'loop_step':
      return `Loop check: ${action.args[0]} is ${action.args[1] ? 'True' : 'False'}`;
    case 'if_step':
      return `Condition check: ${action.args[0]} is ${action.args[1] ? 'True' : 'False'}`;
    case 'success':
      return 'Objective completed!';
    case 'error':
      return `Halted: ${action.message}`;
    default:
      return '';
  }
}

export const IsometricVisualEngine: React.FC<IsometricVisualEngineProps> = ({
  worldState,
  isSuccess,
  errorMessage,
  setErrorMessage,
  resetSimulation,
  actionQueue,
  currentIndex,
  isDebugMode = false,
  hideWrapper = false,
  onNextMission,
  isPlaying = false
}) => {
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);

  const currentAction = isDebugMode && actionQueue && currentIndex !== undefined && currentIndex >= 0 
    ? actionQueue[currentIndex] 
    : null;
  const toastMsg = currentAction ? getActionToastMessage(currentAction) : '';

  const getAmbientExpression = (): RobotExpression => {
    if (isSuccess) return 'excited';
    if (errorMessage) {
      if (
        errorMessage.includes('InfiniteLoopError') || 
        errorMessage.includes('Collision') || 
        errorMessage.includes('Boundary') || 
        errorMessage.includes('crashed')
      ) {
        return 'confused';
      }
      return 'sad';
    }
    if (isPlaying) return 'talking';
    return 'idle';
  };

  const currentExpression = getAmbientExpression();
  const spriteCoords = EXPRESSION_SPRITE_MAP[currentExpression];
  const bgPosX = spriteCoords.col * 50;
  const bgPosY = spriteCoords.row * 50;

  return (
    <div className={`relative flex flex-col overflow-hidden flex-1 min-h-0 h-full ${
      hideWrapper ? '' : 'bg-[#f4efe1] border border-[#3e382d] shadow-sm'
    } ${
      (isDebugMode && errorMessage) ? 'animate-shake' : ''
    }`}>
      
      {/* Viewport Header */}
      {!hideWrapper && (
        <div className="border-b border-[#3e382d] px-4 py-3 bg-[#eae3ce] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#9c3526]" />
            <span className="text-xs font-bold text-[#2e2a22] tracking-wider uppercase font-mono">Isometric Visual Engine</span>
          </div>
          <div className="text-xs text-[#5c5341] font-mono">
            {hoveredTile ? `TILE MAP: [${hoveredTile.x}, ${hoveredTile.y}]` : 'Hover grid for coordinates'}
          </div>
        </div>
      )}

      {/* Isometric Render Window */}
      <div className="relative w-full flex-grow flex-1 min-h-0 bg-[#faf8f2] flex items-center justify-center p-4">
        {/* HUD coordinates overlay when nested in tab panel */}
        {hideWrapper && (
          <div className="absolute top-3 right-3 bg-[#faf8f2]/95 border border-[#3e382d] px-2 py-1 text-[10px] font-mono text-[#5c5341] shadow-sm select-none pointer-events-none z-10">
            {hoveredTile ? `TILE MAP: [${hoveredTile.x}, ${hoveredTile.y}]` : 'Hover grid for coordinates'}
          </div>
        )}

        {/* Robot State Overlay */}
        <div className="absolute top-3 left-3 flex flex-col items-center gap-1 z-10 w-[60px]">
          <div className="bg-[#faf8f2]/95 border border-[#3e382d] p-1 shadow-sm select-none w-[60px] h-[60px] flex items-center justify-center">
            <div
              className="w-full h-full select-none"
              style={{
                backgroundImage: `url(${spriteSheet})`,
                backgroundSize: '300% 300%',
                backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                imageRendering: 'pixelated',
              }}
              title={`R-07 Status: ${currentExpression.toUpperCase()}`}
            />
          </div>
          <span className="text-[9px] font-mono font-bold text-[#9c3526] uppercase animate-pulse select-none text-center leading-tight">
            {currentExpression}
          </span>
        </div>
        
        <svg 
          viewBox="0 -30 500 350" 
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
            {Array.from({ length: worldState.gridSize.height }).map((_, y) => 
              Array.from({ length: worldState.gridSize.width }).map((_, x) => {
                const isHovered = hoveredTile?.x === x && hoveredTile?.y === y;
                const isTarget = worldState.target.x === x && worldState.target.y === y;
                
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
            {[...worldState.obstacles]
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

        {/* Step Toast Overlay */}
        {isDebugMode && toastMsg && (
          <div key={`toast-${currentIndex}`} className="absolute top-4 left-[68px] bg-[#2e2a22]/90 border border-[#eae3ce]/30 px-3 py-1.5 text-[#faf8f2] text-[10px] font-mono shadow-md animate-slide-in-right flex items-center gap-1.5 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Outcome Floating Modals (Success & Error feedback overlay) */}
        {isSuccess && (
          <div className="absolute inset-0 bg-[#2e2a22]/40 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in z-20">
            <div className="bg-[#faf8f2] border border-[#3e382d] p-6 rounded-none max-w-sm text-center shadow-lg relative overflow-hidden animate-bubble">
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
                {onNextMission && (
                  <button 
                    onClick={onNextMission}
                    className="flex-1 bg-[#9c3526] hover:bg-[#852a1e] text-[#faf8f2] font-bold text-xs py-2.5 px-4 border border-[#3e382d] transition cursor-pointer font-mono"
                  >
                    NEXT MISSION
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="absolute inset-x-4 bottom-4 bg-[#faf8f2] border-l-4 border-[#9c3526] p-4 shadow-md animate-slide-up z-20">
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
  );
};
