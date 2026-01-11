// UI Sound paths (Kenney interface sounds)
const UI_SOUNDS = {
  click: '/assets/kenney/sounds/interface/click_001.ogg',
  click2: '/assets/kenney/sounds/interface/click_002.ogg',
  open: '/assets/kenney/sounds/interface/open_001.ogg',
  close: '/assets/kenney/sounds/interface/close_001.ogg',
  toggle: '/assets/kenney/sounds/interface/switch_001.ogg',
  success: '/assets/kenney/sounds/interface/confirmation_001.ogg',
  error: '/assets/kenney/sounds/interface/error_004.ogg',
  unlock: '/assets/kenney/sounds/interface/maximize_003.ogg',
  select: '/assets/kenney/sounds/interface/select_001.ogg',
};

class SoundEngine {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.3;
    this.initialized = false;
    this.audioBuffers = {}; // Cache for loaded audio files
    this.loadingPromises = {}; // Track loading state
  }

  async init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();

      // Resume AudioContext if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.initialized = true;
      // Preload UI sounds
      this.preloadUISounds();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.enabled = false;
    }
  }

  // Ensure audio context is active (call on user interaction)
  async ensureAudioContext() {
    if (!this.audioContext) {
      await this.init();
    } else if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async preloadUISounds() {
    const loadPromises = Object.entries(UI_SOUNDS).map(([key, path]) =>
      this.loadSound(path).catch(err => console.warn(`Failed to load ${key}:`, err))
    );
    await Promise.all(loadPromises);
  }

  async loadSound(url) {
    if (this.audioBuffers[url]) return this.audioBuffers[url];
    if (this.loadingPromises[url]) return this.loadingPromises[url];

    this.loadingPromises[url] = (async () => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.audioBuffers[url] = audioBuffer;
        return audioBuffer;
      } catch (error) {
        console.warn(`Failed to load sound: ${url}`, error);
        return null;
      }
    })();

    return this.loadingPromises[url];
  }

  async playSound(url, volumeMultiplier = 1) {
    if (!this.enabled) return;
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    let buffer = this.audioBuffers[url];
    if (!buffer) {
      buffer = await this.loadSound(url);
    }
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    gainNode.gain.value = this.volume * volumeMultiplier;
    source.start(0);
  }

  // UI Sound methods
  playUIClick() { this.playSound(UI_SOUNDS.click); }
  playUIOpen() { this.playSound(UI_SOUNDS.open); }
  playUIClose() { this.playSound(UI_SOUNDS.close); }
  playUIToggle() { this.playSound(UI_SOUNDS.toggle); }
  playUISuccess() { this.playSound(UI_SOUNDS.success); }
  playUIError() { this.playSound(UI_SOUNDS.error); }
  playUIUnlock() { this.playSound(UI_SOUNDS.unlock); }
  playUISelect() { this.playSound(UI_SOUNDS.select); }

  // Original oscillator-based sounds (for game actions)
  async playTone(frequency, duration = 0.1, type = 'sine') {
    if (!this.enabled) return;
    await this.ensureAudioContext();
    if (!this.audioContext) return;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playSequence(notes, tempo = 100) {
    if (!this.enabled) return;
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note.frequency, note.duration || 0.1, note.type || 'sine'), i * tempo);
    });
  }

  // Game sound effects
  playCrystalCollect() { this.playSequence([{ frequency: 523.25, duration: 0.05 }, { frequency: 659.25, duration: 0.05 }, { frequency: 783.99, duration: 0.1 }], 30); }
  playJump() { this.playTone(392, 0.1, 'triangle'); }
  playBounce() { this.playTone(523.25, 0.15, 'triangle'); }
  playOrbCollect() { this.playTone(880, 0.1, 'square'); }
  playPortalEnter() { this.playSequence([{ frequency: 440, duration: 0.1, type: 'square' }, { frequency: 554.37, duration: 0.1, type: 'square' }, { frequency: 659.25, duration: 0.2, type: 'square' }], 50); }
  playMatch(count = 3) { const notes = []; for (let i = 0; i < count; i++) notes.push({ frequency: 523.25 * (1 + i * 0.2), duration: 0.08 }); this.playSequence(notes, 40); }
  playLevelComplete() { this.playUISuccess(); this.playSequence([{ frequency: 523.25, duration: 0.15 }, { frequency: 659.25, duration: 0.15 }, { frequency: 783.99, duration: 0.15 }, { frequency: 1046.50, duration: 0.3 }], 100); }
  playLevelFailed() { this.playUIError(); this.playSequence([{ frequency: 392, duration: 0.2 }, { frequency: 349.23, duration: 0.2 }, { frequency: 293.66, duration: 0.3 }], 150); }
  playClick() { this.playUIClick(); }

  // Timer urgency sounds
  playWarning() {
    // Two-tone alert beep for timer warnings
    this.playSequence([
      { frequency: 880, duration: 0.1, type: 'square' },
      { frequency: 660, duration: 0.15, type: 'square' }
    ], 120);
  }
  playTick() {
    // Sharp tick for final countdown
    this.playTone(1200, 0.08, 'square');
  }

  setVolume(volume) { this.volume = Math.max(0, Math.min(1, volume)); }
  setEnabled(enabled) { this.enabled = enabled; }

  // Ambient background music system
  musicNodes = null;
  musicVolume = 0.15;
  isMusicPlaying = false;

  async startAmbientMusic() {
    if (this.isMusicPlaying || !this.enabled) return;
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    // Create a relaxing ambient soundscape with melody
    const masterGain = this.audioContext.createGain();
    masterGain.gain.value = this.musicVolume;
    masterGain.connect(this.audioContext.destination);

    // Soft pad for background harmony
    const createPad = (freq, detune = 0) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = detune;

      filter.type = 'lowpass';
      filter.frequency.value = 600;
      filter.Q.value = 0.5;

      gain.gain.value = 0.04; // Quieter pads

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start();

      // Very subtle LFO modulation
      const lfo = this.audioContext.createOscillator();
      const lfoGain = this.audioContext.createGain();
      lfo.frequency.value = 0.05;
      lfoGain.gain.value = 0.01;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();

      return { osc, gain, filter, lfo };
    };

    // Create soft pad layers
    const pads = [
      createPad(130.81, 0),    // C3
      createPad(196.00, 3),    // G3
    ];

    // Melodic arpeggio pattern (dreamy, gentle)
    const melodyNotes = [
      { freq: 523.25, duration: 0.8 },  // C5
      { freq: 659.25, duration: 0.6 },  // E5
      { freq: 783.99, duration: 0.8 },  // G5
      { freq: 659.25, duration: 0.6 },  // E5
      { freq: 523.25, duration: 1.0 },  // C5
      { freq: 392.00, duration: 0.8 },  // G4
      { freq: 440.00, duration: 0.6 },  // A4
      { freq: 523.25, duration: 1.0 },  // C5
    ];
    let melodyIndex = 0;
    let melodyTimeout = null;

    const playMelodyNote = () => {
      if (!this.isMusicPlaying || !this.enabled) return;

      const note = melodyNotes[melodyIndex];
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.value = note.freq;

      filter.type = 'lowpass';
      filter.frequency.value = 1200;

      // Soft attack and release
      gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.06 * this.musicVolume, this.audioContext.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + note.duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start();
      osc.stop(this.audioContext.currentTime + note.duration + 0.1);

      melodyIndex = (melodyIndex + 1) % melodyNotes.length;

      // Schedule next note with slight variation
      const nextDelay = (note.duration * 1000) + 200 + Math.random() * 300;
      melodyTimeout = setTimeout(playMelodyNote, nextDelay);
    };

    // Start melody after a short delay
    melodyTimeout = setTimeout(playMelodyNote, 1000);

    // Occasional sparkle/chime effect
    const sparkleInterval = setInterval(() => {
      if (!this.isMusicPlaying || !this.enabled) {
        clearInterval(sparkleInterval);
        return;
      }
      const sparkleFreq = [1046.50, 1318.51, 1567.98][Math.floor(Math.random() * 3)];
      const sparkle = this.audioContext.createOscillator();
      const sparkleGain = this.audioContext.createGain();
      sparkle.type = 'sine';
      sparkle.frequency.value = sparkleFreq;
      sparkleGain.gain.setValueAtTime(0.02 * this.musicVolume, this.audioContext.currentTime);
      sparkleGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.5);
      sparkle.connect(sparkleGain);
      sparkleGain.connect(this.audioContext.destination);
      sparkle.start();
      sparkle.stop(this.audioContext.currentTime + 1.5);
    }, 4000 + Math.random() * 3000);

    this.musicNodes = { pads, masterGain, sparkleInterval, melodyTimeout };
    this.isMusicPlaying = true;
  }

  stopAmbientMusic() {
    if (!this.musicNodes) return;

    const { pads, masterGain, sparkleInterval, melodyTimeout } = this.musicNodes;

    clearInterval(sparkleInterval);
    if (melodyTimeout) clearTimeout(melodyTimeout);

    // Fade out over 1 second
    if (this.audioContext && masterGain) {
      masterGain.gain.setValueAtTime(masterGain.gain.value, this.audioContext.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
    }

    setTimeout(() => {
      pads.forEach(pad => {
        try {
          pad.osc.stop();
          pad.lfo.stop();
        } catch {
          // Oscillator may already be stopped
        }
      });
    }, 1100);

    this.musicNodes = null;
    this.isMusicPlaying = false;
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicNodes?.masterGain) {
      this.musicNodes.masterGain.gain.value = this.musicVolume;
    }
  }
}

export const soundEngine = new SoundEngine();
