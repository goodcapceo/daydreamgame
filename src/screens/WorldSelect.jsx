import React from 'react';
import { useGameState } from '../engine/GameStateProvider';
import { WORLDS, GAME_CONFIG } from '../utils/constants';

const WorldSelect = () => {
  const { navigateTo, progress } = useGameState();

  return (
    <div className="screen-container">
      <div className="absolute top-0 left-0 right-0 flex-between p-4">
        <button className="btn-icon" onClick={() => navigateTo('menu')}>←</button>
        <h2 className="text-heading-md">Select World</h2>
        <div style={{ width: '44px' }} />
      </div>
      <div className="flex-col gap-4 w-full max-w-sm p-4" style={{ paddingTop: 'var(--space-8)' }}>
        {WORLDS.map((world, index) => {
          const worldProgress = progress.worlds.find(w => w.id === world.id);
          const isLocked = !worldProgress.unlocked;
          const starsRequired = GAME_CONFIG.STARS_TO_UNLOCK[world.id] || 0;
          const prevWorldStars = index > 0 ? progress.worlds[index - 1].totalStars : 0;

          return (
            <button
              key={world.id}
              className={`glass-panel flex items-center gap-4 p-4 w-full transition-all ${isLocked ? 'opacity-50' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
              onClick={() => !isLocked && navigateTo('levelSelect', world.id)}
              disabled={isLocked}
              style={{ background: isLocked ? 'var(--glass-bg)' : `linear-gradient(135deg, ${world.color}22, var(--glass-bg))`, borderColor: isLocked ? 'var(--glass-border)' : world.color }}
            >
              <div className="flex-center" style={{ width: 60, height: 60, borderRadius: 'var(--radius-md)', background: isLocked ? '#666' : world.color, fontSize: 'var(--text-3xl)', boxShadow: isLocked ? 'none' : `0 0 20px ${world.color}` }}>
                {isLocked ? '🔒' : world.id}
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-heading-sm">{world.name}</h3>
                <p className="text-small text-muted">{world.description}</p>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3].map(star => (<span key={star} className="text-sm">{star <= (worldProgress.totalStars / 10) ? '⭐' : '☆'}</span>))}
                  <span className="text-xs ml-2 opacity-60">{worldProgress.totalStars}/{GAME_CONFIG.LEVELS_PER_WORLD * 3}</span>
                </div>
                {isLocked && <p className="text-xs mt-1" style={{ color: 'var(--color-warning)' }}>Need {starsRequired} stars ({prevWorldStars}/{starsRequired})</p>}
              </div>
              {!isLocked && <div className="text-2xl opacity-50">→</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WorldSelect;
