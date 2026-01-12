import React, { useState, useEffect } from 'react';
import { useGameState } from '../../engine/useGameState';
import { ChevronRight, Grid } from 'lucide-react';

// Kenney UI assets
const STAR_FILLED = '/assets/kenney/ui/stars/star_filled.png';
const STAR_GREY = '/assets/kenney/ui/stars/star_grey.png';
const RETRY_ICON = '/assets/kenney/ui/icons/retry.png';
const ARROW_RIGHT = '/assets/kenney/ui/icons/arrow_right.png';

const LevelComplete = () => {
  const { levelResults, nextLevel, retryLevel, navigateTo, selectedWorld, playSound } = useGameState();
  const [visibleStars, setVisibleStars] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    playSound('complete');
    setTimeout(() => setShowContent(true), 100);
  }, [playSound]);

  useEffect(() => {
    if (!showContent) return;
    let count = 0;
    const interval = setInterval(() => {
      if (count < levelResults.stars) {
        count++;
        setVisibleStars(count);
        playSound('unlock');
      } else {
        clearInterval(interval);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [levelResults.stars, showContent, playSound]);

  const handleNextLevel = () => {
    playSound('click');
    nextLevel();
  };

  const handleRetry = () => {
    playSound('click');
    retryLevel();
  };

  const handleLevels = () => {
    playSound('click');
    navigateTo('levelSelect', selectedWorld);
  };

  return (
    <div
      className="absolute-fill flex-center"
      style={{
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 'var(--z-modal)',
      }}
    >
      <div
        style={{
          width: '90%',
          maxWidth: 340,
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)',
          transition: 'all 0.4s ease',
        }}
      >
        {/* Success header */}
        <div className="text-center mb-6">
          <h2
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: '#00FFF5',
              textShadow: '0 0 30px rgba(0, 255, 245, 0.5)',
              margin: 0,
              letterSpacing: 2,
            }}
          >
            COMPLETE!
          </h2>
        </div>

        {/* Stars display */}
        <div
          className="flex-center gap-4 mb-8"
          style={{ height: 80 }}
        >
          {[1, 2, 3].map((star, index) => {
            const isEarned = star <= visibleStars;
            const delay = index * 0.1;
            return (
              <div
                key={star}
                style={{
                  position: 'relative',
                  opacity: isEarned ? 1 : 0.2,
                  transform: isEarned ? 'scale(1) rotate(0deg)' : 'scale(0.6) rotate(-30deg)',
                  transition: `all 0.4s ease ${delay}s`,
                }}
              >
                {/* Glow effect */}
                {isEarned && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: -10,
                      background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)',
                      borderRadius: '50%',
                    }}
                  />
                )}
                <img
                  src={isEarned ? STAR_FILLED : STAR_GREY}
                  alt=""
                  style={{
                    width: 56,
                    height: 56,
                    imageRendering: 'pixelated',
                    filter: isEarned ? 'drop-shadow(0 4px 12px rgba(255, 215, 0, 0.6))' : 'none',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Score card */}
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex-between items-center mb-3">
            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>Score</span>
            <span style={{ color: '#00FFF5', fontSize: 28, fontWeight: 700 }}>{levelResults.score}</span>
          </div>
          <div
            style={{
              height: 6,
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min((levelResults.score / 1000) * 100, 100)}%`,
                background: 'linear-gradient(90deg, #00FFF5, #00ff88)',
                borderRadius: 3,
                transition: 'width 1s ease',
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex-col gap-3">
          <button
            onClick={handleNextLevel}
            className="flex items-center justify-center gap-2"
            style={{
              width: '100%',
              padding: 16,
              fontSize: 16,
              fontWeight: 700,
              color: '#0a0a1a',
              background: 'linear-gradient(135deg, #00FFF5, #00e0e0)',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0, 255, 245, 0.3)',
            }}
          >
            Next Level
            <ChevronRight size={20} />
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 flex-1"
              style={{
                padding: 14,
                fontSize: 14,
                fontWeight: 600,
                color: 'white',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 12,
                cursor: 'pointer',
              }}
            >
              <img src={RETRY_ICON} alt="" style={{ width: 20, height: 20, imageRendering: 'pixelated' }} />
              Retry
            </button>
            <button
              onClick={handleLevels}
              className="flex items-center justify-center gap-2 flex-1"
              style={{
                padding: 14,
                fontSize: 14,
                fontWeight: 600,
                color: 'white',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 12,
                cursor: 'pointer',
              }}
            >
              <Grid size={18} />
              Levels
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelComplete;
