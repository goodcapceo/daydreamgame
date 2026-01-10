// Game Configuration
export const GAME_CONFIG = {
  TARGET_FPS: 60,
  FRAME_TIME: 1000 / 60, // ~16.67ms

  // Worlds
  TOTAL_WORLDS: 4,
  LEVELS_PER_WORLD: 10,

  // Star Requirements (to unlock next world)
  STARS_TO_UNLOCK: {
    2: 15, // 15 stars from World 1 to unlock World 2
    3: 18, // 18 stars from World 2 to unlock World 3
    4: 20, // 20 stars from World 3 to unlock World 4
  },

  // Lives System
  MAX_LIVES: 5,
  LIFE_REGEN_TIME: 30 * 60 * 1000, // 30 minutes in milliseconds

  // Scoring
  STAR_THRESHOLDS: {
    THREE_STAR: 0.9,  // 90% completion
    TWO_STAR: 0.6,    // 60% completion
    ONE_STAR: 0.3,    // 30% completion
  },
};

// World Metadata
export const WORLDS = [
  {
    id: 1,
    name: 'Crystal Caverns',
    theme: 'caverns',
    character: 'Gem',
    color: '#00FFF5',
    bgColor: '#1A1A2E',
    type: 'maze',
    description: 'Navigate glowing caves and collect crystals',
  },
  {
    id: 2,
    name: 'Skyline City',
    theme: 'skyline',
    character: 'Flap',
    color: '#FFD700',
    bgColor: 'linear-gradient(to top, #6C5B7B, #C06C84, #F67280, #F8B195)',
    type: 'platformer',
    description: 'Jump through rooftops at golden hour',
  },
  {
    id: 3,
    name: 'Neon Rush',
    theme: 'neon',
    character: 'Pulse',
    color: '#00F0FF',
    bgColor: '#050505',
    type: 'snake',
    description: 'Race through a digital highway',
  },
  {
    id: 4,
    name: 'Enchanted Garden',
    theme: 'garden',
    character: 'Flutter',
    color: '#FFB5A7',
    bgColor: 'linear-gradient(to bottom, #588157, #3A5A40)',
    type: 'match3',
    description: 'Match blooms in a magical garden',
  },
];

// Input Constants
export const KEYS = {
  LEFT: ['ArrowLeft', 'KeyA'],
  RIGHT: ['ArrowRight', 'KeyD'],
  UP: ['ArrowUp', 'KeyW'],
  DOWN: ['ArrowDown', 'KeyS'],
  SPACE: ['Space'],
  ENTER: ['Enter'],
  ESCAPE: ['Escape'],
};

// Direction Vectors
export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// Physics Constants (for World 2)
export const PHYSICS = {
  GRAVITY: 0.6,
  JUMP_STRENGTH: -15,
  MAX_FALL_SPEED: 20,
  HORIZONTAL_SPEED: 5,
};

// Tile Types (for World 1)
export const TILES = {
  EMPTY: 0,
  WALL: 1,
  CRYSTAL: 2,
  DARK_PATCH: 3,
  EXIT: 4,
};

// Match-3 Types (for World 4)
export const TILE_TYPES = {
  PINK: 'pink',
  PURPLE: 'purple',
  YELLOW: 'yellow',
  EMPTY: null,
};

// LocalStorage Keys
export const STORAGE_KEYS = {
  GAME_PROGRESS: 'daydream_progress',
  SETTINGS: 'daydream_settings',
  LAST_PLAYED: 'daydream_last_played',
};
