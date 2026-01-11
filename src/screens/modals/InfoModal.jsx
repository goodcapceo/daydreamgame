import React from 'react';
import { useGameState } from '../../engine/useGameState';
import { WORLDS } from '../../utils/constants';
import { X, Star, Heart } from 'lucide-react';

const InfoModal = () => {
  const { setShowInfoModal } = useGameState();

  return (
    <div
      className="absolute-fill flex-center"
      style={{
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 'var(--z-modal)',
      }}
      onClick={() => setShowInfoModal(false)}
    >
      <div
        className="glass-panel anim-slide-up flex-col gap-4"
        style={{
          padding: 'var(--space-5)',
          width: '90%',
          maxWidth: '340px',
          maxHeight: '80vh',
          overflowY: 'auto',
          background: 'rgba(26, 26, 46, 0.95)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-between items-center">
          <h2 className="text-heading-md" style={{ color: 'var(--text-light)' }}>
            About
          </h2>
          <button
            className="btn-icon flex-center"
            onClick={() => setShowInfoModal(false)}
            style={{
              width: '36px',
              height: '36px',
              background: 'var(--glass-bg)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <X size={20} color="var(--text-light)" />
          </button>
        </div>

        {/* Game description */}
        <div
          className="flex-col gap-1"
          style={{
            padding: '10px 12px',
            background: 'var(--glass-bg)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <h3
            style={{
              fontSize: 'var(--text-lg)',
              background: 'linear-gradient(135deg, #00FFF5, #FFD700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 700,
            }}
          >
            DAYDREAM
          </h3>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
            A zen arcade experience with four handcrafted worlds - your bite-sized escape from doomscrolling.
          </p>
        </div>

        {/* How to play */}
        <div className="flex-col gap-2">
          <h3 style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>How to Play</h3>

          {WORLDS.map((world) => (
            <div
              key={world.id}
              className="flex items-center gap-2"
              style={{
                padding: '6px 8px',
                background: `${world.color}15`,
                borderRadius: 'var(--radius-sm)',
                borderLeft: `3px solid ${world.color}`,
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: 'var(--radius-sm)',
                  background: world.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: world.id === 2 ? '#000' : '#fff',
                  flexShrink: 0,
                }}
              >
                {world.id}
              </div>
              <div className="flex-col" style={{ gap: '1px' }}>
                <span style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: 'var(--text-xs)' }}>
                  {world.name}
                </span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>
                  {world.type === 'maze' && 'Swipe to navigate, collect crystals'}
                  {world.type === 'platformer' && 'Tap to jump, collect stars'}
                  {world.type === 'snake' && 'Swipe to turn, eat orbs'}
                  {world.type === 'match3' && 'Swap to match 3 or more'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stars explanation */}
        <div
          className="flex-col gap-2"
          style={{
            padding: '10px 12px',
            background: 'var(--glass-bg)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <h3 className="flex items-center gap-2" style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
            <Star size={16} fill="#FFD700" color="#FFD700" /> Star Rating
          </h3>
          <div className="flex-col gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
            <div className="flex items-center gap-1">
              <Star size={12} fill="#FFD700" color="#FFD700" />
              <Star size={12} fill="#FFD700" color="#FFD700" />
              <Star size={12} fill="#FFD700" color="#FFD700" />
              <span style={{ marginLeft: '4px' }}>Complete 90%+ of objectives</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={12} fill="#FFD700" color="#FFD700" />
              <Star size={12} fill="#FFD700" color="#FFD700" />
              <Star size={12} color="rgba(255,255,255,0.3)" />
              <span style={{ marginLeft: '4px' }}>Complete 60%+ of objectives</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={12} fill="#FFD700" color="#FFD700" />
              <Star size={12} color="rgba(255,255,255,0.3)" />
              <Star size={12} color="rgba(255,255,255,0.3)" />
              <span style={{ marginLeft: '4px' }}>Complete 30%+ of objectives</span>
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--w1-accent)', marginTop: '4px' }}>
            Collect stars to unlock new worlds!
          </p>
        </div>

        {/* Credits */}
        <div
          style={{
            borderTop: '1px solid var(--glass-border)',
            paddingTop: 'var(--space-2)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
            Made with <Heart size={10} fill="#FF6B6B" color="#FF6B6B" style={{ display: 'inline', verticalAlign: 'middle' }} /> for mindful gaming • v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
