import React from 'react';
import { useGameState } from '../engine/GameStateProvider';
import { WORLDS, GAME_CONFIG } from '../utils/constants';

const LevelSelect = () => {
  const { navigateTo, startLevel, selectedWorld, progress } = useGameState();
  const world = WORLDS.find(w => w.id === selectedWorld);
  const worldProgress = progress.worlds.find(w => w.id === selectedWorld);

  return (
    <div className="screen-container" style={{ background: world.bgColor.includes?.('gradient') ? world.bgColor : `linear-gradient(to bottom, ${world.bgColor}, #000)` }}>
      <div className="absolute top-0 left-0 right-0 flex-between p-4">
        <button className="btn-icon" onClick={() => navigateTo('worldSelect')}>←</button>
        <div className="text-center">
          <h2 className="text-heading-md">{world.name}</h2>
          <p className="text-xs opacity-60">{worldProgress.totalStars}/{GAME_CONFIG.LEVELS_PER_WORLD * 3} stars</p>
        </div>
        <div style={{ width: '44px' }} />
      </div>
      <div className="grid gap-3 p-6" style={{ gridTemplateColumns: 'repeat(5, 1fr)', maxWidth: '400px', paddingTop: 'var(--space-8)' }}>
        {worldProgress.levels.map((level, index) => {
          const isUnlocked = index === 0 || worldProgress.levels[index - 1].completed;
          return (
            <button
              key={level.id}
              className={`glass-panel flex-center flex-col gap-1 aspect-square transition-all ${isUnlocked ? 'hover:scale-110 active:scale-95' : 'opacity-40'}`}
              onClick={() => isUnlocked && startLevel(selectedWorld, level.id)}
              disabled={!isUnlocked}
              style={{ background: level.completed ? `${world.color}33` : 'var(--glass-bg)', borderColor: level.completed ? world.color : 'var(--glass-border)' }}
            >
              <div className="text-heading-sm">{isUnlocked ? level.id : '🔒'}</div>
              {level.completed && (
                <div className="flex gap-px">
                  {[1, 2, 3].map(star => (<span key={star} className="text-xs">{star <= level.stars ? '⭐' : '☆'}</span>))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LevelSelect;
