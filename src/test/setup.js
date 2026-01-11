import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock AudioContext for sound tests
class MockAudioContext {
  constructor() {
    this.state = 'running';
  }
  createOscillator() {
    return {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 0 },
      type: 'sine',
    };
  }
  createGain() {
    return {
      connect: vi.fn(),
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
    };
  }
  createBiquadFilter() {
    return {
      connect: vi.fn(),
      frequency: { value: 0 },
      Q: { value: 0 },
      type: 'lowpass',
    };
  }
  createBufferSource() {
    return {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      buffer: null,
    };
  }
  decodeAudioData() {
    return Promise.resolve({});
  }
  resume() {
    return Promise.resolve();
  }
  get currentTime() {
    return 0;
  }
  get destination() {
    return {};
  }
}

window.AudioContext = MockAudioContext;
window.webkitAudioContext = MockAudioContext;

// Mock requestAnimationFrame
let frameId = 0;
window.requestAnimationFrame = vi.fn(callback => {
  frameId++;
  setTimeout(() => callback(Date.now()), 16);
  return frameId;
});

window.cancelAnimationFrame = vi.fn(_id => {
  // Cancel animation frame
});

// Mock fetch for sound loading
global.fetch = vi.fn(() =>
  Promise.resolve({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  })
);
