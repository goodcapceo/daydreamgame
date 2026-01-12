/**
 * Monster Sprite Builder
 * Composites Kenney monster-builder-pack parts into complete monster sprites
 *
 * Usage: node scripts/build-monsters.cjs
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const KENNEY_PATH = path.join(__dirname, '../../Kenney/kenney_monster-builder-pack/PNG/Default');
const OUTPUT_PATH = path.join(__dirname, '../public/assets/kenney/world1/monsters');

// Monster definitions - each monster has body, eyes, mouth, and optional arms/details
const MONSTERS = [
  {
    name: 'monster_red',
    body: 'body_redA.png',
    eyes: [{ file: 'eye_angry_red.png', x: 45, y: 35 }],
    mouth: { file: 'mouth_closed_fangs.png', x: 35, y: 85 },
    arms: [
      { file: 'arm_redA.png', x: -25, y: 50, flip: false },
      { file: 'arm_redA.png', x: 115, y: 50, flip: true },
    ],
  },
  {
    name: 'monster_dark',
    body: 'body_darkA.png',
    eyes: [
      { file: 'eye_red.png', x: 30, y: 40 },
      { file: 'eye_red.png', x: 70, y: 40 },
    ],
    mouth: { file: 'mouth_closed_teeth.png', x: 35, y: 90 },
    arms: [
      { file: 'arm_darkA.png', x: -20, y: 55, flip: false },
      { file: 'arm_darkA.png', x: 110, y: 55, flip: true },
    ],
  },
  {
    name: 'monster_blue',
    body: 'body_blueA.png',
    eyes: [{ file: 'eye_psycho_light.png', x: 50, y: 30 }],
    mouth: { file: 'mouth_closed_happy.png', x: 40, y: 80 },
    arms: [
      { file: 'arm_blueA.png', x: -15, y: 45, flip: false },
      { file: 'arm_blueA.png', x: 105, y: 45, flip: true },
    ],
  },
  {
    name: 'monster_green',
    body: 'body_greenA.png',
    eyes: [
      { file: 'eye_yellow.png', x: 25, y: 35 },
      { file: 'eye_yellow.png', x: 65, y: 35 },
    ],
    mouth: { file: 'mouth_closed_sad.png', x: 35, y: 85 },
    arms: [
      { file: 'arm_greenA.png', x: -20, y: 50, flip: false },
      { file: 'arm_greenA.png', x: 115, y: 50, flip: true },
    ],
  },
  {
    name: 'monster_shadow',
    body: 'body_darkA.png',
    eyes: [{ file: 'eye_cute_light.png', x: 45, y: 35 }],
    mouth: { file: 'mouth_closed_fangs.png', x: 35, y: 85 },
    arms: [
      { file: 'arm_darkA.png', x: -25, y: 50, flip: false },
      { file: 'arm_darkA.png', x: 115, y: 50, flip: true },
    ],
  },
];

async function buildMonster(monster) {
  console.log(`Building ${monster.name}...`);

  // Create a larger canvas to accommodate arms
  const canvasWidth = 200;
  const canvasHeight = 200;
  const bodyOffsetX = 50;
  const bodyOffsetY = 30;

  // Prepare composite layers
  const composites = [];

  // Add arms first (behind body)
  if (monster.arms) {
    for (const arm of monster.arms) {
      const armPath = path.join(KENNEY_PATH, arm.file);
      let armBuffer = await sharp(armPath).toBuffer();

      if (arm.flip) {
        armBuffer = await sharp(armBuffer).flop().toBuffer();
      }

      // Ensure positions are not negative
      const left = Math.max(0, bodyOffsetX + arm.x);
      const top = Math.max(0, bodyOffsetY + arm.y);

      composites.push({
        input: armBuffer,
        left,
        top,
      });
    }
  }

  // Add body
  composites.push({
    input: path.join(KENNEY_PATH, monster.body),
    left: bodyOffsetX,
    top: bodyOffsetY,
  });

  // Add eyes
  for (const eye of monster.eyes) {
    const left = Math.max(0, bodyOffsetX + eye.x);
    const top = Math.max(0, bodyOffsetY + eye.y);
    composites.push({
      input: path.join(KENNEY_PATH, eye.file),
      left,
      top,
    });
  }

  // Add mouth
  if (monster.mouth) {
    const left = Math.max(0, bodyOffsetX + monster.mouth.x);
    const top = Math.max(0, bodyOffsetY + monster.mouth.y);
    composites.push({
      input: path.join(KENNEY_PATH, monster.mouth.file),
      left,
      top,
    });
  }

  // Create the composite image
  const outputPath = path.join(OUTPUT_PATH, `${monster.name}.png`);

  await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toFile(outputPath);

  console.log(`  -> Saved to ${outputPath}`);
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH, { recursive: true });
  }

  console.log('Monster Sprite Builder');
  console.log('======================\n');
  console.log(`Source: ${KENNEY_PATH}`);
  console.log(`Output: ${OUTPUT_PATH}\n`);

  for (const monster of MONSTERS) {
    try {
      await buildMonster(monster);
    } catch (err) {
      console.error(`  Error building ${monster.name}:`, err.message);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
