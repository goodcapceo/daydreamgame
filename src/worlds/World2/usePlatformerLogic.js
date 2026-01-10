import { useState, useEffect, useRef, useCallback } from 'react';
import { PHYSICS } from '../../utils/constants';
import { useCollision } from '../../engine/useCollision';

/**
 * Custom hook for platformer game logic in World 2
 * Handles physics, jumping, platform collision, star collection
 */
export const usePlatformerLogic = (levelData, onComplete, onFail) => {
  const [player, setPlayer] = useState({
    x: levelData.startPos.x,
    y: levelData.startPos.y,
    vx: 0,
    vy: 0,
    width: 36,
    height: 36,
    grounded: false,
  });

  const [platforms, setPlatforms] = useState(() =>
    levelData.platforms.map(p => ({
      ...p,
      originalX: p.x,
      moveDirection: 1,
    }))
  );

  // FIX: Use id-based tracking for stars
  const [stars, setStars] = useState(() =>
    levelData.stars.map(s => ({ ...s }))
  );

  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing');

  const keysRef = useRef({ left: false, right: false });
  const previousYRef = useRef(player.y);

  const { checkPlatformCollision } = useCollision();

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = true;
      if ((e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') && player.grounded) {
        setPlayer(prev => ({ ...prev, vy: PHYSICS.JUMP_STRENGTH, grounded: false }));
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [player.grounded]);

  // Touch controls
  useEffect(() => {
    let touchStartX = null;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;

      // Tap to jump
      if (player.grounded) {
        setPlayer(prev => ({ ...prev, vy: PHYSICS.JUMP_STRENGTH, grounded: false }));
      }
    };

    const handleTouchMove = (e) => {
      if (touchStartX === null) return;

      const touch = e.touches[0];
      const dx = touch.clientX - touchStartX;

      keysRef.current.left = dx < -30;
      keysRef.current.right = dx > 30;
    };

    const handleTouchEnd = () => {
      touchStartX = null;
      keysRef.current.left = false;
      keysRef.current.right = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [player.grounded]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let frameId;
    let lastTime = Date.now();

    const gameLoop = () => {
      const currentTime = Date.now();
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 2);
      lastTime = currentTime;

      setPlayer(prev => {
        let newPlayer = { ...prev };

        // Horizontal movement
        if (keysRef.current.left) newPlayer.vx = -PHYSICS.HORIZONTAL_SPEED;
        else if (keysRef.current.right) newPlayer.vx = PHYSICS.HORIZONTAL_SPEED;
        else newPlayer.vx = 0;

        // Apply gravity
        newPlayer.vy = Math.min(newPlayer.vy + PHYSICS.GRAVITY * deltaTime, PHYSICS.MAX_FALL_SPEED);

        // Store previous Y for platform collision
        previousYRef.current = newPlayer.y;

        // Apply velocity
        newPlayer.x += newPlayer.vx * deltaTime;
        newPlayer.y += newPlayer.vy * deltaTime;

        // Screen boundaries
        newPlayer.x = Math.max(0, Math.min(480 - newPlayer.width, newPlayer.x));

        // Fell off screen
        if (newPlayer.y > 900) {
          setGameState('failed');
          onFail();
          return prev;
        }

        // Platform collision
        newPlayer.grounded = false;

        platforms.forEach(platform => {
          if (
            checkPlatformCollision(
              newPlayer,
              platform,
              previousYRef.current
            )
          ) {
            // Cloud platforms only collide from above
            if (platform.type === 'cloud' && newPlayer.vy < 0) return;

            newPlayer.y = platform.y - newPlayer.height;
            newPlayer.vy = 0;
            newPlayer.grounded = true;

            // Check finish
            if (platform.type === 'finish') {
              setGameState('complete');
              const collectedCount = levelData.stars.length - stars.length;
              const starRating = collectedCount >= 3 ? 3 : collectedCount >= 2 ? 2 : 1;
              onComplete(score + collectedCount * 100, starRating);
            }
          }
        });

        return newPlayer;
      });

      // FIX: Star collision - filter by id instead of index
      setStars(prevStars => {
        const remaining = prevStars.filter(star => {
          const dx = star.x - (player.x + player.width / 2);
          const dy = star.y - (player.y + player.height / 2);
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 30) {
            setScore(prev => prev + 100);
            return false; // Remove this star
          }
          return true;
        });

        return remaining;
      });

      // Move platforms
      setPlatforms(prevPlatforms =>
        prevPlatforms.map(platform => {
          if (platform.type !== 'moving') return platform;

          let newX = platform.x + platform.speed * platform.moveDirection * deltaTime;

          if (newX > platform.originalX + platform.moveX) {
            newX = platform.originalX + platform.moveX;
            platform.moveDirection = -1;
          } else if (newX < platform.originalX) {
            newX = platform.originalX;
            platform.moveDirection = 1;
          }

          return { ...platform, x: newX };
        })
      );

      frameId = requestAnimationFrame(gameLoop);
    };

    frameId = requestAnimationFrame(gameLoop);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [gameState, platforms, stars, score, player, levelData, checkPlatformCollision, onComplete, onFail]);

  return {
    player,
    platforms,
    stars,
    score,
    gameState,
  };
};
