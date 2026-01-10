import { useEffect, useRef, useCallback } from 'react';
import { KEYS } from '../utils/constants';

/**
 * Unified input hook for keyboard, touch, and swipe
 * Returns: { getDirection, isKeyPressed }
 *
 * FIX: Combined touchend handlers to prevent double-processing
 */
export const useInput = (enabled = true) => {
  const directionRef = useRef(null);
  const touchStartRef = useRef(null);
  const keysPressed = useRef(new Set());

  // Keyboard handling
  const handleKeyDown = useCallback((e) => {
    if (!enabled) return;

    if (KEYS.UP.includes(e.code)) {
      directionRef.current = 'UP';
      keysPressed.current.add('UP');
    } else if (KEYS.DOWN.includes(e.code)) {
      directionRef.current = 'DOWN';
      keysPressed.current.add('DOWN');
    } else if (KEYS.LEFT.includes(e.code)) {
      directionRef.current = 'LEFT';
      keysPressed.current.add('LEFT');
    } else if (KEYS.RIGHT.includes(e.code)) {
      directionRef.current = 'RIGHT';
      keysPressed.current.add('RIGHT');
    } else if (KEYS.SPACE.includes(e.code)) {
      directionRef.current = 'ACTION';
      keysPressed.current.add('ACTION');
    }
  }, [enabled]);

  const handleKeyUp = useCallback((e) => {
    if (KEYS.UP.includes(e.code)) {
      keysPressed.current.delete('UP');
    } else if (KEYS.DOWN.includes(e.code)) {
      keysPressed.current.delete('DOWN');
    } else if (KEYS.LEFT.includes(e.code)) {
      keysPressed.current.delete('LEFT');
    } else if (KEYS.RIGHT.includes(e.code)) {
      keysPressed.current.delete('RIGHT');
    } else if (KEYS.SPACE.includes(e.code)) {
      keysPressed.current.delete('ACTION');
    }

    // Clear direction if no keys pressed
    if (keysPressed.current.size === 0) {
      directionRef.current = null;
    }
  }, []);

  // Touch/Swipe handling
  const handleTouchStart = useCallback((e) => {
    if (!enabled) return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, [enabled]);

  // FIX: Combined touchend handler for both tap and swipe
  const handleTouchEnd = useCallback((e) => {
    if (!enabled || !touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const time = Date.now() - touchStartRef.current.time;

    // Check for tap first (quick touch, minimal movement)
    if (time < 300 && distance < 10) {
      directionRef.current = 'ACTION';
    } else if (distance >= 30) {
      // Swipe detected
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        directionRef.current = dx > 0 ? 'RIGHT' : 'LEFT';
      } else {
        // Vertical swipe
        directionRef.current = dy > 0 ? 'DOWN' : 'UP';
      }
    }

    touchStartRef.current = null;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleKeyDown, handleKeyUp, handleTouchStart, handleTouchEnd]);

  const getDirection = useCallback(() => {
    const dir = directionRef.current;
    directionRef.current = null; // Consume direction
    return dir;
  }, []);

  const isKeyPressed = useCallback((key) => {
    return keysPressed.current.has(key);
  }, []);

  return {
    getDirection,
    isKeyPressed,
  };
};

/**
 * Simplified swipe-only input for touch devices
 * Better for World 1 (maze) where discrete moves are needed
 */
export const useSwipeInput = (onSwipe) => {
  const touchStartRef = useRef(null);

  useEffect(() => {
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    };

    const handleTouchEnd = (e) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 30) {
        touchStartRef.current = null;
        return;
      }

      let direction;
      if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? 'RIGHT' : 'LEFT';
      } else {
        direction = dy > 0 ? 'DOWN' : 'UP';
      }

      onSwipe(direction);
      touchStartRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipe]);
};
