import React, { useState, useEffect, useCallback, useRef } from 'react';
import { loadProgress, saveProgress, regenerateLives, loadSettings, saveSettings } from '../utils/storage';
import { deepClone } from '../utils/helpers';
import { soundEngine } from '../audio/SoundEngine';
import { GameStateContext } from './GameStateContext';

export const GameStateProvider = ({ children }) => {
  // Screen navigation
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levelKey, setLevelKey] = useState(0); // Key to force game component remount

  // Game progress - initialize lives from regeneration
  const [progress, setProgress] = useState(() => loadProgress());
  const [lives, setLives] = useState(() => regenerateLives());

  // Settings
  const [settings, setSettingsState] = useState(() => loadSettings());
  const [soundInitialized, setSoundInitialized] = useState(false);

  // Modal states
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showLevelFailed, setShowLevelFailed] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSoundsModal, setShowSoundsModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Level results
  const [levelResults, setLevelResults] = useState(null);

  // Periodically check for life regeneration (interval callback, not synchronous)
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedLives = regenerateLives();
      setLives(updatedLives);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Save progress whenever it changes
  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
    saveProgress(progress);
  }, [progress]);

  const setSettings = (newSettings) => {
    setSettingsState(newSettings);
    saveSettings(newSettings);
    soundEngine.setEnabled(!newSettings.muted);
    soundEngine.setVolume(newSettings.sfxVolume);
    soundEngine.setMusicVolume(newSettings.musicVolume);
    // Stop music immediately if muted
    if (newSettings.muted) {
      soundEngine.stopAmbientMusic();
    }
  };

  const initSound = useCallback(() => {
    if (!soundInitialized) {
      soundEngine.init();
      soundEngine.setEnabled(!settings.muted);
      soundEngine.setVolume(settings.sfxVolume);
      soundEngine.setMusicVolume(settings.musicVolume);
      setSoundInitialized(true);
    }
  }, [soundInitialized, settings.muted, settings.sfxVolume, settings.musicVolume]);

  const startMusic = useCallback(() => {
    if (!settings.muted) {
      soundEngine.startAmbientMusic();
    }
  }, [settings.muted]);

  const stopMusic = useCallback(() => {
    soundEngine.stopAmbientMusic();
  }, []);

  const playSound = useCallback((soundType) => {
    initSound();
    if (settings.muted) return;

    switch (soundType) {
      case 'click': soundEngine.playUIClick(); break;
      case 'open': soundEngine.playUIOpen(); break;
      case 'close': soundEngine.playUIClose(); break;
      case 'toggle': soundEngine.playUIToggle(); break;
      case 'select': soundEngine.playUISelect(); break;
      case 'unlock': soundEngine.playUIUnlock(); break;
      case 'collect': soundEngine.playCrystalCollect(); break;
      case 'jump': soundEngine.playJump(); break;
      case 'bounce': soundEngine.playBounce(); break;
      case 'orb': soundEngine.playOrbCollect(); break;
      case 'portal': soundEngine.playPortalEnter(); break;
      case 'match': soundEngine.playMatch(); break;
      case 'complete': soundEngine.playLevelComplete(); break;
      case 'fail': soundEngine.playLevelFailed(); break;
      case 'warning': soundEngine.playWarning(); break;
      case 'tick': soundEngine.playTick(); break;
      default: soundEngine.playUIClick();
    }
  }, [initSound, settings.muted]);

  const navigateTo = (screen, worldId = null, levelId = null) => {
    setShowLevelComplete(false);
    setShowLevelFailed(false);
    setShowPauseMenu(false);
    setLevelResults(null);
    setCurrentScreen(screen);
    if (worldId !== null) setSelectedWorld(worldId);
    if (levelId !== null) setSelectedLevel(levelId);
  };

  const startLevel = (worldId, levelId) => {
    soundEngine.stopAmbientMusic();
    setSelectedWorld(worldId);
    setSelectedLevel(levelId);
    setCurrentScreen('game');
    setShowLevelComplete(false);
    setShowLevelFailed(false);
    setLevelResults(null);
  };

  const completeLevel = (score, stars) => {
    setLevelResults({ score, stars });
    setShowLevelComplete(true);

    const newProgress = deepClone(progressRef.current);
    const world = newProgress.worlds.find(w => w.id === selectedWorld);
    const level = world.levels.find(l => l.id === selectedLevel);

    level.completed = true;
    level.stars = Math.max(level.stars, stars);
    level.bestScore = Math.max(level.bestScore, score);
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
    setLevelKey(prev => prev + 1); // Increment key to force remount
    setCurrentScreen('game');
  };

  const nextLevel = () => {
    const world = progressRef.current.worlds.find(w => w.id === selectedWorld);
    const currentLevelIndex = world.levels.findIndex(l => l.id === selectedLevel);

    if (currentLevelIndex < world.levels.length - 1) {
      startLevel(selectedWorld, selectedLevel + 1);
    } else {
      navigateTo('levelSelect', selectedWorld);
    }
  };

  const value = {
    currentScreen, selectedWorld, selectedLevel, levelKey, progress, lives, settings,
    showPauseMenu, showLevelComplete, showLevelFailed,
    showSettingsModal, showSoundsModal, showInfoModal, levelResults,
    navigateTo, startLevel, completeLevel, failLevel, retryLevel, nextLevel,
    setShowPauseMenu, setShowSettingsModal, setShowSoundsModal, setShowInfoModal,
    setSettings, setProgress, playSound, initSound, startMusic, stopMusic,
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
};
