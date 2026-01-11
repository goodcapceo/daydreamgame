import React, { useState, useEffect, useMemo } from 'react';
import { useGameState } from '../engine/useGameState';
import { WORLDS, GAME_CONFIG } from '../utils/constants';
import { ArrowLeft, Star, Lock, ChevronRight } from 'lucide-react';

// Pre-generate particle styles
const generateParticleStyles = () =>
  [...Array(15)].map((_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${4 + Math.random() * 6}px`,
    height: `${4 + Math.random() * 6}px`,
    background: ['#00FFF5', '#FFD700', '#FF0099', '#00ff88'][i % 4],
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${4 + Math.random() * 4}s`,
  }));

// Kenney sprites for each world
const WORLD_SPRITES = {
  1: '/assets/kenney/world1/player.png',
  2: '/assets/kenney/world2/bunny1_stand.png',
  3: '/assets/kenney/world3/player.png',
  4: '/assets/kenney/world4/tile_pink.png',
};

const WorldSelect = () => {
  const { navigateTo, progress, playSound } = useGameState();
  const [showContent, setShowContent] = useState(false);

  // Stable particle styles across re-renders
  const particleStyles = useMemo(() => generateParticleStyles(), []);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);
  }, []);

  const totalStars = progress.worlds.reduce((sum, world) => sum + world.totalStars, 0);
  const maxStars = progress.worlds.length * GAME_CONFIG.LEVELS_PER_WORLD * 3;

  const handleBack = () => {
    playSound('click');
    navigateTo('menu');
  };

  const handleSelectWorld = (worldId) => {
    playSound('select');
    navigateTo('levelSelect', worldId);
  };

  return (
    <div
      className="screen-container"
      style={{
        background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 50%, #0d1b2a 100%)',
      }}
    >
      {/* Background particles */}
      <div className="absolute-fill" style={{ overflow: 'hidden', opacity: 0.2 }}>
        {particleStyles.map((style, i) => (
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

      {/* Header */}
      <div
        className="absolute top-0 left-0 right-0 p-4"
        style={{ zIndex: 10 }}
      >
        <div className="flex-between items-center">
          <button
            onClick={handleBack}
            style={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 12,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={22} color="white" />
          </button>

          <div className="flex-col items-center">
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'white', margin: 0 }}>
              Worlds
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Star size={14} fill="#FFD700" color="#FFD700" />
              <span style={{ color: '#FFD700', fontSize: 14, fontWeight: 600 }}>{totalStars}</span>
              <span style={{ color: 'rgba(255, 215, 0, 0.5)', fontSize: 12 }}>/ {maxStars}</span>
            </div>
          </div>

          <div style={{ width: 44 }} />
        </div>
      </div>

      {/* World cards */}
      <div
        className="flex-col gap-4 w-full"
        style={{
          paddingTop: 100,
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: 24,
          maxWidth: 420,
          margin: '0 auto',
        }}
      >
        {WORLDS.map((world, index) => {
          const worldProgress = progress.worlds.find((w) => w.id === world.id);
          const isLocked = false; // DEV: All worlds unlocked for testing
          const worldMaxStars = GAME_CONFIG.LEVELS_PER_WORLD * 3;

          return (
            <button
              key={world.id}
              onClick={() => !isLocked && handleSelectWorld(world.id)}
              disabled={isLocked}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                width: '100%',
                padding: 16,
                background: isLocked
                  ? 'rgba(30, 30, 50, 0.8)'
                  : `linear-gradient(135deg, ${world.color}20, rgba(30, 30, 50, 0.9))`,
                border: `2px solid ${isLocked ? 'rgba(60, 60, 80, 0.5)' : world.color + '40'}`,
                borderRadius: 16,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: showContent ? 1 : 0,
                transform: showContent ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.4s ease ${index * 0.1}s`,
                textAlign: 'left',
              }}
            >
              {/* World icon */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 14,
                  background: isLocked ? 'rgba(60, 60, 80, 0.5)' : `${world.color}25`,
                  border: `2px solid ${isLocked ? 'transparent' : world.color}`,
                  boxShadow: isLocked ? 'none' : `0 0 20px ${world.color}30`,
                  flexShrink: 0,
                }}
              >
                {isLocked ? (
                  <Lock size={28} color="rgba(255, 255, 255, 0.3)" />
                ) : (
                  <img
                    src={WORLD_SPRITES[world.id]}
                    alt={world.name}
                    style={{
                      width: 40,
                      height: 40,
                      imageRendering: 'pixelated',
                    }}
                  />
                )}
              </div>

              {/* World info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: isLocked ? 'rgba(255, 255, 255, 0.4)' : 'white',
                    margin: 0,
                    marginBottom: 4,
                  }}
                >
                  {world.name}
                </h3>
                <p
                  style={{
                    fontSize: 12,
                    color: 'rgba(255, 255, 255, 0.5)',
                    margin: 0,
                    marginBottom: 8,
                  }}
                >
                  {world.description}
                </p>

                {/* Progress bar */}
                {!isLocked && (
                  <div
                    style={{
                      width: '100%',
                      height: 4,
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${(worldProgress.totalStars / worldMaxStars) * 100}%`,
                        height: '100%',
                        background: world.color,
                        borderRadius: 2,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Star count and arrow */}
              {!isLocked && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star size={16} fill="#FFD700" color="#FFD700" />
                    <span style={{ color: '#FFD700', fontSize: 14, fontWeight: 600 }}>
                      {worldProgress.totalStars}
                    </span>
                  </div>
                  <ChevronRight size={20} color="rgba(255, 255, 255, 0.3)" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WorldSelect;
