import React, { useEffect, useState } from 'react';
import { useGameState } from '../engine/useGameState';
import { Settings, Volume2, Info, Heart } from 'lucide-react';

// Kenney character sprites for showcase
const CHARACTER_SPRITES = [
  { src: '/assets/kenney/world1/player.png', name: 'Crystal', world: 1 },
  { src: '/assets/kenney/world2/bunny1_stand.png', name: 'Bunny', world: 2 },
  { src: '/assets/kenney/world3/player.png', name: 'Ball', world: 3 },
  { src: '/assets/kenney/world4/tile_pink.png', name: 'Tile', world: 4 },
];

// Pre-generate particle styles at module level (once, outside component)
const PARTICLE_STYLES = [...Array(20)].map((_, i) => ({
  left: `${(i * 5) % 100}%`,
  top: `${(i * 7 + 10) % 100}%`,
  width: `${4 + (i % 3) * 4}px`,
  height: `${4 + (i % 3) * 4}px`,
  background: ['#00FFF5', '#FFD700', '#FF0099', '#00ff88'][i % 4],
  animationDelay: `${(i * 0.15) % 3}s`,
  animationDuration: `${3 + (i % 4)}s`,
}));

const MainMenu = () => {
  const { navigateTo, lives, progress, setShowSettingsModal, setShowSoundsModal, setShowInfoModal, playSound, startMusic } = useGameState();
  const [showContent, setShowContent] = useState(false);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);
  }, []);

  // Start music on first interaction
  const handleInteraction = () => {
    startMusic();
  };

  // Cycle through characters
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCharIndex((prev) => (prev + 1) % CHARACTER_SPRITES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const totalStars = progress.worlds.reduce((sum, world) => sum + world.totalStars, 0);
  const maxStars = progress.worlds.length * 30;
  const currentChar = CHARACTER_SPRITES[currentCharIndex];

  return (
    <div
      className="screen-container"
      style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 50%, #0d1b2a 100%)' }}
      onClick={handleInteraction}
    >
      {/* Animated floating particles background */}
      <div className="absolute-fill" style={{ overflow: 'hidden', opacity: 0.3 }}>
        {PARTICLE_STYLES.map((style, i) => (
          <div
            key={i}
            className="absolute anim-float"
            style={{
              ...style,
              borderRadius: '50%',
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      {/* Top bar with stats */}
      <div
        className="absolute top-0 left-0 right-0 flex-between p-4"
        style={{
          zIndex: 10,
          opacity: showContent ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      >
        {/* Stars display */}
        <div
          className="flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 180, 0, 0.15) 100%)',
            borderRadius: 20,
            padding: '8px 14px',
            border: '2px solid rgba(255, 215, 0, 0.4)',
            boxShadow: '0 4px 12px rgba(255, 215, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          <img
            src="/assets/kenney/ui/stars/star_filled.png"
            alt="Stars"
            style={{ width: 22, height: 22, imageRendering: 'pixelated' }}
          />
          <span style={{ color: '#FFD700', fontWeight: 700, fontSize: '16px', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
            {totalStars}
          </span>
          <span style={{ color: 'rgba(255, 215, 0, 0.7)', fontSize: '12px' }}>/ {maxStars}</span>
        </div>

        {/* Lives display */}
        <div
          className="flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.25) 0%, rgba(255, 80, 80, 0.15) 100%)',
            borderRadius: 20,
            padding: '8px 14px',
            border: '2px solid rgba(255, 107, 107, 0.4)',
            boxShadow: '0 4px 12px rgba(255, 107, 107, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          <Heart size={20} fill="#FF6B6B" color="#FF6B6B" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
          <span style={{ color: '#FF6B6B', fontWeight: 700, fontSize: '16px', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
            {lives}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div
        className="flex-col flex-center gap-8"
        style={{
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease',
          marginTop: '15%',
        }}
      >
        {/* Character showcase */}
        <div
          className="relative anim-float"
          style={{
            width: 120,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="absolute"
            style={{
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(0,255,245,0.2) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />
          <img
            key={currentCharIndex}
            src={currentChar.src}
            alt={currentChar.name}
            className="anim-bounce-in"
            style={{
              width: 80,
              height: 80,
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0 8px 24px rgba(0,255,245,0.4))',
            }}
          />
        </div>

        {/* Title */}
        <div className="flex-col flex-center gap-3">
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #00FFF5 0%, #FFD700 50%, #FF0099 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '4px',
              textShadow: '0 0 60px rgba(0,255,245,0.5)',
            }}
          >
            DAYDREAM
          </h1>
          <p
            style={{
              color: 'white',
              fontSize: '14px',
              letterSpacing: '1px',
              fontWeight: 500,
            }}
          >
            Five minutes away from your feed
          </p>
        </div>

        {/* Play button */}
        <button
          onClick={() => { playSound('click'); navigateTo('worldSelect'); }}
          style={{
            padding: '18px 64px',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '4px',
            color: '#0a0a1a',
            background: 'linear-gradient(135deg, #00FFF5, #00e0e0)',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0,255,245,0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          PLAY
        </button>
      </div>

      {/* Bottom section with icon buttons */}
      <div
        className="absolute bottom-0 left-0 right-0 flex-col items-center gap-4 pb-12"
        style={{
          opacity: showContent ? 1 : 0,
          transition: 'opacity 0.5s ease 0.3s',
        }}
      >
        <div className="flex gap-4">
          <button
            onClick={() => { playSound('click'); setShowSettingsModal(true); }}
            aria-label="Settings"
            style={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
          >
            <Settings size={22} color="rgba(255, 255, 255, 0.8)" />
          </button>
          <button
            onClick={() => { playSound('click'); setShowSoundsModal(true); }}
            aria-label="Sound"
            style={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
          >
            <Volume2 size={22} color="rgba(255, 255, 255, 0.8)" />
          </button>
          <button
            onClick={() => { playSound('click'); setShowInfoModal(true); }}
            aria-label="Info"
            style={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
          >
            <Info size={22} color="rgba(255, 255, 255, 0.8)" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
