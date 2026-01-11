import React from 'react';
import { useGameState } from '../../engine/useGameState';
import { X, Vibrate, Bell, RotateCcw } from 'lucide-react';

const ToggleSwitch = ({ enabled, onToggle, disabled = false }) => (
  <button
    onClick={onToggle}
    disabled={disabled}
    style={{
      width: 44,
      height: 24,
      borderRadius: 12,
      background: enabled ? '#00FFF5' : 'rgba(255, 255, 255, 0.1)',
      border: 'none',
      position: 'relative',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      opacity: disabled ? 0.5 : 1,
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

const SettingsModal = () => {
  const { setShowSettingsModal, settings, setSettings, setProgress, playSound } = useGameState();

  const handleHapticsToggle = () => {
    playSound('toggle');
    setSettings({ ...settings, haptics: !settings.haptics });
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      const defaultProgress = {
        worlds: [1, 2, 3, 4].map((id) => ({
          id,
          unlocked: id === 1,
          totalStars: 0,
          levels: Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            completed: false,
            stars: 0,
            bestScore: 0,
          })),
        })),
        lives: 5,
        lastLifeRegen: Date.now(),
      };
      setProgress(defaultProgress);
      setShowSettingsModal(false);
    }
  };

  const handleClose = () => {
    playSound('close');
    setShowSettingsModal(false);
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
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, margin: 0 }}>Settings</h2>
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

        {/* Settings list */}
        <div className="p-4 flex-col gap-3">
          {/* Haptics */}
          <div
            className="flex-between items-center p-3"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0, 255, 245, 0.15)',
                  borderRadius: 8,
                }}
              >
                <Vibrate size={18} color="#00FFF5" />
              </div>
              <div>
                <div style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>Haptics</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>Vibration feedback</div>
              </div>
            </div>
            <ToggleSwitch enabled={settings.haptics} onToggle={handleHapticsToggle} />
          </div>

          {/* Notifications (coming soon) */}
          <div
            className="flex-between items-center p-3"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              opacity: 0.5,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 215, 0, 0.15)',
                  borderRadius: 8,
                }}
              >
                <Bell size={18} color="#FFD700" />
              </div>
              <div>
                <div style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>Notifications</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>Coming soon</div>
              </div>
            </div>
            <span
              style={{
                padding: '4px 8px',
                background: 'rgba(255, 215, 0, 0.2)',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 600,
                color: '#FFD700',
              }}
            >
              SOON
            </span>
          </div>
        </div>

        {/* Reset button */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={handleResetProgress}
            className="flex items-center justify-center gap-2"
            style={{
              width: '100%',
              padding: 12,
              background: 'transparent',
              border: '1px solid rgba(255, 107, 107, 0.5)',
              borderRadius: 8,
              color: '#FF6B6B',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <RotateCcw size={16} />
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
