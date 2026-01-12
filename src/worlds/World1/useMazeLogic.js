import { useState, useEffect, useRef, useCallback } from 'react';
import { TILES } from '../../utils/constants';
import { useCollision } from '../../engine/useCollision';

const TILE_SIZE = 40;

/**
 * Custom hook for maze game logic in World 1
 * Handles player movement, crystal collection, hazard avoidance
 */
export const useMazeLogic = (levelData, onComplete, onFail, playSound = () => {}, isPaused = false) => {
  const [playerPos, setPlayerPos] = useState(levelData.startPos);
  // Extract initial crystals from grid and store count
  const initialCrystals = (() => {
    const found = [];
    levelData.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === TILES.CRYSTAL) {
          found.push({ id: `${x}-${y}`, x, y });
        }
      });
    });
    return found;
  })();
  const initialCrystalCount = initialCrystals.length;

  const [crystals, setCrystals] = useState(initialCrystals);

  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(levelData.timeLimit);
  const [gameState, setGameState] = useState('playing');
  const [mood, setMood] = useState('idle');
  const [trail, setTrail] = useState([levelData.startPos]); // Track movement trail

  // Track which timer warnings have been played
  const playedWarnings = useRef({ ten: false, five: false, three: false, two: false, one: false });

  // Hazard positions (moving dark patches)
  const [hazards, setHazards] = useState(() =>
    (levelData.hazards || []).map(h => ({ ...h, currentX: h.x, currentY: h.y }))
  );

  const { checkGridCollision, getEntitiesInRadius } = useCollision();

  // Movement handler
  const movePlayer = useCallback((direction) => {
    if (gameState !== 'playing') return;

    const newPos = { ...playerPos };

    switch (direction) {
      case 'UP':
        newPos.y -= 1;
        break;
      case 'DOWN':
        newPos.y += 1;
        break;
      case 'LEFT':
        newPos.x -= 1;
        break;
      case 'RIGHT':
        newPos.x += 1;
        break;
      default:
        return;
    }

    // Check wall collision
    if (checkGridCollision(newPos.x, newPos.y, levelData.grid)) {
      return; // Can't move into wall
    }

    setPlayerPos(newPos);

    // Update trail (keep last 8 positions for visual effect)
    setTrail(prev => {
      const newTrail = [...prev, newPos];
      return newTrail.slice(-8);
    });

    // Check crystal collection - FIX: filter by reference/id instead of index
    const collectedCrystal = crystals.find(c => c.x === newPos.x && c.y === newPos.y);
    if (collectedCrystal) {
      setCrystals(prev => prev.filter(c => c.id !== collectedCrystal.id));
      setScore(prev => prev + 100);
      setMood('happy');
      playSound('collect');
      setTimeout(() => setMood('idle'), 500);
    }

    // Check exit
    if (levelData.grid[newPos.y][newPos.x] === TILES.EXIT) {
      // Calculate how many crystals have been collected (including the one just collected this move)
      const remainingCrystals = crystals.length - (collectedCrystal ? 1 : 0);
      const collectedCount = initialCrystalCount - remainingCrystals;
      if (collectedCount >= levelData.crystalsRequired) {
        setGameState('complete');
        playSound('complete');
        const stars =
          timeRemaining > levelData.timeLimit * 0.7 ? 3 :
          timeRemaining > levelData.timeLimit * 0.4 ? 2 : 1;
        onComplete(score + timeRemaining * 10, stars);
      }
    }

    // Check hazard collision
    const hitHazard = hazards.some(
      h => h.currentX === newPos.x && h.currentY === newPos.y
    );
    if (hitHazard || levelData.grid[newPos.y][newPos.x] === TILES.DARK_PATCH) {
      setGameState('failed');
      playSound('fail');
      onFail();
    }
  }, [playerPos, crystals, hazards, score, timeRemaining, gameState, levelData, checkGridCollision, onComplete, onFail, playSound, initialCrystalCount]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') movePlayer('UP');
      if (e.code === 'ArrowDown' || e.code === 'KeyS') movePlayer('DOWN');
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') movePlayer('LEFT');
      if (e.code === 'ArrowRight' || e.code === 'KeyD') movePlayer('RIGHT');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  // Swipe input
  useEffect(() => {
    let touchStart = null;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStart = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e) => {
      if (!touchStart) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 30) {
        touchStart = null;
        return;
      }

      if (Math.abs(dx) > Math.abs(dy)) {
        movePlayer(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        movePlayer(dy > 0 ? 'DOWN' : 'UP');
      }

      touchStart = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [movePlayer]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setGameState('failed');
          onFail();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, onFail, isPaused]);

  // Timer urgency sounds - escalating warnings as time runs low
  useEffect(() => {
    if (gameState !== 'playing') return;

    // 10 seconds warning - gentle alert
    if (timeRemaining === 10 && !playedWarnings.current.ten) {
      playedWarnings.current.ten = true;
      playSound('warning');
    }

    // 5 seconds warning - more urgent
    if (timeRemaining === 5 && !playedWarnings.current.five) {
      playedWarnings.current.five = true;
      playSound('warning');
    }

    // Final 3 seconds - rapid ticking
    if (timeRemaining === 3 && !playedWarnings.current.three) {
      playedWarnings.current.three = true;
      playSound('tick');
    }

    if (timeRemaining === 2 && !playedWarnings.current.two) {
      playedWarnings.current.two = true;
      playSound('tick');
    }

    if (timeRemaining === 1 && !playedWarnings.current.one) {
      playedWarnings.current.one = true;
      playSound('tick');
    }
  }, [timeRemaining, gameState, playSound]);

  // Hazard movement (using requestAnimationFrame for smoother updates)
  useEffect(() => {
    if (gameState !== 'playing' || isPaused || hazards.length === 0) return;

    let lastTime = Date.now();
    const moveInterval = 350; // Move hazards every 350ms (faster!)
    let frameId;

    const updateHazards = () => {
      const now = Date.now();
      if (now - lastTime >= moveInterval) {
        lastTime = now;

        setHazards(prev => prev.map(hazard => {
          if (hazard.pattern === 'static') return hazard;

          const newHazard = { ...hazard };

          if (hazard.pattern === 'horizontal') {
            newHazard.direction = newHazard.direction || 1;
            newHazard.currentX += newHazard.direction;

            if (Math.abs(newHazard.currentX - hazard.x) >= hazard.range) {
              newHazard.direction *= -1;
            }
          }

          if (hazard.pattern === 'vertical') {
            newHazard.direction = newHazard.direction || 1;
            newHazard.currentY += newHazard.direction;

            if (Math.abs(newHazard.currentY - hazard.y) >= hazard.range) {
              newHazard.direction *= -1;
            }
          }

          // Chase pattern - move towards player
          if (hazard.pattern === 'chase') {
            const dx = playerPos.x - newHazard.currentX;
            const dy = playerPos.y - newHazard.currentY;

            // Move in the direction of the player (one step at a time)
            if (Math.abs(dx) > Math.abs(dy)) {
              const newX = newHazard.currentX + Math.sign(dx);
              // Check if new position is walkable (not a wall)
              if (!checkGridCollision(newX, newHazard.currentY, levelData.grid)) {
                newHazard.currentX = newX;
              }
            } else if (dy !== 0) {
              const newY = newHazard.currentY + Math.sign(dy);
              if (!checkGridCollision(newHazard.currentX, newY, levelData.grid)) {
                newHazard.currentY = newY;
              }
            }
          }

          return newHazard;
        }));
      }

      frameId = requestAnimationFrame(updateHazards);
    };

    frameId = requestAnimationFrame(updateHazards);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [gameState, hazards.length, isPaused, playerPos, levelData.grid, checkGridCollision]);

  // Check if hazards have moved into player position
  useEffect(() => {
    if (gameState !== 'playing') return;

    const hazardHitPlayer = hazards.some(
      h => h.currentX === playerPos.x && h.currentY === playerPos.y
    );

    if (hazardHitPlayer) {
      setGameState('failed');
      playSound('fail');
      onFail();
    }
  }, [hazards, playerPos, gameState, playSound, onFail]);

  // Calculate mood based on nearby hazards (derived state, no effect needed)
  const calculatedMood = (() => {
    // Don't override 'happy' mood (set after collecting crystal)
    if (mood === 'happy') return mood;

    const nearbyHazards = getEntitiesInRadius(
      { x: playerPos.x * TILE_SIZE, y: playerPos.y * TILE_SIZE },
      hazards.map(h => ({ x: h.currentX * TILE_SIZE, y: h.currentY * TILE_SIZE })),
      TILE_SIZE * 2
    );

    return nearbyHazards.length > 0 ? 'worried' : 'idle';
  })();

  return {
    playerPos,
    crystals,
    hazards,
    score,
    timeRemaining,
    gameState,
    mood: calculatedMood,
    trail,
    movePlayer,
    grid: levelData.grid,
    tileSize: TILE_SIZE,
  };
};
