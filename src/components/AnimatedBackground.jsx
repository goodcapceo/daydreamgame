import React from 'react';

const WORLD_THEMES = {
  default: {
    colors: ['#1A1A2E', '#16213E', '#0F3460', '#1A1A2E'],
    accent1: '#00FFF5',
    accent2: '#FFD700',
  },
  1: {
    colors: ['#1A1A2E', '#16213E', '#0F3460', '#1A1A2E'],
    accent1: '#00FFF5',
    accent2: '#E94560',
  },
  2: {
    colors: ['#6C5B7B', '#C06C84', '#F67280', '#F8B195'],
    accent1: '#FFD700',
    accent2: '#6A0572',
  },
  3: {
    colors: ['#050505', '#0a0a1a', '#1a0a2e', '#050505'],
    accent1: '#00F0FF',
    accent2: '#FF0099',
  },
  4: {
    colors: ['#344E41', '#3A5A40', '#588157', '#3A5A40'],
    accent1: '#FFB5A7',
    accent2: '#C8B6FF',
  },
};

const AnimatedBackground = ({ world = 'default' }) => {
  const theme = WORLD_THEMES[world] || WORLD_THEMES.default;

  return (
    <div
      className="absolute-fill"
      style={{
        overflow: 'hidden',
        zIndex: 'var(--z-background)',
      }}
    >
      {/* Base gradient layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${theme.colors.join(', ')})`,
        }}
      />

      {/* Aurora layer 1 - slow moving gradient */}
      <div
        style={{
          position: 'absolute',
          inset: '-50%',
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, ${theme.accent1}15, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, ${theme.accent2}12, transparent 50%)
          `,
          animation: 'auroraMove1 20s ease-in-out infinite',
        }}
      />

      {/* Aurora layer 2 - medium movement */}
      <div
        style={{
          position: 'absolute',
          inset: '-30%',
          background: `
            radial-gradient(ellipse 50% 80% at 70% 30%, ${theme.accent1}10, transparent 50%),
            radial-gradient(ellipse 70% 50% at 30% 70%, ${theme.accent2}08, transparent 50%)
          `,
          animation: 'auroraMove2 15s ease-in-out infinite',
        }}
      />

      {/* Aurora layer 3 - faster accent */}
      <div
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `
            radial-gradient(ellipse 40% 60% at 50% 50%, ${theme.accent1}08, transparent 40%)
          `,
          animation: 'auroraMove3 12s ease-in-out infinite',
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Keyframe styles injected via style tag */}
      <style>{`
        @keyframes auroraMove1 {
          0%, 100% {
            transform: translate(0%, 0%) rotate(0deg);
          }
          33% {
            transform: translate(5%, -5%) rotate(2deg);
          }
          66% {
            transform: translate(-5%, 5%) rotate(-2deg);
          }
        }
        @keyframes auroraMove2 {
          0%, 100% {
            transform: translate(0%, 0%) scale(1);
          }
          50% {
            transform: translate(-8%, 8%) scale(1.1);
          }
        }
        @keyframes auroraMove3 {
          0%, 100% {
            transform: translate(0%, 0%) rotate(0deg);
            opacity: 0.6;
          }
          50% {
            transform: translate(10%, -10%) rotate(5deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;
