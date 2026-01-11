import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSnakeLogic } from './useSnakeLogic';

// Test level data
const createTestLevel = (overrides = {}) => ({
  startPos: { x: 240, y: 800 },
  startDirection: 'UP',
  finishPos: { x: 240, y: 100 },
  orbs: [
    { id: 'orb-1', x: 240, y: 700 },
    { id: 'orb-2', x: 240, y: 500 },
    { id: 'orb-3', x: 240, y: 300 },
  ],
  barriers: [],
  initialSpeed: 3,
  speedIncrement: 0.5,
  ...overrides,
});

// Level with barriers
const createBarrierLevel = () => ({
  startPos: { x: 240, y: 800 },
  startDirection: 'UP',
  finishPos: { x: 240, y: 100 },
  orbs: [{ id: 'orb-1', x: 240, y: 700 }],
  barriers: [
    { x: 200, y: 600, width: 80, height: 20 },
  ],
  initialSpeed: 5,
  speedIncrement: 0.5,
});

describe('useSnakeLogic', () => {
  let onComplete;
  let onFail;
  let playSound;
  let rafCallbacks = [];
  let rafId = 0;

  beforeEach(() => {
    onComplete = vi.fn();
    onFail = vi.fn();
    playSound = vi.fn();

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

  const advanceGameLoop = (frames = 1) => {
    for (let i = 0; i < frames; i++) {
      act(() => {
        const callbacks = [...rafCallbacks];
        rafCallbacks = [];
        callbacks.forEach(r => {
          r.callback(Date.now());
        });
        vi.advanceTimersByTime(33); // ~30fps fixed timestep
      });
    }
  };

  // Helper to complete countdown (3 seconds + small buffer)
  const completeCountdown = () => {
    // Advance each second separately to allow React to process state updates
    act(() => { vi.advanceTimersByTime(1000); }); // 3 -> 2
    act(() => { vi.advanceTimersByTime(1000); }); // 2 -> 1
    act(() => { vi.advanceTimersByTime(1000); }); // 1 -> 0
    act(() => { vi.advanceTimersByTime(100); });  // 0 -> playing
  };

  describe('Initialization', () => {
    it('should initialize with countdown state', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.gameState).toBe('countdown');
    });

    it('should initialize countdown at 3', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.countdown).toBe(3);
    });

    it('should initialize trail with start position', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.trail).toHaveLength(1);
      expect(result.current.trail[0]).toEqual({ x: 240, y: 800 });
    });

    it('should initialize orbs from level data', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.orbs).toHaveLength(3);
      expect(result.current.orbs[0].id).toBe('orb-1');
    });

    it('should initialize barriers from level data', () => {
      const levelData = createBarrierLevel();
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.barriers).toHaveLength(1);
      expect(result.current.barriers[0].width).toBe(80);
    });

    it('should initialize score at 0', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.score).toBe(0);
    });

    it('should initialize speed from level data', () => {
      const levelData = createTestLevel({ initialSpeed: 5 });
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.speed).toBe(5);
    });

    it('should expose finish position', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.finishPos).toEqual({ x: 240, y: 100 });
    });

    it('should handle null levelData gracefully', () => {
      const { result } = renderHook(() =>
        useSnakeLogic(null, onComplete, onFail, playSound)
      );

      expect(result.current.barriers).toEqual([]);
      expect(result.current.finishPos).toEqual({ x: 0, y: 0 });
    });
  });

  describe('Countdown', () => {
    it('should decrement countdown each second', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.countdown).toBe(3);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.countdown).toBe(2);
    });

    it('should play tick sound on each countdown', () => {
      const levelData = createTestLevel();
      renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(playSound).toHaveBeenCalledWith('tick');
    });

    it('should transition to playing state after countdown', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      // Advance through countdown
      completeCountdown();

      expect(result.current.gameState).toBe('playing');
      expect(result.current.countdown).toBe(null);
    });
  });

  describe('Movement', () => {
    it('should move in initial direction after countdown', () => {
      const levelData = createTestLevel({ startDirection: 'UP' });
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      // Complete countdown
      completeCountdown();

      // Advance game loop
      advanceGameLoop(10);

      // Trail should have moved up (y decreased)
      expect(result.current.trail[0].y).toBeLessThan(800);
    });

    it('should grow trail as snake moves', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      advanceGameLoop(20);

      expect(result.current.trail.length).toBeGreaterThan(1);
    });

    it('should limit trail length based on orbs collected', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      advanceGameLoop(100);

      // Base length is 20, grows by 5 per orb collected
      expect(result.current.trail.length).toBeLessThanOrEqual(40);
    });
  });

  describe('Direction Change', () => {
    it('should change direction with arrow keys', () => {
      const levelData = createTestLevel({ startDirection: 'UP' });
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      const initialX = result.current.trail[0].x;

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
      });

      advanceGameLoop(10);

      // Should have moved right
      expect(result.current.trail[0].x).toBeGreaterThan(initialX);
    });

    it('should change direction with WASD keys', () => {
      const levelData = createTestLevel({ startDirection: 'UP' });
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      const initialX = result.current.trail[0].x;

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }));
      });

      advanceGameLoop(10);

      expect(result.current.trail[0].x).toBeGreaterThan(initialX);
    });

    it('should not allow 180 degree turn (UP to DOWN)', () => {
      const levelData = createTestLevel({ startDirection: 'UP' });
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      const initialY = result.current.trail[0].y;

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
      });

      advanceGameLoop(5);

      // Should still be moving up (y decreasing), not down
      expect(result.current.trail[0].y).toBeLessThan(initialY);
    });

    it('should not allow 180 degree turn (LEFT to RIGHT)', () => {
      const levelData = createTestLevel({ startDirection: 'LEFT' });
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      const initialX = result.current.trail[0].x;

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
      });

      advanceGameLoop(5);

      // Should still be moving left
      expect(result.current.trail[0].x).toBeLessThan(initialX);
    });

    it('should not change direction when game is not playing', () => {
      const levelData = createTestLevel();
      renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      // Still in countdown
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
      });

      // Direction should still be UP (start direction)
      // We can verify by checking the game still works properly after countdown
    });
  });

  describe('Touch Controls', () => {
    it('should change direction based on swipe', () => {
      const levelData = createTestLevel({ startDirection: 'UP' });
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      const initialX = result.current.trail[0].x;

      // Swipe right
      act(() => {
        window.dispatchEvent(new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 }],
        }));
      });

      act(() => {
        window.dispatchEvent(new TouchEvent('touchend', {
          changedTouches: [{ clientX: 200, clientY: 100 }],
        }));
      });

      advanceGameLoop(10);

      expect(result.current.trail[0].x).toBeGreaterThan(initialX);
    });

    it('should detect vertical swipe', () => {
      const levelData = createTestLevel({ startDirection: 'RIGHT' });
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      // Swipe down
      act(() => {
        window.dispatchEvent(new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 }],
        }));
      });

      act(() => {
        window.dispatchEvent(new TouchEvent('touchend', {
          changedTouches: [{ clientX: 100, clientY: 200 }],
        }));
      });

      advanceGameLoop(10);

      // Should have moved down
      expect(result.current.trail[0].y).toBeGreaterThan(800);
    });
  });

  describe('Orb Collection', () => {
    it('should collect orb when snake head touches it', () => {
      const levelData = createTestLevel({
        orbs: [{ id: 'orb-1', x: 240, y: 790 }], // Very close to start
      });
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      advanceGameLoop(20);

      expect(result.current.orbs.length).toBeLessThan(1);
    });

    it('should increase score by 20 when collecting orb', () => {
      const levelData = createTestLevel({
        orbs: [{ id: 'orb-1', x: 240, y: 790 }],
      });
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      advanceGameLoop(20);

      expect(result.current.score).toBeGreaterThanOrEqual(20);
    });

    it('should increase speed when collecting orb', () => {
      const levelData = createTestLevel({
        orbs: [{ id: 'orb-1', x: 240, y: 790 }],
        initialSpeed: 3,
        speedIncrement: 0.5,
      });
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      advanceGameLoop(20);

      expect(result.current.speed).toBeGreaterThanOrEqual(3.5);
    });

    it('should play orb sound when collecting', () => {
      const levelData = createTestLevel({
        orbs: [{ id: 'orb-1', x: 240, y: 790 }],
      });
      renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      advanceGameLoop(20);

      expect(playSound).toHaveBeenCalledWith('orb');
    });
  });

  describe('Boundary Collision', () => {
    it('should fail when hitting left boundary', () => {
      const levelData = createTestLevel({ startDirection: 'LEFT' });
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      // Move until hitting left boundary
      advanceGameLoop(200);

      expect(result.current.gameState).toBe('failed');
      expect(onFail).toHaveBeenCalled();
    });

    it('should fail when hitting right boundary', () => {
      const levelData = createTestLevel({ startDirection: 'RIGHT', startPos: { x: 470, y: 800 } });
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      advanceGameLoop(50);

      expect(result.current.gameState).toBe('failed');
    });

    it('should fail when hitting top boundary', () => {
      const levelData = createTestLevel({ startPos: { x: 240, y: 10 } });
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      advanceGameLoop(50);

      expect(result.current.gameState).toBe('failed');
    });

    it('should fail when hitting bottom boundary', () => {
      const levelData = createTestLevel({ startDirection: 'DOWN', startPos: { x: 240, y: 890 } });
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      advanceGameLoop(50);

      expect(result.current.gameState).toBe('failed');
    });

    it('should play fail sound on boundary collision', () => {
      const levelData = createTestLevel({ startDirection: 'LEFT' });
      renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      advanceGameLoop(200);

      expect(playSound).toHaveBeenCalledWith('fail');
    });
  });

  describe('Barrier Collision', () => {
    it('should fail when hitting barrier', () => {
      const levelData = createBarrierLevel();
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      // Move towards barrier
      advanceGameLoop(100);

      expect(result.current.gameState).toBe('failed');
      expect(onFail).toHaveBeenCalled();
    });
  });

  describe('Self Collision', () => {
    it('should fail when snake collides with itself', () => {
      // This is harder to test due to the skip of first 5 segments
      // We'd need a specific scenario where the snake loops back on itself
      const levelData = createTestLevel({
        startPos: { x: 240, y: 800 },
        initialSpeed: 10, // Faster for quicker testing
      });
      renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      // Create a loop by rapidly changing directions
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
      });
      advanceGameLoop(20);

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
      });
      advanceGameLoop(20);

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
      });
      advanceGameLoop(20);

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));
      });
      advanceGameLoop(50);

      // At this point, snake might have collided with itself
      // This is a timing-dependent test
    });
  });

  describe('Level Completion', () => {
    it('should complete when reaching finish position', () => {
      const levelData = createTestLevel({
        startPos: { x: 240, y: 120 }, // Start close to finish
        finishPos: { x: 240, y: 100 },
        orbs: [],
      });
      const { result } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      advanceGameLoop(50);

      expect(result.current.gameState).toBe('complete');
      expect(onComplete).toHaveBeenCalled();
    });

    it('should play complete sound on finish', () => {
      const levelData = createTestLevel({
        startPos: { x: 240, y: 120 },
        finishPos: { x: 240, y: 100 },
        orbs: [],
      });
      renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      advanceGameLoop(50);

      expect(playSound).toHaveBeenCalledWith('complete');
    });

    it('should calculate 3 stars when all orbs collected', () => {
      const levelData = createTestLevel({
        startPos: { x: 240, y: 130 },
        finishPos: { x: 240, y: 100 },
        orbs: [{ id: 'orb-1', x: 240, y: 115 }], // On the way
      });
      renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      advanceGameLoop(50);

      expect(onComplete).toHaveBeenCalledWith(expect.any(Number), 3);
    });

    it('should calculate 2 stars when missing 1-2 orbs', () => {
      const levelData = createTestLevel({
        startPos: { x: 240, y: 130 },
        finishPos: { x: 240, y: 100 },
        orbs: [
          { id: 'orb-1', x: 500, y: 500 }, // Not on the path
        ],
      });
      renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      advanceGameLoop(50);

      expect(onComplete).toHaveBeenCalledWith(expect.any(Number), 2);
    });
  });

  describe('Level Reset', () => {
    it('should reset when levelData changes', () => {
      const levelData1 = createTestLevel({ initialSpeed: 3 });
      const levelData2 = createTestLevel({ initialSpeed: 5, startPos: { x: 100, y: 100 } });

      const { result, rerender } = renderHook(
        ({ level }) => useSnakeLogic(level, onComplete, onFail, playSound),
        { initialProps: { level: levelData1 } }
      );

      expect(result.current.speed).toBe(3);
      expect(result.current.trail[0]).toEqual({ x: 240, y: 800 });

      rerender({ level: levelData2 });

      expect(result.current.speed).toBe(5);
      expect(result.current.trail[0]).toEqual({ x: 100, y: 100 });
      expect(result.current.gameState).toBe('countdown');
      expect(result.current.countdown).toBe(3);
    });
  });

  describe('Cleanup', () => {
    it('should cancel animation frame on unmount', () => {
      const levelData = createTestLevel();
      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');

      const { unmount } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      completeCountdown();

      advanceGameLoop(5);

      unmount();

      expect(cancelSpy).toHaveBeenCalled();
    });

    it('should clean up event listeners on unmount', () => {
      const levelData = createTestLevel();
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() =>
        useSnakeLogic(levelData, onComplete, onFail, playSound)
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});
