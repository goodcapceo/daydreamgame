import React, { useCallback, useEffect } from 'react';
import { WORLD4_LEVELS } from './levels';
import { useMatch3Logic } from './useMatch3Logic';
import { useGameState } from '../../engine/useGameState';
import { Pause } from 'lucide-react';

const TILE_SIZE = 50;
const GAP = 4;

// Kenney UI assets
const STAR_FILLED = '/assets/kenney/ui/stars/star_filled.png';

// Kenney puzzle tile sprites - 5 distinct colors for clarity
const TILE_SPRITES = {
  red: '/assets/kenney/world4/tiles/tile_red.png',
  green: '/assets/kenney/world4/tiles/tile_green.png',
  pink: '/assets/kenney/world4/tile_pink.png',
  yellow: '/assets/kenney/world4/tile_yellow.png',
  blue: '/assets/kenney/world4/tiles/tile_blue.png',
};

const TILE_COLORS = {
  red: '#ff7675',
  green: '#55efc4',
  pink: 'var(--w4-flower-pink)',
  yellow: 'var(--w4-flower-yellow)',
  blue: '#74b9ff',
};

const EnchantedGarden = ({ levelId }) => {
  const { completeLevel, failLevel, setShowPauseMenu, showPauseMenu, playSound } = useGameState();
  const levelData = WORLD4_LEVELS.find(l => l.id === levelId);
  const {
    grid,
    selected,
    score,
    moves,
    collected,
    lastMatchPoints,
    dragging,
    dragOffset,
    swappingTiles,
    matchingTiles,
    fallingColumns,
    handleTileClick,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useMatch3Logic(levelData, completeLevel, failLevel, playSound);

  // Global mouse/touch move and end handlers
  useEffect(() => {
    const handleMouseMove = (e) => {
      handleDragMove(e.clientX, e.clientY);
    };
    const handleMouseUp = () => {
      handleDragEnd();
    };
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => {
      handleDragEnd();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  // Calculate tile transform for animations
  const getTileTransform = useCallback((rowIndex, colIndex) => {
    // Dragging transform
    if (dragging && dragging.row === rowIndex && dragging.col === colIndex) {
      return `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(1.1)`;
    }

    // Swapping animation
    if (swappingTiles) {
      const { from, to } = swappingTiles;
      if (from.row === rowIndex && from.col === colIndex) {
        const dx = (to.col - from.col) * (TILE_SIZE + GAP);
        const dy = (to.row - from.row) * (TILE_SIZE + GAP);
        return `translate(${dx}px, ${dy}px)`;
      }
      if (to.row === rowIndex && to.col === colIndex) {
        const dx = (from.col - to.col) * (TILE_SIZE + GAP);
        const dy = (from.row - to.row) * (TILE_SIZE + GAP);
        return `translate(${dx}px, ${dy}px)`;
      }
    }

    return 'translate(0, 0)';
  }, [dragging, dragOffset, swappingTiles]);

  // Check if tile is matching
  const isMatching = useCallback((rowIndex, colIndex) => {
    return matchingTiles.some(m => m.row === rowIndex && m.col === colIndex);
  }, [matchingTiles]);

  // Check if column is falling
  const isFalling = useCallback((colIndex) => {
    return fallingColumns.includes(colIndex);
  }, [fallingColumns]);

  return (
    <div className="absolute-fill flex-center flex-col" style={{ background: 'var(--w4-bg-gradient)' }}>
      {/* Header UI */}
      <div className="absolute top-0 left-0 right-0 flex-between p-4" style={{ zIndex: 'var(--z-ui-overlay)' }}>
        <button className="btn-icon flex-center" onClick={() => setShowPauseMenu(true)} style={{ width: '44px', height: '44px' }}>
          <Pause size={22} color="var(--text-light)" />
        </button>
        <div className="glass-panel flex gap-4 px-4 py-2 items-center">
          <span className="flex items-center gap-1 text-body"><img src={STAR_FILLED} alt="Score" style={{ width: 18, height: 18, imageRendering: 'pixelated' }} /> {score}</span>
          <span className="flex items-center gap-1 text-body"><img src={TILE_SPRITES.yellow} alt="Moves" style={{ width: 18, height: 18, imageRendering: 'pixelated' }} /> {moves}</span>
        </div>
        <div style={{ width: '44px' }} />
      </div>

      {/* Objective display */}
      <div className="glass-panel flex gap-3 px-4 py-2 mb-4" style={{ marginTop: '70px' }}>
        {levelData.objective.type === 'collect' ? (
          // Collection objective - show each tile type progress
          Object.entries(levelData.objective.targets).map(([type, target]) => (
            <div key={type} className="flex items-center gap-1">
              <img src={TILE_SPRITES[type]} alt={type} style={{ width: 20, height: 20, imageRendering: 'pixelated' }} />
              <span className="text-body text-sm">{collected[type]}/{target}</span>
            </div>
          ))
        ) : (
          // Score objective - show target score
          <div className="flex items-center gap-2">
            <img src={STAR_FILLED} alt="" style={{ width: 20, height: 20, imageRendering: 'pixelated' }} />
            <span className="text-body text-sm">Score: {score}/{levelData.objective.target}</span>
          </div>
        )}
      </div>

      {/* Game grid */}
      <div
        className="glass-panel-strong p-2"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${grid[0].length}, ${TILE_SIZE}px)`,
          gap: GAP,
          marginTop: '10px',
          touchAction: 'none', // Prevent scroll while dragging
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((tile, colIndex) => {
            const isSelected = selected && selected.row === rowIndex && selected.col === colIndex;
            const isDragging = dragging && dragging.row === rowIndex && dragging.col === colIndex;
            const matching = isMatching(rowIndex, colIndex);
            const falling = isFalling(colIndex);

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleDragStart(rowIndex, colIndex, e.clientX, e.clientY);
                }}
                onTouchStart={(e) => {
                  if (e.touches.length > 0) {
                    handleDragStart(rowIndex, colIndex, e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                onClick={() => handleTileClick(rowIndex, colIndex)}
                style={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  borderRadius: 'var(--radius-md)',
                  background: tile ? TILE_COLORS[tile] : 'transparent',
                  border: isSelected
                    ? '3px solid var(--color-white)'
                    : isDragging
                    ? '3px solid rgba(255,255,255,0.8)'
                    : '2px solid rgba(255,255,255,0.3)',
                  boxShadow: isSelected || isDragging
                    ? '0 0 15px rgba(255,255,255,0.5)'
                    : matching
                    ? '0 0 20px rgba(255,255,255,0.8)'
                    : 'none',
                  cursor: 'grab',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  transform: getTileTransform(rowIndex, colIndex),
                  transition: isDragging
                    ? 'none'
                    : swappingTiles
                    ? 'transform 150ms ease-out'
                    : falling
                    ? 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)' // Bounce
                    : 'transform 100ms ease-out, box-shadow 150ms ease',
                  opacity: matching ? 0 : 1,
                  scale: matching ? '1.2' : '1',
                  zIndex: isDragging ? 10 : 1,
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
              >
                {tile && (
                  <img
                    src={TILE_SPRITES[tile]}
                    alt={tile}
                    style={{
                      width: 40,
                      height: 40,
                      imageRendering: 'pixelated',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Floating points indicator */}
      {lastMatchPoints && (
        <div
          key={lastMatchPoints.id}
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '32px',
            fontWeight: 800,
            color: '#FFD700',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5)',
            animation: 'floatUp 1s ease-out forwards',
            pointerEvents: 'none',
            zIndex: 100,
          }}
        >
          +{lastMatchPoints.points}
        </div>
      )}

      {/* Instructions */}
      <p className="absolute bottom-8 text-small text-center opacity-70">
        Drag tiles to swap, match 3 or more
      </p>

      {/* Animation keyframes */}
      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
          50% { opacity: 1; transform: translate(-50%, -80%) scale(1.2); }
          100% { opacity: 0; transform: translate(-50%, -120%) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default EnchantedGarden;
