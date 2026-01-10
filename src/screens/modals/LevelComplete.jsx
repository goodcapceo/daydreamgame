import React, { useState, useEffect } from 'react';
import { useGameState } from '../../engine/GameStateProvider';

const LevelComplete = () => {
  const { levelResults, nextLevel, retryLevel, navigateTo, selectedWorld } = useGameState();
  const [visibleStars, setVisibleStars] = useState(0);

  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      if (count < levelResults.stars) { count++; setVisibleStars(count); }
      else clearInterval(interval);
    }, 300);
    return () => clearInterval(interval);
  }, [levelResults.stars]);

  return (
    <div className="overlay anim-fade-in">
      <div className="glass-panel-strong anim-slide-up" style={{ maxWidth: '90%', width: '400px', padding: 'var(--space-6)' }}>
        <h2 className="text-heading-lg text-center mb-4" style={{ color: 'var(--color-success)' }}>LEVEL COMPLETE!</h2>
        <div className="flex-center gap-3 mb-6" style={{ height: '80px' }}>
          {[1, 2, 3].map(star => (
            <div key={star} className={`text-5xl transition-all ${star <= visibleStars ? 'anim-scale-pop' : ''}`} style={{ opacity: star <= visibleStars ? 1 : 0.2, transform: star <= visibleStars ? 'scale(1)' : 'scale(0.5)', animationDelay: `${star * 100}ms` }}>
              {star <= visibleStars ? '⭐' : '☆'}
            </div>
          ))}
        </div>
        <div className="text-center mb-6">
          <div className="text-heading-md mb-2">Score: {levelResults.score}</div>
          <div style={{ height: 8, width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(to right, #22d3ee, #3b82f6)', transition: 'all 1s', width: `${Math.min((levelResults.score / 1000) * 100, 100)}%` }} />
          </div>
        </div>
        <div className="flex-col gap-3">
          <button className="btn-primary w-full" onClick={nextLevel}>NEXT LEVEL</button>
          <div className="flex gap-3">
            <button className="btn-secondary flex-1" onClick={retryLevel}>Retry</button>
            <button className="btn-secondary flex-1" onClick={() => navigateTo('levelSelect', selectedWorld)}>Levels</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelComplete;
