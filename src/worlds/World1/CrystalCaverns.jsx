import React from 'react';
import { WORLD1_LEVELS } from './levels';
import { useMazeLogic } from './useMazeLogic';
import { useGameState } from '../../engine/useGameState';
import { TILES } from '../../utils/constants';
import { Pause, Clock } from 'lucide-react';

const TILE_SIZE = 40;

// Kenney UI assets
const STAR_FILLED = '/assets/kenney/ui/stars/star_filled.png';
const ARROW_UP = '/assets/kenney/ui/icons/arrow_up.png';
const ARROW_DOWN = '/assets/kenney/ui/icons/arrow_down.png';
const ARROW_LEFT = '/assets/kenney/ui/icons/arrow_left.png';
const ARROW_RIGHT = '/assets/kenney/ui/icons/arrow_right.png';
const FLAG_ICON = '/assets/kenney/ui/icons/flagGreen1.png';

// Kenney gem sprites
const GEM_SPRITES = [
  '/assets/kenney/world1/gemBlue.png',
  '/assets/kenney/world1/gemGreen.png',
  '/assets/kenney/world1/gemRed.png',
  '/assets/kenney/world1/gemYellow.png',
];
const PLAYER_SPRITE = '/assets/kenney/world1/player.png';
const PLAYER_FACE = '/assets/kenney/world1/face.png';

// Kenney monster sprites
const MONSTER_SPRITES = [
  '/assets/kenney/world1/monsters/monster_red.png',
  '/assets/kenney/world1/monsters/monster_dark.png',
  '/assets/kenney/world1/monsters/monster_blue.png',
  '/assets/kenney/world1/monsters/monster_green.png',
  '/assets/kenney/world1/monsters/monster_shadow.png',
];

const CrystalCaverns = ({ levelId }) => {
  const { completeLevel, failLevel, setShowPauseMenu, showPauseMenu, playSound } = useGameState();

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
    movePlayer,
  } = useMazeLogic(levelData, completeLevel, failLevel, playSound, showPauseMenu);

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
            <img src={GEM_SPRITES[0]} alt="Gems" style={{ width: 18, height: 18, imageRendering: 'pixelated' }} /> {crystals.length}
          </span>
          <span className="flex items-center gap-1 text-body">
            <Clock size={16} color="var(--text-light)" /> {timeRemaining}s
          </span>
          <span className="flex items-center gap-1 text-body">
            <img src={STAR_FILLED} alt="Score" style={{ width: 18, height: 18, imageRendering: 'pixelated' }} /> {score}
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
                    <img src={FLAG_ICON} alt="Exit" style={{ width: 28, height: 28, imageRendering: 'pixelated' }} />
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

          {/* Render Hazards (Kenney monsters) */}
          {hazards.map((hazard, index) => (
            <div
              key={`hazard-${index}`}
              className="absolute"
              style={{
                left: hazard.currentX * TILE_SIZE + TILE_SIZE / 2,
                top: hazard.currentY * TILE_SIZE + TILE_SIZE / 2,
                transform: 'translate(-50%, -50%)',
                transition: 'left 200ms ease, top 200ms ease',
                zIndex: 'var(--z-game-entities)',
              }}
            >
              <img
                src={MONSTER_SPRITES[index % MONSTER_SPRITES.length]}
                alt="Monster"
                className="anim-float"
                style={{
                  width: 48,
                  height: 48,
                  imageRendering: 'pixelated',
                  filter: 'drop-shadow(0 0 8px rgba(255, 0, 100, 0.5))',
                }}
              />
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

      {/* D-Pad Controls */}
      <div
        className="absolute"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 48px)',
          gridTemplateRows: 'repeat(3, 48px)',
          gap: '4px',
          zIndex: 'var(--z-ui-overlay)',
        }}
      >
        <div />
        <button
          className="btn-icon flex-center"
          onClick={() => movePlayer('UP')}
          aria-label="Move up"
        >
          <img src={ARROW_UP} alt="Up" style={{ width: 28, height: 28, imageRendering: 'pixelated' }} />
        </button>
        <div />
        <button
          className="btn-icon flex-center"
          onClick={() => movePlayer('LEFT')}
          aria-label="Move left"
        >
          <img src={ARROW_LEFT} alt="Left" style={{ width: 28, height: 28, imageRendering: 'pixelated' }} />
        </button>
        <div />
        <button
          className="btn-icon flex-center"
          onClick={() => movePlayer('RIGHT')}
          aria-label="Move right"
        >
          <img src={ARROW_RIGHT} alt="Right" style={{ width: 28, height: 28, imageRendering: 'pixelated' }} />
        </button>
        <div />
        <button
          className="btn-icon flex-center"
          onClick={() => movePlayer('DOWN')}
          aria-label="Move down"
        >
          <img src={ARROW_DOWN} alt="Down" style={{ width: 28, height: 28, imageRendering: 'pixelated' }} />
        </button>
        <div />
      </div>

      {/* Instructions */}
      <p
        className="absolute text-small text-center"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 170px)',
          left: 0,
          right: 0,
          color: 'var(--w1-text)',
          opacity: 0.5,
        }}
      >
        Tap buttons or swipe to move
      </p>
    </div>
  );
};

export default CrystalCaverns;
