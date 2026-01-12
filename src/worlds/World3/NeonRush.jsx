import React, { useRef, useState, useEffect } from 'react';
import { WORLD3_LEVELS } from './levels';
import { useSnakeLogic } from './useSnakeLogic';
import { useGameState } from '../../engine/useGameState';
import { Pause, Zap } from 'lucide-react';

// Kenney UI assets
const STAR_FILLED = '/assets/kenney/ui/stars/star_filled.png';
const STAR_ICON = '/assets/kenney/world3/star.png';

// Kenney rolling ball sprites - multiple colors for variety
const BALL_SPRITES = [
  '/assets/kenney/world3/player.png',
  '/assets/kenney/world3/ball_blue.png',
  '/assets/kenney/world3/ball_red.png',
];
// Select ball based on level ID for variety
const getPlayerSprite = (levelId) => BALL_SPRITES[(levelId - 1) % BALL_SPRITES.length];

const ORB_SPRITE = '/assets/kenney/world3/orb.png';

// Game world dimensions (coordinate system)
const WORLD_WIDTH = 480;
const WORLD_HEIGHT = 900;

const NeonRush = ({ levelId }) => {
  const { completeLevel, failLevel, setShowPauseMenu, showPauseMenu, playSound } = useGameState();
  const levelData = WORLD3_LEVELS.find(l => l.id === levelId);
  const { trail, orbs, barriers, finishPos, score, speed, countdown } = useSnakeLogic(levelData, completeLevel, failLevel, playSound, showPauseMenu);

  // Track container size for scaling
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const scaleX = clientWidth / WORLD_WIDTH;
        const scaleY = clientHeight / WORLD_HEIGHT;
        setScale(Math.min(scaleX, scaleY));
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Cache player sprite for this level
  const playerSprite = getPlayerSprite(levelId);

  return (
    <div
      className="absolute-fill"
      style={{
        background: 'var(--w3-bg)',
        overflow: 'hidden',
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <div className="absolute-fill" style={{ backgroundImage: 'linear-gradient(0deg, var(--w3-grid) 1px, transparent 1px), linear-gradient(90deg, var(--w3-grid) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3 }} />
      <div className="absolute top-0 left-0 right-0 flex-between p-4" style={{ zIndex: 'var(--z-ui-overlay)' }}>
        <button className="btn-icon flex-center" onClick={() => setShowPauseMenu(true)} style={{ width: '44px', height: '44px' }}>
          <Pause size={22} color="var(--text-light)" />
        </button>
        <div className="glass-panel flex gap-4 px-4 py-2 items-center">
          <span className="flex items-center gap-1 text-body"><img src={ORB_SPRITE} alt="Orbs" style={{ width: 18, height: 18, imageRendering: 'pixelated' }} /> {orbs.length}</span>
          <span className="flex items-center gap-1 text-body"><Zap size={16} color="var(--w3-tertiary)" /> {speed.toFixed(1)}x</span>
          <span className="flex items-center gap-1 text-body"><img src={STAR_FILLED} alt="Score" style={{ width: 18, height: 18, imageRendering: 'pixelated' }} /> {score}</span>
        </div>
        <div style={{ width: '44px' }} />
      </div>
      {/* Game area container */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: 70,
          left: 0,
          right: 0,
          bottom: 60,
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: WORLD_WIDTH,
            height: WORLD_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {barriers.map((barrier, i) => (
          <div key={`barrier-${i}`} className="absolute" style={{ left: barrier.x, top: barrier.y, width: barrier.width, height: barrier.height, background: 'var(--w3-primary)', boxShadow: '0 0 20px var(--w3-primary)', border: '2px solid var(--w3-primary)' }} />
        ))}
        {orbs.map((orb) => (
          <img key={orb.id} src={ORB_SPRITE} alt="Orb" className="absolute anim-pulse" style={{ left: orb.x - 10, top: orb.y - 10, width: 20, height: 20, imageRendering: 'pixelated', filter: 'drop-shadow(0 0 10px var(--w3-accent))' }} />
        ))}
        <div className="absolute anim-glow flex-center" style={{ left: finishPos.x - 25, top: finishPos.y - 25, width: 50, height: 50, borderRadius: '50%', border: '3px solid var(--w3-tertiary)', background: 'rgba(255, 255, 0, 0.1)', boxShadow: '0 0 30px var(--w3-tertiary)' }}>
          <img src={STAR_ICON} alt="Finish" style={{ width: 32, height: 32, imageRendering: 'pixelated' }} />
        </div>
        {trail.map((segment, i) => {
          const opacity = 1 - (i / trail.length) * 0.7;
          const size = 12 - (i / trail.length) * 4;
          return <div key={i} className="absolute" style={{ left: segment.x - size / 2, top: segment.y - size / 2, width: size, height: size, borderRadius: '50%', background: 'var(--w3-primary)', opacity, boxShadow: `0 0 ${10 * opacity}px var(--w3-primary)`, pointerEvents: 'none' }} />;
        })}
        {trail.length > 0 && (
          <img
            src={playerSprite}
            alt="Player"
            className="absolute"
            style={{
              left: trail[0].x - 14,
              top: trail[0].y - 14,
              width: 28,
              height: 28,
              imageRendering: 'pixelated',
              filter: `drop-shadow(0 0 ${10 + speed * 2}px var(--w3-primary))`,
            }}
          />
        )}
        </div>
      </div>

      {/* Countdown overlay */}
      {countdown !== null && countdown > 0 && (
        <div
          className="absolute-fill flex-center"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 'var(--z-modal)',
          }}
        >
          <div
            key={countdown}
            style={{
              fontSize: '120px',
              fontWeight: 800,
              color: 'var(--w3-primary)',
              textShadow: '0 0 40px var(--w3-primary), 0 0 80px var(--w3-primary)',
              animation: 'countdownPulse 1s ease-out',
            }}
          >
            {countdown}
          </div>
        </div>
      )}

      <p className="absolute bottom-8 left-0 right-0 text-small text-center opacity-50" style={{ color: 'var(--w3-text)' }}>Swipe or arrow keys to change direction</p>

      {/* Countdown animation */}
      <style>{`
        @keyframes countdownPulse {
          0% { transform: scale(0.5); opacity: 0; }
          20% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default NeonRush;
