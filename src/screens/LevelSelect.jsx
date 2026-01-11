import React, { useState, useEffect } from 'react';
import { useGameState } from '../engine/useGameState';
import { WORLDS } from '../utils/constants';
import { ArrowLeft, Lock, Play } from 'lucide-react';

// Kenney star sprites
const STAR_FILLED = '/assets/kenney/ui/stars/star_filled.png';
const STAR_EMPTY = '/assets/kenney/ui/stars/star_grey.png';

const LevelCard = ({ level, world, isUnlocked, onSelect, delay }) => {
  const hasStars = level.stars > 0;

  return (
    <button
      onClick={() => isUnlocked && onSelect()}
      disabled={!isUnlocked}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        borderRadius: 16,
        padding: 8,
        background: level.completed
          ? `linear-gradient(135deg, ${world.color}30, ${world.color}15)`
          : isUnlocked
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(30, 30, 50, 0.6)',
        border: `2px solid ${
          level.completed
            ? world.color
            : isUnlocked
            ? 'rgba(255, 255, 255, 0.15)'
            : 'rgba(60, 60, 80, 0.5)'
        }`,
        cursor: isUnlocked ? 'pointer' : 'not-allowed',
        opacity: 0,
        transform: 'translateY(20px) scale(0.9)',
        animation: `fadeSlideIn 0.4s ease ${delay}s forwards`,
        transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
        overflow: 'hidden',
      }}
      onMouseDown={(e) => isUnlocked && (e.currentTarget.style.transform = 'scale(0.95)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {isUnlocked ? (
        <>
          {/* Level number */}
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: level.completed ? world.color : 'white',
              textShadow: level.completed ? `0 0 20px ${world.color}60` : 'none',
            }}
          >
            {level.id}
          </span>

          {/* Stars */}
          <div className="flex" style={{ gap: 2 }}>
            {[1, 2, 3].map((s) => (
              <img
                key={s}
                src={hasStars && s <= level.stars ? STAR_FILLED : STAR_EMPTY}
                alt=""
                style={{
                  width: 12,
                  height: 12,
                  imageRendering: 'pixelated',
                  opacity: hasStars && s <= level.stars ? 1 : 0.4,
                }}
              />
            ))}
          </div>

          {/* Play indicator for next level */}
          {!level.completed && isUnlocked && (
            <div
              className="absolute"
              style={{
                top: 4,
                right: 4,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: world.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 8px ${world.color}`,
              }}
            >
              <Play size={8} color="white" fill="white" style={{ marginLeft: 1 }} />
            </div>
          )}
        </>
      ) : (
        <Lock size={24} color="rgba(255, 255, 255, 0.25)" />
      )}
    </button>
  );
};

const LevelSelect = () => {
  const { navigateTo, startLevel, selectedWorld, progress, playSound } = useGameState();
  const [showContent, setShowContent] = useState(false);

  const world = WORLDS.find((w) => w.id === selectedWorld);
  const worldProgress = progress.worlds.find((w) => w.id === selectedWorld);
  const totalStars = worldProgress.totalStars;
  const maxStars = 30;

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);
  }, []);

  const handleBack = () => {
    playSound('click');
    navigateTo('worldSelect');
  };

  const handleSelectLevel = (levelId) => {
    playSound('select');
    startLevel(selectedWorld, levelId);
  };

  return (
    <div
      className="screen-container"
      style={{
        background: `linear-gradient(180deg, #0a0a1a 0%, ${world.color}15 50%, #0a0a1a 100%)`,
      }}
    >
      {/* Background glow */}
      <div
        className="absolute"
        style={{
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 300,
          height: 300,
          background: `radial-gradient(circle, ${world.color}20 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

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
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: world.color,
                margin: 0,
                textShadow: `0 0 20px ${world.color}60`,
              }}
            >
              {world.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <img src={STAR_FILLED} alt="" style={{ width: 16, height: 16, imageRendering: 'pixelated' }} />
              <span style={{ color: '#FFD700', fontSize: 14, fontWeight: 600 }}>
                {totalStars}
              </span>
              <span style={{ color: 'rgba(255, 215, 0, 0.5)', fontSize: 12 }}>
                / {maxStars}
              </span>
            </div>
          </div>

          <div style={{ width: 44 }} />
        </div>
      </div>

      {/* Levels grid */}
      <div
        className="absolute-fill flex-center"
        style={{
          paddingTop: 100,
          paddingBottom: 80,
          opacity: showContent ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 12,
            width: '90%',
            maxWidth: 400,
            padding: 16,
          }}
        >
          {worldProgress.levels.map((level, index) => {
            // DEV: All levels unlocked for testing
            const isUnlocked = true;

            return (
              <LevelCard
                key={level.id}
                level={level}
                world={world}
                isUnlocked={isUnlocked}
                onSelect={() => handleSelectLevel(level.id)}
                delay={index * 0.05}
              />
            );
          })}
        </div>
      </div>

      {/* Progress bar at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 p-4"
        style={{ zIndex: 10 }}
      >
        <div
          style={{
            width: '100%',
            height: 6,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${(totalStars / maxStars) * 100}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${world.color}, ${world.color}cc)`,
              borderRadius: 3,
              transition: 'width 0.5s ease',
              boxShadow: `0 0 10px ${world.color}`,
            }}
          />
        </div>
        <p
          className="text-center mt-2"
          style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12 }}
        >
          Complete levels to earn stars
        </p>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeSlideIn {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default LevelSelect;
