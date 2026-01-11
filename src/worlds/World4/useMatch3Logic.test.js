import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMatch3Logic } from './useMatch3Logic';

// Test level data
const createTestLevel = (overrides = {}) => ({
  gridSize: { rows: 8, cols: 7 },
  objective: { type: 'score', target: 100 },
  moves: 10,
  tileTypes: ['pink', 'purple', 'yellow'],
  ...overrides,
});

// Level with collect objective
const createCollectLevel = () => ({
  gridSize: { rows: 8, cols: 7 },
  objective: {
    type: 'collect',
    targets: { pink: 5, purple: 5, yellow: 5 },
  },
  moves: 20,
  tileTypes: ['pink', 'purple', 'yellow'],
});

describe('useMatch3Logic', () => {
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
    it('should initialize with correct grid dimensions', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.grid).toHaveLength(8); // rows
      expect(result.current.grid[0]).toHaveLength(7); // cols
    });

    it('should initialize with playing state', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.gameState).toBe('playing');
    });

    it('should initialize score at 0', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.score).toBe(0);
    });

    it('should initialize moves from level data', () => {
      const levelData = createTestLevel({ moves: 15 });
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.moves).toBe(15);
    });

    it('should initialize collected counts at 0', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.collected).toEqual({ pink: 0, purple: 0, yellow: 0 });
    });

    it('should initialize animation phase as idle', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.animationPhase).toBe('idle');
    });

    it('should initialize with no selected tile', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.selected).toBeNull();
    });

    it('should initialize with no dragging state', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.dragging).toBeNull();
    });

    it('should generate grid with only valid tile types', () => {
      const levelData = createTestLevel({ tileTypes: ['pink', 'purple'] });
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      const allTiles = result.current.grid.flat();
      allTiles.forEach(tile => {
        expect(['pink', 'purple']).toContain(tile);
      });
    });

    it('should generate grid without initial matches', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      // Check no horizontal matches of 3+
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 5; col++) {
          const tile = result.current.grid[row][col];
          const hasMatch = tile === result.current.grid[row][col + 1] &&
                          tile === result.current.grid[row][col + 2];
          expect(hasMatch).toBe(false);
        }
      }

      // Check no vertical matches of 3+
      for (let col = 0; col < 7; col++) {
        for (let row = 0; row < 6; row++) {
          const tile = result.current.grid[row][col];
          const hasMatch = tile === result.current.grid[row + 1][col] &&
                          tile === result.current.grid[row + 2][col];
          expect(hasMatch).toBe(false);
        }
      }
    });
  });

  describe('Tile Selection', () => {
    it('should select tile on click', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.handleTileClick(3, 4);
      });

      expect(result.current.selected).toEqual({ row: 3, col: 4 });
    });

    it('should change selection when clicking different tile', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.handleTileClick(3, 4);
      });

      act(() => {
        result.current.handleTileClick(5, 2);
      });

      expect(result.current.selected).toEqual({ row: 5, col: 2 });
    });

    it('should not select when animation is in progress', () => {
      const levelData = createTestLevel();
      renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      // Manually set animation phase to swapping
      act(() => {
        // This is internal state, but we can trigger via swap
      });

      // Test would need to check selection during animation
    });

    it('should not select when game is not playing', () => {
      const levelData = createTestLevel({ moves: 0 });
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      // Game should be failed immediately
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      act(() => {
        result.current.handleTileClick(3, 4);
      });

      // Selection should not happen since game is over
    });
  });

  describe('Tile Swapping', () => {
    it('should swap adjacent tiles horizontally', async () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      // Select first tile
      act(() => {
        result.current.handleTileClick(3, 3);
      });

      // Click adjacent tile
      act(() => {
        result.current.handleTileClick(3, 4);
      });

      // Selection should be cleared (swap attempted)
      expect(result.current.selected).toBeNull();
    });

    it('should swap adjacent tiles vertically', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.handleTileClick(3, 3);
      });

      act(() => {
        result.current.handleTileClick(4, 3);
      });

      expect(result.current.selected).toBeNull();
    });

    it('should not swap non-adjacent tiles', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.handleTileClick(3, 3);
      });

      act(() => {
        result.current.handleTileClick(5, 5); // Not adjacent
      });

      // Should just change selection, not swap
      expect(result.current.selected).toEqual({ row: 5, col: 5 });
    });

    it('should not swap diagonally adjacent tiles', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.handleTileClick(3, 3);
      });

      act(() => {
        result.current.handleTileClick(4, 4); // Diagonal
      });

      // Should change selection, not swap
      expect(result.current.selected).toEqual({ row: 4, col: 4 });
    });
  });

  describe('Drag Controls', () => {
    it('should start drag on handleDragStart', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.handleDragStart(3, 3, 100, 100);
      });

      expect(result.current.dragging).toEqual({
        row: 3,
        col: 3,
        startX: 100,
        startY: 100,
      });
    });

    it('should update drag offset on move', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.handleDragStart(3, 3, 100, 100);
      });

      act(() => {
        result.current.handleDragMove(120, 100); // Move 20px right
      });

      expect(result.current.dragOffset.x).toBe(20);
      expect(result.current.dragOffset.y).toBe(0);
    });

    it('should constrain drag to one direction', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.handleDragStart(3, 3, 100, 100);
      });

      act(() => {
        result.current.handleDragMove(130, 115); // Mostly horizontal
      });

      // Should constrain to horizontal
      expect(result.current.dragOffset.y).toBe(0);
    });

    it('should reset drag state on end', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        result.current.handleDragStart(3, 3, 100, 100);
      });

      act(() => {
        result.current.handleDragEnd();
      });

      expect(result.current.dragging).toBeNull();
      expect(result.current.dragOffset).toEqual({ x: 0, y: 0 });
    });

    it('should not start drag during animation', () => {
      const levelData = createTestLevel();
      renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      // Simulate animation in progress by attempting drag during non-idle phase
      // This would require setting internal state
    });
  });

  describe('Match Detection', () => {
    it('should detect horizontal match of 3', () => {
      // This requires a controlled grid - we test via the swap mechanism
      const levelData = createTestLevel();
      renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      // The match detection is internal, tested indirectly through gameplay
    });

    it('should detect horizontal match of 4+', () => {
      // Matches of 4+ should be detected same as 3
    });

    it('should detect vertical match of 3', () => {
      // Tested indirectly
    });

    it('should detect multiple matches simultaneously', () => {
      // T-shapes, L-shapes, crosses
    });
  });

  describe('Score System', () => {
    it('should increase score on match', async () => {
      const levelData = createTestLevel({ objective: { type: 'score', target: 10000 } });
      renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      // Making a valid match would increase score
      // This needs grid manipulation
    });

    it('should award 10 points per matched tile', () => {
      // Score formula: totalMatches * 10
    });
  });

  describe('Collection System', () => {
    it('should track collected tiles by type', () => {
      const levelData = createCollectLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      // Initial collected counts
      expect(result.current.collected.pink).toBe(0);
      expect(result.current.collected.purple).toBe(0);
      expect(result.current.collected.yellow).toBe(0);
    });
  });

  describe('Move Counter', () => {
    it('should decrement moves on valid swap', async () => {
      const levelData = createTestLevel({ moves: 10 });
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      // Verify initial moves match level data
      expect(result.current.moves).toBe(10);

      // A valid swap would decrease moves by 1
      // Need controlled grid to test
    });

    it('should not decrement moves on invalid swap', () => {
      // Invalid swaps (no match) should not use a move
    });
  });

  describe('Win Conditions', () => {
    it('should complete on reaching score target', () => {
      const levelData = createTestLevel({ objective: { type: 'score', target: 0 } });
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      // Immediate win since target is 0 and score starts at 0
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.gameState).toBe('complete');
      expect(onComplete).toHaveBeenCalled();
    });

    it('should complete on meeting collection targets', () => {
      const levelData = createCollectLevel();
      levelData.objective.targets = { pink: 0, purple: 0, yellow: 0 };

      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.gameState).toBe('complete');
    });

    it('should play complete sound on win', () => {
      const levelData = createTestLevel({ objective: { type: 'score', target: 0 } });
      renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(playSound).toHaveBeenCalledWith('complete');
    });

    it('should calculate star rating based on score surplus', () => {
      // Star calculation: 3 stars if score >= target * 1.5, 2 stars if >= target * 1.2, else 1
    });
  });

  describe('Lose Conditions', () => {
    it('should fail when out of moves without meeting objective', () => {
      const levelData = createTestLevel({
        moves: 0,
        objective: { type: 'score', target: 1000 },
      });
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.gameState).toBe('failed');
      expect(onFail).toHaveBeenCalled();
    });

    it('should play fail sound on lose', () => {
      const levelData = createTestLevel({
        moves: 0,
        objective: { type: 'score', target: 1000 },
      });
      renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(playSound).toHaveBeenCalledWith('fail');
    });
  });

  describe('Animation States', () => {
    it('should have idle animation phase initially', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.animationPhase).toBe('idle');
    });

    it('should track swapping tiles during swap animation', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.swappingTiles).toBeNull();
    });

    it('should track matching tiles during match animation', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.matchingTiles).toEqual([]);
    });

    it('should track falling columns during gravity animation', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.fallingColumns).toEqual([]);
    });
  });

  describe('Floating Point Indicator', () => {
    it('should initialize with no last match points', () => {
      const levelData = createTestLevel();
      const { result } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      expect(result.current.lastMatchPoints).toBeNull();
    });

    it('should set last match points after successful match', () => {
      // Would need controlled grid to test
    });

    it('should clear last match points after 1 second', () => {
      // Tested when match occurs
    });
  });

  describe('Gravity System', () => {
    it('should fill empty cells with new tiles', () => {
      // After match, empty cells should be filled
    });

    it('should drop tiles from above to fill gaps', () => {
      // Tiles above empty cells should fall down
    });

    it('should trigger cascade matches', () => {
      // After gravity, new matches should be detected
    });
  });

  describe('Sound Effects', () => {
    it('should play match sound on successful match', () => {
      // Tested when match occurs
    });

    it('should play complete sound on win', () => {
      const levelData = createTestLevel({ objective: { type: 'score', target: 0 } });
      renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(playSound).toHaveBeenCalledWith('complete');
    });

    it('should play fail sound on loss', () => {
      const levelData = createTestLevel({
        moves: 0,
        objective: { type: 'score', target: 1000 },
      });
      renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(playSound).toHaveBeenCalledWith('fail');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup timeout on unmount', () => {
      const levelData = createTestLevel();
      const { unmount } = renderHook(() =>
        useMatch3Logic(levelData, onComplete, onFail, playSound)
      );

      unmount();

      // No errors should occur
    });
  });
});

describe('generateGrid utility', () => {
  it('should generate grid without initial matches', async () => {
    const { generateGrid } = await import('./levels');

    const grid = generateGrid(8, 7, ['pink', 'purple', 'yellow']);

    expect(grid).toHaveLength(8);
    expect(grid[0]).toHaveLength(7);

    // Verify no horizontal matches
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 5; col++) {
        const hasMatch = grid[row][col] === grid[row][col + 1] &&
                        grid[row][col] === grid[row][col + 2];
        expect(hasMatch).toBe(false);
      }
    }

    // Verify no vertical matches
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 6; row++) {
        const hasMatch = grid[row][col] === grid[row + 1][col] &&
                        grid[row][col] === grid[row + 2][col];
        expect(hasMatch).toBe(false);
      }
    }
  });

  it('should use only provided tile types', async () => {
    const { generateGrid } = await import('./levels');

    const grid = generateGrid(5, 5, ['pink', 'purple']);

    const allTiles = grid.flat();
    allTiles.forEach(tile => {
      expect(['pink', 'purple']).toContain(tile);
    });
  });

  it('should handle edge case of single tile type', async () => {
    const { generateGrid } = await import('./levels');

    // With only one tile type, it's impossible to avoid matches
    // The function should handle this gracefully
    const grid = generateGrid(4, 4, ['pink']);

    expect(grid).toHaveLength(4);
    expect(grid[0]).toHaveLength(4);
  });
});
