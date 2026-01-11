import React from 'react';

/**
 * Flap Character - World 2 (Skyline City)
 * A cute round bird that jumps between platforms
 * SVG-based for crisp rendering at any size
 */
const Flap = ({ vy = 0, size = 36 }) => {
  const isFlapping = vy < 0;
  const isFalling = vy > 5;

  // Wing rotation based on state
  const wingAngle = isFlapping ? -30 : isFalling ? 15 : 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))',
        transform: isFlapping ? 'scaleY(1.1) scaleX(0.9)' : isFalling ? 'scaleY(0.9) scaleX(1.1)' : 'scale(1)',
        transition: 'transform 100ms ease',
      }}
    >
      <defs>
        <linearGradient id="flapBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="100%" stopColor="#5BA4D0" />
        </linearGradient>
        <linearGradient id="flapWing" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6BB8E0" />
          <stop offset="100%" stopColor="#4A9BC8" />
        </linearGradient>
      </defs>

      {/* Left wing */}
      <ellipse
        cx="10"
        cy="24"
        rx="8"
        ry="12"
        fill="url(#flapWing)"
        style={{
          transformOrigin: '14px 24px',
          transform: `rotate(${wingAngle}deg)`,
          transition: 'transform 150ms ease',
        }}
      />

      {/* Right wing */}
      <ellipse
        cx="38"
        cy="24"
        rx="8"
        ry="12"
        fill="url(#flapWing)"
        style={{
          transformOrigin: '34px 24px',
          transform: `rotate(${-wingAngle}deg)`,
          transition: 'transform 150ms ease',
        }}
      />

      {/* Body */}
      <circle cx="24" cy="24" r="16" fill="url(#flapBody)" />

      {/* Belly highlight */}
      <ellipse cx="24" cy="28" rx="10" ry="8" fill="rgba(255,255,255,0.3)" />

      {/* Left eye (white) */}
      <ellipse cx="18" cy="20" rx="5" ry="6" fill="white" />
      {/* Left pupil */}
      <circle
        cx="18"
        cy={isFlapping ? 18 : isFalling ? 22 : 20}
        r="3"
        fill="#2D3436"
        style={{ transition: 'cy 100ms ease' }}
      />
      {/* Left eye shine */}
      <circle cx="16" cy="18" r="1.5" fill="white" />

      {/* Right eye (white) */}
      <ellipse cx="30" cy="20" rx="5" ry="6" fill="white" />
      {/* Right pupil */}
      <circle
        cx="30"
        cy={isFlapping ? 18 : isFalling ? 22 : 20}
        r="3"
        fill="#2D3436"
        style={{ transition: 'cy 100ms ease' }}
      />
      {/* Right eye shine */}
      <circle cx="28" cy="18" r="1.5" fill="white" />

      {/* Beak */}
      <path
        d="M24 26 L20 32 L24 30 L28 32 Z"
        fill="#FFB347"
        stroke="#E69520"
        strokeWidth="0.5"
      />

      {/* Feet (only when not flapping) */}
      {!isFlapping && (
        <>
          <path
            d="M18 40 L16 44 M18 40 L18 44 M18 40 L20 44"
            stroke="#FFB347"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M30 40 L28 44 M30 40 L30 44 M30 40 L32 44"
            stroke="#FFB347"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Animated wing flap effect */}
      {isFlapping && (
        <>
          <ellipse cx="6" cy="20" rx="3" ry="2" fill="rgba(135,206,235,0.5)" />
          <ellipse cx="42" cy="20" rx="3" ry="2" fill="rgba(135,206,235,0.5)" />
        </>
      )}
    </svg>
  );
};

export default Flap;
