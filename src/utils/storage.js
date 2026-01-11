import { STORAGE_KEYS, WORLDS, GAME_CONFIG } from './constants';

/**
 * Initialize default game progress
 */
const getDefaultProgress = () => ({
  worlds: WORLDS.map((world, index) => ({
    id: world.id,
    unlocked: index === 0, // Only first world unlocked
    totalStars: 0,
    levels: Array.from({ length: GAME_CONFIG.LEVELS_PER_WORLD }, (_, i) => ({
      id: i + 1,
      completed: false,
      stars: 0,
      bestScore: 0,
    })),
  })),
  lives: GAME_CONFIG.MAX_LIVES,
  lastLifeRegenTime: Date.now(),
  totalPlayTime: 0,
  gamesPlayed: 0,
});

/**
 * Load game progress from localStorage
 */
export const loadProgress = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GAME_PROGRESS);
    if (!saved) return getDefaultProgress();

    const progress = JSON.parse(saved);

    // Validate structure
    if (!progress.worlds || !Array.isArray(progress.worlds)) {
      return getDefaultProgress();
    }

    return progress;
  } catch (error) {
    console.error('Error loading progress:', error);
    return getDefaultProgress();
  }
};

/**
 * Save game progress to localStorage
 */
export const saveProgress = (progress) => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.GAME_PROGRESS,
      JSON.stringify(progress)
    );
    return true;
  } catch (error) {
    console.error('Error saving progress:', error);
    return false;
  }
};

/**
 * Update level completion
 */
export const updateLevelCompletion = (worldId, levelId, stars, score) => {
  const progress = loadProgress();
  const world = progress.worlds.find(w => w.id === worldId);

  if (!world) return false;

  const level = world.levels.find(l => l.id === levelId);
  if (!level) return false;

  // Update level
  const wasCompleted = level.completed;
  level.completed = true;
  level.stars = Math.max(level.stars, stars);
  level.bestScore = Math.max(level.bestScore, score);

  // Recalculate world stars
  world.totalStars = world.levels.reduce((sum, l) => sum + l.stars, 0);

  // Check if next world should be unlocked
  if (worldId < WORLDS.length) {
    const nextWorld = progress.worlds.find(w => w.id === worldId + 1);
    const requiredStars = GAME_CONFIG.STARS_TO_UNLOCK[worldId + 1];

    if (nextWorld && !nextWorld.unlocked && world.totalStars >= requiredStars) {
      nextWorld.unlocked = true;
    }
  }

  // Increment games played if first completion
  if (!wasCompleted) {
    progress.gamesPlayed += 1;
  }

  return saveProgress(progress);
};

/**
 * Use a life
 */
export const useLife = () => {
  const progress = loadProgress();

  if (progress.lives > 0) {
    progress.lives -= 1;
    saveProgress(progress);
    return true;
  }

  return false;
};

/**
 * Regenerate lives based on time passed
 */
export const regenerateLives = () => {
  const progress = loadProgress();

  if (progress.lives >= GAME_CONFIG.MAX_LIVES) {
    return progress.lives;
  }

  const now = Date.now();
  const timePassed = now - progress.lastLifeRegenTime;
  const livesToRegen = Math.floor(timePassed / GAME_CONFIG.LIFE_REGEN_TIME);

  if (livesToRegen > 0) {
    progress.lives = Math.min(
      progress.lives + livesToRegen,
      GAME_CONFIG.MAX_LIVES
    );
    progress.lastLifeRegenTime = now;
    saveProgress(progress);
  }

  return progress.lives;
};

/**
 * Get time until next life regenerates
 */
export const getTimeUntilNextLife = () => {
  const progress = loadProgress();

  if (progress.lives >= GAME_CONFIG.MAX_LIVES) {
    return 0;
  }

  const now = Date.now();
  const timePassed = now - progress.lastLifeRegenTime;
  const timeRemaining = GAME_CONFIG.LIFE_REGEN_TIME - (timePassed % GAME_CONFIG.LIFE_REGEN_TIME);

  return timeRemaining;
};

/**
 * Reset all progress (for testing or user request)
 */
export const resetProgress = () => {
  const defaultProgress = getDefaultProgress();
  return saveProgress(defaultProgress);
};

/**
 * Get default settings
 */
const getDefaultSettings = () => ({
  muted: false,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  haptics: true,
  reducedMotion: false,
});

/**
 * Load settings
 */
export const loadSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!saved) {
      return getDefaultSettings();
    }
    // Merge with defaults to handle missing fields
    return { ...getDefaultSettings(), ...JSON.parse(saved) };
  } catch (error) {
    console.error('Error loading settings:', error);
    return getDefaultSettings();
  }
};

/**
 * Save settings
 */
export const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};
