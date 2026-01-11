import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock AudioContext before importing
class MockOscillator {
  constructor() {
    this.frequency = { value: 0 };
    this.type = 'sine';
    this.detune = { value: 0 };
  }
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class MockGainNode {
  constructor() {
    this.gain = {
      value: 1,
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    };
  }
  connect = vi.fn();
}

class MockBiquadFilter {
  constructor() {
    this.frequency = { value: 0 };
    this.Q = { value: 0 };
    this.type = 'lowpass';
  }
  connect = vi.fn();
}

class MockAudioBufferSource {
  constructor() {
    this.buffer = null;
  }
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class MockAudioContext {
  constructor() {
    this.state = 'running';
    this._currentTime = 0;
    this.destination = {};
  }
  createOscillator = vi.fn(() => new MockOscillator());
  createGain = vi.fn(() => new MockGainNode());
  createBiquadFilter = vi.fn(() => new MockBiquadFilter());
  createBufferSource = vi.fn(() => new MockAudioBufferSource());
  decodeAudioData = vi.fn(() => Promise.resolve({}));
  resume = vi.fn(() => Promise.resolve());
  get currentTime() {
    return this._currentTime;
  }
}

// Set up mock before tests
beforeEach(() => {
  window.AudioContext = MockAudioContext;
  window.webkitAudioContext = MockAudioContext;
  global.fetch = vi.fn(() =>
    Promise.resolve({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    })
  );
});

describe('SoundEngine', () => {
  let soundEngine;

  beforeEach(async () => {
    vi.resetModules();
    // Re-import to get fresh instance
    const module = await import('./SoundEngine.js');
    soundEngine = module.soundEngine;

    // Reset engine state
    soundEngine.initialized = false;
    soundEngine.audioContext = null;
    soundEngine.enabled = true;
    soundEngine.volume = 0.3;
    soundEngine.audioBuffers = {};
    soundEngine.loadingPromises = {};
    soundEngine.isMusicPlaying = false;
    soundEngine.musicNodes = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should start uninitialized', () => {
      expect(soundEngine.initialized).toBe(false);
      expect(soundEngine.audioContext).toBeNull();
    });

    it('should have default settings', () => {
      expect(soundEngine.enabled).toBe(true);
      expect(soundEngine.volume).toBe(0.3);
    });

    it('should initialize AudioContext on init()', async () => {
      await soundEngine.init();

      expect(soundEngine.initialized).toBe(true);
      expect(soundEngine.audioContext).toBeInstanceOf(MockAudioContext);
    });

    it('should resume AudioContext if suspended', async () => {
      window.AudioContext = class extends MockAudioContext {
        constructor() {
          super();
          this.state = 'suspended';
        }
      };

      await soundEngine.init();

      expect(soundEngine.audioContext.resume).toHaveBeenCalled();
    });

    it('should not re-initialize if already initialized', async () => {
      await soundEngine.init();
      const firstContext = soundEngine.audioContext;

      await soundEngine.init();

      expect(soundEngine.audioContext).toBe(firstContext);
    });

    it('should handle AudioContext not supported', async () => {
      window.AudioContext = undefined;
      window.webkitAudioContext = undefined;

      await soundEngine.init();

      expect(soundEngine.enabled).toBe(false);
    });
  });

  describe('ensureAudioContext', () => {
    it('should initialize if not yet initialized', async () => {
      expect(soundEngine.audioContext).toBeNull();

      await soundEngine.ensureAudioContext();

      expect(soundEngine.audioContext).not.toBeNull();
    });

    it('should resume if suspended', async () => {
      await soundEngine.init();
      soundEngine.audioContext.state = 'suspended';

      await soundEngine.ensureAudioContext();

      expect(soundEngine.audioContext.resume).toHaveBeenCalled();
    });
  });

  describe('Sound Loading', () => {
    it('should load sound from URL', async () => {
      await soundEngine.init();
      vi.clearAllMocks(); // Clear preload fetches

      await soundEngine.loadSound('/test/sound.ogg');

      expect(fetch).toHaveBeenCalledWith('/test/sound.ogg');
      expect(soundEngine.audioContext.decodeAudioData).toHaveBeenCalled();
    });

    it('should cache loaded sounds', async () => {
      await soundEngine.init();
      vi.clearAllMocks(); // Clear preload fetches

      await soundEngine.loadSound('/test/unique1.ogg');
      await soundEngine.loadSound('/test/unique1.ogg');

      // Should only fetch once for this specific URL
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should return cached buffer on second load', async () => {
      await soundEngine.init();

      const buffer1 = await soundEngine.loadSound('/test/sound.ogg');
      const buffer2 = await soundEngine.loadSound('/test/sound.ogg');

      expect(buffer1).toBe(buffer2);
    });

    it('should handle load errors gracefully', async () => {
      await soundEngine.init();
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await soundEngine.loadSound('/test/bad.ogg');

      expect(result).toBeNull();
    });

    it('should not duplicate loading for same URL', async () => {
      await soundEngine.init();
      vi.clearAllMocks(); // Clear preload fetches

      // Start two loads simultaneously
      const load1 = soundEngine.loadSound('/test/unique2.ogg');
      const load2 = soundEngine.loadSound('/test/unique2.ogg');

      await Promise.all([load1, load2]);

      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Sound Playback', () => {
    it('should not play when disabled', async () => {
      soundEngine.enabled = false;

      await soundEngine.playSound('/test/sound.ogg');

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should play sound with correct volume', async () => {
      await soundEngine.init();
      soundEngine.audioBuffers['/test/sound.ogg'] = {};

      await soundEngine.playSound('/test/sound.ogg');

      expect(soundEngine.audioContext.createBufferSource).toHaveBeenCalled();
      expect(soundEngine.audioContext.createGain).toHaveBeenCalled();
    });

    it('should apply volume multiplier', async () => {
      await soundEngine.init();
      soundEngine.audioBuffers['/test/sound.ogg'] = {};

      await soundEngine.playSound('/test/sound.ogg', 0.5);

      const gainNode = soundEngine.audioContext.createGain.mock.results[0].value;
      expect(gainNode.gain.value).toBe(0.3 * 0.5);
    });

    it('should load sound if not cached', async () => {
      await soundEngine.init();

      await soundEngine.playSound('/test/sound.ogg');

      expect(fetch).toHaveBeenCalledWith('/test/sound.ogg');
    });
  });

  describe('UI Sound Methods', () => {
    beforeEach(async () => {
      await soundEngine.init();
    });

    it('should have playUIClick method', () => {
      expect(typeof soundEngine.playUIClick).toBe('function');
    });

    it('should have playUIOpen method', () => {
      expect(typeof soundEngine.playUIOpen).toBe('function');
    });

    it('should have playUIClose method', () => {
      expect(typeof soundEngine.playUIClose).toBe('function');
    });

    it('should have playUIToggle method', () => {
      expect(typeof soundEngine.playUIToggle).toBe('function');
    });

    it('should have playUISuccess method', () => {
      expect(typeof soundEngine.playUISuccess).toBe('function');
    });

    it('should have playUIError method', () => {
      expect(typeof soundEngine.playUIError).toBe('function');
    });

    it('should have playUIUnlock method', () => {
      expect(typeof soundEngine.playUIUnlock).toBe('function');
    });

    it('should have playUISelect method', () => {
      expect(typeof soundEngine.playUISelect).toBe('function');
    });
  });

  describe('Tone Generation', () => {
    it('should create oscillator for playTone', async () => {
      await soundEngine.init();

      await soundEngine.playTone(440, 0.1, 'sine');

      expect(soundEngine.audioContext.createOscillator).toHaveBeenCalled();
    });

    it('should set correct frequency', async () => {
      await soundEngine.init();

      await soundEngine.playTone(440, 0.1, 'sine');

      const oscillator = soundEngine.audioContext.createOscillator.mock.results[0].value;
      expect(oscillator.frequency.value).toBe(440);
    });

    it('should set correct oscillator type', async () => {
      await soundEngine.init();

      await soundEngine.playTone(440, 0.1, 'square');

      const oscillator = soundEngine.audioContext.createOscillator.mock.results[0].value;
      expect(oscillator.type).toBe('square');
    });

    it('should not play tone when disabled', async () => {
      await soundEngine.init();
      soundEngine.enabled = false;

      await soundEngine.playTone(440, 0.1);

      expect(soundEngine.audioContext.createOscillator).not.toHaveBeenCalled();
    });
  });

  describe('Sequence Playback', () => {
    beforeEach(async () => {
      await soundEngine.init();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should play sequence of notes', async () => {
      const notes = [
        { frequency: 440, duration: 0.1 },
        { frequency: 550, duration: 0.1 },
        { frequency: 660, duration: 0.1 },
      ];

      soundEngine.playSequence(notes, 100);

      // First note plays at 0ms delay (need to flush timers)
      await vi.advanceTimersByTimeAsync(0);
      expect(soundEngine.audioContext.createOscillator).toHaveBeenCalledTimes(1);

      // Second note at 100ms
      await vi.advanceTimersByTimeAsync(100);
      expect(soundEngine.audioContext.createOscillator).toHaveBeenCalledTimes(2);

      // Third note at 200ms
      await vi.advanceTimersByTimeAsync(100);
      expect(soundEngine.audioContext.createOscillator).toHaveBeenCalledTimes(3);
    });

    it('should not play sequence when disabled', () => {
      soundEngine.enabled = false;

      const notes = [{ frequency: 440, duration: 0.1 }];
      soundEngine.playSequence(notes, 100);

      expect(soundEngine.audioContext.createOscillator).not.toHaveBeenCalled();
    });
  });

  describe('Game Sound Effects', () => {
    beforeEach(async () => {
      await soundEngine.init();
    });

    it('should have playCrystalCollect method', () => {
      expect(typeof soundEngine.playCrystalCollect).toBe('function');
    });

    it('should have playJump method', () => {
      expect(typeof soundEngine.playJump).toBe('function');
    });

    it('should have playBounce method', () => {
      expect(typeof soundEngine.playBounce).toBe('function');
    });

    it('should have playOrbCollect method', () => {
      expect(typeof soundEngine.playOrbCollect).toBe('function');
    });

    it('should have playPortalEnter method', () => {
      expect(typeof soundEngine.playPortalEnter).toBe('function');
    });

    it('should have playMatch method', () => {
      expect(typeof soundEngine.playMatch).toBe('function');
    });

    it('should have playLevelComplete method', () => {
      expect(typeof soundEngine.playLevelComplete).toBe('function');
    });

    it('should have playLevelFailed method', () => {
      expect(typeof soundEngine.playLevelFailed).toBe('function');
    });

    it('should have playClick method', () => {
      expect(typeof soundEngine.playClick).toBe('function');
    });

    it('should have playWarning method', () => {
      expect(typeof soundEngine.playWarning).toBe('function');
    });

    it('should have playTick method', () => {
      expect(typeof soundEngine.playTick).toBe('function');
    });
  });

  describe('Volume Control', () => {
    it('should set volume within range', () => {
      soundEngine.setVolume(0.5);
      expect(soundEngine.volume).toBe(0.5);
    });

    it('should clamp volume to min 0', () => {
      soundEngine.setVolume(-1);
      expect(soundEngine.volume).toBe(0);
    });

    it('should clamp volume to max 1', () => {
      soundEngine.setVolume(2);
      expect(soundEngine.volume).toBe(1);
    });
  });

  describe('Enable/Disable', () => {
    it('should enable sound', () => {
      soundEngine.setEnabled(true);
      expect(soundEngine.enabled).toBe(true);
    });

    it('should disable sound', () => {
      soundEngine.setEnabled(false);
      expect(soundEngine.enabled).toBe(false);
    });
  });

  describe('Ambient Music', () => {
    beforeEach(async () => {
      await soundEngine.init();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should have default music volume', () => {
      expect(soundEngine.musicVolume).toBe(0.15);
    });

    it('should track music playing state', () => {
      expect(soundEngine.isMusicPlaying).toBe(false);
    });

    it('should start ambient music', async () => {
      await soundEngine.startAmbientMusic();

      expect(soundEngine.isMusicPlaying).toBe(true);
      expect(soundEngine.musicNodes).not.toBeNull();
    });

    it('should not start music when disabled', async () => {
      soundEngine.enabled = false;

      await soundEngine.startAmbientMusic();

      expect(soundEngine.isMusicPlaying).toBe(false);
    });

    it('should not start music if already playing', async () => {
      await soundEngine.startAmbientMusic();
      const firstNodes = soundEngine.musicNodes;

      await soundEngine.startAmbientMusic();

      expect(soundEngine.musicNodes).toBe(firstNodes);
    });

    it('should stop ambient music', async () => {
      await soundEngine.startAmbientMusic();

      soundEngine.stopAmbientMusic();

      // Music should fade out over 1 second
      vi.advanceTimersByTime(1200);

      expect(soundEngine.isMusicPlaying).toBe(false);
      expect(soundEngine.musicNodes).toBeNull();
    });

    it('should handle stop when music not playing', () => {
      expect(() => soundEngine.stopAmbientMusic()).not.toThrow();
    });

    it('should set music volume', async () => {
      soundEngine.setMusicVolume(0.5);

      expect(soundEngine.musicVolume).toBe(0.5);
    });

    it('should clamp music volume', () => {
      soundEngine.setMusicVolume(-1);
      expect(soundEngine.musicVolume).toBe(0);

      soundEngine.setMusicVolume(2);
      expect(soundEngine.musicVolume).toBe(1);
    });

    it('should update playing music volume', async () => {
      await soundEngine.startAmbientMusic();

      soundEngine.setMusicVolume(0.8);

      const masterGain = soundEngine.musicNodes.masterGain;
      expect(masterGain.gain.value).toBe(0.8);
    });
  });

  describe('Preloading', () => {
    it('should preload UI sounds on init', async () => {
      await soundEngine.init();

      // preloadUISounds should have been called
      // This loads multiple sounds
      expect(fetch).toHaveBeenCalled();
    });
  });
});
