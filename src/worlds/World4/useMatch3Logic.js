import { useState, useCallback, useEffect, useRef } from 'react';
import { generateGrid } from './levels';

const ANIMATION_DURATION = {
  swap: 150,
  match: 200,
  fall: 300,
};

export const useMatch3Logic = (levelData, onComplete, onFail, playSound = () => {}) => {
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(levelData.moves);
  const [gameState, setGameState] = useState('playing');
  const [grid, setGrid] = useState(() => generateGrid(levelData.gridSize.rows, levelData.gridSize.cols, levelData.tileTypes));
  const [collected, setCollected] = useState({ pink: 0, purple: 0, yellow: 0 });
  const [lastMatchPoints, setLastMatchPoints] = useState(null); // { points, x, y } for floating indicator

  // Drag state
  const [dragging, setDragging] = useState(null); // { row, col, startX, startY }
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Animation state
  const [animationPhase, setAnimationPhase] = useState('idle'); // 'idle' | 'swapping' | 'matching' | 'falling'
  const [swappingTiles, setSwappingTiles] = useState(null); // { from: {row, col}, to: {row, col} }
  const [matchingTiles, setMatchingTiles] = useState([]); // Array of {row, col}
  const [fallingColumns, setFallingColumns] = useState([]); // Array of column indices

  const animationTimeoutRef = useRef(null);

  const areAdjacent = (pos1, pos2) => {
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };

  const findMatches = (currentGrid) => {
    const matches = [];
    // Horizontal matches
    for (let row = 0; row < currentGrid.length; row++) {
      for (let col = 0; col < currentGrid[0].length - 2; col++) {
        const tile = currentGrid[row][col];
        if (!tile) continue;
        let matchLength = 1;
        for (let i = 1; col + i < currentGrid[0].length; i++) {
          if (currentGrid[row][col + i] === tile) matchLength++;
          else break;
        }
        if (matchLength >= 3) {
          for (let i = 0; i < matchLength; i++) matches.push({ row, col: col + i, type: tile });
        }
      }
    }
    // Vertical matches
    for (let col = 0; col < currentGrid[0].length; col++) {
      for (let row = 0; row < currentGrid.length - 2; row++) {
        const tile = currentGrid[row][col];
        if (!tile) continue;
        let matchLength = 1;
        for (let i = 1; row + i < currentGrid.length; i++) {
          if (currentGrid[row + i][col] === tile) matchLength++;
          else break;
        }
        if (matchLength >= 3) {
          for (let i = 0; i < matchLength; i++) matches.push({ row: row + i, col, type: tile });
        }
      }
    }
    // Remove duplicates
    const uniqueMatches = [];
    matches.forEach(match => {
      const exists = uniqueMatches.some(m => m.row === match.row && m.col === match.col);
      if (!exists) uniqueMatches.push(match);
    });
    return uniqueMatches;
  };

  const applyGravity = useCallback((currentGrid) => {
    const newGrid = currentGrid.map(row => [...row]);
    const affectedColumns = [];

    for (let col = 0; col < newGrid[0].length; col++) {
      const column = [];
      let hasEmpty = false;
      for (let row = newGrid.length - 1; row >= 0; row--) {
        if (newGrid[row][col]) {
          column.push(newGrid[row][col]);
        } else {
          hasEmpty = true;
        }
      }
      if (hasEmpty) affectedColumns.push(col);
      for (let row = newGrid.length - 1; row >= 0; row--) {
        if (column.length > 0) {
          newGrid[row][col] = column.shift();
        } else {
          newGrid[row][col] = levelData.tileTypes[Math.floor(Math.random() * levelData.tileTypes.length)];
        }
      }
    }
    return { grid: newGrid, affectedColumns };
  }, [levelData.tileTypes]);

  const processMatchesAnimated = useCallback(async (currentGrid, collectedSoFar) => {
    let newGrid = currentGrid.map(row => [...row]);
    let totalMatches = 0;
    let newCollected = { ...collectedSoFar };

    const processOneRound = () => {
      return new Promise((resolve) => {
        const matches = findMatches(newGrid);
        if (matches.length === 0) {
          resolve(false);
          return;
        }

        // Show matching animation
        setMatchingTiles(matches);
        setAnimationPhase('matching');

        setTimeout(() => {
          // Clear matched tiles
          matches.forEach(match => {
            newGrid[match.row][match.col] = null;
            newCollected[match.type]++;
            totalMatches++;
          });

          // Apply gravity with animation
          const { grid: afterGravity, affectedColumns } = applyGravity(newGrid);
          newGrid = afterGravity;

          setMatchingTiles([]);
          setFallingColumns(affectedColumns);
          setAnimationPhase('falling');
          setGrid([...newGrid.map(row => [...row])]);

          setTimeout(() => {
            setFallingColumns([]);
            setAnimationPhase('idle');
            resolve(true);
          }, ANIMATION_DURATION.fall);
        }, ANIMATION_DURATION.match);
      });
    };

    // Process matches in sequence
    let hasMoreMatches = true;
    while (hasMoreMatches) {
      hasMoreMatches = await processOneRound();
    }

    if (totalMatches > 0) {
      const points = totalMatches * 10;
      setScore(prev => prev + points);
      setCollected(newCollected);
      playSound('match');
      // Show floating point indicator
      setLastMatchPoints({ points, id: Date.now() });
      setTimeout(() => setLastMatchPoints(null), 1000);
    }

    return { grid: newGrid, collected: newCollected };
  }, [applyGravity, playSound]);

  const performSwap = useCallback(async (from, to) => {
    if (animationPhase !== 'idle') return;

    // Start swap animation
    setSwappingTiles({ from, to });
    setAnimationPhase('swapping');

    // Create swapped grid
    const newGrid = grid.map(r => [...r]);
    const temp = newGrid[from.row][from.col];
    newGrid[from.row][from.col] = newGrid[to.row][to.col];
    newGrid[to.row][to.col] = temp;

    // Check if valid move
    const matches = findMatches(newGrid);

    await new Promise(resolve => setTimeout(resolve, ANIMATION_DURATION.swap));

    if (matches.length > 0) {
      // Valid move
      setGrid(newGrid);
      setMoves(prev => prev - 1);
      setSwappingTiles(null);
      setAnimationPhase('idle');

      // Process matches with animation
      await processMatchesAnimated(newGrid, collected);
    } else {
      // Invalid move - swap back
      setSwappingTiles({ from: to, to: from });
      await new Promise(resolve => setTimeout(resolve, ANIMATION_DURATION.swap));
      setSwappingTiles(null);
      setAnimationPhase('idle');
    }
  }, [grid, collected, animationPhase, processMatchesAnimated]);

  // Drag handlers
  const handleDragStart = useCallback((row, col, clientX, clientY) => {
    if (gameState !== 'playing' || animationPhase !== 'idle') return;
    setDragging({ row, col, startX: clientX, startY: clientY });
    setDragOffset({ x: 0, y: 0 });
  }, [gameState, animationPhase]);

  const handleDragMove = useCallback((clientX, clientY) => {
    if (!dragging) return;

    const dx = clientX - dragging.startX;
    const dy = clientY - dragging.startY;

    // Constrain to one direction
    const TILE_SIZE = 50;
    const threshold = TILE_SIZE * 0.5;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal drag
      const constrainedX = Math.max(-TILE_SIZE, Math.min(TILE_SIZE, dx));
      setDragOffset({ x: constrainedX, y: 0 });

      // Check if we should trigger swap
      if (Math.abs(dx) > threshold) {
        const targetCol = dx > 0 ? dragging.col + 1 : dragging.col - 1;
        if (targetCol >= 0 && targetCol < grid[0].length) {
          setDragging(null);
          setDragOffset({ x: 0, y: 0 });
          performSwap(
            { row: dragging.row, col: dragging.col },
            { row: dragging.row, col: targetCol }
          );
        }
      }
    } else {
      // Vertical drag
      const constrainedY = Math.max(-TILE_SIZE, Math.min(TILE_SIZE, dy));
      setDragOffset({ x: 0, y: constrainedY });

      // Check if we should trigger swap
      if (Math.abs(dy) > threshold) {
        const targetRow = dy > 0 ? dragging.row + 1 : dragging.row - 1;
        if (targetRow >= 0 && targetRow < grid.length) {
          setDragging(null);
          setDragOffset({ x: 0, y: 0 });
          performSwap(
            { row: dragging.row, col: dragging.col },
            { row: targetRow, col: dragging.col }
          );
        }
      }
    }
  }, [dragging, grid, performSwap]);

  const handleDragEnd = useCallback(() => {
    setDragging(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Legacy click handler (for accessibility)
  const [selected, setSelected] = useState(null);
  const handleTileClick = useCallback((row, col) => {
    if (gameState !== 'playing' || animationPhase !== 'idle') return;
    if (!selected) {
      setSelected({ row, col });
      return;
    }
    if (!areAdjacent(selected, { row, col })) {
      setSelected({ row, col });
      return;
    }
    performSwap(selected, { row, col });
    setSelected(null);
  }, [selected, gameState, animationPhase, performSwap]);

  // Win/lose condition check - runs after each match
  useEffect(() => {
    if (gameState !== 'playing' || animationPhase !== 'idle') return;

    // Check win condition first (can win even with moves remaining)
    if (levelData.objective.type === 'score') {
      if (score >= levelData.objective.target) {
        setGameState('complete');
        playSound('complete');
        const stars = score >= levelData.objective.target * 1.5 ? 3 : score >= levelData.objective.target * 1.2 ? 2 : 1;
        onComplete(score, stars);
        return;
      }
    } else if (levelData.objective.type === 'collect') {
      const allCollected = Object.entries(levelData.objective.targets).every(([type, target]) => collected[type] >= target);
      if (allCollected) {
        setGameState('complete');
        playSound('complete');
        const movesBonus = moves > 0 ? Math.min(3, Math.floor(moves / 3) + 1) : 1;
        onComplete(score, movesBonus);
        return;
      }
    }

    // Check lose condition (out of moves without meeting objective)
    if (moves === 0) {
      setGameState('failed');
      playSound('fail');
      onFail();
    }
  }, [moves, score, collected, gameState, animationPhase, levelData, onComplete, onFail, playSound]);

  // Cleanup
  useEffect(() => {
    const timeoutRef = animationTimeoutRef;
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    grid,
    selected,
    score,
    moves,
    collected,
    gameState,
    lastMatchPoints,
    // Drag state
    dragging,
    dragOffset,
    // Animation state
    animationPhase,
    swappingTiles,
    matchingTiles,
    fallingColumns,
    // Handlers
    handleTileClick,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
};
