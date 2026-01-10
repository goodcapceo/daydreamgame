import React from 'react';
import { useGameState } from '../../engine/GameStateProvider';

const LevelFailed = () => {
  const { retryLevel, navigateTo, selectedWorld } = useGameState();

  return (
    <div className="overlay anim-fade-in">
      <div className="glass-panel-strong anim-slide-up" style={{ maxWidth: '90%', width: '400px', padding: 'var(--space-6)' }}>
        <div className="text-center text-6xl mb-4">😔</div>
        <h2 className="text-heading-lg text-center mb-4">Try Again?</h2>
        <p className="text-body text-center mb-6 opacity-80">Every daydream takes practice</p>
        <div className="flex-col gap-3">
          <button className="btn-primary w-full" onClick={retryLevel}>RETRY</button>
          <button className="btn-secondary w-full" onClick={() => navigateTo('levelSelect', selectedWorld)}>Back to Levels</button>
        </div>
      </div>
    </div>
  );
};

export default LevelFailed;
