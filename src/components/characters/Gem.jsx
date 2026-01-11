import React from 'react';

/**
 * Gem Character - World 1 (Crystal Caverns)
 * A cute crystal/gem character with expressive eyes
 * SVG-based for crisp rendering at any size
 */
const Gem = ({ mood = 'idle', size = 36 }) => {
  // Eye styles based on mood
  const getEyeHeight = () => {
    switch (mood) {
      case 'happy': return 3; // Squished happy eyes
      case 'worried': return 10; // Wide worried eyes
      default: return 6;
    }
  };

  const eyeHeight = getEyeHeight();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 4px 8px rgba(233, 69, 96, 0.4))' }}
    >
      {/* Crystal body */}
      <defs>
        <linearGradient id="gemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B9D" />
          <stop offset="50%" stopColor="#E94560" />
          <stop offset="100%" stopColor="#C73E54" />
        </linearGradient>
        <linearGradient id="gemShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* Main crystal shape */}
      <path
        d="M24 4 L44 24 L24 44 L4 24 Z"
        fill="url(#gemGradient)"
        stroke="#FF8FAB"
        strokeWidth="1"
      />

      {/* Inner highlight facet */}
      <path
        d="M24 8 L38 24 L24 40 L10 24 Z"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
      />

      {/* Top shine */}
      <path
        d="M12 16 L18 10 L24 16 L18 22 Z"
        fill="url(#gemShine)"
      />

      {/* Eyes */}
      <ellipse cx="18" cy="22" rx="3" ry={eyeHeight / 2} fill="#2D3436">
        <animate
          attributeName="ry"
          values={`${eyeHeight / 2};${eyeHeight / 4};${eyeHeight / 2}`}
          dur="3s"
          repeatCount="indefinite"
        />
      </ellipse>
      <ellipse cx="30" cy="22" rx="3" ry={eyeHeight / 2} fill="#2D3436">
        <animate
          attributeName="ry"
          values={`${eyeHeight / 2};${eyeHeight / 4};${eyeHeight / 2}`}
          dur="3s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* Eye shines */}
      <circle cx="16" cy="20" r="1.5" fill="white" />
      <circle cx="28" cy="20" r="1.5" fill="white" />

      {/* Blush (when happy) */}
      {mood === 'happy' && (
        <>
          <ellipse cx="12" cy="26" rx="4" ry="2" fill="rgba(255, 150, 150, 0.5)" />
          <ellipse cx="36" cy="26" rx="4" ry="2" fill="rgba(255, 150, 150, 0.5)" />
        </>
      )}

      {/* Small smile */}
      <path
        d={mood === 'happy' ? "M20 28 Q24 32 28 28" : mood === 'worried' ? "M20 30 Q24 28 28 30" : "M21 29 Q24 30 27 29"}
        stroke="#2D3436"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default Gem;
