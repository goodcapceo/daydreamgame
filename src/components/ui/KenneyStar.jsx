import React from 'react';

const STAR_IMAGES = {
  filled: '/assets/kenney/ui/stars/star_filled.png',
  outline: '/assets/kenney/ui/stars/star_outline.png',
  grey: '/assets/kenney/ui/stars/star_grey.png',
};

/**
 * Kenney-styled star component for ratings/progress
 * @param {boolean} filled - Whether the star is filled (earned)
 * @param {number} size - Size in pixels
 * @param {boolean} grey - Use grey star (for locked/unavailable)
 */
const KenneyStar = ({ filled = false, size = 24, grey = false, style = {} }) => {
  const src = grey ? STAR_IMAGES.grey : filled ? STAR_IMAGES.filled : STAR_IMAGES.outline;

  return (
    <img
      src={src}
      alt={filled ? 'Earned star' : 'Empty star'}
      width={size}
      height={size}
      style={{
        display: 'inline-block',
        filter: filled ? 'drop-shadow(0 2px 4px rgba(255, 200, 0, 0.4))' : 'none',
        transition: 'transform 200ms ease, filter 200ms ease',
        ...style,
      }}
    />
  );
};

/**
 * Star rating display (e.g., 2/3 stars)
 */
export const KenneyStarRating = ({ earned = 0, total = 3, size = 24, gap = 4 }) => {
  return (
    <div style={{ display: 'flex', gap, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <KenneyStar key={i} filled={i < earned} size={size} />
      ))}
    </div>
  );
};

export default KenneyStar;
