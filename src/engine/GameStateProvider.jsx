import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadProgress, saveProgress, regenerateLives, loadSettings, saveSettings } from '../utils/storage';
import { deepClone } from '../utils/helpers';

const GameStateContext = createContext(null);

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within GameStateProvider');
  }
  return context;
};

export const GameStateProvider = ({ children }) => {
  // Screen navigation
  const [currentScreen, setCurrentScreen] = useState('menu'); // 'menu' | 'worldSelect' | 'levelSelect' | 'game'
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);

  // Game progress
  const [progress, setProgress] = useState(() => loadProgress());
  const [lives, setLives] = useState(progress.lives);

  // Settings
  const [settings, setSettingsState] = useState(() => loadSettings());

  // Modal states
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showLevelFailed, setShowLevelFailed] = useState(false);

  // Level results (set when level ends)
  const [levelResults, setLevelResults] = useState(null);

  // Regenerate lives on mount and periodically
  useEffect(() => {
    const newLives = regenerateLives();
    setLives(newLives);

    // Check every minute
    const interval = setInterval(() => {
      const updatedLives = regenerateLives();
      setLives(updatedLives);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Save progress whenever it changes
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Save settings whenever they change
  const setSettings = (newSettings) => {
    setSettingsState(newSettings);
    saveSettings(newSettings);
  };

  // Navigation helpers
  const navigateTo = (screen, worldId = null, levelId = null) => {
    setCurrentScreen(screen);
    if (worldId !== null) setSelectedWorld(worldId);
    if (levelId !== null) setSelectedLevel(levelId);
  };

  const startLevel = (worldId, levelId) => {
    setSelectedWorld(worldId);
    setSelectedLevel(levelId);
    setCurrentScreen('game');
    setShowLevelComplete(false);
    setShowLevelFailed(false);
    setLevelResults(null);
  };

  // FIX: Use deep clone to prevent state mutation
  const completeLevel = (score, stars) => {
    setLevelResults({ score, stars });
    setShowLevelComplete(true);

    // Deep clone to prevent mutation
    const newProgress = deepClone(progress);
    const world = newProgress.worlds.find(w => w.id === selectedWorld);
    const level = world.levels.find(l => l.id === selectedLevel);

    level.completed = true;
    level.stars = Math.max(level.stars, stars);
    level.bestScore = Math.max(level.bestScore, score);

    // Recalculate world stars
    world.totalStars = world.levels.reduce((sum, l) => sum + l.stars, 0);

    setProgress(newProgress);
  };

  const failLevel = () => {
    setShowLevelFailed(true);
  };

  const retryLevel = () => {
    setShowLevelComplete(false);
    setShowLevelFailed(false);
    setLevelResults(null);
    // Force re-mount by toggling screen
    setCurrentScreen('loading');
    setTimeout(() => setCurrentScreen('game'), 0);
  };

  const nextLevel = () => {
    const world = progress.worlds.find(w => w.id === selectedWorld);
    const currentLevelIndex = world.levels.findIndex(l => l.id === selectedLevel);

    if (currentLevelIndex < world.levels.length - 1) {
      // Next level in same world
      startLevel(selectedWorld, selectedLevel + 1);
    } else {
      // Go to level select
      navigateTo('levelSelect', selectedWorld);
    }
  };

  const value = {
    // State
    currentScreen,
    selectedWorld,
    selectedLevel,
    progress,
    lives,
    settings,
    showPauseMenu,
    showLevelComplete,
    showLevelFailed,
    levelResults,

    // Actions
    navigateTo,
    startLevel,
    completeLevel,
    failLevel,
    retryLevel,
    nextLevel,
    setShowPauseMenu,
    setSettings,
    setProgress,
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
};
