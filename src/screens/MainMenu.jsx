import React, { useEffect, useState } from 'react';
import { useGameState } from '../engine/GameStateProvider';
import Gem from '../components/characters/Gem';

const MainMenu = () => {
  const { navigateTo, lives, progress } = useGameState();
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowTitle(true), 100);
  }, []);

  const totalStars = progress.worlds.reduce((sum, world) => sum + world.totalStars, 0);

  return (
    <div className="screen-container">
      <div className="absolute top-20 anim-float" style={{ opacity: 0.3 }}>
        <div style={{ transform: 'scale(2)' }}><Gem /></div>
      </div>
      <div className={`glass-panel w-full max-w-sm flex-col flex-center gap-6 ${showTitle ? 'anim-slide-up' : ''}`} style={{ padding: 'var(--space-6)' }}>
        <div className="flex-col flex-center gap-2">
          <h1 className="text-heading-lg" style={{ fontSize: 'var(--text-5xl)', background: 'linear-gradient(135deg, var(--w1-accent), var(--w2-accent), var(--w3-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>DAYDREAM</h1>
          <p className="text-small text-center" style={{ opacity: 0.8 }}>Five minutes away from your feed</p>
        </div>
        <div className="flex gap-4 text-center">
          <div><div className="text-heading-md">{totalStars}</div><div className="text-small">Stars</div></div>
          <div><div className="text-heading-md">{lives}</div><div className="text-small">Lives</div></div>
        </div>
        <button className="btn-primary w-full anim-breathe" onClick={() => navigateTo('worldSelect')}>PLAY</button>
        <div className="flex gap-3 w-full justify-center">
          <button className="btn-icon" aria-label="Settings">⚙️</button>
          <button className="btn-icon" aria-label="Sound">🔊</button>
          <button className="btn-icon" aria-label="Info">ℹ️</button>
        </div>
      </div>
      <p className="absolute bottom-8 text-xs opacity-40">v1.0.0 • playdaydreamgame.com</p>
    </div>
  );
};

export default MainMenu;
