import React from 'react';
import { useGameState } from '../../engine/GameStateProvider';

const ToggleButton = ({ label, icon, enabled, onChange }) => (
  <button className={`glass-panel flex-between p-4 transition-all ${enabled ? 'border-green-400' : 'opacity-60'}`} onClick={onChange} style={{ width: '100%' }}>
    <span className="text-body">{icon} {label}</span>
    <div className="relative" style={{ width: 44, height: 24, borderRadius: 12, background: enabled ? 'var(--color-success)' : '#666', transition: 'background 200ms' }}>
      <div style={{ position: 'absolute', top: 2, left: enabled ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 200ms' }} />
    </div>
  </button>
);

const PauseMenu = () => {
  const { setShowPauseMenu, navigateTo, selectedWorld, settings, setSettings } = useGameState();

  return (
    <div className="overlay anim-fade-in">
      <div className="glass-panel-strong anim-slide-up" style={{ maxWidth: '90%', width: '400px', padding: 'var(--space-6)' }}>
        <h2 className="text-heading-lg text-center mb-6">PAUSED</h2>
        <div className="flex-col gap-3 mb-6">
          <ToggleButton label="Sound" icon="🔊" enabled={settings.soundEnabled} onChange={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })} />
          <ToggleButton label="Haptics" icon="📳" enabled={settings.hapticsEnabled} onChange={() => setSettings({ ...settings, hapticsEnabled: !settings.hapticsEnabled })} />
        </div>
        <div className="flex-col gap-3">
          <button className="btn-primary w-full" onClick={() => setShowPauseMenu(false)}>RESUME</button>
          <button className="btn-secondary w-full" onClick={() => { setShowPauseMenu(false); navigateTo('levelSelect', selectedWorld); }}>Exit to Levels</button>
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;
