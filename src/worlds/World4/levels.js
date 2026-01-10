/**
 * Match-3 Level Structure - Tile types: 'pink', 'purple', 'yellow', null (empty)
 */

export const WORLD4_LEVELS = [
  { id: 1, name: 'Blooming Beginnings', gridSize: { rows: 8, cols: 7 }, objective: { type: 'score', target: 1000 }, moves: 20, tileTypes: ['pink', 'purple', 'yellow'] },
  { id: 2, name: 'Butterfly Dance', gridSize: { rows: 8, cols: 7 }, objective: { type: 'collect', targets: { pink: 15, purple: 15, yellow: 15 } }, moves: 25, tileTypes: ['pink', 'purple', 'yellow'] },
  { id: 3, name: 'Garden Path', gridSize: { rows: 8, cols: 7 }, objective: { type: 'score', target: 1500 }, moves: 22, tileTypes: ['pink', 'purple', 'yellow'] },
  { id: 4, name: 'Petal Storm', gridSize: { rows: 8, cols: 7 }, objective: { type: 'collect', targets: { pink: 20, purple: 20, yellow: 20 } }, moves: 28, tileTypes: ['pink', 'purple', 'yellow'] },
  { id: 5, name: 'Flower Burst', gridSize: { rows: 8, cols: 7 }, objective: { type: 'score', target: 2000 }, moves: 25, tileTypes: ['pink', 'purple', 'yellow'] },
  { id: 6, name: 'Meadow Magic', gridSize: { rows: 8, cols: 7 }, objective: { type: 'collect', targets: { pink: 25, purple: 25, yellow: 25 } }, moves: 30, tileTypes: ['pink', 'purple', 'yellow'] },
  { id: 7, name: 'Blossom Blitz', gridSize: { rows: 8, cols: 7 }, objective: { type: 'score', target: 2500 }, moves: 22, tileTypes: ['pink', 'purple', 'yellow'] },
  { id: 8, name: 'Garden Grove', gridSize: { rows: 8, cols: 7 }, objective: { type: 'collect', targets: { pink: 30, purple: 30, yellow: 30 } }, moves: 32, tileTypes: ['pink', 'purple', 'yellow'] },
  { id: 9, name: 'Enchanted Bloom', gridSize: { rows: 8, cols: 7 }, objective: { type: 'score', target: 3000 }, moves: 25, tileTypes: ['pink', 'purple', 'yellow'] },
  { id: 10, name: 'Final Garden', gridSize: { rows: 8, cols: 7 }, objective: { type: 'collect', targets: { pink: 40, purple: 40, yellow: 40 } }, moves: 35, tileTypes: ['pink', 'purple', 'yellow'] },
];

export const generateGrid = (rows, cols, tileTypes) => {
  const grid = [];
  for (let row = 0; row < rows; row++) {
    grid[row] = [];
    for (let col = 0; col < cols; col++) {
      let tile;
      let attempts = 0;
      do {
        tile = tileTypes[Math.floor(Math.random() * tileTypes.length)];
        attempts++;
        if (attempts > 50) { tile = tileTypes[0]; break; }
        const horizontalMatch = col >= 2 && grid[row][col - 1] === tile && grid[row][col - 2] === tile;
        const verticalMatch = row >= 2 && grid[row - 1][col] === tile && grid[row - 2][col] === tile;
        if (!horizontalMatch && !verticalMatch) break;
      } while (true);
      grid[row][col] = tile;
    }
  }
  return grid;
};
