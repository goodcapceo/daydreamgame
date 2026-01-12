import { useState, useEffect, useRef } from 'react';
import { PHYSICS } from '../../utils/constants';
import { useCollision } from '../../engine/useCollision';

/**
 * Custom hook for platformer game logic in World 2
 * Handles physics, jumping, platform collision, star collection
 */
export const usePlatformerLogic = (levelData, onComplete, onFail, playSound = () => {}, isPaused = false) => {
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
  const initialStarCount = levelData.stars.length;
  const starsRef = useRef(stars);

  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing');

  const keysRef = useRef({ left: false, right: false });
  const previousYRef = useRef(player.y);
  const groundedRef = useRef(player.grounded);
  const playerRef = useRef(player);
  const canDoubleJumpRef = useRef(false); // Track if double jump is available
  const playerVyRef = useRef(player.vy);

  const { checkPlatformCollision } = useCollision();

  // Keep refs in sync via useEffect (not during render)
  useEffect(() => {
    starsRef.current = stars;
  }, [stars]);

  useEffect(() => {
    groundedRef.current = player.grounded;
    playerRef.current = player;
    playerVyRef.current = player.vy;

    // Reset double jump when player lands
    if (player.grounded) {
      canDoubleJumpRef.current = true;
    }
  }, [player]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = true;

      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        if (groundedRef.current) {
          // First jump from ground
          setPlayer(prev => ({ ...prev, vy: PHYSICS.JUMP_STRENGTH, grounded: false }));
          playSound('jump');
        } else if (canDoubleJumpRef.current && playerVyRef.current > -3) {
          // Double jump - only when near peak of jump (vy > -3 means slowing down or falling)
          canDoubleJumpRef.current = false;
          setPlayer(prev => ({ ...prev, vy: PHYSICS.JUMP_STRENGTH * 0.85 }));
          playSound('jump');
        }
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
  }, [playSound]);

  // Touch controls
  useEffect(() => {
    let touchStartX = null;

    const handleTouchStart = (e) => {
      // Prevent default to stop text selection and double-tap zoom
      e.preventDefault();

      const touch = e.touches[0];
      touchStartX = touch.clientX;

      // Tap to jump
      if (groundedRef.current) {
        // First jump from ground
        setPlayer(prev => ({ ...prev, vy: PHYSICS.JUMP_STRENGTH, grounded: false }));
        playSound('jump');
      } else if (canDoubleJumpRef.current && playerVyRef.current > -3) {
        // Double jump - only when near peak of jump (vy > -3 means slowing down or falling)
        canDoubleJumpRef.current = false;
        setPlayer(prev => ({ ...prev, vy: PHYSICS.JUMP_STRENGTH * 0.85 }));
        playSound('jump');
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

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [playSound]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;

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
          playSound('fail');
          onFail();
          return prev;
        }

        // Update ref synchronously for star collision
        playerRef.current = newPlayer;

        // Star collision - check and update stars inline
        const currentStars = starsRef.current;
        const newStars = currentStars.filter(star => {
          const dx = star.x - (newPlayer.x + newPlayer.width / 2);
          const dy = star.y - (newPlayer.y + newPlayer.height / 2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 30) {
            setScore(prevScore => prevScore + 100);
            playSound('collect');
            return false;
          }
          return true;
        });
        if (newStars.length !== currentStars.length) {
          starsRef.current = newStars;
          setStars(newStars);
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
              playSound('complete');
              // Use ref to get current stars count for accurate calculation
              const collectedCount = initialStarCount - starsRef.current.length;
              const starRating = collectedCount >= 3 ? 3 : collectedCount >= 2 ? 2 : 1;
              onComplete(score + collectedCount * 100, starRating);
            }
          }
        });

        return newPlayer;
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
  }, [gameState, platforms, stars, score, player, levelData, checkPlatformCollision, onComplete, onFail, playSound, initialStarCount, isPaused]);

  // Calculate camera offset to follow player (keep player visible in viewport)
  // Player should appear roughly in the middle-lower part of the screen
  const VIEWPORT_CENTER = 400; // Approximate center point where player should appear
  const MAX_CAMERA_Y = 500; // Don't scroll too far down
  // Clamp camera to avoid shake at extremes
  const rawCameraY = player.y - VIEWPORT_CENTER;
  const cameraY = Math.max(0, Math.min(rawCameraY, MAX_CAMERA_Y));

  return {
    player,
    platforms,
    stars,
    score,
    gameState,
    cameraY,
  };
};
