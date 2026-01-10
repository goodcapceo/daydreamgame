import { useState, useCallback, useEffect } from 'react';
import { generateGrid } from './levels';

export const useMatch3Logic = (levelData, onComplete, onFail) => {
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(levelData.moves);
  const [gameState, setGameState] = useState('playing');
  const [grid, setGrid] = useState(() => generateGrid(levelData.gridSize.rows, levelData.gridSize.cols, levelData.tileTypes));
  const [selected, setSelected] = useState(null);
  const [collected, setCollected] = useState({ pink: 0, purple: 0, yellow: 0 });

  const areAdjacent = (pos1, pos2) => {
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };

  const findMatches = (currentGrid) => {
    const matches = [];
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
    const uniqueMatches = [];
    matches.forEach(match => {
      const exists = uniqueMatches.some(m => m.row === match.row && m.col === match.col);
      if (!exists) uniqueMatches.push(match);
    });
    return uniqueMatches;
  };

  const applyGravity = useCallback((currentGrid) => {
    const newGrid = currentGrid.map(row => [...row]);
    for (let col = 0; col < newGrid[0].length; col++) {
      const column = [];
      for (let row = newGrid.length - 1; row >= 0; row--) {
        if (newGrid[row][col]) column.push(newGrid[row][col]);
      }
      for (let row = newGrid.length - 1; row >= 0; row--) {
        if (column.length > 0) newGrid[row][col] = column.shift();
        else newGrid[row][col] = levelData.tileTypes[Math.floor(Math.random() * levelData.tileTypes.length)];
      }
    }
    return newGrid;
  }, [levelData.tileTypes]);

  const processMatches = useCallback((currentGrid) => {
    let newGrid = currentGrid.map(row => [...row]);
    let totalMatches = 0;
    let newCollected = { ...collected };
    while (true) {
      const matches = findMatches(newGrid);
      if (matches.length === 0) break;
      matches.forEach(match => {
        newGrid[match.row][match.col] = null;
        newCollected[match.type]++;
        totalMatches++;
      });
      newGrid = applyGravity(newGrid);
    }
    if (totalMatches > 0) {
      const points = totalMatches * 10;
      setScore(prev => prev + points);
      setCollected(newCollected);
    }
    return newGrid;
  }, [collected, applyGravity]);

  const handleTileClick = useCallback((row, col) => {
    if (gameState !== 'playing') return;
    if (!selected) { setSelected({ row, col }); return; }
    if (!areAdjacent(selected, { row, col })) { setSelected({ row, col }); return; }
    const newGrid = grid.map(r => [...r]);
    const temp = newGrid[selected.row][selected.col];
    newGrid[selected.row][selected.col] = newGrid[row][col];
    newGrid[row][col] = temp;
    const matches = findMatches(newGrid);
    if (matches.length > 0) {
      setMoves(prev => prev - 1);
      const processedGrid = processMatches(newGrid);
      setGrid(processedGrid);
    }
    setSelected(null);
  }, [selected, grid, gameState, processMatches]);

  // FIX: Changed from useState to useEffect for win/lose condition check
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (moves === 0) {
      if (levelData.objective.type === 'score') {
        if (score >= levelData.objective.target) {
          setGameState('complete');
          const stars = score >= levelData.objective.target * 1.5 ? 3 : score >= levelData.objective.target * 1.2 ? 2 : 1;
          onComplete(score, stars);
        } else {
          setGameState('failed');
          onFail();
        }
      } else if (levelData.objective.type === 'collect') {
        const allCollected = Object.entries(levelData.objective.targets).every(([type, target]) => collected[type] >= target);
        if (allCollected) {
          setGameState('complete');
          onComplete(score, 3);
        } else {
          setGameState('failed');
          onFail();
        }
      }
    }
  }, [moves, score, collected, gameState, levelData, onComplete, onFail]);

  return { grid, selected, score, moves, collected, gameState, handleTileClick };
};
