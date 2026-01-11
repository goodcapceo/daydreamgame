import React from 'react';

/**
 * Flutter Character - World 4 (Enchanted Garden)
 * A magical butterfly that helps match flowers
 * SVG-based for smooth wing animations
 */
const Flutter = ({ isMatching = false, size = 36 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: 'drop-shadow(0 2px 8px rgba(200, 100, 200, 0.4))',
      }}
    >
      <defs>
        <linearGradient id="wingPink" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFB6C1" />
          <stop offset="100%" stopColor="#FF69B4" />
        </linearGradient>
        <linearGradient id="wingPurple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DDA0DD" />
          <stop offset="100%" stopColor="#9370DB" />
        </linearGradient>
        <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B4789" />
          <stop offset="100%" stopColor="#6B2D6B" />
        </linearGradient>
      </defs>

      {/* Top left wing */}
      <ellipse
        cx="14"
        cy="18"
        rx="12"
        ry="14"
        fill="url(#wingPink)"
        opacity="0.9"
        style={{
          transformOrigin: '22px 24px',
          animation: isMatching ? 'flutter 0.15s ease-in-out infinite alternate' : 'flutter 0.4s ease-in-out infinite alternate',
        }}
      />
      {/* Wing pattern */}
      <circle cx="12" cy="14" r="4" fill="rgba(255,255,255,0.4)" />
      <circle cx="10" cy="22" r="3" fill="rgba(255,255,255,0.3)" />

      {/* Top right wing */}
      <ellipse
        cx="34"
        cy="18"
        rx="12"
        ry="14"
        fill="url(#wingPurple)"
        opacity="0.9"
        style={{
          transformOrigin: '26px 24px',
          animation: isMatching ? 'flutter 0.15s ease-in-out infinite alternate-reverse' : 'flutter 0.4s ease-in-out infinite alternate-reverse',
        }}
      />
      {/* Wing pattern */}
      <circle cx="36" cy="14" r="4" fill="rgba(255,255,255,0.4)" />
      <circle cx="38" cy="22" r="3" fill="rgba(255,255,255,0.3)" />

      {/* Bottom left wing */}
      <ellipse
        cx="16"
        cy="32"
        rx="10"
        ry="10"
        fill="url(#wingPurple)"
        opacity="0.8"
        style={{
          transformOrigin: '22px 28px',
          animation: isMatching ? 'flutter 0.15s ease-in-out infinite alternate' : 'flutter 0.4s ease-in-out infinite alternate',
          animationDelay: '0.05s',
        }}
      />

      {/* Bottom right wing */}
      <ellipse
        cx="32"
        cy="32"
        rx="10"
        ry="10"
        fill="url(#wingPink)"
        opacity="0.8"
        style={{
          transformOrigin: '26px 28px',
          animation: isMatching ? 'flutter 0.15s ease-in-out infinite alternate-reverse' : 'flutter 0.4s ease-in-out infinite alternate-reverse',
          animationDelay: '0.05s',
        }}
      />

      {/* Body */}
      <ellipse cx="24" cy="26" rx="4" ry="12" fill="url(#bodyGradient)" />

      {/* Head */}
      <circle cx="24" cy="14" r="5" fill="url(#bodyGradient)" />

      {/* Eyes */}
      <circle cx="22" cy="13" r="2" fill="#2D3436" />
      <circle cx="26" cy="13" r="2" fill="#2D3436" />
      <circle cx="21.5" cy="12.5" r="0.8" fill="white" />
      <circle cx="25.5" cy="12.5" r="0.8" fill="white" />

      {/* Antennae */}
      <path
        d="M22 9 Q20 4 18 2"
        stroke="#6B2D6B"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="18" cy="2" r="2" fill="#FFB6C1" />

      <path
        d="M26 9 Q28 4 30 2"
        stroke="#6B2D6B"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="30" cy="2" r="2" fill="#DDA0DD" />

      {/* Smile */}
      <path
        d="M22 16 Q24 18 26 16"
        stroke="#2D3436"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />

      {/* Sparkle effect when matching */}
      {isMatching && (
        <>
          <circle cx="8" cy="10" r="1.5" fill="#FFD700" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="0.3s" repeatCount="indefinite" />
          </circle>
          <circle cx="40" cy="10" r="1.5" fill="#FFD700" opacity="0.8">
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="0.3s" repeatCount="indefinite" />
          </circle>
          <circle cx="24" cy="44" r="1.5" fill="#FFD700" opacity="0.8">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="0.3s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      <style>{`
        @keyframes flutter {
          0% { transform: rotateY(0deg) scale(1); }
          100% { transform: rotateY(20deg) scale(0.95); }
        }
      `}</style>
    </svg>
  );
};

export default Flutter;
