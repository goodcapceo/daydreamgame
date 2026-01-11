import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCollision } from './useCollision';

describe('useCollision', () => {
  describe('checkAABB - Axis-Aligned Bounding Box Collision', () => {
    it('should detect collision when rectangles overlap', () => {
      const { result } = renderHook(() => useCollision());
      const rect1 = { x: 0, y: 0, width: 50, height: 50 };
      const rect2 = { x: 25, y: 25, width: 50, height: 50 };

      expect(result.current.checkAABB(rect1, rect2)).toBe(true);
    });

    it('should detect collision when rectangles share an edge', () => {
      const { result } = renderHook(() => useCollision());
      const rect1 = { x: 0, y: 0, width: 50, height: 50 };
      const rect2 = { x: 49, y: 0, width: 50, height: 50 };

      expect(result.current.checkAABB(rect1, rect2)).toBe(true);
    });

    it('should not detect collision when rectangles are separate horizontally', () => {
      const { result } = renderHook(() => useCollision());
      const rect1 = { x: 0, y: 0, width: 50, height: 50 };
      const rect2 = { x: 100, y: 0, width: 50, height: 50 };

      expect(result.current.checkAABB(rect1, rect2)).toBe(false);
    });

    it('should not detect collision when rectangles are separate vertically', () => {
      const { result } = renderHook(() => useCollision());
      const rect1 = { x: 0, y: 0, width: 50, height: 50 };
      const rect2 = { x: 0, y: 100, width: 50, height: 50 };

      expect(result.current.checkAABB(rect1, rect2)).toBe(false);
    });

    it('should detect collision when one rectangle contains another', () => {
      const { result } = renderHook(() => useCollision());
      const rect1 = { x: 0, y: 0, width: 100, height: 100 };
      const rect2 = { x: 25, y: 25, width: 25, height: 25 };

      expect(result.current.checkAABB(rect1, rect2)).toBe(true);
    });

    it('should detect collision with zero-width rectangles overlapping', () => {
      const { result } = renderHook(() => useCollision());
      const rect1 = { x: 50, y: 0, width: 0, height: 50 };
      const rect2 = { x: 25, y: 25, width: 50, height: 50 };

      expect(result.current.checkAABB(rect1, rect2)).toBe(true);
    });

    it('should handle negative coordinates', () => {
      const { result } = renderHook(() => useCollision());
      const rect1 = { x: -50, y: -50, width: 100, height: 100 };
      const rect2 = { x: -25, y: -25, width: 50, height: 50 };

      expect(result.current.checkAABB(rect1, rect2)).toBe(true);
    });

    it('should not detect collision when rectangles just touch (no overlap)', () => {
      const { result } = renderHook(() => useCollision());
      const rect1 = { x: 0, y: 0, width: 50, height: 50 };
      const rect2 = { x: 50, y: 0, width: 50, height: 50 };

      expect(result.current.checkAABB(rect1, rect2)).toBe(false);
    });
  });

  describe('pointInRect - Point in Rectangle Detection', () => {
    it('should detect point inside rectangle', () => {
      const { result } = renderHook(() => useCollision());
      const point = { x: 25, y: 25 };
      const rect = { x: 0, y: 0, width: 50, height: 50 };

      expect(result.current.pointInRect(point, rect)).toBe(true);
    });

    it('should detect point on rectangle edge', () => {
      const { result } = renderHook(() => useCollision());
      const point = { x: 0, y: 25 };
      const rect = { x: 0, y: 0, width: 50, height: 50 };

      expect(result.current.pointInRect(point, rect)).toBe(true);
    });

    it('should detect point on rectangle corner', () => {
      const { result } = renderHook(() => useCollision());
      const point = { x: 50, y: 50 };
      const rect = { x: 0, y: 0, width: 50, height: 50 };

      expect(result.current.pointInRect(point, rect)).toBe(true);
    });

    it('should not detect point outside rectangle', () => {
      const { result } = renderHook(() => useCollision());
      const point = { x: 100, y: 100 };
      const rect = { x: 0, y: 0, width: 50, height: 50 };

      expect(result.current.pointInRect(point, rect)).toBe(false);
    });

    it('should not detect point just outside rectangle', () => {
      const { result } = renderHook(() => useCollision());
      const point = { x: 51, y: 25 };
      const rect = { x: 0, y: 0, width: 50, height: 50 };

      expect(result.current.pointInRect(point, rect)).toBe(false);
    });

    it('should handle negative coordinates', () => {
      const { result } = renderHook(() => useCollision());
      const point = { x: -25, y: -25 };
      const rect = { x: -50, y: -50, width: 50, height: 50 };

      expect(result.current.pointInRect(point, rect)).toBe(true);
    });
  });

  describe('circleRectCollision - Circle to Rectangle Collision', () => {
    it('should detect collision when circle center is inside rectangle', () => {
      const { result } = renderHook(() => useCollision());
      const circle = { x: 25, y: 25, radius: 10 };
      const rect = { x: 0, y: 0, width: 50, height: 50 };

      expect(result.current.circleRectCollision(circle, rect)).toBe(true);
    });

    it('should detect collision when circle overlaps rectangle edge', () => {
      const { result } = renderHook(() => useCollision());
      const circle = { x: 60, y: 25, radius: 15 };
      const rect = { x: 0, y: 0, width: 50, height: 50 };

      expect(result.current.circleRectCollision(circle, rect)).toBe(true);
    });

    it('should detect collision when circle overlaps rectangle corner', () => {
      const { result } = renderHook(() => useCollision());
      const circle = { x: 55, y: 55, radius: 10 };
      const rect = { x: 0, y: 0, width: 50, height: 50 };

      expect(result.current.circleRectCollision(circle, rect)).toBe(true);
    });

    it('should not detect collision when circle is far from rectangle', () => {
      const { result } = renderHook(() => useCollision());
      const circle = { x: 100, y: 100, radius: 10 };
      const rect = { x: 0, y: 0, width: 50, height: 50 };

      expect(result.current.circleRectCollision(circle, rect)).toBe(false);
    });

    it('should not detect collision when circle just misses corner', () => {
      const { result } = renderHook(() => useCollision());
      // Distance from (50,50) to (60,60) is sqrt(200) ≈ 14.14, so radius 10 misses
      const circle = { x: 60, y: 60, radius: 10 };
      const rect = { x: 0, y: 0, width: 50, height: 50 };

      expect(result.current.circleRectCollision(circle, rect)).toBe(false);
    });

    it('should detect collision when circle exactly touches rectangle edge', () => {
      const { result } = renderHook(() => useCollision());
      const circle = { x: 60, y: 25, radius: 10 };
      const rect = { x: 0, y: 0, width: 50, height: 50 };

      // Circle edge at x=50 touches rect edge at x=50
      expect(result.current.circleRectCollision(circle, rect)).toBe(true);
    });

    it('should handle zero radius circles', () => {
      const { result } = renderHook(() => useCollision());
      const circle = { x: 25, y: 25, radius: 0 };
      const rect = { x: 0, y: 0, width: 50, height: 50 };

      expect(result.current.circleRectCollision(circle, rect)).toBe(false);
    });
  });

  describe('checkGridCollision - Grid-based Collision', () => {
    const testGrid = [
      [0, 0, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [1, 0, 0, 1],
    ];

    it('should detect collision with wall (1)', () => {
      const { result } = renderHook(() => useCollision());

      expect(result.current.checkGridCollision(2, 0, testGrid)).toBe(true);
      expect(result.current.checkGridCollision(1, 1, testGrid)).toBe(true);
      expect(result.current.checkGridCollision(2, 1, testGrid)).toBe(true);
    });

    it('should not detect collision with empty cell (0)', () => {
      const { result } = renderHook(() => useCollision());

      expect(result.current.checkGridCollision(0, 0, testGrid)).toBe(false);
      expect(result.current.checkGridCollision(1, 0, testGrid)).toBe(false);
      expect(result.current.checkGridCollision(2, 2, testGrid)).toBe(false);
    });

    it('should detect collision when out of bounds (negative x)', () => {
      const { result } = renderHook(() => useCollision());

      expect(result.current.checkGridCollision(-1, 0, testGrid)).toBe(true);
    });

    it('should detect collision when out of bounds (negative y)', () => {
      const { result } = renderHook(() => useCollision());

      expect(result.current.checkGridCollision(0, -1, testGrid)).toBe(true);
    });

    it('should detect collision when out of bounds (x >= width)', () => {
      const { result } = renderHook(() => useCollision());

      expect(result.current.checkGridCollision(4, 0, testGrid)).toBe(true);
    });

    it('should detect collision when out of bounds (y >= height)', () => {
      const { result } = renderHook(() => useCollision());

      expect(result.current.checkGridCollision(0, 4, testGrid)).toBe(true);
    });
  });

  describe('checkPlatformCollision - Platform Collision from Above', () => {
    it('should detect collision when player lands on platform from above', () => {
      const { result } = renderHook(() => useCollision());
      const player = { x: 50, y: 100, width: 36, height: 36 };
      const platform = { x: 0, y: 130, width: 200, height: 20 };
      const previousY = 90; // Was above platform

      expect(result.current.checkPlatformCollision(player, platform, previousY)).toBe(true);
    });

    it('should not detect collision when player is rising through platform', () => {
      const { result } = renderHook(() => useCollision());
      const player = { x: 50, y: 100, width: 36, height: 36 };
      const platform = { x: 0, y: 130, width: 200, height: 20 };
      const previousY = 140; // Was below platform (rising)

      expect(result.current.checkPlatformCollision(player, platform, previousY)).toBe(false);
    });

    it('should not detect collision when player is horizontally off platform', () => {
      const { result } = renderHook(() => useCollision());
      const player = { x: 300, y: 100, width: 36, height: 36 };
      const platform = { x: 0, y: 130, width: 200, height: 20 };
      const previousY = 90;

      expect(result.current.checkPlatformCollision(player, platform, previousY)).toBe(false);
    });

    it('should detect collision when player edge touches platform edge', () => {
      const { result } = renderHook(() => useCollision());
      const player = { x: 164, y: 100, width: 36, height: 36 }; // Right edge at 200
      const platform = { x: 0, y: 130, width: 200, height: 20 };
      const previousY = 90;

      expect(result.current.checkPlatformCollision(player, platform, previousY)).toBe(true);
    });

    it('should not detect collision when player completely above platform', () => {
      const { result } = renderHook(() => useCollision());
      const player = { x: 50, y: 50, width: 36, height: 36 }; // Bottom at 86
      const platform = { x: 0, y: 130, width: 200, height: 20 };
      const previousY = 40;

      expect(result.current.checkPlatformCollision(player, platform, previousY)).toBe(false);
    });
  });

  describe('getEntitiesInRadius - Proximity Detection', () => {
    const entities = [
      { x: 10, y: 10 },
      { x: 50, y: 50 },
      { x: 100, y: 100 },
      { x: 200, y: 200 },
    ];

    it('should find entities within radius', () => {
      const { result } = renderHook(() => useCollision());
      const center = { x: 0, y: 0 };

      const nearby = result.current.getEntitiesInRadius(center, entities, 20);

      expect(nearby).toHaveLength(1);
      expect(nearby[0]).toEqual({ x: 10, y: 10 });
    });

    it('should find multiple entities within radius', () => {
      const { result } = renderHook(() => useCollision());
      const center = { x: 50, y: 50 };

      const nearby = result.current.getEntitiesInRadius(center, entities, 100);

      expect(nearby).toHaveLength(3);
    });

    it('should return empty array when no entities in radius', () => {
      const { result } = renderHook(() => useCollision());
      const center = { x: 500, y: 500 };

      const nearby = result.current.getEntitiesInRadius(center, entities, 50);

      expect(nearby).toHaveLength(0);
    });

    it('should include entities exactly on radius boundary', () => {
      const { result } = renderHook(() => useCollision());
      const center = { x: 0, y: 0 };
      // Distance from (0,0) to (10,10) is sqrt(200) ≈ 14.14

      const nearby = result.current.getEntitiesInRadius(center, entities, 14.15);

      expect(nearby).toHaveLength(1);
    });

    it('should handle zero radius', () => {
      const { result } = renderHook(() => useCollision());
      const center = { x: 10, y: 10 };

      const nearby = result.current.getEntitiesInRadius(center, entities, 0);

      expect(nearby).toHaveLength(1); // Only exact match
    });

    it('should handle empty entities array', () => {
      const { result } = renderHook(() => useCollision());
      const center = { x: 0, y: 0 };

      const nearby = result.current.getEntitiesInRadius(center, [], 100);

      expect(nearby).toHaveLength(0);
    });
  });

  describe('Hook Stability', () => {
    it('should return stable function references (memoization)', () => {
      const { result, rerender } = renderHook(() => useCollision());

      const firstCheckAABB = result.current.checkAABB;
      const firstPointInRect = result.current.pointInRect;
      const firstCircleRectCollision = result.current.circleRectCollision;

      rerender();

      expect(result.current.checkAABB).toBe(firstCheckAABB);
      expect(result.current.pointInRect).toBe(firstPointInRect);
      expect(result.current.circleRectCollision).toBe(firstCircleRectCollision);
    });
  });
});
