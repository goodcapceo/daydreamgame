import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlatformerLogic } from './usePlatformerLogic';
import { PHYSICS } from '../../utils/constants';

// Test level data
const createTestLevel = (overrides = {}) => ({
  platforms: [
    { x: 0, y: 700, width: 200, height: 20, type: 'solid' },
    { x: 250, y: 600, width: 100, height: 20, type: 'solid' },
    { x: 400, y: 500, width: 100, height: 20, type: 'finish' },
  ],
  stars: [
    { id: 'star-1', x: 100, y: 650, collected: false },
    { id: 'star-2', x: 300, y: 550, collected: false },
  ],
  startPos: { x: 50, y: 664 },
  ...overrides,
});

// Level with moving platform
const createMovingPlatformLevel = () => ({
  platforms: [
    { x: 0, y: 700, width: 200, height: 20, type: 'solid' },
    { x: 200, y: 600, width: 100, height: 20, type: 'moving', moveX: 100, speed: 5, originalX: 200 },
    { x: 400, y: 500, width: 100, height: 20, type: 'finish' },
  ],
  stars: [],
  startPos: { x: 50, y: 664 },
});

// Level with cloud platform
const createCloudPlatformLevel = () => ({
  platforms: [
    { x: 0, y: 700, width: 200, height: 20, type: 'solid' },
    { x: 200, y: 600, width: 100, height: 20, type: 'cloud' },
    { x: 400, y: 500, width: 100, height: 20, type: 'finish' },
  ],
  stars: [],
  startPos: { x: 50, y: 664 },
});

describe('usePlatformerLogic', () => {
  let onComplete;
  let onFail;
  let playSound;
  let rafCallbacks = [];
  let rafId = 0;

  beforeEach(() => {
    onComplete = vi.fn();
    onFail = vi.fn();
    playSound = vi.fn();

    // Mock requestAnimationFrame
    rafCallbacks = [];
    rafId = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafId++;
      rafCallbacks.push({ id: rafId, callback: cb });
      return rafId;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      rafCallbacks = rafCallbacks.filter(r => r.id !== id);
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // Helper to advance game loop
  const advanceGameLoop = (frames = 1) => {
    for (let i = 0; i < frames; i++) {
      act(() => {
        const callbacks = [...rafCallbacks];
        rafCallbacks = [];
        callbacks.forEach(r => {
          r.callback(Date.now());
        });
        vi.advanceTimersByTime(16);
      });
    }
  };

  describe('Initialization', () => {
    it('should initialize player at start position', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.player.x).toBe(50);
      expect(result.current.player.y).toBe(664);
    });

    it('should initialize player with zero velocity', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.player.vx).toBe(0);
      expect(result.current.player.vy).toBe(0);
    });

    it('should initialize player with correct dimensions', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.player.width).toBe(36);
      expect(result.current.player.height).toBe(36);
    });

    it('should initialize with playing state', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.gameState).toBe('playing');
    });

    it('should initialize score at 0', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.score).toBe(0);
    });

    it('should initialize platforms from level data', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.platforms).toHaveLength(3);
      expect(result.current.platforms[0].type).toBe('solid');
    });

    it('should initialize stars from level data', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.stars).toHaveLength(2);
      expect(result.current.stars[0].id).toBe('star-1');
    });

    it('should initialize player as not grounded', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.player.grounded).toBe(false);
    });
  });

  describe('Physics - Gravity', () => {
    it('should apply gravity to player when not grounded', () => {
      const levelData = createTestLevel({ startPos: { x: 50, y: 500 } }); // High up
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      const initialY = result.current.player.y;

      advanceGameLoop(5);

      expect(result.current.player.y).toBeGreaterThan(initialY);
    });

    it('should cap fall speed at MAX_FALL_SPEED', () => {
      const levelData = createTestLevel({ startPos: { x: 50, y: 100 } });
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      // Advance many frames to let gravity accumulate
      advanceGameLoop(100);

      expect(result.current.player.vy).toBeLessThanOrEqual(PHYSICS.MAX_FALL_SPEED);
    });
  });

  describe('Physics - Jumping', () => {
    it('should allow jumping when grounded', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      // First, let player land on platform
      advanceGameLoop(10);

      // Now jump
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
      });

      expect(result.current.player.vy).toBe(PHYSICS.JUMP_STRENGTH);
    });

    it('should play jump sound when jumping', () => {
      const levelData = createTestLevel();
      renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      // Land first
      advanceGameLoop(10);

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
      });

      expect(playSound).toHaveBeenCalledWith('jump');
    });

    it('should not allow jumping when not grounded (double jump)', () => {
      const levelData = createTestLevel({ startPos: { x: 50, y: 100 } });
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      // Player starts in air
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
      });

      // Velocity should not be jump strength (player was falling)
      expect(result.current.player.vy).not.toBe(PHYSICS.JUMP_STRENGTH);
    });

    it('should allow jumping with ArrowUp', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      advanceGameLoop(10);

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));
      });

      expect(result.current.player.vy).toBe(PHYSICS.JUMP_STRENGTH);
    });

    it('should allow jumping with W key', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      advanceGameLoop(10);

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
      });

      expect(result.current.player.vy).toBe(PHYSICS.JUMP_STRENGTH);
    });
  });

  describe('Physics - Horizontal Movement', () => {
    it('should move left when pressing left arrow', () => {
      const levelData = createTestLevel({ startPos: { x: 200, y: 664 } });
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
      });

      advanceGameLoop(5);

      expect(result.current.player.vx).toBe(-PHYSICS.HORIZONTAL_SPEED);
    });

    it('should move right when pressing right arrow', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
      });

      advanceGameLoop(5);

      expect(result.current.player.vx).toBe(PHYSICS.HORIZONTAL_SPEED);
    });

    it('should move left when pressing A key', () => {
      const levelData = createTestLevel({ startPos: { x: 200, y: 664 } });
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
      });

      advanceGameLoop(5);

      expect(result.current.player.vx).toBe(-PHYSICS.HORIZONTAL_SPEED);
    });

    it('should move right when pressing D key', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }));
      });

      advanceGameLoop(5);

      expect(result.current.player.vx).toBe(PHYSICS.HORIZONTAL_SPEED);
    });

    it('should stop horizontal movement when key released', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
      });

      advanceGameLoop(2);

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight' }));
      });

      advanceGameLoop(2);

      expect(result.current.player.vx).toBe(0);
    });
  });

  describe('Platform Collision', () => {
    it('should ground player when landing on solid platform', () => {
      const levelData = createTestLevel({ startPos: { x: 50, y: 650 } });
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      // Advance frames until player lands
      advanceGameLoop(20);

      expect(result.current.player.grounded).toBe(true);
    });

    it('should set vertical velocity to 0 when landing', () => {
      const levelData = createTestLevel({ startPos: { x: 50, y: 650 } });
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      advanceGameLoop(20);

      expect(result.current.player.vy).toBe(0);
    });

    it('should complete level when landing on finish platform', () => {
      const levelData = createTestLevel({
        platforms: [
          { x: 0, y: 700, width: 200, height: 20, type: 'finish' },
        ],
        stars: [],
        startPos: { x: 50, y: 650 },
      });
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      advanceGameLoop(20);

      expect(result.current.gameState).toBe('complete');
      expect(onComplete).toHaveBeenCalled();
    });

    it('should play complete sound on finish', () => {
      const levelData = createTestLevel({
        platforms: [
          { x: 0, y: 700, width: 200, height: 20, type: 'finish' },
        ],
        stars: [],
        startPos: { x: 50, y: 650 },
      });
      renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      advanceGameLoop(20);

      expect(playSound).toHaveBeenCalledWith('complete');
    });
  });

  describe('Cloud Platforms', () => {
    it('should allow landing on cloud platform from above', () => {
      const levelData = createCloudPlatformLevel();
      // Start above cloud platform
      levelData.startPos = { x: 220, y: 550 };
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      advanceGameLoop(20);

      // Should land on cloud at y=600
      expect(result.current.player.grounded).toBe(true);
    });

    // Note: Cloud platform pass-through from below is handled in the game loop
  });

  describe('Moving Platforms', () => {
    it('should update moving platform position over time', () => {
      const levelData = createMovingPlatformLevel();
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      const initialX = result.current.platforms[1].x;

      advanceGameLoop(30);

      // Platform should have moved
      expect(result.current.platforms[1].x).not.toBe(initialX);
    });

    it('should reverse platform direction at end of range', () => {
      const levelData = createMovingPlatformLevel();
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      // Advance enough for platform to reach end and reverse
      advanceGameLoop(100);

      // Platform should be within its range
      expect(result.current.platforms[1].x).toBeLessThanOrEqual(300); // originalX + moveX
      expect(result.current.platforms[1].x).toBeGreaterThanOrEqual(200); // originalX
    });
  });

  describe('Star Collection', () => {
    it('should collect star when player touches it', () => {
      const levelData = createTestLevel({
        stars: [{ id: 'star-1', x: 68, y: 682, collected: false }], // Near start position
        startPos: { x: 50, y: 664 },
      });
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      // Star is at player's position
      advanceGameLoop(5);

      expect(result.current.stars.length).toBeLessThan(1);
    });

    it('should increase score when collecting star', () => {
      const levelData = createTestLevel({
        stars: [{ id: 'star-1', x: 68, y: 682, collected: false }],
        startPos: { x: 50, y: 664 },
      });
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      advanceGameLoop(5);

      expect(result.current.score).toBeGreaterThanOrEqual(100);
    });

    it('should play collect sound when getting star', () => {
      const levelData = createTestLevel({
        stars: [{ id: 'star-1', x: 68, y: 682, collected: false }],
        startPos: { x: 50, y: 664 },
      });
      renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      advanceGameLoop(5);

      expect(playSound).toHaveBeenCalledWith('collect');
    });
  });

  describe('Failure Conditions', () => {
    it('should fail when player falls off screen', () => {
      const levelData = createTestLevel({
        platforms: [], // No platforms to catch player
        startPos: { x: 50, y: 800 },
      });
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      advanceGameLoop(50);

      expect(result.current.gameState).toBe('failed');
      expect(onFail).toHaveBeenCalled();
    });

    it('should play fail sound when falling off', () => {
      const levelData = createTestLevel({
        platforms: [],
        startPos: { x: 50, y: 850 },
      });
      renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      advanceGameLoop(30);

      expect(playSound).toHaveBeenCalledWith('fail');
    });
  });

  describe('Screen Boundaries', () => {
    it('should keep player within left screen boundary', () => {
      const levelData = createTestLevel({ startPos: { x: 10, y: 664 } });
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      // Move left
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
      });

      advanceGameLoop(30);

      expect(result.current.player.x).toBeGreaterThanOrEqual(0);
    });

    it('should keep player within right screen boundary', () => {
      const levelData = createTestLevel({ startPos: { x: 440, y: 664 } });
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      // Move right
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
      });

      advanceGameLoop(30);

      expect(result.current.player.x).toBeLessThanOrEqual(480 - 36); // 480 - player.width
    });
  });

  describe('Star Rating Calculation', () => {
    it('should give 3 stars when collecting all stars', () => {
      const levelData = createTestLevel({
        platforms: [
          { x: 0, y: 700, width: 200, height: 20, type: 'finish' },
        ],
        stars: [
          { id: 'star-1', x: 68, y: 682, collected: false },
          { id: 'star-2', x: 68, y: 682, collected: false },
          { id: 'star-3', x: 68, y: 682, collected: false },
        ],
        startPos: { x: 50, y: 664 },
      });
      renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      advanceGameLoop(30);

      expect(onComplete).toHaveBeenCalledWith(expect.any(Number), 3);
    });

    it('should give 2 stars when collecting 2+ stars', () => {
      const levelData = createTestLevel({
        platforms: [
          { x: 0, y: 700, width: 200, height: 20, type: 'finish' },
        ],
        stars: [
          { id: 'star-1', x: 68, y: 682, collected: false },
          { id: 'star-2', x: 68, y: 682, collected: false },
          { id: 'star-3', x: 500, y: 500, collected: false }, // Out of reach
        ],
        startPos: { x: 50, y: 664 },
      });
      renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      advanceGameLoop(30);

      expect(onComplete).toHaveBeenCalledWith(expect.any(Number), 2);
    });
  });

  describe('Touch Controls', () => {
    it('should jump on tap when grounded', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      // Land first
      advanceGameLoop(10);

      act(() => {
        window.dispatchEvent(new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 }],
        }));
      });

      expect(result.current.player.vy).toBe(PHYSICS.JUMP_STRENGTH);
    });

    it('should move based on touch drag direction', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        window.dispatchEvent(new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 }],
        }));
      });

      act(() => {
        window.dispatchEvent(new TouchEvent('touchmove', {
          touches: [{ clientX: 200, clientY: 100 }], // Move right 100px
        }));
      });

      advanceGameLoop(5);

      // Should be moving right (velocity should be positive)
      expect(result.current.player.vx).toBe(PHYSICS.HORIZONTAL_SPEED);
    });

    it('should stop movement on touch end', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        window.dispatchEvent(new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 }],
        }));
      });

      act(() => {
        window.dispatchEvent(new TouchEvent('touchmove', {
          touches: [{ clientX: 200, clientY: 100 }],
        }));
      });

      advanceGameLoop(2);

      act(() => {
        window.dispatchEvent(new TouchEvent('touchend', {}));
      });

      advanceGameLoop(2);

      expect(result.current.player.vx).toBe(0);
    });
  });

  describe('Game Loop Management', () => {
    it('should stop game loop when game state is not playing', () => {
      const levelData = createTestLevel({
        platforms: [],
        startPos: { x: 50, y: 850 },
      });
      const { result } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      // Let player fall off screen
      advanceGameLoop(30);

      // Game should be failed
      expect(result.current.gameState).toBe('failed');

      // Further frames should not cause errors
      advanceGameLoop(10);
    });

    it('should cleanup animation frame on unmount', () => {
      const levelData = createTestLevel();
      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');

      const { unmount } = renderHook(() =>
        usePlatformerLogic(levelData, onComplete, onFail, playSound)
      );

      advanceGameLoop(5);

      unmount();

      // cancelAnimationFrame should have been called
      expect(cancelSpy).toHaveBeenCalled();
    });
  });
});
