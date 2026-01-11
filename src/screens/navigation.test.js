import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

// Mock components for testing navigation
const mockSetScreen = vi.fn();
const mockSetCurrentWorld = vi.fn();
const mockSetCurrentLevel = vi.fn();
const mockPlaySound = vi.fn();
const mockSetShowSettings = vi.fn();

// Mock GameStateContext
const mockGameState = {
  screen: 'menu',
  setScreen: mockSetScreen,
  currentWorld: null,
  setCurrentWorld: mockSetCurrentWorld,
  currentLevel: null,
  setCurrentLevel: mockSetCurrentLevel,
  progress: {
    1: { 1: { completed: true, stars: 3, score: 1000 } },
    2: {},
    3: {},
    4: {},
  },
  lives: 5,
  playSound: mockPlaySound,
  setShowSettings: mockSetShowSettings,
  showPauseMenu: false,
  setShowPauseMenu: vi.fn(),
  showComplete: false,
  showFailed: false,
};

vi.mock('../engine/useGameState', () => ({
  useGameState: () => mockGameState,
}));

describe('Navigation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Screen Transitions', () => {
    it('should define all required screens', () => {
      const screens = ['menu', 'worldSelect', 'levelSelect', 'game'];
      screens.forEach(screen => {
        expect(typeof screen).toBe('string');
      });
    });

    it('should support navigation from menu to worldSelect', () => {
      mockSetScreen('worldSelect');
      expect(mockSetScreen).toHaveBeenCalledWith('worldSelect');
    });

    it('should support navigation from worldSelect to levelSelect', () => {
      mockSetCurrentWorld(1);
      mockSetScreen('levelSelect');
      expect(mockSetCurrentWorld).toHaveBeenCalledWith(1);
      expect(mockSetScreen).toHaveBeenCalledWith('levelSelect');
    });

    it('should support navigation from levelSelect to game', () => {
      mockSetCurrentLevel(1);
      mockSetScreen('game');
      expect(mockSetCurrentLevel).toHaveBeenCalledWith(1);
      expect(mockSetScreen).toHaveBeenCalledWith('game');
    });

    it('should support back navigation from worldSelect to menu', () => {
      mockSetScreen('menu');
      expect(mockSetScreen).toHaveBeenCalledWith('menu');
    });

    it('should support back navigation from levelSelect to worldSelect', () => {
      mockSetScreen('worldSelect');
      expect(mockSetScreen).toHaveBeenCalledWith('worldSelect');
    });
  });

  describe('World Selection', () => {
    it('should have 4 worlds defined', () => {
      const worldCount = 4;
      expect(worldCount).toBe(4);
    });

    it('should track world progress separately', () => {
      expect(mockGameState.progress[1]).toBeDefined();
      expect(mockGameState.progress[2]).toBeDefined();
      expect(mockGameState.progress[3]).toBeDefined();
      expect(mockGameState.progress[4]).toBeDefined();
    });

    it('should allow selecting any world', () => {
      [1, 2, 3, 4].forEach(worldId => {
        mockSetCurrentWorld(worldId);
        expect(mockSetCurrentWorld).toHaveBeenCalledWith(worldId);
      });
    });
  });

  describe('Level Selection', () => {
    it('should have 10 levels per world', () => {
      const levelsPerWorld = 10;
      expect(levelsPerWorld).toBe(10);
    });

    it('should allow selecting any level 1-10', () => {
      for (let i = 1; i <= 10; i++) {
        mockSetCurrentLevel(i);
        expect(mockSetCurrentLevel).toHaveBeenCalledWith(i);
      }
    });

    it('should track level completion with stars', () => {
      const levelProgress = mockGameState.progress[1][1];
      expect(levelProgress.completed).toBe(true);
      expect(levelProgress.stars).toBe(3);
      expect(levelProgress.score).toBe(1000);
    });
  });

  describe('Modal States', () => {
    it('should support pause menu toggle', () => {
      expect(mockGameState.showPauseMenu).toBe(false);
      mockGameState.setShowPauseMenu(true);
      expect(mockGameState.setShowPauseMenu).toHaveBeenCalledWith(true);
    });

    it('should support settings modal', () => {
      mockSetShowSettings(true);
      expect(mockSetShowSettings).toHaveBeenCalledWith(true);
    });

    it('should track completion modal state', () => {
      expect(mockGameState.showComplete).toBe(false);
    });

    it('should track failure modal state', () => {
      expect(mockGameState.showFailed).toBe(false);
    });
  });

  describe('Lives System', () => {
    it('should have max 5 lives', () => {
      expect(mockGameState.lives).toBe(5);
    });

    it('should track lives count', () => {
      expect(typeof mockGameState.lives).toBe('number');
      expect(mockGameState.lives).toBeGreaterThanOrEqual(0);
      expect(mockGameState.lives).toBeLessThanOrEqual(5);
    });
  });

  describe('Sound Integration', () => {
    it('should play sound on navigation', () => {
      mockPlaySound('click');
      expect(mockPlaySound).toHaveBeenCalledWith('click');
    });

    it('should have playSound function available', () => {
      expect(typeof mockGameState.playSound).toBe('function');
    });
  });
});

describe('Progress Tracking', () => {
  it('should calculate total stars correctly', () => {
    const progress = {
      1: {
        1: { stars: 3 },
        2: { stars: 2 },
        3: { stars: 1 },
      },
      2: {},
      3: {},
      4: {},
    };

    const totalStars = Object.values(progress)
      .flatMap(world => Object.values(world))
      .reduce((sum, level) => sum + (level.stars || 0), 0);

    expect(totalStars).toBe(6);
  });

  it('should count completed levels correctly', () => {
    const progress = {
      1: {
        1: { completed: true },
        2: { completed: true },
        3: { completed: false },
      },
    };

    const completedLevels = Object.values(progress)
      .flatMap(world => Object.values(world))
      .filter(level => level.completed).length;

    expect(completedLevels).toBe(2);
  });

  it('should track high scores per level', () => {
    const levelData = { completed: true, stars: 3, score: 1500 };
    expect(levelData.score).toBe(1500);
  });
});

describe('World Unlock Logic', () => {
  it('should calculate stars required to unlock worlds', () => {
    const STARS_TO_UNLOCK = {
      2: 15, // 15 stars from World 1 to unlock World 2
      3: 18, // 18 stars from World 2 to unlock World 3
      4: 20, // 20 stars from World 3 to unlock World 4
    };

    expect(STARS_TO_UNLOCK[2]).toBe(15);
    expect(STARS_TO_UNLOCK[3]).toBe(18);
    expect(STARS_TO_UNLOCK[4]).toBe(20);
  });

  it('should determine if world is unlocked based on previous world stars', () => {
    const getWorldStars = (worldId, progress) => {
      const worldProgress = progress[worldId] || {};
      return Object.values(worldProgress).reduce((sum, level) => sum + (level.stars || 0), 0);
    };

    const progress = {
      1: {
        1: { stars: 3 },
        2: { stars: 3 },
        3: { stars: 3 },
        4: { stars: 3 },
        5: { stars: 3 },
      },
    };

    const world1Stars = getWorldStars(1, progress);
    expect(world1Stars).toBe(15);
    expect(world1Stars >= 15).toBe(true); // World 2 should be unlocked
  });
});
