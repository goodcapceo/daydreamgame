/**
 * Neon Rush Level Structure - Snake-like mechanics with trail growth
 */

export const WORLD3_LEVELS = [
  {
    id: 1,
    name: 'First Rush',
    startPos: { x: 240, y: 800 },
    startDirection: 'UP',
    finishPos: { x: 240, y: 50 },
    orbs: [
      { id: 'orb-1', x: 240, y: 700 },
      { id: 'orb-2', x: 150, y: 600 },
      { id: 'orb-3', x: 330, y: 500 },
      { id: 'orb-4', x: 240, y: 400 },
      { id: 'orb-5', x: 180, y: 300 },
      { id: 'orb-6', x: 300, y: 200 },
    ],
    barriers: [
      { x: 100, y: 550, width: 10, height: 100 },
      { x: 370, y: 450, width: 10, height: 100 },
    ],
    initialSpeed: 3,
    speedIncrement: 0.5,
  },
  {
    id: 2,
    name: 'Zigzag Zone',
    startPos: { x: 240, y: 800 },
    startDirection: 'UP',
    finishPos: { x: 240, y: 50 },
    orbs: [
      { id: 'orb-1', x: 120, y: 700 },
      { id: 'orb-2', x: 360, y: 600 },
      { id: 'orb-3', x: 120, y: 500 },
      { id: 'orb-4', x: 360, y: 400 },
      { id: 'orb-5', x: 240, y: 200 },
    ],
    barriers: [
      { x: 200, y: 650, width: 180, height: 10 },
      { x: 100, y: 550, width: 180, height: 10 },
      { x: 200, y: 450, width: 180, height: 10 },
      { x: 100, y: 350, width: 180, height: 10 },
    ],
    initialSpeed: 3.5,
    speedIncrement: 0.5,
  },
  { id: 3, name: 'Corridor Run', startPos: { x: 60, y: 800 }, startDirection: 'UP', finishPos: { x: 420, y: 50 }, orbs: [{ id: 'orb-1', x: 60, y: 650 }, { id: 'orb-2', x: 180, y: 550 }, { id: 'orb-3', x: 300, y: 450 }, { id: 'orb-4', x: 420, y: 350 }], barriers: [{ x: 120, y: 700, width: 10, height: 200 }, { x: 240, y: 500, width: 10, height: 200 }], initialSpeed: 3.5, speedIncrement: 0.6 },
  { id: 4, name: 'The Gauntlet', startPos: { x: 240, y: 850 }, startDirection: 'UP', finishPos: { x: 240, y: 50 }, orbs: [{ id: 'orb-1', x: 150, y: 750 }, { id: 'orb-2', x: 330, y: 650 }, { id: 'orb-3', x: 150, y: 550 }, { id: 'orb-4', x: 330, y: 450 }, { id: 'orb-5', x: 240, y: 250 }], barriers: [{ x: 80, y: 700, width: 50, height: 50 }, { x: 350, y: 700, width: 50, height: 50 }, { x: 80, y: 500, width: 50, height: 50 }, { x: 350, y: 500, width: 50, height: 50 }], initialSpeed: 4, speedIncrement: 0.4 },
  { id: 5, name: 'Spiral Path', startPos: { x: 420, y: 850 }, startDirection: 'UP', finishPos: { x: 240, y: 400 }, orbs: [{ id: 'orb-1', x: 420, y: 700 }, { id: 'orb-2', x: 300, y: 600 }, { id: 'orb-3', x: 180, y: 500 }, { id: 'orb-4', x: 60, y: 400 }, { id: 'orb-5', x: 300, y: 200 }], barriers: [{ x: 350, y: 650, width: 130, height: 10 }, { x: 0, y: 550, width: 250, height: 10 }, { x: 230, y: 450, width: 250, height: 10 }], initialSpeed: 4, speedIncrement: 0.5 },
  { id: 6, name: 'Neon Grid', startPos: { x: 60, y: 850 }, startDirection: 'RIGHT', finishPos: { x: 420, y: 50 }, orbs: [{ id: 'orb-1', x: 180, y: 800 }, { id: 'orb-2', x: 300, y: 700 }, { id: 'orb-3', x: 180, y: 600 }, { id: 'orb-4', x: 300, y: 500 }, { id: 'orb-5', x: 180, y: 400 }, { id: 'orb-6', x: 300, y: 300 }], barriers: [{ x: 120, y: 750, width: 10, height: 100 }, { x: 360, y: 650, width: 10, height: 100 }, { x: 120, y: 550, width: 10, height: 100 }, { x: 360, y: 450, width: 10, height: 100 }], initialSpeed: 4.5, speedIncrement: 0.4 },
  { id: 7, name: 'Speed Demon', startPos: { x: 240, y: 850 }, startDirection: 'UP', finishPos: { x: 240, y: 50 }, orbs: [{ id: 'orb-1', x: 120, y: 750 }, { id: 'orb-2', x: 360, y: 650 }, { id: 'orb-3', x: 120, y: 550 }, { id: 'orb-4', x: 360, y: 450 }, { id: 'orb-5', x: 120, y: 350 }, { id: 'orb-6', x: 360, y: 250 }], barriers: [{ x: 200, y: 700, width: 80, height: 10 }, { x: 200, y: 600, width: 80, height: 10 }, { x: 200, y: 500, width: 80, height: 10 }, { x: 200, y: 400, width: 80, height: 10 }, { x: 200, y: 300, width: 80, height: 10 }], initialSpeed: 5, speedIncrement: 0.6 },
  { id: 8, name: 'Maze Runner', startPos: { x: 60, y: 850 }, startDirection: 'UP', finishPos: { x: 420, y: 50 }, orbs: [{ id: 'orb-1', x: 60, y: 700 }, { id: 'orb-2', x: 240, y: 650 }, { id: 'orb-3', x: 420, y: 550 }, { id: 'orb-4', x: 240, y: 450 }, { id: 'orb-5', x: 60, y: 350 }, { id: 'orb-6', x: 240, y: 250 }], barriers: [{ x: 100, y: 750, width: 280, height: 10 }, { x: 100, y: 600, width: 10, height: 100 }, { x: 370, y: 500, width: 10, height: 100 }, { x: 100, y: 400, width: 280, height: 10 }], initialSpeed: 4.5, speedIncrement: 0.5 },
  { id: 9, name: 'Cyber Highway', startPos: { x: 240, y: 850 }, startDirection: 'UP', finishPos: { x: 240, y: 50 }, orbs: [{ id: 'orb-1', x: 100, y: 800 }, { id: 'orb-2', x: 380, y: 700 }, { id: 'orb-3', x: 100, y: 600 }, { id: 'orb-4', x: 380, y: 500 }, { id: 'orb-5', x: 100, y: 400 }, { id: 'orb-6', x: 380, y: 300 }, { id: 'orb-7', x: 240, y: 150 }], barriers: [{ x: 180, y: 750, width: 120, height: 10 }, { x: 180, y: 650, width: 120, height: 10 }, { x: 180, y: 550, width: 120, height: 10 }, { x: 180, y: 450, width: 120, height: 10 }, { x: 180, y: 350, width: 120, height: 10 }], initialSpeed: 5, speedIncrement: 0.5 },
  { id: 10, name: 'Final Rush', startPos: { x: 60, y: 850 }, startDirection: 'RIGHT', finishPos: { x: 240, y: 450 }, orbs: [{ id: 'orb-1', x: 200, y: 850 }, { id: 'orb-2', x: 400, y: 750 }, { id: 'orb-3', x: 200, y: 650 }, { id: 'orb-4', x: 60, y: 550 }, { id: 'orb-5', x: 400, y: 450 }, { id: 'orb-6', x: 200, y: 350 }, { id: 'orb-7', x: 60, y: 250 }, { id: 'orb-8', x: 400, y: 150 }], barriers: [{ x: 150, y: 800, width: 10, height: 100 }, { x: 330, y: 700, width: 10, height: 100 }, { x: 150, y: 600, width: 10, height: 100 }, { x: 330, y: 500, width: 10, height: 100 }, { x: 150, y: 400, width: 10, height: 100 }, { x: 330, y: 300, width: 10, height: 100 }], initialSpeed: 5.5, speedIncrement: 0.6 },
];
