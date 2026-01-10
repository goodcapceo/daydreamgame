/**
 * World 2: Skyline City
 * Platformer levels with jumping between rooftops
 */

export const WORLD2_LEVELS = [
  // LEVEL 1 - "Rooftop Run"
  {
    id: 1,
    name: 'Rooftop Run',
    platforms: [
      { x: 0, y: 700, width: 150, height: 20, type: 'solid' },
      { x: 200, y: 650, width: 100, height: 20, type: 'solid' },
      { x: 350, y: 600, width: 100, height: 20, type: 'solid' },
      { x: 200, y: 500, width: 100, height: 20, type: 'solid' },
      { x: 50, y: 400, width: 150, height: 20, type: 'solid' },
      { x: 250, y: 350, width: 100, height: 20, type: 'solid' },
      { x: 380, y: 250, width: 100, height: 20, type: 'finish' },
    ],
    stars: [
      { id: 'star-1', x: 240, y: 620, collected: false },
      { id: 'star-2', x: 240, y: 470, collected: false },
      { id: 'star-3', x: 120, y: 370, collected: false },
    ],
    startPos: { x: 50, y: 664 },
  },

  // LEVEL 2 - "Cloud Hopper"
  {
    id: 2,
    name: 'Cloud Hopper',
    platforms: [
      { x: 0, y: 750, width: 100, height: 20, type: 'solid' },
      { x: 150, y: 700, width: 80, height: 20, type: 'cloud' },
      { x: 280, y: 650, width: 80, height: 20, type: 'cloud' },
      { x: 150, y: 550, width: 80, height: 20, type: 'solid' },
      { x: 300, y: 480, width: 100, height: 20, type: 'solid' },
      { x: 100, y: 380, width: 80, height: 20, type: 'cloud' },
      { x: 250, y: 300, width: 80, height: 20, type: 'cloud' },
      { x: 380, y: 220, width: 100, height: 20, type: 'finish' },
    ],
    stars: [
      { id: 'star-1', x: 185, y: 670, collected: false },
      { id: 'star-2', x: 345, y: 450, collected: false },
      { id: 'star-3', x: 285, y: 270, collected: false },
    ],
    startPos: { x: 30, y: 714 },
  },

  // LEVEL 3 - "Moving Platforms"
  {
    id: 3,
    name: 'Moving Platforms',
    platforms: [
      { x: 0, y: 750, width: 120, height: 20, type: 'solid' },
      { x: 180, y: 680, width: 100, height: 20, type: 'moving', moveX: 80, speed: 2 },
      { x: 100, y: 580, width: 80, height: 20, type: 'solid' },
      { x: 250, y: 500, width: 100, height: 20, type: 'moving', moveX: 100, speed: 2.5 },
      { x: 80, y: 400, width: 100, height: 20, type: 'solid' },
      { x: 250, y: 320, width: 80, height: 20, type: 'moving', moveX: 80, speed: 2 },
      { x: 380, y: 220, width: 100, height: 20, type: 'finish' },
    ],
    stars: [
      { id: 'star-1', x: 225, y: 650, collected: false },
      { id: 'star-2', x: 295, y: 470, collected: false },
      { id: 'star-3', x: 285, y: 290, collected: false },
    ],
    startPos: { x: 30, y: 714 },
  },

  // LEVELS 4-10 follow similar patterns
  {
    id: 4,
    name: 'Sky Gardens',
    platforms: [
      { x: 0, y: 780, width: 100, height: 20, type: 'solid' },
      { x: 140, y: 720, width: 80, height: 20, type: 'solid' },
      { x: 260, y: 660, width: 80, height: 20, type: 'solid' },
      { x: 380, y: 600, width: 100, height: 20, type: 'solid' },
      { x: 260, y: 520, width: 80, height: 20, type: 'cloud' },
      { x: 120, y: 440, width: 100, height: 20, type: 'solid' },
      { x: 280, y: 360, width: 80, height: 20, type: 'cloud' },
      { x: 100, y: 280, width: 100, height: 20, type: 'solid' },
      { x: 300, y: 200, width: 100, height: 20, type: 'finish' },
    ],
    stars: [
      { id: 'star-1', x: 420, y: 570, collected: false },
      { id: 'star-2', x: 160, y: 410, collected: false },
      { id: 'star-3', x: 140, y: 250, collected: false },
    ],
    startPos: { x: 30, y: 744 },
  },

  {
    id: 5,
    name: 'Sunset Chase',
    platforms: [
      { x: 0, y: 800, width: 80, height: 20, type: 'solid' },
      { x: 120, y: 740, width: 60, height: 20, type: 'moving', moveX: 60, speed: 3 },
      { x: 220, y: 680, width: 80, height: 20, type: 'solid' },
      { x: 340, y: 620, width: 60, height: 20, type: 'moving', moveX: 60, speed: 3 },
      { x: 200, y: 540, width: 80, height: 20, type: 'solid' },
      { x: 60, y: 460, width: 80, height: 20, type: 'cloud' },
      { x: 200, y: 380, width: 60, height: 20, type: 'moving', moveX: 80, speed: 2 },
      { x: 340, y: 300, width: 80, height: 20, type: 'solid' },
      { x: 180, y: 220, width: 100, height: 20, type: 'finish' },
    ],
    stars: [
      { id: 'star-1', x: 255, y: 650, collected: false },
      { id: 'star-2', x: 95, y: 430, collected: false },
      { id: 'star-3', x: 375, y: 270, collected: false },
    ],
    startPos: { x: 20, y: 764 },
  },

  {
    id: 6,
    name: 'Tower Climb',
    platforms: [
      { x: 200, y: 800, width: 100, height: 20, type: 'solid' },
      { x: 80, y: 720, width: 100, height: 20, type: 'solid' },
      { x: 300, y: 640, width: 100, height: 20, type: 'solid' },
      { x: 120, y: 560, width: 100, height: 20, type: 'solid' },
      { x: 280, y: 480, width: 100, height: 20, type: 'solid' },
      { x: 100, y: 400, width: 100, height: 20, type: 'solid' },
      { x: 300, y: 320, width: 100, height: 20, type: 'solid' },
      { x: 180, y: 240, width: 120, height: 20, type: 'finish' },
    ],
    stars: [
      { id: 'star-1', x: 345, y: 610, collected: false },
      { id: 'star-2', x: 145, y: 370, collected: false },
      { id: 'star-3', x: 345, y: 290, collected: false },
    ],
    startPos: { x: 230, y: 764 },
  },

  {
    id: 7,
    name: 'Wind Rider',
    platforms: [
      { x: 0, y: 800, width: 100, height: 20, type: 'solid' },
      { x: 180, y: 720, width: 80, height: 20, type: 'cloud' },
      { x: 320, y: 640, width: 80, height: 20, type: 'cloud' },
      { x: 160, y: 560, width: 80, height: 20, type: 'cloud' },
      { x: 320, y: 480, width: 80, height: 20, type: 'cloud' },
      { x: 100, y: 400, width: 80, height: 20, type: 'solid' },
      { x: 280, y: 320, width: 80, height: 20, type: 'cloud' },
      { x: 100, y: 240, width: 100, height: 20, type: 'finish' },
    ],
    stars: [
      { id: 'star-1', x: 355, y: 610, collected: false },
      { id: 'star-2', x: 355, y: 450, collected: false },
      { id: 'star-3', x: 315, y: 290, collected: false },
    ],
    startPos: { x: 30, y: 764 },
  },

  {
    id: 8,
    name: 'Express Route',
    platforms: [
      { x: 0, y: 800, width: 80, height: 20, type: 'solid' },
      { x: 150, y: 720, width: 80, height: 20, type: 'moving', moveX: 100, speed: 4 },
      { x: 350, y: 640, width: 80, height: 20, type: 'solid' },
      { x: 150, y: 540, width: 80, height: 20, type: 'moving', moveX: 100, speed: 4 },
      { x: 0, y: 440, width: 80, height: 20, type: 'solid' },
      { x: 200, y: 360, width: 80, height: 20, type: 'moving', moveX: 100, speed: 4 },
      { x: 380, y: 260, width: 100, height: 20, type: 'finish' },
    ],
    stars: [
      { id: 'star-1', x: 385, y: 610, collected: false },
      { id: 'star-2', x: 35, y: 410, collected: false },
      { id: 'star-3', x: 235, y: 330, collected: false },
    ],
    startPos: { x: 20, y: 764 },
  },

  {
    id: 9,
    name: 'Skyline Sprint',
    platforms: [
      { x: 0, y: 800, width: 60, height: 20, type: 'solid' },
      { x: 100, y: 740, width: 60, height: 20, type: 'cloud' },
      { x: 200, y: 680, width: 60, height: 20, type: 'solid' },
      { x: 300, y: 620, width: 60, height: 20, type: 'cloud' },
      { x: 400, y: 560, width: 60, height: 20, type: 'solid' },
      { x: 300, y: 480, width: 60, height: 20, type: 'moving', moveX: 60, speed: 3 },
      { x: 180, y: 400, width: 60, height: 20, type: 'cloud' },
      { x: 60, y: 320, width: 60, height: 20, type: 'solid' },
      { x: 180, y: 240, width: 60, height: 20, type: 'moving', moveX: 80, speed: 3 },
      { x: 340, y: 160, width: 100, height: 20, type: 'finish' },
    ],
    stars: [
      { id: 'star-1', x: 425, y: 530, collected: false },
      { id: 'star-2', x: 205, y: 370, collected: false },
      { id: 'star-3', x: 215, y: 210, collected: false },
    ],
    startPos: { x: 15, y: 764 },
  },

  {
    id: 10,
    name: 'Final Ascent',
    platforms: [
      { x: 200, y: 850, width: 100, height: 20, type: 'solid' },
      { x: 50, y: 780, width: 80, height: 20, type: 'moving', moveX: 80, speed: 3 },
      { x: 350, y: 720, width: 80, height: 20, type: 'cloud' },
      { x: 180, y: 640, width: 80, height: 20, type: 'moving', moveX: 100, speed: 4 },
      { x: 350, y: 560, width: 80, height: 20, type: 'solid' },
      { x: 50, y: 480, width: 80, height: 20, type: 'cloud' },
      { x: 200, y: 400, width: 80, height: 20, type: 'moving', moveX: 100, speed: 3 },
      { x: 380, y: 320, width: 80, height: 20, type: 'solid' },
      { x: 100, y: 240, width: 80, height: 20, type: 'cloud' },
      { x: 280, y: 160, width: 100, height: 20, type: 'finish' },
    ],
    stars: [
      { id: 'star-1', x: 385, y: 690, collected: false },
      { id: 'star-2', x: 85, y: 450, collected: false },
      { id: 'star-3', x: 135, y: 210, collected: false },
    ],
    startPos: { x: 230, y: 814 },
  },
];
