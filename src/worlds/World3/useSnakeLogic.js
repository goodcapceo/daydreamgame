import { useState, useEffect, useRef, useCallback } from 'react';
import { DIRECTIONS } from '../../utils/constants';
import { useCollision } from '../../engine/useCollision';

export const useSnakeLogic = (levelData, onComplete, onFail) => {
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing');
  const [trail, setTrail] = useState([levelData.startPos]);
  const trailRef = useRef([levelData.startPos]);
  const directionRef = useRef(levelData.startDirection);
  const speedRef = useRef(levelData.initialSpeed);
  const headRef = useRef({ ...levelData.startPos });
  const [orbs, setOrbs] = useState(levelData.orbs);
  const inputBufferRef = useRef(null);
  const { checkAABB } = useCollision();

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
    if (gameState !== 'playing') return;
    let lastTime = Date.now();
    let accumulator = 0;
    const fixedDeltaTime = 1000 / 30;
    let frameId;

    const loop = () => {
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
        headRef.current.x += dir.x * speedRef.current;
        headRef.current.y += dir.y * speedRef.current;

        const newTrail = [{ x: headRef.current.x, y: headRef.current.y }, ...trailRef.current];
        const maxLength = 20 + (levelData.orbs.length - orbs.length) * 5;
        if (newTrail.length > maxLength) newTrail.pop();
        trailRef.current = newTrail;

        if (headRef.current.x < 0 || headRef.current.x > 480 || headRef.current.y < 0 || headRef.current.y > 900) {
          setGameState('failed');
          onFail();
          return;
        }

        const headRect = { x: headRef.current.x - 6, y: headRef.current.y - 6, width: 12, height: 12 };
        const hitBarrier = levelData.barriers.some(barrier => checkAABB(headRect, barrier));
        if (hitBarrier) {
          setGameState('failed');
          onFail();
          return;
        }

        const hitSelf = trailRef.current.slice(5).some(segment => {
          const dx = segment.x - headRef.current.x;
          const dy = segment.y - headRef.current.y;
          return Math.sqrt(dx * dx + dy * dy) < 10;
        });
        if (hitSelf) {
          setGameState('failed');
          onFail();
          return;
        }

        // FIX: Use id-based filtering for orb collection
        setOrbs(prevOrbs => {
          const remaining = prevOrbs.filter(orb => {
            const dx = orb.x - headRef.current.x;
            const dy = orb.y - headRef.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 15) {
              setScore(prev => prev + 20);
              speedRef.current += levelData.speedIncrement;
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
          setGameState('complete');
          const collectedCount = levelData.orbs.length - orbs.length;
          const stars = collectedCount === levelData.orbs.length ? 3 : collectedCount >= levelData.orbs.length - 2 ? 2 : 1;
          onComplete(score, stars);
          return;
        }
        accumulator -= fixedDeltaTime;
      }
      setTrail([...trailRef.current]);
      frameId = requestAnimationFrame(loop);
    };
    loop();
    return () => { if (frameId) cancelAnimationFrame(frameId); };
  }, [gameState, orbs, score, levelData, checkAABB, onComplete, onFail]);

  return { trail, orbs, barriers: levelData.barriers, finishPos: levelData.finishPos, score, gameState, speed: speedRef.current };
};
