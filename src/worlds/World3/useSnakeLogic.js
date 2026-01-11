import { useState, useEffect, useRef, useCallback } from 'react';
import { DIRECTIONS } from '../../utils/constants';
import { useCollision } from '../../engine/useCollision';

/**
 * Snake game logic hook - uses refs for game loop performance
 * Note: Game loop code intentionally accesses refs during render for performance
 * and to maintain state across animation frames without triggering re-renders.
 * Initialization effect intentionally sets state when levelData becomes available.
 */

export const useSnakeLogic = (levelData, onComplete, onFail, playSound = () => {}) => {
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(3);
  const [gameState, setGameState] = useState('waiting');
  const [trail, setTrail] = useState([]);
  const [orbs, setOrbs] = useState([]);
  const [countdown, setCountdown] = useState(null); // null = no countdown, 3/2/1 = counting

  const trailRef = useRef([]);
  const directionRef = useRef('UP');
  const speedRef = useRef(3);
  const headRef = useRef({ x: 240, y: 800 });
  const orbsRef = useRef([]);
  const scoreRef = useRef(0);
  const inputBufferRef = useRef(null);
  const { checkAABB } = useCollision();

  // Initialize/reset game when levelData changes
  useEffect(() => {
    if (!levelData) return;

    const startTrail = [{ ...levelData.startPos }];
    const startOrbs = [...levelData.orbs];

    // Reset all state - intentional initialization when level loads
    /* eslint-disable react-hooks/set-state-in-effect */
    setScore(0);
    setSpeed(levelData.initialSpeed);
    setTrail(startTrail);
    setOrbs(startOrbs);
    setGameState('countdown');
    setCountdown(3);
    /* eslint-enable react-hooks/set-state-in-effect */

    // Reset all refs
    trailRef.current = startTrail;
    directionRef.current = levelData.startDirection;
    speedRef.current = levelData.initialSpeed;
    headRef.current = { ...levelData.startPos };
    orbsRef.current = startOrbs;
    scoreRef.current = 0;
    inputBufferRef.current = null;
  }, [levelData]);

  // Countdown timer effect
  useEffect(() => {
    if (gameState !== 'countdown' || countdown === null) return;

    if (countdown === 0) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setGameState('playing');
      setCountdown(null);
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }

    const timer = setTimeout(() => {
      playSound('tick');
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState, countdown, playSound]);

  // Keep refs in sync with state for use in game loop
  useEffect(() => {
    orbsRef.current = orbs;
  }, [orbs]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const changeDirection = useCallback((newDirection) => {
    if (gameState !== 'playing') return;
    const current = directionRef.current;
    if (
      (current === 'UP' && newDirection === 'DOWN') ||
      (current === 'DOWN' && newDirection === 'UP') ||
      (current === 'LEFT' && newDirection === 'RIGHT') ||
      (current === 'RIGHT' && newDirection === 'LEFT')
    ) return;
    inputBufferRef.current = newDirection;
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') changeDirection('UP');
      if (e.code === 'ArrowDown' || e.code === 'KeyS') changeDirection('DOWN');
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') changeDirection('LEFT');
      if (e.code === 'ArrowRight' || e.code === 'KeyD') changeDirection('RIGHT');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection]);

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
      if (Math.abs(dx) > Math.abs(dy)) {
        changeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        changeDirection(dy > 0 ? 'DOWN' : 'UP');
      }
      touchStart = null;
    };
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [changeDirection]);

  useEffect(() => {
    if (gameState !== 'playing' || !levelData) return;

    let lastTime = Date.now();
    let accumulator = 0;
    const fixedDeltaTime = 1000 / 30;
    let frameId;
    let isRunning = true;

    const loop = () => {
      if (!isRunning) return;

      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      accumulator += deltaTime;

      while (accumulator >= fixedDeltaTime) {
        if (inputBufferRef.current) {
          directionRef.current = inputBufferRef.current;
          inputBufferRef.current = null;
        }
        const dir = DIRECTIONS[directionRef.current];
        if (!dir) {
          accumulator -= fixedDeltaTime;
          continue;
        }
        headRef.current.x += dir.x * speedRef.current;
        headRef.current.y += dir.y * speedRef.current;

        const newTrail = [{ x: headRef.current.x, y: headRef.current.y }, ...trailRef.current];
        const maxLength = 20 + (levelData.orbs.length - orbsRef.current.length) * 5;
        if (newTrail.length > maxLength) newTrail.pop();
        trailRef.current = newTrail;

        if (headRef.current.x < 0 || headRef.current.x > 480 || headRef.current.y < 0 || headRef.current.y > 900) {
          isRunning = false;
          setGameState('failed');
          playSound('fail');
          onFail();
          return;
        }

        const headRect = { x: headRef.current.x - 6, y: headRef.current.y - 6, width: 12, height: 12 };
        const hitBarrier = levelData.barriers.some(barrier => checkAABB(headRect, barrier));
        if (hitBarrier) {
          isRunning = false;
          setGameState('failed');
          playSound('fail');
          onFail();
          return;
        }

        const hitSelf = trailRef.current.slice(5).some(segment => {
          const dx = segment.x - headRef.current.x;
          const dy = segment.y - headRef.current.y;
          return Math.sqrt(dx * dx + dy * dy) < 10;
        });
        if (hitSelf) {
          isRunning = false;
          setGameState('failed');
          playSound('fail');
          onFail();
          return;
        }

        // Check orb collection using ref
        setOrbs(prevOrbs => {
          const remaining = prevOrbs.filter(orb => {
            const dx = orb.x - headRef.current.x;
            const dy = orb.y - headRef.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 15) {
              setScore(prev => prev + 20);
              speedRef.current += levelData.speedIncrement;
              setSpeed(speedRef.current);
              playSound('orb');
              return false;
            }
            return true;
          });
          return remaining;
        });

        const finishDist = Math.sqrt(
          Math.pow(headRef.current.x - levelData.finishPos.x, 2) +
          Math.pow(headRef.current.y - levelData.finishPos.y, 2)
        );
        if (finishDist < 20) {
          isRunning = false;
          setGameState('complete');
          playSound('complete');
          const collectedCount = levelData.orbs.length - orbsRef.current.length;
          const stars = collectedCount === levelData.orbs.length ? 3 : collectedCount >= levelData.orbs.length - 2 ? 2 : 1;
          onComplete(scoreRef.current, stars);
          return;
        }
        accumulator -= fixedDeltaTime;
      }
      setTrail([...trailRef.current]);
      frameId = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      isRunning = false;
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [gameState, levelData, checkAABB, onComplete, onFail, playSound]);

  return {
    trail,
    orbs,
    barriers: levelData?.barriers || [],
    finishPos: levelData?.finishPos || { x: 0, y: 0 },
    score,
    gameState,
    speed,
    countdown,
  };
};
