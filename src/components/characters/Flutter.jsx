import React from 'react';

/**
 * Flutter Character - World 4 (Enchanted Garden)
 * A magical butterfly that helps match flowers
 */
const Flutter = ({ isMatching = false }) => {
  return (
    <div
      className="relative flex-center"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      {/* Body */}
      <div
        style={{
          width: 12,
          height: 16,
          background: 'var(--w4-primary)',
          borderRadius: '40% 40% 60% 60%',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Eyes */}
        <div
          className="absolute flex gap-1"
          style={{ top: '25%', left: '20%' }}
        >
          <div
            style={{
              width: 3,
              height: 3,
              background: '#000',
              borderRadius: '50%',
            }}
          />
        </div>

        {/* Antennae - Left */}
        <div
          style={{
            position: 'absolute',
            top: -8,
            left: '30%',
            width: 1,
            height: 8,
            background: 'var(--w4-primary)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -2,
              left: -1,
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: 'var(--w4-flower-pink)',
            }}
          />
        </div>

        {/* Antennae - Right */}
        <div
          style={{
            position: 'absolute',
            top: -8,
            right: '30%',
            width: 1,
            height: 8,
            background: 'var(--w4-primary)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -2,
              left: -1,
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: 'var(--w4-flower-pink)',
            }}
          />
        </div>
      </div>

      {/* Wings - Top Left */}
      <div
        className={isMatching ? 'anim-wing-flap-fast' : 'anim-wing-flap'}
        style={{
          position: 'absolute',
          top: '20%',
          left: -8,
          width: 16,
          height: 20,
          background: 'linear-gradient(135deg, var(--w4-flower-pink), var(--w4-flower-purple))',
          borderRadius: '60% 40% 40% 60%',
          opacity: 0.8,
          transformOrigin: 'right center',
          zIndex: 1,
        }}
      />

      {/* Wings - Top Right */}
      <div
        className={isMatching ? 'anim-wing-flap-fast' : 'anim-wing-flap'}
        style={{
          position: 'absolute',
          top: '20%',
          right: -8,
          width: 16,
          height: 20,
          background: 'linear-gradient(135deg, var(--w4-flower-purple), var(--w4-flower-yellow))',
          borderRadius: '40% 60% 60% 40%',
          opacity: 0.8,
          transformOrigin: 'left center',
          zIndex: 1,
          animationDelay: '50ms',
        }}
      />

      {/* Wings - Bottom Left */}
      <div
        className={isMatching ? 'anim-wing-flap-fast' : 'anim-wing-flap'}
        style={{
          position: 'absolute',
          top: '50%',
          left: -6,
          width: 14,
          height: 16,
          background: 'linear-gradient(135deg, var(--w4-flower-yellow), var(--w4-flower-pink))',
          borderRadius: '50% 40% 60% 50%',
          opacity: 0.7,
          transformOrigin: 'right center',
          zIndex: 0,
        }}
      />

      {/* Wings - Bottom Right */}
      <div
        className={isMatching ? 'anim-wing-flap-fast' : 'anim-wing-flap'}
        style={{
          position: 'absolute',
          top: '50%',
          right: -6,
          width: 14,
          height: 16,
          background: 'linear-gradient(135deg, var(--w4-flower-purple), var(--w4-flower-yellow))',
          borderRadius: '40% 50% 50% 60%',
          opacity: 0.7,
          transformOrigin: 'left center',
          zIndex: 0,
          animationDelay: '50ms',
        }}
      />
    </div>
  );
};

export default Flutter;
