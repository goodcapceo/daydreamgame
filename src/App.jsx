import React from 'react';
import { GameStateProvider, useGameState } from './engine/GameStateProvider';
import ErrorBoundary from './components/ErrorBoundary';
import MainMenu from './screens/MainMenu';
import WorldSelect from './screens/WorldSelect';
import LevelSelect from './screens/LevelSelect';
import LevelComplete from './screens/modals/LevelComplete';
import LevelFailed from './screens/modals/LevelFailed';
import PauseMenu from './screens/modals/PauseMenu';
import CrystalCaverns from './worlds/World1/CrystalCaverns';
import SkylineCity from './worlds/World2/SkylineCity';
import NeonRush from './worlds/World3/NeonRush';
import EnchantedGarden from './worlds/World4/EnchantedGarden';

import './styles/variables.css';
import './styles/global.css';
import './styles/utilities.css';
import './styles/animations.css';

const GameRouter = () => {
  const { currentScreen, selectedWorld, selectedLevel, showPauseMenu, showLevelComplete, showLevelFailed } = useGameState();

  const renderGame = () => {
    switch (selectedWorld) {
      case 1: return <CrystalCaverns levelId={selectedLevel} />;
      case 2: return <SkylineCity levelId={selectedLevel} />;
      case 3: return <NeonRush levelId={selectedLevel} />;
      case 4: return <EnchantedGarden levelId={selectedLevel} />;
      default: return null;
    }
  };

  return (
    <>
      {currentScreen === 'menu' && <MainMenu />}
      {currentScreen === 'worldSelect' && <WorldSelect />}
      {currentScreen === 'levelSelect' && <LevelSelect />}
      {currentScreen === 'game' && renderGame()}
      {showPauseMenu && <PauseMenu />}
      {showLevelComplete && <LevelComplete />}
      {showLevelFailed && <LevelFailed />}
      <canvas id="particles" className="absolute-fill" style={{ pointerEvents: 'none', zIndex: 'var(--z-ui-overlay)' }} />
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <div className="game-root">
        <GameStateProvider>
          <GameRouter />
        </GameStateProvider>
      </div>
    </ErrorBoundary>
  );
}

export default App;
