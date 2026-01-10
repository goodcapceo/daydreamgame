class SoundEngine {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.3;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      this.initialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.enabled = false;
    }
  }

  playTone(frequency, duration = 0.1, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;
    this.init();
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

  playCrystalCollect() { this.playSequence([{ frequency: 523.25, duration: 0.05 }, { frequency: 659.25, duration: 0.05 }, { frequency: 783.99, duration: 0.1 }], 30); }
  playJump() { this.playTone(392, 0.1, 'triangle'); }
  playBounce() { this.playTone(523.25, 0.15, 'triangle'); }
  playOrbCollect() { this.playTone(880, 0.1, 'square'); }
  playPortalEnter() { this.playSequence([{ frequency: 440, duration: 0.1, type: 'square' }, { frequency: 554.37, duration: 0.1, type: 'square' }, { frequency: 659.25, duration: 0.2, type: 'square' }], 50); }
  playMatch(count = 3) { const notes = []; for (let i = 0; i < count; i++) notes.push({ frequency: 523.25 * (1 + i * 0.2), duration: 0.08 }); this.playSequence(notes, 40); }
  playLevelComplete() { this.playSequence([{ frequency: 523.25, duration: 0.15 }, { frequency: 659.25, duration: 0.15 }, { frequency: 783.99, duration: 0.15 }, { frequency: 1046.50, duration: 0.3 }], 100); }
  playLevelFailed() { this.playSequence([{ frequency: 392, duration: 0.2 }, { frequency: 349.23, duration: 0.2 }, { frequency: 293.66, duration: 0.3 }], 150); }
  playClick() { this.playTone(880, 0.05, 'sine'); }
  setVolume(volume) { this.volume = Math.max(0, Math.min(1, volume)); }
  setEnabled(enabled) { this.enabled = enabled; }
}

export const soundEngine = new SoundEngine();
