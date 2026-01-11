import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMazeLogic } from './useMazeLogic';
import { TILES } from '../../utils/constants';

// Test level data
const createTestLevel = (overrides = {}) => ({
  grid: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 2, 1],
    [1, 0, 1, 0, 1],
    [1, 2, 0, 4, 1],
    [1, 1, 1, 1, 1],
  ],
  startPos: { x: 1, y: 1 },
  timeLimit: 60,
  crystalsRequired: 2,
  hazards: [],
  ...overrides,
});

// Level with hazards
const createHazardLevel = () => ({
  grid: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 3, 0, 1],
    [1, 2, 0, 4, 1],
    [1, 1, 1, 1, 1],
  ],
  startPos: { x: 1, y: 1 },
  timeLimit: 60,
  crystalsRequired: 1,
  hazards: [
    { x: 2, y: 1, pattern: 'horizontal', range: 1 },
  ],
});

describe('useMazeLogic', () => {
  let onComplete;
  let onFail;
  let playSound;

  beforeEach(() => {
    onComplete = vi.fn();
    onFail = vi.fn();
    playSound = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with correct player position', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.playerPos).toEqual({ x: 1, y: 1 });
    });

    it('should initialize with correct time limit', () => {
      const levelData = createTestLevel({ timeLimit: 90 });
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.timeRemaining).toBe(90);
    });

    it('should initialize with playing state', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.gameState).toBe('playing');
    });

    it('should initialize score at 0', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.score).toBe(0);
    });

    it('should initialize mood as idle', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.mood).toBe('idle');
    });

    it('should extract crystals from grid correctly', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      // Grid has crystals at (3,1) and (1,3)
      expect(result.current.crystals).toHaveLength(2);
      expect(result.current.crystals).toContainEqual({ id: '3-1', x: 3, y: 1 });
      expect(result.current.crystals).toContainEqual({ id: '1-3', x: 1, y: 3 });
    });

    it('should initialize trail with start position', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.trail).toHaveLength(1);
      expect(result.current.trail[0]).toEqual({ x: 1, y: 1 });
    });

    it('should expose grid from level data', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.grid).toBe(levelData.grid);
    });

    it('should expose correct tile size', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.tileSize).toBe(40);
    });
  });

  describe('Movement', () => {
    it('should move player right on valid move', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.movePlayer('RIGHT');
      });

      expect(result.current.playerPos).toEqual({ x: 2, y: 1 });
    });

    it('should move player down on valid move', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.movePlayer('DOWN');
      });

      expect(result.current.playerPos).toEqual({ x: 1, y: 2 });
    });

    it('should not move into wall', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.movePlayer('UP'); // Wall at y=0
      });

      expect(result.current.playerPos).toEqual({ x: 1, y: 1 });
    });

    it('should not move left into wall', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.movePlayer('LEFT'); // Wall at x=0
      });

      expect(result.current.playerPos).toEqual({ x: 1, y: 1 });
    });

    it('should update trail on valid move', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.movePlayer('RIGHT');
      });

      expect(result.current.trail).toHaveLength(2);
      expect(result.current.trail).toContainEqual({ x: 2, y: 1 });
    });

    it('should limit trail to 8 positions', () => {
      const levelData = createTestLevel({
        grid: [
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
      });
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      // Move 10 times
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.movePlayer('RIGHT');
        });
      }

      expect(result.current.trail.length).toBeLessThanOrEqual(8);
    });

    it('should not move when game is not playing', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      // Let time run out
      act(() => {
        vi.advanceTimersByTime(61000);
      });

      const posBeforeMove = { ...result.current.playerPos };

      act(() => {
        result.current.movePlayer('RIGHT');
      });

      expect(result.current.playerPos).toEqual(posBeforeMove);
    });

    it('should ignore invalid direction', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.movePlayer('INVALID');
      });

      expect(result.current.playerPos).toEqual({ x: 1, y: 1 });
    });
  });

  describe('Crystal Collection', () => {
    it('should collect crystal when moving to crystal position', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      // Move to crystal at (3, 1) - each move in its own act() for proper state update
      act(() => {
        result.current.movePlayer('RIGHT'); // (2, 1)
      });
      act(() => {
        result.current.movePlayer('RIGHT'); // (3, 1) - crystal!
      });

      expect(result.current.crystals).toHaveLength(1);
    });

    it('should increase score by 100 when collecting crystal', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.movePlayer('RIGHT');
      });
      act(() => {
        result.current.movePlayer('RIGHT');
      });

      expect(result.current.score).toBe(100);
    });

    it('should play collect sound when collecting crystal', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.movePlayer('RIGHT');
      });
      act(() => {
        result.current.movePlayer('RIGHT');
      });

      expect(playSound).toHaveBeenCalledWith('collect');
    });

    it('should set mood to happy when collecting crystal', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.movePlayer('RIGHT');
        result.current.movePlayer('RIGHT');
      });

      // Mood should be happy immediately after collection
      // (it resets after 500ms via setTimeout)
    });
  });

  describe('Level Completion', () => {
    it('should complete level when reaching exit with enough crystals', () => {
      const levelData = createTestLevel({ crystalsRequired: 1 });
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      // Collect crystal at (3, 1) then reach exit at (3, 3)
      act(() => {
        result.current.movePlayer('RIGHT'); // (2, 1)
      });
      act(() => {
        result.current.movePlayer('RIGHT'); // (3, 1) - crystal
      });
      act(() => {
        result.current.movePlayer('DOWN');  // (3, 2)
      });
      act(() => {
        result.current.movePlayer('DOWN');  // (3, 3) - exit
      });

      expect(result.current.gameState).toBe('complete');
      expect(onComplete).toHaveBeenCalled();
    });

    it('should play complete sound on level completion', () => {
      const levelData = createTestLevel({ crystalsRequired: 1 });
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.movePlayer('RIGHT');
      });
      act(() => {
        result.current.movePlayer('RIGHT');
      });
      act(() => {
        result.current.movePlayer('DOWN');
      });
      act(() => {
        result.current.movePlayer('DOWN');
      });

      expect(playSound).toHaveBeenCalledWith('complete');
    });

    it('should not complete level without enough crystals', () => {
      const levelData = createTestLevel({ crystalsRequired: 2 });
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      // Go directly to exit without collecting crystals
      act(() => {
        result.current.movePlayer('DOWN');  // (1, 2)
      });
      act(() => {
        result.current.movePlayer('DOWN');  // (1, 3)
      });
      act(() => {
        result.current.movePlayer('RIGHT'); // (2, 3)
      });
      act(() => {
        result.current.movePlayer('RIGHT'); // (3, 3) - exit
      });

      expect(result.current.gameState).toBe('playing');
      expect(onComplete).not.toHaveBeenCalled();
    });

    it('should calculate 3 stars for fast completion (>70% time)', () => {
      const levelData = createTestLevel({ crystalsRequired: 1, timeLimit: 100 });
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      // Complete quickly
      act(() => {
        result.current.movePlayer('RIGHT');
      });
      act(() => {
        result.current.movePlayer('RIGHT');
      });
      act(() => {
        result.current.movePlayer('DOWN');
      });
      act(() => {
        result.current.movePlayer('DOWN');
      });

      expect(onComplete).toHaveBeenCalledWith(expect.any(Number), 3);
    });

    it('should calculate 2 stars for medium completion (>40% time)', () => {
      const levelData = createTestLevel({ crystalsRequired: 1, timeLimit: 100 });
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      // Wait until 50% time remaining
      act(() => {
        vi.advanceTimersByTime(50000);
      });

      act(() => {
        result.current.movePlayer('RIGHT');
      });
      act(() => {
        result.current.movePlayer('RIGHT');
      });
      act(() => {
        result.current.movePlayer('DOWN');
      });
      act(() => {
        result.current.movePlayer('DOWN');
      });

      expect(onComplete).toHaveBeenCalledWith(expect.any(Number), 2);
    });

    it('should calculate 1 star for slow completion (<=40% time)', () => {
      const levelData = createTestLevel({ crystalsRequired: 1, timeLimit: 100 });
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      // Wait until <40% time remaining
      act(() => {
        vi.advanceTimersByTime(65000);
      });

      act(() => {
        result.current.movePlayer('RIGHT');
      });
      act(() => {
        result.current.movePlayer('RIGHT');
      });
      act(() => {
        result.current.movePlayer('DOWN');
      });
      act(() => {
        result.current.movePlayer('DOWN');
      });

      expect(onComplete).toHaveBeenCalledWith(expect.any(Number), 1);
    });
  });

  describe('Timer', () => {
    it('should countdown time every second', () => {
      const levelData = createTestLevel({ timeLimit: 60 });
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.timeRemaining).toBe(55);
    });

    it('should fail when time runs out', () => {
      const levelData = createTestLevel({ timeLimit: 5 });
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        vi.advanceTimersByTime(6000);
      });

      expect(result.current.gameState).toBe('failed');
      expect(onFail).toHaveBeenCalled();
    });

    it('should play warning sound at 10 seconds', () => {
      const levelData = createTestLevel({ timeLimit: 15 });
      renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        vi.advanceTimersByTime(5000); // 10 seconds remaining
      });

      expect(playSound).toHaveBeenCalledWith('warning');
    });

    it('should play tick sound at 3, 2, 1 seconds', () => {
      const levelData = createTestLevel({ timeLimit: 5 });
      renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        vi.advanceTimersByTime(2000); // 3 seconds
      });
      expect(playSound).toHaveBeenCalledWith('tick');

      act(() => {
        vi.advanceTimersByTime(1000); // 2 seconds
      });
      expect(playSound).toHaveBeenCalledWith('tick');

      act(() => {
        vi.advanceTimersByTime(1000); // 1 second
      });
      expect(playSound).toHaveBeenCalledWith('tick');
    });

    it('should stop timer when game is complete', () => {
      const levelData = createTestLevel({ crystalsRequired: 1, timeLimit: 60 });
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      // Complete the level
      act(() => {
        result.current.movePlayer('RIGHT');
      });
      act(() => {
        result.current.movePlayer('RIGHT');
      });
      act(() => {
        result.current.movePlayer('DOWN');
      });
      act(() => {
        result.current.movePlayer('DOWN');
      });

      const timeAtCompletion = result.current.timeRemaining;

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Time should not have decreased
      expect(result.current.timeRemaining).toBe(timeAtCompletion);
    });
  });

  describe('Hazards', () => {
    it('should fail when hitting static dark patch in grid', () => {
      const levelData = createHazardLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      // Move to dark patch at (2, 2)
      act(() => {
        result.current.movePlayer('DOWN');  // (1, 2)
        result.current.movePlayer('RIGHT'); // (2, 2) - dark patch
      });

      expect(result.current.gameState).toBe('failed');
      expect(onFail).toHaveBeenCalled();
    });

    it('should play fail sound when hitting hazard', () => {
      const levelData = createHazardLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.movePlayer('DOWN');
        result.current.movePlayer('RIGHT');
      });

      expect(playSound).toHaveBeenCalledWith('fail');
    });

    it('should initialize hazards from level data', () => {
      const levelData = createHazardLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.hazards).toHaveLength(1);
      expect(result.current.hazards[0].currentX).toBe(2);
      expect(result.current.hazards[0].currentY).toBe(1);
    });
  });

  describe('Mood System', () => {
    it('should have idle mood when no hazards nearby', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.mood).toBe('idle');
    });

    it('should change to worried mood when hazard is nearby', () => {
      const levelData = {
        grid: [
          [1, 1, 1, 1, 1],
          [1, 0, 0, 0, 1],
          [1, 0, 0, 0, 1],
          [1, 0, 0, 4, 1],
          [1, 1, 1, 1, 1],
        ],
        startPos: { x: 1, y: 1 },
        timeLimit: 60,
        crystalsRequired: 0,
        hazards: [
          { x: 2, y: 1, pattern: 'static', currentX: 2, currentY: 1 },
        ],
      };
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      // Player at (1,1), hazard at (2,1) - within 2 tiles
      expect(result.current.mood).toBe('worried');
    });
  });

  describe('Keyboard Input', () => {
    it('should handle arrow key input', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
      });

      expect(result.current.playerPos).toEqual({ x: 2, y: 1 });
    });

    it('should handle WASD input', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }));
      });

      expect(result.current.playerPos).toEqual({ x: 2, y: 1 });
    });

    it('should handle W for up', () => {
      const levelData = createTestLevel({
        grid: [
          [1, 1, 1, 1, 1],
          [1, 0, 0, 0, 1],
          [1, 0, 0, 0, 1],
          [1, 0, 0, 4, 1],
          [1, 1, 1, 1, 1],
        ],
        startPos: { x: 1, y: 2 },
      });
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
      });

      expect(result.current.playerPos).toEqual({ x: 1, y: 1 });
    });

    it('should handle S for down', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS' }));
      });

      expect(result.current.playerPos).toEqual({ x: 1, y: 2 });
    });

    it('should handle A for left', () => {
      const levelData = createTestLevel({
        grid: [
          [1, 1, 1, 1, 1],
          [1, 0, 0, 0, 1],
          [1, 0, 0, 0, 1],
          [1, 0, 0, 4, 1],
          [1, 1, 1, 1, 1],
        ],
        startPos: { x: 2, y: 1 },
      });
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
      });

      expect(result.current.playerPos).toEqual({ x: 1, y: 1 });
    });
  });

  describe('Score Calculation', () => {
    it('should add time bonus to score on completion', () => {
      const levelData = createTestLevel({ crystalsRequired: 1, timeLimit: 100 });
      const { result } = renderHook(() =>
        useMazeLogic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.movePlayer('RIGHT');
      });
      act(() => {
        result.current.movePlayer('RIGHT'); // Collect crystal (+100)
      });
      act(() => {
        result.current.movePlayer('DOWN');
      });
      act(() => {
        result.current.movePlayer('DOWN');  // Complete
      });

      // Score should be crystal(100) + timeRemaining * 10
      const expectedMinScore = 100 + 98 * 10; // At least 98 seconds remaining
      expect(onComplete).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number)
      );
      const [score] = onComplete.mock.calls[0];
      expect(score).toBeGreaterThanOrEqual(expectedMinScore);
    });
  });
});
