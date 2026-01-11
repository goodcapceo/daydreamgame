import React from 'react';
import { WORLD2_LEVELS } from './levels';
import { usePlatformerLogic } from './usePlatformerLogic';
import { useGameState } from '../../engine/useGameState';
import { Pause, Star, Flag } from 'lucide-react';

// Kenney bunny sprites
const BUNNY_SPRITES = {
  stand: '/assets/kenney/world2/bunny1_stand.png',
  jump: '/assets/kenney/world2/bunny1_jump.png',
  walk1: '/assets/kenney/world2/bunny1_walk1.png',
  walk2: '/assets/kenney/world2/bunny1_walk2.png',
};
const STAR_SPRITE = '/assets/kenney/world2/star.png';

const SkylineCity = ({ levelId }) => {
  const { completeLevel, failLevel, setShowPauseMenu, playSound } = useGameState();

  const levelData = WORLD2_LEVELS.find(l => l.id === levelId);

  const {
    player,
    platforms,
    stars,
    score,
  } = usePlatformerLogic(levelData, completeLevel, failLevel, playSound);

  return (
    <div
      className="absolute-fill"
      style={{
        background: 'var(--w2-sky-gradient)',
        overflow: 'hidden',
      }}
    >
      {/* Enhanced decorative clouds */}
      {/* Large fluffy cloud - left */}
      <div className="absolute" style={{ top: '8%', left: '5%' }}>
        <div
          className="anim-float"
          style={{
            position: 'relative',
            width: 120,
            height: 50,
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50px',
            boxShadow: '0 4px 20px rgba(255, 255, 255, 0.3)',
          }}
        >
          <div style={{ position: 'absolute', top: -20, left: 20, width: 50, height: 50, background: 'rgba(255, 255, 255, 0.9)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: -15, left: 55, width: 40, height: 40, background: 'rgba(255, 255, 255, 0.9)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: -10, left: 85, width: 30, height: 30, background: 'rgba(255, 255, 255, 0.85)', borderRadius: '50%' }} />
        </div>
      </div>

      {/* Medium cloud - right */}
      <div className="absolute" style={{ top: '15%', right: '10%' }}>
        <div
          className="anim-float"
          style={{
            position: 'relative',
            width: 90,
            height: 40,
            background: 'rgba(255, 255, 255, 0.85)',
            borderRadius: '40px',
            boxShadow: '0 4px 16px rgba(255, 255, 255, 0.25)',
            animationDelay: '1s',
          }}
        >
          <div style={{ position: 'absolute', top: -15, left: 15, width: 40, height: 40, background: 'rgba(255, 255, 255, 0.85)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: -10, left: 45, width: 30, height: 30, background: 'rgba(255, 255, 255, 0.8)', borderRadius: '50%' }} />
        </div>
      </div>

      {/* Small distant cloud - center */}
      <div className="absolute" style={{ top: '25%', left: '40%' }}>
        <div
          className="anim-float"
          style={{
            position: 'relative',
            width: 60,
            height: 25,
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '30px',
            animationDelay: '2s',
          }}
        >
          <div style={{ position: 'absolute', top: -10, left: 12, width: 25, height: 25, background: 'rgba(255, 255, 255, 0.6)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: -6, left: 32, width: 18, height: 18, background: 'rgba(255, 255, 255, 0.55)', borderRadius: '50%' }} />
        </div>
      </div>

      {/* Wispy cloud - bottom left */}
      <div
        className="absolute anim-float"
        style={{
          top: '35%',
          left: '15%',
          width: 70,
          height: 25,
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '25px',
          animationDelay: '3s',
        }}
      />

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
            <Star size={16} fill="#FFD700" color="#FFD700" /> {stars.length}/{levelData.stars.length}
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
                <Flag size={24} color="white" />
              </div>
            )}
            {platform.type === 'cloud' && (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {/* Main cloud body */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '10%',
                  width: '80%',
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.85)',
                  borderRadius: '40px',
                  boxShadow: '0 4px 12px rgba(255, 255, 255, 0.3)',
                }} />
                {/* Left puff */}
                <div style={{
                  position: 'absolute',
                  bottom: '30%',
                  left: '5%',
                  width: '35%',
                  height: '90%',
                  background: 'rgba(255, 255, 255, 0.85)',
                  borderRadius: '50%',
                }} />
                {/* Right puff */}
                <div style={{
                  position: 'absolute',
                  bottom: '20%',
                  right: '10%',
                  width: '30%',
                  height: '80%',
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '50%',
                }} />
                {/* Center top puff */}
                <div style={{
                  position: 'absolute',
                  bottom: '40%',
                  left: '30%',
                  width: '40%',
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '50%',
                }} />
              </div>
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
            src={player.vy < -2 ? BUNNY_SPRITES.jump : BUNNY_SPRITES.stand}
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
