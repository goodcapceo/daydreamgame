import React from 'react';

/**
 * Pulse Character - World 3 (Neon Rush)
 * A neon arrow/chevron shape that leads a trail
 * SVG-based for crisp rendering and glow effects
 */
const Pulse = ({ speed = 1, size = 24 }) => {
  // Glow intensity based on speed
  const glowIntensity = Math.min(8 + speed * 4, 20);
  const eyeOffset = Math.min(speed * 1.5, 4);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: `drop-shadow(0 0 ${glowIntensity}px #00F0FF)`,
      }}
    >
      <defs>
        <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="50%" stopColor="#00C8E0" />
          <stop offset="100%" stopColor="#0099B8" />
        </linearGradient>
        <linearGradient id="pulseInner" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#80F8FF" />
          <stop offset="100%" stopColor="#00E0F0" />
        </linearGradient>
      </defs>

      {/* Outer glow ring */}
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        stroke="rgba(0,240,255,0.2)"
        strokeWidth="2"
      >
        <animate
          attributeName="r"
          values="18;22;18"
          dur="1s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.3;0.1;0.3"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Arrow body pointing up */}
      <path
        d="M24 6 L40 30 L32 30 L32 42 L16 42 L16 30 L8 30 Z"
        fill="url(#pulseGradient)"
        stroke="#00F0FF"
        strokeWidth="1"
      />

      {/* Inner highlight */}
      <path
        d="M24 12 L34 28 L28 28 L28 38 L20 38 L20 28 L14 28 Z"
        fill="url(#pulseInner)"
        opacity="0.5"
      />

      {/* Eyes */}
      <circle
        cx="20"
        cy={24 + eyeOffset}
        r="3"
        fill="#001820"
        style={{ transition: 'cy 100ms ease' }}
      />
      <circle
        cx="28"
        cy={24 + eyeOffset}
        r="3"
        fill="#001820"
        style={{ transition: 'cy 100ms ease' }}
      />

      {/* Eye shines */}
      <circle cx="19" cy={22 + eyeOffset} r="1" fill="white" style={{ transition: 'cy 100ms ease' }} />
      <circle cx="27" cy={22 + eyeOffset} r="1" fill="white" style={{ transition: 'cy 100ms ease' }} />

      {/* Speed lines when fast */}
      {speed > 1.5 && (
        <>
          <line x1="24" y1="44" x2="24" y2="48" stroke="#00F0FF" strokeWidth="2" opacity="0.6" />
          <line x1="18" y1="44" x2="16" y2="48" stroke="#00F0FF" strokeWidth="1.5" opacity="0.4" />
          <line x1="30" y1="44" x2="32" y2="48" stroke="#00F0FF" strokeWidth="1.5" opacity="0.4" />
        </>
      )}
    </svg>
  );
};

export default Pulse;
