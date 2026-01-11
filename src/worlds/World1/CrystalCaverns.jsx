import React from 'react';
import { WORLD1_LEVELS } from './levels';
import { useMazeLogic } from './useMazeLogic';
import { useGameState } from '../../engine/useGameState';
import { TILES } from '../../utils/constants';
import { Pause, Diamond, Clock, Star, DoorOpen } from 'lucide-react';

const TILE_SIZE = 40;

// Kenney gem sprites
const GEM_SPRITES = [
  '/assets/kenney/world1/gemBlue.png',
  '/assets/kenney/world1/gemGreen.png',
  '/assets/kenney/world1/gemRed.png',
  '/assets/kenney/world1/gemYellow.png',
];
const PLAYER_SPRITE = '/assets/kenney/world1/player.png';
const PLAYER_FACE = '/assets/kenney/world1/face.png';

const CrystalCaverns = ({ levelId }) => {
  const { completeLevel, failLevel, setShowPauseMenu, playSound } = useGameState();

  const levelData = WORLD1_LEVELS.find(l => l.id === levelId);

  const {
    playerPos,
    crystals,
    hazards,
    score,
    timeRemaining,
    mood,
    trail,
    grid,
  } = useMazeLogic(levelData, completeLevel, failLevel, playSound);

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
        <button className="btn-icon flex-center" onClick={() => setShowPauseMenu(true)} style={{ width: '44px', height: '44px' }}>
          <Pause size={22} color="var(--text-light)" />
        </button>

        <div className="glass-panel flex gap-4 px-4 py-2 items-center">
          <span className="flex items-center gap-1 text-body">
            <Diamond size={16} color="var(--w1-accent)" /> {crystals.length}
          </span>
          <span className="flex items-center gap-1 text-body">
            <Clock size={16} color="var(--text-light)" /> {timeRemaining}s
          </span>
          <span className="flex items-center gap-1 text-body">
            <Star size={16} fill="#FFD700" color="#FFD700" /> {score}
          </span>
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
                  <div className="absolute-fill flex-center">
                    <DoorOpen size={24} color="var(--w1-accent)" />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Render Crystals */}
          {crystals.map((crystal, index) => (
            <img
              key={crystal.id}
              src={GEM_SPRITES[index % GEM_SPRITES.length]}
              alt="Crystal"
              className="absolute anim-pulse"
              style={{
                left: crystal.x * TILE_SIZE + TILE_SIZE / 2 - 12,
                top: crystal.y * TILE_SIZE + TILE_SIZE / 2 - 12,
                width: 24,
                height: 24,
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))',
                imageRendering: 'pixelated',
              }}
            />
          ))}

          {/* Render Hazards (shadow monsters) */}
          {hazards.map((hazard, index) => (
            <div
              key={`hazard-${index}`}
              className="absolute anim-float"
              style={{
                left: hazard.currentX * TILE_SIZE,
                top: hazard.currentY * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'left 200ms ease, top 200ms ease',
              }}
            >
              {/* Ghost/Monster shape */}
              <div
                style={{
                  width: 32,
                  height: 36,
                  background: 'linear-gradient(180deg, #2d1b4e 0%, #1a0a2e 100%)',
                  borderRadius: '50% 50% 30% 30% / 60% 60% 40% 40%',
                  position: 'relative',
                  boxShadow: '0 0 15px rgba(100, 50, 150, 0.6), inset 0 -8px 12px rgba(0, 0, 0, 0.4)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              >
                {/* Eyes */}
                <div style={{ position: 'absolute', top: '30%', left: '20%', width: 8, height: 10, background: '#ff4444', borderRadius: '50%', boxShadow: '0 0 6px #ff4444' }} />
                <div style={{ position: 'absolute', top: '30%', right: '20%', width: 8, height: 10, background: '#ff4444', borderRadius: '50%', boxShadow: '0 0 6px #ff4444' }} />
                {/* Wavy bottom edge */}
                <div style={{ position: 'absolute', bottom: -4, left: 0, right: 0, height: 8, display: 'flex', justifyContent: 'space-around' }}>
                  <div style={{ width: 8, height: 8, background: '#1a0a2e', borderRadius: '0 0 50% 50%' }} />
                  <div style={{ width: 8, height: 8, background: '#1a0a2e', borderRadius: '0 0 50% 50%' }} />
                  <div style={{ width: 8, height: 8, background: '#1a0a2e', borderRadius: '0 0 50% 50%' }} />
                </div>
              </div>
            </div>
          ))}

          {/* Movement Trail */}
          {trail.slice(0, -1).map((pos, index) => {
            const opacity = (index + 1) / trail.length * 0.6;
            const size = 8 + (index / trail.length) * 8;
            return (
              <div
                key={`trail-${index}`}
                className="absolute"
                style={{
                  left: pos.x * TILE_SIZE + (TILE_SIZE - size) / 2,
                  top: pos.y * TILE_SIZE + (TILE_SIZE - size) / 2,
                  width: size,
                  height: size,
                  background: `rgba(0, 255, 245, ${opacity})`,
                  borderRadius: '50%',
                  boxShadow: `0 0 ${4 + index}px rgba(0, 255, 245, ${opacity})`,
                  transition: 'all 150ms ease',
                  zIndex: 'var(--z-game-world)',
                }}
              />
            );
          })}

          {/* Player */}
          <div
            className="absolute transition-all"
            style={{
              left: playerPos.x * TILE_SIZE + (TILE_SIZE - 32) / 2,
              top: playerPos.y * TILE_SIZE + (TILE_SIZE - 32) / 2,
              width: 32,
              height: 32,
              transitionDuration: '100ms',
              zIndex: 'var(--z-game-entities)',
            }}
          >
            <img
              src={PLAYER_SPRITE}
              alt="Player"
              style={{
                width: '100%',
                height: '100%',
                imageRendering: 'pixelated',
                filter: mood === 'sad' ? 'brightness(0.7)' : mood === 'surprised' ? 'brightness(1.3)' : 'none',
              }}
            />
            <img
              src={PLAYER_FACE}
              alt=""
              style={{
                position: 'absolute',
                top: '4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '16px',
                height: '16px',
                imageRendering: 'pixelated',
              }}
            />
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
