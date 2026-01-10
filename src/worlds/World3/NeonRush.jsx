import React from 'react';
import { WORLD3_LEVELS } from './levels';
import { useSnakeLogic } from './useSnakeLogic';
import { useGameState } from '../../engine/GameStateProvider';
import Pulse from '../../components/characters/Pulse';

const NeonRush = ({ levelId }) => {
  const { completeLevel, failLevel, setShowPauseMenu } = useGameState();
  const levelData = WORLD3_LEVELS.find(l => l.id === levelId);
  const { trail, orbs, barriers, finishPos, score, speed } = useSnakeLogic(levelData, completeLevel, failLevel);

  return (
    <div className="absolute-fill" style={{ background: 'var(--w3-bg)', overflow: 'hidden' }}>
      <div className="absolute-fill" style={{ backgroundImage: 'linear-gradient(0deg, var(--w3-grid) 1px, transparent 1px), linear-gradient(90deg, var(--w3-grid) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3 }} />
      <div className="absolute top-0 left-0 right-0 flex-between p-4" style={{ zIndex: 'var(--z-ui-overlay)' }}>
        <button className="btn-icon" onClick={() => setShowPauseMenu(true)}>⏸</button>
        <div className="glass-panel flex gap-3 px-4 py-2">
          <span className="text-body">💎 {orbs.length}</span>
          <span className="text-body">⚡ {speed.toFixed(1)}x</span>
          <span className="text-body">⭐ {score}</span>
        </div>
        <div style={{ width: '44px' }} />
      </div>
      <div className="relative w-full h-full">
        {barriers.map((barrier, i) => (
          <div key={`barrier-${i}`} className="absolute" style={{ left: barrier.x, top: barrier.y, width: barrier.width, height: barrier.height, background: 'var(--w3-primary)', boxShadow: '0 0 20px var(--w3-primary)', border: '2px solid var(--w3-primary)' }} />
        ))}
        {orbs.map((orb) => (
          <div key={orb.id} className="absolute anim-pulse" style={{ left: orb.x - 8, top: orb.y - 8, width: 16, height: 16, borderRadius: '50%', background: 'var(--w3-accent)', boxShadow: '0 0 15px var(--w3-accent)' }} />
        ))}
        <div className="absolute anim-glow" style={{ left: finishPos.x - 25, top: finishPos.y - 25, width: 50, height: 50, borderRadius: '50%', border: '3px solid var(--w3-tertiary)', background: 'rgba(255, 255, 0, 0.1)', boxShadow: '0 0 30px var(--w3-tertiary)' }}>
          <div className="absolute-fill flex-center text-2xl">🎯</div>
        </div>
        {trail.map((segment, i) => {
          const opacity = 1 - (i / trail.length) * 0.7;
          const size = 12 - (i / trail.length) * 4;
          return <div key={i} className="absolute" style={{ left: segment.x - size / 2, top: segment.y - size / 2, width: size, height: size, borderRadius: '50%', background: 'var(--w3-primary)', opacity, boxShadow: `0 0 ${10 * opacity}px var(--w3-primary)`, pointerEvents: 'none' }} />;
        })}
        {trail.length > 0 && (
          <div className="absolute" style={{ left: trail[0].x - 12, top: trail[0].y - 12, width: 24, height: 24 }}>
            <Pulse speed={speed} />
          </div>
        )}
      </div>
      <p className="absolute bottom-8 left-0 right-0 text-small text-center opacity-50" style={{ color: 'var(--w3-text)' }}>Swipe or arrow keys to change direction</p>
    </div>
  );
};

export default NeonRush;
