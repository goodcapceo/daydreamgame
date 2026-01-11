import React from 'react';
import { useGameState } from '../../engine/useGameState';
import { X, Volume2, VolumeX, Music, Sparkles } from 'lucide-react';

const ToggleSwitch = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    style={{
      width: 44,
      height: 24,
      borderRadius: 12,
      background: enabled ? '#00FFF5' : 'rgba(255, 255, 255, 0.1)',
      border: 'none',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 2,
        left: enabled ? 22 : 2,
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: 'white',
        transition: 'left 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}
    />
  </button>
);

const VolumeSlider = ({ value, onChange, color, icon, label }) => {
  const IconComponent = icon;
  return (
  <div className="flex-col gap-2">
    <div className="flex-between items-center">
      <div className="flex items-center gap-2">
        <IconComponent size={16} color={color} />
        <span style={{ color: 'white', fontSize: 13, fontWeight: 500 }}>{label}</span>
      </div>
      <span style={{ color, fontSize: 13, fontWeight: 600 }}>{Math.round(value * 100)}%</span>
    </div>
    <div style={{ position: 'relative', height: 24, display: 'flex', alignItems: 'center' }}>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          height: 6,
          borderRadius: 3,
          background: `linear-gradient(to right, ${color} ${value * 100}%, rgba(255,255,255,0.1) ${value * 100}%)`,
          appearance: 'none',
          cursor: 'pointer',
          outline: 'none',
        }}
      />
    </div>
  </div>
);
};

const SoundsModal = () => {
  const { setShowSoundsModal, settings, setSettings, playSound } = useGameState();

  const handleMuteToggle = () => {
    playSound('toggle');
    setSettings({ ...settings, muted: !settings.muted });
  };

  const handleClose = () => {
    playSound('close');
    setShowSoundsModal(false);
  };

  return (
    <div
      className="absolute-fill flex-center"
      style={{
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 'var(--z-modal)',
      }}
      onClick={handleClose}
    >
      <div
        className="anim-slide-up"
        style={{
          width: '90%',
          maxWidth: 320,
          background: 'linear-gradient(180deg, #1a1a3a 0%, #0d1b2a 100%)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex-between items-center p-4"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, margin: 0 }}>Sound</h2>
          <button
            onClick={handleClose}
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            <X size={18} color="white" />
          </button>
        </div>

        {/* Master toggle */}
        <div className="p-4">
          <div
            className="flex-between items-center p-3"
            style={{
              background: settings.muted ? 'rgba(255, 107, 107, 0.1)' : 'rgba(0, 255, 245, 0.1)',
              borderRadius: 12,
              border: `1px solid ${settings.muted ? 'rgba(255, 107, 107, 0.3)' : 'rgba(0, 255, 245, 0.3)'}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: settings.muted ? 'rgba(255, 107, 107, 0.2)' : 'rgba(0, 255, 245, 0.2)',
                  borderRadius: 10,
                }}
              >
                {settings.muted ? (
                  <VolumeX size={22} color="#FF6B6B" />
                ) : (
                  <Volume2 size={22} color="#00FFF5" />
                )}
              </div>
              <div>
                <div style={{ color: 'white', fontSize: 15, fontWeight: 600 }}>
                  {settings.muted ? 'Sound Off' : 'Sound On'}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
                  Master volume
                </div>
              </div>
            </div>
            <ToggleSwitch enabled={!settings.muted} onToggle={handleMuteToggle} />
          </div>
        </div>

        {/* Volume sliders */}
        <div
          className="p-4 flex-col gap-4"
          style={{
            opacity: settings.muted ? 0.3 : 1,
            pointerEvents: settings.muted ? 'none' : 'auto',
            transition: 'opacity 0.2s ease',
          }}
        >
          <VolumeSlider
            value={settings.musicVolume}
            onChange={(value) => setSettings({ ...settings, musicVolume: value })}
            color="#FF0099"
            icon={Music}
            label="Music"
          />
          <VolumeSlider
            value={settings.sfxVolume}
            onChange={(value) => setSettings({ ...settings, sfxVolume: value })}
            color="#FFD700"
            icon={Sparkles}
            label="Sound Effects"
          />
        </div>

        {/* Note */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 11, textAlign: 'center', margin: 0 }}>
            Sound plays after first interaction (browser policy)
          </p>
        </div>
      </div>
    </div>
  );
};

export default SoundsModal;
