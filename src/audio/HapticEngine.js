class HapticEngine {
  constructor() {
    this.enabled = true;
    this.supported = 'vibrate' in navigator;
  }

  vibrate(pattern) {
    if (!this.enabled || !this.supported) return;
    try { navigator.vibrate(pattern); } catch (error) { console.warn('Vibration failed:', error); }
  }

  light() { this.vibrate(10); }
  medium() { this.vibrate(20); }
  heavy() { this.vibrate(50); }
  success() { this.vibrate([10, 50, 10, 50, 10]); }
  error() { this.vibrate([30, 100, 30]); }
  custom(pattern) { this.vibrate(pattern); }
  setEnabled(enabled) { this.enabled = enabled; }
}

export const hapticEngine = new HapticEngine();
