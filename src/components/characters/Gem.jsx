import React from 'react';

/**
 * Gem Character - World 1 (Crystal Caverns)
 * A cute diamond-shaped character with expressive eyes
 */
const Gem = ({ mood = 'idle', size = 36, color = 'var(--w1-gem-gradient)' }) => {
  // Eye styles based on mood
  const getEyeStyle = () => {
    switch (mood) {
      case 'happy':
        return { scaleY: 0.3, translateY: 1 }; // Squished happy eyes
      case 'worried':
        return { scaleY: 1.2, translateY: -2 }; // Wide worried eyes
      case 'idle':
      default:
        return { scaleY: 1, translateY: 0 };
    }
  };

  const eyeStyle = getEyeStyle();

  return (
    <div
      className="relative flex-center"
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Diamond body - rotated square */}
      <div
        style={{
          width: size * 0.8,
          height: size * 0.8,
          background: color,
          transform: 'rotate(45deg)',
          borderRadius: '4px',
          boxShadow: `
            0 4px 12px rgba(233, 69, 96, 0.4),
            inset 0 -4px 8px rgba(0, 0, 0, 0.2),
            inset 0 4px 8px rgba(255, 255, 255, 0.3)
          `,
          position: 'relative',
        }}
      >
        {/* Inner shine */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '15%',
            width: '30%',
            height: '30%',
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '2px',
          }}
        />
      </div>

      {/* Face container (not rotated) */}
      <div
        className="absolute flex-center"
        style={{
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {/* Eyes */}
        <div className="flex gap-1">
          {/* Left eye */}
          <div
            style={{
              width: 6,
              height: 8,
              background: '#2D3436',
              borderRadius: '50%',
              transform: `scaleY(${eyeStyle.scaleY}) translateY(${eyeStyle.translateY}px)`,
              transition: 'transform 150ms ease',
            }}
          >
            {/* Eye shine */}
            <div
              style={{
                width: 2,
                height: 2,
                background: '#fff',
                borderRadius: '50%',
                position: 'relative',
                top: 1,
                left: 1,
              }}
            />
          </div>

          {/* Right eye */}
          <div
            style={{
              width: 6,
              height: 8,
              background: '#2D3436',
              borderRadius: '50%',
              transform: `scaleY(${eyeStyle.scaleY}) translateY(${eyeStyle.translateY}px)`,
              transition: 'transform 150ms ease',
            }}
          >
            <div
              style={{
                width: 2,
                height: 2,
                background: '#fff',
                borderRadius: '50%',
                position: 'relative',
                top: 1,
                left: 1,
              }}
            />
          </div>
        </div>
      </div>

      {/* Blush (only when happy) */}
      {mood === 'happy' && (
        <>
          <div
            className="absolute"
            style={{
              top: '50%',
              left: '10%',
              width: 6,
              height: 4,
              background: 'rgba(255, 150, 150, 0.6)',
              borderRadius: '50%',
            }}
          />
          <div
            className="absolute"
            style={{
              top: '50%',
              right: '10%',
              width: 6,
              height: 4,
              background: 'rgba(255, 150, 150, 0.6)',
              borderRadius: '50%',
            }}
          />
        </>
      )}
    </div>
  );
};

export default Gem;
