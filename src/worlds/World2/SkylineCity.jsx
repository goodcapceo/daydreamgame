import React from 'react';
import { WORLD2_LEVELS } from './levels';
import { usePlatformerLogic } from './usePlatformerLogic';
import { useGameState } from '../../engine/GameStateProvider';
import Flap from '../../components/characters/Flap';

const SkylineCity = ({ levelId }) => {
  const { completeLevel, failLevel, setShowPauseMenu } = useGameState();

  const levelData = WORLD2_LEVELS.find(l => l.id === levelId);

  const {
    player,
    platforms,
    stars,
    score,
  } = usePlatformerLogic(levelData, completeLevel, failLevel);

  return (
    <div
      className="absolute-fill"
      style={{
        background: 'var(--w2-sky-gradient)',
        overflow: 'hidden',
      }}
    >
      {/* Decorative clouds */}
      <div
        className="absolute anim-float"
        style={{
          top: '10%',
          left: '10%',
          width: 80,
          height: 40,
          background: 'rgba(255, 255, 255, 0.4)',
          borderRadius: '50px',
        }}
      />
      <div
        className="absolute anim-float delay-200"
        style={{
          top: '20%',
          right: '15%',
          width: 60,
          height: 30,
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '40px',
        }}
      />

      {/* Top UI */}
      <div
        className="absolute top-0 left-0 right-0 flex-between p-4"
        style={{ zIndex: 'var(--z-ui-overlay)' }}
      >
        <button className="btn-icon" onClick={() => setShowPauseMenu(true)}>
          ⏸
        </button>

        <div className="glass-panel flex gap-3 px-4 py-2">
          <span className="text-body" style={{ color: 'var(--w2-text)' }}>
            ⭐ {stars.length}/{levelData.stars.length}
          </span>
          <span className="text-body" style={{ color: 'var(--w2-text)' }}>
            {score}
          </span>
        </div>

        <div style={{ width: '44px' }} />
      </div>

      {/* Game World */}
      <div className="relative w-full h-full">
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
                  ? 'rgba(255, 255, 255, 0.6)'
                  : 'var(--w2-platform)',
              borderRadius:
                platform.type === 'cloud' ? '20px' : 'var(--radius-sm)',
              boxShadow:
                platform.type === 'finish'
                  ? '0 0 20px var(--w2-accent)'
                  : 'var(--shadow-md)',
              transition: platform.type === 'moving' ? 'none' : 'all 150ms',
            }}
          >
            {platform.type === 'finish' && (
              <div className="absolute-fill flex-center text-lg">🏁</div>
            )}
          </div>
        ))}

        {/* Stars */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute anim-float"
            style={{
              left: star.x - 15,
              top: star.y - 15,
              width: 30,
              height: 30,
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ⭐
          </div>
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
          <Flap vy={player.vy} />
        </div>
      </div>

      {/* Instructions */}
      <p
        className="absolute bottom-8 left-0 right-0 text-small text-center"
        style={{ color: 'var(--w2-text)', opacity: 0.6 }}
      >
        Tap to jump • Swipe to move
      </p>
    </div>
  );
};

export default SkylineCity;
