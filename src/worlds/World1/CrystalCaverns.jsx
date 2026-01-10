import React from 'react';
import { WORLD1_LEVELS } from './levels';
import { useMazeLogic } from './useMazeLogic';
import { useGameState } from '../../engine/GameStateProvider';
import Gem from '../../components/characters/Gem';
import { TILES } from '../../utils/constants';

const TILE_SIZE = 40;

const CrystalCaverns = ({ levelId }) => {
  const { completeLevel, failLevel, setShowPauseMenu } = useGameState();

  const levelData = WORLD1_LEVELS.find(l => l.id === levelId);

  const {
    playerPos,
    crystals,
    hazards,
    score,
    timeRemaining,
    mood,
    grid,
  } = useMazeLogic(levelData, completeLevel, failLevel);

  return (
    <div
      className="absolute-fill"
      style={{
        background: 'var(--w1-bg-dark)',
        overflow: 'hidden',
      }}
    >
      {/* Top UI */}
      <div
        className="absolute top-0 left-0 right-0 flex-between p-4"
        style={{ zIndex: 'var(--z-ui-overlay)' }}
      >
        <button className="btn-icon" onClick={() => setShowPauseMenu(true)}>
          ⏸
        </button>

        <div className="glass-panel flex gap-3 px-4 py-2">
          <span className="text-body">💎 {crystals.length}</span>
          <span className="text-body">⏱ {timeRemaining}s</span>
          <span className="text-body">⭐ {score}</span>
        </div>

        <div style={{ width: '44px' }} />
      </div>

      {/* Game Grid Container */}
      <div
        className="absolute-fill flex-center"
        style={{ paddingTop: '80px', paddingBottom: '40px' }}
      >
        <div
          className="relative"
          style={{
            width: grid[0].length * TILE_SIZE,
            height: grid.length * TILE_SIZE,
          }}
        >
          {/* Render Grid Tiles */}
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className="absolute"
                style={{
                  left: x * TILE_SIZE,
                  top: y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  background:
                    cell === TILES.WALL
                      ? 'var(--w1-primary)'
                      : cell === TILES.DARK_PATCH
                      ? 'rgba(0, 0, 0, 0.8)'
                      : cell === TILES.EXIT
                      ? 'var(--w1-accent)'
                      : 'var(--w1-bg-medium)',
                  border:
                    cell === TILES.WALL
                      ? '1px solid var(--w1-bg-dark)'
                      : cell === TILES.EXIT
                      ? '2px solid var(--w1-accent)'
                      : 'none',
                  borderRadius: cell === TILES.EXIT ? '4px' : '0',
                  boxShadow:
                    cell === TILES.EXIT
                      ? '0 0 20px var(--w1-accent)'
                      : 'none',
                }}
              >
                {cell === TILES.EXIT && (
                  <div className="absolute-fill flex-center text-lg">🚪</div>
                )}
              </div>
            ))
          )}

          {/* Render Crystals */}
          {crystals.map((crystal) => (
            <div
              key={crystal.id}
              className="absolute anim-pulse"
              style={{
                left: crystal.x * TILE_SIZE + TILE_SIZE / 2 - 8,
                top: crystal.y * TILE_SIZE + TILE_SIZE / 2 - 8,
                width: 16,
                height: 16,
                background: 'var(--w1-gem-gradient)',
                transform: 'rotate(45deg)',
                borderRadius: '2px',
                boxShadow: '0 0 12px rgba(233, 69, 96, 0.6)',
              }}
            />
          ))}

          {/* Render Hazards (moving dark patches) */}
          {hazards.map((hazard, index) => (
            <div
              key={`hazard-${index}`}
              className="absolute"
              style={{
                left: hazard.currentX * TILE_SIZE,
                top: hazard.currentY * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
                background: 'rgba(0, 0, 0, 0.9)',
                borderRadius: '50%',
                boxShadow: '0 0 20px rgba(0, 0, 0, 0.8)',
                transition: 'left 200ms ease, top 200ms ease',
              }}
            />
          ))}

          {/* Player */}
          <div
            className="absolute transition-all"
            style={{
              left: playerPos.x * TILE_SIZE + (TILE_SIZE - 36) / 2,
              top: playerPos.y * TILE_SIZE + (TILE_SIZE - 36) / 2,
              transitionDuration: '100ms',
              zIndex: 'var(--z-game-entities)',
            }}
          >
            <Gem mood={mood} />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <p
        className="absolute bottom-0 left-0 right-0 text-small text-center p-4"
        style={{ color: 'var(--w1-text)', opacity: 0.5 }}
      >
        Swipe or use arrow keys to move
      </p>
    </div>
  );
};

export default CrystalCaverns;
