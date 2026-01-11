import React from 'react';
import { GameStateProvider } from './engine/GameStateProvider';
import { useGameState } from './engine/useGameState';
import ErrorBoundary from './components/ErrorBoundary';
import ScreenTransition from './components/ScreenTransition';
import MainMenu from './screens/MainMenu';
import WorldSelect from './screens/WorldSelect';
import LevelSelect from './screens/LevelSelect';
import LevelComplete from './screens/modals/LevelComplete';
import LevelFailed from './screens/modals/LevelFailed';
import PauseMenu from './screens/modals/PauseMenu';
import SettingsModal from './screens/modals/SettingsModal';
import SoundsModal from './screens/modals/SoundsModal';
import InfoModal from './screens/modals/InfoModal';
import CrystalCaverns from './worlds/World1/CrystalCaverns';
import SkylineCity from './worlds/World2/SkylineCity';
import NeonRush from './worlds/World3/NeonRush';
import EnchantedGarden from './worlds/World4/EnchantedGarden';

import './styles/variables.css';
import './styles/global.css';
import './styles/utilities.css';
import './styles/animations.css';

const GameRouter = () => {
  const { currentScreen, selectedWorld, selectedLevel, levelKey, showPauseMenu, showLevelComplete, showLevelFailed, showSettingsModal, showSoundsModal, showInfoModal } = useGameState();

  const renderGame = () => {
    // Use levelKey to force remount when retrying
    const gameKey = `${selectedWorld}-${selectedLevel}-${levelKey}`;
    switch (selectedWorld) {
      case 1: return <CrystalCaverns key={gameKey} levelId={selectedLevel} />;
      case 2: return <SkylineCity key={gameKey} levelId={selectedLevel} />;
      case 3: return <NeonRush key={gameKey} levelId={selectedLevel} />;
      case 4: return <EnchantedGarden key={gameKey} levelId={selectedLevel} />;
      default: return null;
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu': return <MainMenu />;
      case 'worldSelect': return <WorldSelect />;
      case 'levelSelect': return <LevelSelect />;
      case 'game': return renderGame();
      default: return <MainMenu />;
    }
  };

  return (
    <>
      <ScreenTransition screenKey={currentScreen} type="fade">
        {renderScreen()}
      </ScreenTransition>
      {showPauseMenu && <PauseMenu />}
      {showLevelComplete && <LevelComplete />}
      {showLevelFailed && <LevelFailed />}
      {showSettingsModal && <SettingsModal />}
      {showSoundsModal && <SoundsModal />}
      {showInfoModal && <InfoModal />}
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
