import React from 'react';

/**
 * Flap Character - World 2 (Skyline City)
 * A cute bird-like character that jumps between platforms
 * FIX: This component was missing from the original spec
 */
const Flap = ({ vy = 0, size = 36 }) => {
  // Determine animation state based on vertical velocity
  const isFlapping = vy < 0; // Going up = flapping
  const isFalling = vy > 5; // Falling fast
  const isIdle = Math.abs(vy) < 1;

  // Body squash/stretch based on movement
  const getBodyTransform = () => {
    if (isFlapping) return 'scaleX(0.85) scaleY(1.15)';
    if (isFalling) return 'scaleX(1.15) scaleY(0.85)';
    return 'scaleX(1) scaleY(1)';
  };

  return (
    <div
      className="relative flex-center"
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Body */}
      <div
        className={isFlapping ? 'anim-stretch' : isIdle ? '' : 'anim-squash'}
        style={{
          width: size,
          height: size,
          background: 'var(--w2-char)',
          borderRadius: '50%',
          position: 'relative',
          transform: getBodyTransform(),
          transition: 'transform 100ms ease',
          boxShadow: `
            0 4px 8px rgba(0, 0, 0, 0.2),
            inset 0 -4px 8px rgba(0, 0, 0, 0.1),
            inset 0 4px 8px rgba(255, 255, 255, 0.2)
          `,
        }}
      >
        {/* Eyes */}
        <div
          className="absolute flex gap-2"
          style={{
            top: '30%',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {/* Left eye */}
          <div
            style={{
              width: 8,
              height: 8,
              background: '#fff',
              borderRadius: '50%',
              position: 'relative',
            }}
          >
            {/* Pupil */}
            <div
              style={{
                width: 4,
                height: 4,
                background: '#2D3436',
                borderRadius: '50%',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, ${isFlapping ? '-70%' : isFalling ? '-30%' : '-50%'})`,
                transition: 'transform 100ms ease',
              }}
            />
          </div>

          {/* Right eye */}
          <div
            style={{
              width: 8,
              height: 8,
              background: '#fff',
              borderRadius: '50%',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: 4,
                height: 4,
                background: '#2D3436',
                borderRadius: '50%',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, ${isFlapping ? '-70%' : isFalling ? '-30%' : '-50%'})`,
                transition: 'transform 100ms ease',
              }}
            />
          </div>
        </div>

        {/* Beak */}
        <div
          style={{
            position: 'absolute',
            bottom: '30%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '8px solid var(--w2-accent)',
          }}
        />

        {/* Wings */}
        <div
          className={isFlapping ? 'anim-wing-flap-fast' : 'anim-wing-flap'}
          style={{
            position: 'absolute',
            top: '40%',
            left: -6,
            width: 10,
            height: 14,
            background: 'var(--w2-char)',
            borderRadius: '50% 20% 50% 50%',
            opacity: 0.9,
            transformOrigin: 'right center',
            filter: 'brightness(0.9)',
          }}
        />
        <div
          className={isFlapping ? 'anim-wing-flap-fast' : 'anim-wing-flap'}
          style={{
            position: 'absolute',
            top: '40%',
            right: -6,
            width: 10,
            height: 14,
            background: 'var(--w2-char)',
            borderRadius: '20% 50% 50% 50%',
            opacity: 0.9,
            transformOrigin: 'left center',
            filter: 'brightness(0.9)',
            animationDelay: '50ms',
          }}
        />

        {/* Feet (only visible when idle or falling) */}
        {!isFlapping && (
          <div
            className="absolute flex gap-1"
            style={{
              bottom: -4,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <div
              style={{
                width: 4,
                height: 4,
                background: 'var(--w2-accent)',
                borderRadius: '0 0 50% 50%',
              }}
            />
            <div
              style={{
                width: 4,
                height: 4,
                background: 'var(--w2-accent)',
                borderRadius: '0 0 50% 50%',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Flap;
