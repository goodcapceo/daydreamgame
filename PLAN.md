# QPLAN: Kenney Asset Integration + Bug Fixes + Match-3 Improvements

## Priority 1: Critical Bug Fixes

### 1.1 World 3 (Neon Rush) Not Starting
**Problem:** Game loop in `useSnakeLogic.js` has `orbs` and `score` in useEffect dependencies, causing the effect to restart on every state change. This kills the animation frame loop.

**Root Cause:** Line 157 dependency array:
```javascript
[gameState, orbs, score, levelData, checkAABB, onComplete, onFail]
```
When `setOrbs` or `setScore` is called inside the loop, React re-renders, the effect cleanup runs (`cancelAnimationFrame`), and the loop restarts from scratch.

**Fix:**
- Remove `orbs` and `score` from useEffect dependency array
- Use refs for values that change during gameplay but are needed in the loop
- Keep only `gameState` and `levelData` as dependencies
- Add defensive null check for `levelData`

**File:** `src/worlds/World3/useSnakeLogic.js`

---

### 1.2 World 4 (Enchanted Garden) Drag-to-Swap
**Problem:** Currently uses tap-to-select, tap-to-swap. User wants Candy Crush-style drag-to-swap.

**Behavior to implement:**
1. Touch/click and hold on a tile
2. Drag finger/mouse toward adjacent tile
3. When crossing the boundary, tiles swap positions
4. Visual feedback: dragged tile follows finger slightly
5. Invalid direction (diagonal, too far): tile snaps back

**Changes:**
- Add drag state: `isDragging`, `dragStart`, `dragCurrent`
- Add `onTouchStart/onMouseDown` to begin drag
- Add `onTouchMove/onMouseMove` to track drag
- Add `onTouchEnd/onMouseUp` to complete swap
- Calculate swap direction from drag vector
- Add CSS transform for drag visual feedback

**Files:**
- `src/worlds/World4/useMatch3Logic.js` - Add drag handlers
- `src/worlds/World4/EnchantedGarden.jsx` - Wire up touch events, add drag styles

---

## Priority 2: Match-3 Animations (Candy Crush Feel)

### 2.1 Swap Animation
```css
.tile-swapping {
  transition: transform 150ms ease-out;
}
```
- Valid swap: tiles slide to new positions smoothly
- Invalid swap: tiles move halfway then bounce back

### 2.2 Match Animation
- Matched tiles: scale(1.2) then fade out over 200ms
- Particle burst effect (optional, CSS-based)
- Score popup: "+30" floats up from match location

### 2.3 Cascade/Gravity Animation
- New tiles enter from top with delay
- Falling tiles: ease-in-out with slight bounce on landing
- Stagger animation for chain reactions

### 2.4 Implementation Approach
Add animation states to the logic:
```javascript
const [animationPhase, setAnimationPhase] = useState('idle');
// Phases: 'idle' | 'swapping' | 'matching' | 'falling' | 'settling'
```

**Files:**
- `src/worlds/World4/useMatch3Logic.js` - Animation state machine
- `src/worlds/World4/EnchantedGarden.jsx` - CSS classes and transitions

---

## Priority 3: Kenney Asset Integration

### 3.1 Asset Directory Structure
```
src/assets/kenney/
├── ui/
│   ├── buttons/          # Blue, Grey, Yellow button PNGs
│   ├── stars/            # star.png, star_outline.png
│   └── sliders/          # Slider handle and tracks
├── sounds/
│   └── interface/        # click, open, close, switch, etc.
├── world1/               # Shape characters, gems
├── world2/               # Bunny sprites, platforms, stars
├── world3/               # Rolling balls, particles
└── world4/               # Puzzle tiles (pink, purple, yellow)
```

### 3.2 Copy Required Assets

**From kenney_ui-pack:**
- `PNG/Blue/Default/button_rectangle_depth_gloss.png` - Play button
- `PNG/Grey/Default/button_round_depth_gloss.png` - Settings buttons
- `PNG/Yellow/Default/star.png`, `star_outline.png` - Stars
- `PNG/Blue/Default/slide_*.png` - Volume sliders

**From kenney_interface-sounds:**
- `click_001.ogg` - Button tap
- `open_001.ogg` - Menu open
- `close_001.ogg` - Menu close
- `switch_001.ogg` - Toggle
- `confirmation_001.ogg` - Success
- `error_004.ogg` - Error
- `maximize_003.ogg` - Level unlock

**From kenney_platformer-pack-redux:**
- `PNG/Items/gemBlue.png`, `gemRed.png`, `gemGreen.png`, `gemYellow.png` - World 1 crystals
- `PNG/Items/star.png` - World 2 stars
- `PNG/Players/` - World 2 character options

**From kenney_jumper-pack:**
- `PNG/Players/bunny1_*.png` - Cute bunny for World 2

**From kenney_shape-characters:**
- `PNG/Default/blue_body_squircle.png` + `face_a.png` - World 1 player
- `PNG/Default/*_body_circle.png` - World 3 options

**From kenney_puzzle-pack-2:**
- `PNG/Tiles pink/`, `Tiles purple/`, `Tiles yellow/` - World 4 match tiles

**From kenney_rolling-ball-assets:**
- `PNG/Default/ball_blue_*.png` - World 3 player
- `PNG/Default/star.png` - World 3 orbs

### 3.3 UI Sound Integration

Update `src/engine/SoundEngine.js`:
```javascript
const UI_SOUNDS = {
  click: '/assets/kenney/sounds/interface/click_001.ogg',
  open: '/assets/kenney/sounds/interface/open_001.ogg',
  close: '/assets/kenney/sounds/interface/close_001.ogg',
  toggle: '/assets/kenney/sounds/interface/switch_001.ogg',
  success: '/assets/kenney/sounds/interface/confirmation_001.ogg',
  error: '/assets/kenney/sounds/interface/error_004.ogg',
  unlock: '/assets/kenney/sounds/interface/maximize_003.ogg',
};
```

Add `playUISound()` to GameStateProvider and wire up:
- All button clicks → 'click'
- Modal opens → 'open'
- Modal closes → 'close'
- Settings toggles → 'toggle'
- Level complete → 'success'
- Level fail → 'error'

### 3.4 UI Component Creation

**Create `src/components/ui/KenneyButton.jsx`:**
```jsx
const KenneyButton = ({ color = 'blue', size = 'medium', children, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundImage: `url(/assets/kenney/ui/buttons/${color}_button.png)`,
        backgroundSize: 'contain',
        // 9-slice scaling or fixed sizes
      }}
    >
      {children}
    </button>
  );
};
```

**Create `src/components/ui/KenneyStar.jsx`:**
```jsx
const KenneyStar = ({ filled = false, size = 24 }) => (
  <img
    src={filled
      ? '/assets/kenney/ui/stars/star.png'
      : '/assets/kenney/ui/stars/star_outline.png'
    }
    width={size}
    height={size}
    alt=""
  />
);
```

### 3.5 World Sprite Integration

**World 1 (Crystal Caverns):**
- Replace `<Gem />` SVG with Kenney shape character sprite
- Replace crystal tiles (type 2) with gem sprites

**World 2 (Skyline City):**
- Replace `<Flap />` SVG with bunny sprite sheet
- Use bunny1_stand, bunny1_jump based on player.vy
- Replace star collectibles with Kenney star.png

**World 3 (Neon Rush):**
- Replace `<Pulse />` SVG with rolling ball sprite
- Keep neon glow effects as CSS overlays

**World 4 (Enchanted Garden):**
- Replace color blocks with Kenney puzzle tiles
- Map: pink → Tiles pink, purple → Tiles purple, yellow → Tiles yellow

---

## Implementation Order

### Phase 1: Bug Fixes (Do First)
1. [ ] Fix World 3 useSnakeLogic.js dependency array
2. [ ] Test World 3 levels work

### Phase 2: Match-3 Drag + Animations
3. [ ] Add drag-to-swap to World 4
4. [ ] Add swap animation (CSS transitions)
5. [ ] Add match animation (scale + fade)
6. [ ] Add cascade animation (gravity + bounce)

### Phase 3: Asset Setup
7. [ ] Create `src/assets/kenney/` directory structure
8. [ ] Copy required UI assets (buttons, stars, sliders)
9. [ ] Copy required sound assets
10. [ ] Copy world-specific sprites

### Phase 4: UI Integration
11. [ ] Create KenneyButton, KenneyStar components
12. [ ] Add UI sounds to SoundEngine
13. [ ] Wire up playUISound to all interactions
14. [ ] Update MainMenu with Kenney buttons
15. [ ] Update WorldSelect with Kenney elements
16. [ ] Update LevelSelect with Kenney stars
17. [ ] Update modals with Kenney toggles/sliders

### Phase 5: World Sprites
18. [ ] Update World 1 with gem sprites
19. [ ] Update World 2 with bunny + star sprites
20. [ ] Update World 3 with ball sprite
21. [ ] Update World 4 with puzzle tile sprites

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/worlds/World3/useSnakeLogic.js` | Fix dependency array bug |
| `src/worlds/World4/useMatch3Logic.js` | Add drag handlers, animation states |
| `src/worlds/World4/EnchantedGarden.jsx` | Touch events, CSS animations |
| `src/engine/SoundEngine.js` | Add UI sound types |
| `src/engine/GameStateProvider.jsx` | Add playUISound function |
| `src/components/ui/KenneyButton.jsx` | New file |
| `src/components/ui/KenneyStar.jsx` | New file |
| `src/screens/MainMenu.jsx` | Use Kenney buttons |
| `src/screens/WorldSelect.jsx` | Use Kenney elements |
| `src/screens/LevelSelect.jsx` | Use Kenney stars |
| `src/screens/modals/*.jsx` | Kenney toggles, sounds |
| `src/worlds/World1/*.jsx` | Gem sprites |
| `src/worlds/World2/*.jsx` | Bunny + star sprites |
| `src/worlds/World3/*.jsx` | Ball sprite |
| `src/worlds/World4/*.jsx` | Puzzle tile sprites |

---

## Success Criteria

1. **World 3 works** - Snake moves, collects orbs, reaches finish
2. **World 4 feels like Candy Crush** - Drag to swap, smooth animations
3. **UI has polished look** - Kenney buttons and stars throughout
4. **Sounds provide feedback** - Every interaction has audio
5. **Consistent visual style** - Kenney sprites across all worlds
