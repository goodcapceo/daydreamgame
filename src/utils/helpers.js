/**
 * Calculate star rating based on performance
 * @param {number} score - Player's score
 * @param {number} maxScore - Maximum possible score
 * @returns {number} Star rating (1-3)
 */
export const calculateStars = (score, maxScore) => {
  if (maxScore === 0) return 0;

  const ratio = score / maxScore;

  if (ratio >= 0.9) return 3;
  if (ratio >= 0.6) return 2;
  if (ratio > 0) return 1;
  return 0;
};

/**
 * Check AABB collision between two rectangles
 * @param {Object} rect1 - {x, y, width, height}
 * @param {Object} rect2 - {x, y, width, height}
 * @returns {boolean}
 */
export const checkCollision = (rect1, rect2) => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
};

/**
 * Clamp a number between min and max
 */
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Linear interpolation
 */
export const lerp = (start, end, t) => {
  return start + (end - start) * t;
};

/**
 * Check if a point is within bounds
 */
export const isInBounds = (x, y, width, height) => {
  return x >= 0 && x < width && y >= 0 && y < height;
};

/**
 * Get random element from array
 */
export const randomChoice = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Shuffle array (Fisher-Yates)
 */
export const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Format time as MM:SS
 */
export const formatTime = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if device supports haptic feedback
 */
export const supportsHaptics = () => {
  return 'vibrate' in navigator;
};

/**
 * Check if device supports Web Audio API
 */
export const supportsAudio = () => {
  return 'AudioContext' in window || 'webkitAudioContext' in window;
};

/**
 * Get distance between two points
 */
export const getDistance = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Get angle between two points (in radians)
 */
export const getAngle = (x1, y1, x2, y2) => {
  return Math.atan2(y2 - y1, x2 - x1);
};

/**
 * Deep clone an object (for immutable state updates)
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};
