import React from 'react';
import { WORLD2_LEVELS } from './levels';
import { usePlatformerLogic } from './usePlatformerLogic';
import { useGameState } from '../../engine/useGameState';
import { Pause } from 'lucide-react';

// Kenney UI assets
const STAR_FILLED = '/assets/kenney/ui/stars/star_filled.png';
const FLAG_ICON = '/assets/kenney/ui/icons/flagGreen1.png';
const CLOUD_SPRITE = '/assets/kenney/world2/cloud.png';

// Kenney bunny sprites - two color variants for variety
const BUNNY_VARIANTS = [
  {
    stand: '/assets/kenney/world2/bunny1_stand.png',
    jump: '/assets/kenney/world2/bunny1_jump.png',
    walk1: '/assets/kenney/world2/bunny1_walk1.png',
    walk2: '/assets/kenney/world2/bunny1_walk2.png',
  },
  {
    stand: '/assets/kenney/world2/bunny2/bunny2_stand.png',
    jump: '/assets/kenney/world2/bunny2/bunny2_jump.png',
    walk1: '/assets/kenney/world2/bunny2/bunny2_walk1.png',
    walk2: '/assets/kenney/world2/bunny2/bunny2_walk2.png',
  },
];
// Use bunny variant based on level ID for variety
const getBunnySprites = (levelId) => BUNNY_VARIANTS[(levelId - 1) % BUNNY_VARIANTS.length];
const STAR_SPRITE = '/assets/kenney/world2/star.png';

const SkylineCity = ({ levelId }) => {
  const { completeLevel, failLevel, setShowPauseMenu, showPauseMenu, playSound } = useGameState();

  const levelData = WORLD2_LEVELS.find(l => l.id === levelId);

  const {
    player,
    platforms,
    stars,
    score,
    cameraY,
  } = usePlatformerLogic(levelData, completeLevel, failLevel, playSound, showPauseMenu);

  return (
    <div
      className="absolute-fill"
      style={{
        background: 'var(--w2-sky-gradient)',
        overflow: 'hidden',
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >

      {/* Top UI */}
      <div
        className="absolute top-0 left-0 right-0 flex-between p-4"
        style={{ zIndex: 'var(--z-ui-overlay)' }}
      >
        <button className="btn-icon flex-center" onClick={() => setShowPauseMenu(true)} style={{ width: '44px', height: '44px' }}>
          <Pause size={22} color="var(--w2-text)" />
        </button>

        <div className="glass-panel flex gap-4 px-4 py-2 items-center">
          <span className="flex items-center gap-1 text-body" style={{ color: 'var(--w2-text)' }}>
            <img src={STAR_FILLED} alt="" style={{ width: 18, height: 18, imageRendering: 'pixelated' }} /> {stars.length}/{levelData.stars.length}
          </span>
          <span className="text-body" style={{ color: 'var(--w2-text)' }}>
            {score}
          </span>
        </div>

        <div style={{ width: '44px' }} />
      </div>

      {/* Game World Container - clips the scrolling content */}
      <div
        className="absolute"
        style={{
          top: 80,
          left: 0,
          right: 0,
          bottom: 80,
          overflow: 'hidden',
        }}
      >
        {/* Game World - with camera offset */}
        <div
          className="relative w-full"
          style={{
            height: 900,
            transform: `translateY(${-cameraY}px)`,
            transition: 'transform 200ms ease-out',
          }}
        >
        {/* Platforms */}
        {platforms.map((platform, index) => (
          <div
            key={`platform-${index}`}
            className="absolute"
            style={{
              left: platform.x,
              top: platform.y,
              width: platform.width,
              height: platform.height,
              background:
                platform.type === 'finish'
                  ? 'var(--w2-accent)'
                  : platform.type === 'cloud'
                  ? 'transparent'
                  : 'var(--w2-platform)',
              borderRadius:
                platform.type === 'cloud' ? '20px' : 'var(--radius-sm)',
              boxShadow:
                platform.type === 'finish'
                  ? '0 0 20px var(--w2-accent)'
                  : platform.type === 'cloud'
                  ? 'none'
                  : 'var(--shadow-md)',
              transition: platform.type === 'moving' ? 'none' : 'all 150ms',
            }}
          >
            {platform.type === 'finish' && (
              <div className="absolute-fill flex-center">
                <img src={FLAG_ICON} alt="Finish" style={{ width: 28, height: 28, imageRendering: 'pixelated' }} />
              </div>
            )}
            {platform.type === 'cloud' && (
              <img
                src={CLOUD_SPRITE}
                alt="Cloud"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  imageRendering: 'pixelated',
                  filter: 'drop-shadow(0 4px 12px rgba(255, 255, 255, 0.3))',
                }}
              />
            )}
          </div>
        ))}

        {/* Stars */}
        {stars.map((star) => (
          <img
            key={star.id}
            src={STAR_SPRITE}
            alt="Star"
            className="absolute anim-float"
            style={{
              left: star.x - 20,
              top: star.y - 20,
              width: 40,
              height: 40,
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0 4px 12px rgba(255, 200, 0, 0.6))',
            }}
          />
        ))}

        {/* Player */}
        <div
          className="absolute"
          style={{
            left: player.x,
            top: player.y,
            width: player.width,
            height: player.height,
            zIndex: 'var(--z-game-entities)',
          }}
        >
          <img
            src={player.vy < -2 ? getBunnySprites(levelId).jump : getBunnySprites(levelId).stand}
            alt="Player"
            style={{
              width: '100%',
              height: '100%',
              imageRendering: 'pixelated',
              transform: player.vx < 0 ? 'scaleX(-1)' : 'scaleX(1)',
            }}
          />
        </div>
        </div>
      </div>

      {/* Instructions */}
      <p
        className="absolute text-small text-center"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
          left: 0,
          right: 0,
          color: 'var(--w2-text)',
          opacity: 0.6,
        }}
      >
        Tap to jump • Double-tap for boost • Swipe to move
      </p>
    </div>
  );
};

export default SkylineCity;
