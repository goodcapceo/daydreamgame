import React from 'react';

/**
 * Pulse Character - World 3 (Neon Rush)
 * A neon triangle/star shape that leads a trail
 */
const Pulse = ({ speed = 1, size = 24 }) => {
  // Eyes trail back based on speed
  const eyeOffset = Math.min(speed * 2, 6);

  return (
    <div
      className="relative flex-center"
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Star/Triangle body */}
      <div
        style={{
          width: size,
          height: size,
          position: 'relative',
        }}
      >
        {/* Triangle pointing up */}
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${size / 2}px solid transparent`,
            borderRight: `${size / 2}px solid transparent`,
            borderBottom: `${size}px solid var(--w3-primary)`,
            filter: `drop-shadow(0 0 ${8 + speed * 2}px var(--w3-primary))`,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />

        {/* Eyes (two dots that trail back when fast) */}
        <div
          className="absolute flex gap-1"
          style={{
            top: '40%',
            left: '50%',
            transform: `translate(-50%, ${eyeOffset}px)`,
            transition: 'transform 100ms ease-out',
          }}
        >
          <div
            style={{
              width: 4,
              height: 4,
              background: '#000',
              borderRadius: '50%',
              boxShadow: '0 0 2px rgba(255,255,255,0.8)',
            }}
          />
          <div
            style={{
              width: 4,
              height: 4,
              background: '#000',
              borderRadius: '50%',
              boxShadow: '0 0 2px rgba(255,255,255,0.8)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Pulse;
