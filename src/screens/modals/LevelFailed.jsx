import React from 'react';
import { useGameState } from '../../engine/useGameState';

// Kenney assets for failed screen
const SAD_FACE = '/assets/kenney/characters/face_c.png';
const CHARACTER_BODY = '/assets/kenney/characters/blue_body_circle.png';

const LevelFailed = () => {
  const { retryLevel, navigateTo, selectedWorld } = useGameState();

  return (
    <div className="overlay anim-fade-in">
      <div className="glass-panel-strong anim-slide-up" style={{ maxWidth: '90%', width: '400px', padding: 'var(--space-6)' }}>
        <div className="flex-center mb-4" style={{ position: 'relative', width: 80, height: 80, margin: '0 auto' }}>
          <img src={CHARACTER_BODY} alt="" style={{ width: 80, height: 80, imageRendering: 'pixelated', filter: 'brightness(0.8)' }} />
          <img src={SAD_FACE} alt="" style={{ position: 'absolute', width: 40, height: 40, top: 12, imageRendering: 'pixelated' }} />
        </div>
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
