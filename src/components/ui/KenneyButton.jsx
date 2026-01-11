import React from 'react';

const BUTTON_IMAGES = {
  blue: {
    rect: '/assets/kenney/ui/buttons/blue_rect.png',
    round: '/assets/kenney/ui/buttons/blue_round.png',
    square: '/assets/kenney/ui/buttons/blue_square.png',
  },
  grey: {
    rect: '/assets/kenney/ui/buttons/grey_rect.png',
    round: '/assets/kenney/ui/buttons/grey_round.png',
    square: '/assets/kenney/ui/buttons/grey_square.png',
  },
};

const BUTTON_SIZES = {
  small: { rect: { width: 80, height: 32 }, round: 36, square: 36 },
  medium: { rect: { width: 120, height: 45 }, round: 48, square: 48 },
  large: { rect: { width: 180, height: 56 }, round: 60, square: 60 },
};

/**
 * Kenney-styled button component
 * @param {string} color - 'blue' | 'grey'
 * @param {string} variant - 'rect' | 'round' | 'square'
 * @param {string} size - 'small' | 'medium' | 'large'
 */
const KenneyButton = ({
  children,
  onClick,
  color = 'blue',
  variant = 'rect',
  size = 'medium',
  disabled = false,
  className = '',
  style = {},
}) => {
  const imageSrc = BUTTON_IMAGES[color]?.[variant] || BUTTON_IMAGES.blue.rect;
  const sizeConfig = BUTTON_SIZES[size] || BUTTON_SIZES.medium;
  const dimensions = variant === 'rect' ? sizeConfig.rect : { width: sizeConfig[variant], height: sizeConfig[variant] };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`kenney-button ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dimensions.width,
        height: dimensions.height,
        padding: variant === 'rect' ? '0 16px' : 0,
        border: 'none',
        background: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'transform 100ms ease, filter 100ms ease',
        ...style,
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(0.95)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* Button background image */}
      <img
        src={imageSrc}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: variant === 'rect' ? 'fill' : 'contain',
          pointerEvents: 'none',
        }}
      />
      {/* Button content */}
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          color: 'white',
          fontWeight: 600,
          fontSize: size === 'small' ? '12px' : size === 'large' ? '18px' : '14px',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        {children}
      </span>
    </button>
  );
};

export default KenneyButton;
