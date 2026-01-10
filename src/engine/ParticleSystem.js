/**
 * Canvas-based particle system for visual effects
 * Used for transitions, collections, explosions
 */

export class Particle {
  constructor(x, y, vx, vy, color, size, life) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.alpha = 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2; // Gravity
    this.life -= 0.02;
    this.alpha = this.life / this.maxLife;

    return this.life > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = null;
    this.particles = [];
    this.running = false;
    this.resizeHandler = null;

    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      // Size canvas to match container
      this.resize();
      this.resizeHandler = () => this.resize();
      window.addEventListener('resize', this.resizeHandler);
    } else {
      console.warn('Particle canvas not found');
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  emit(x, y, count, options = {}) {
    const {
      color = '#00FFF5',
      speed = 3,
      size = 3,
      life = 1,
      spread = Math.PI * 2,
    } = options;

    for (let i = 0; i < count; i++) {
      const angle = (spread / count) * i + (Math.random() - 0.5) * 0.5;
      const velocity = speed * (0.5 + Math.random() * 0.5);

      const particle = new Particle(
        x,
        y,
        Math.cos(angle) * velocity,
        Math.sin(angle) * velocity,
        color,
        size,
        life
      );

      this.particles.push(particle);
    }

    if (!this.running) {
      this.start();
    }
  }

  start() {
    this.running = true;
    this.animate();
  }

  animate = () => {
    if (!this.running || !this.ctx) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    this.particles = this.particles.filter(particle => {
      const alive = particle.update();
      if (alive) particle.draw(this.ctx);
      return alive;
    });

    // Stop if no particles
    if (this.particles.length === 0) {
      this.running = false;
      return;
    }

    requestAnimationFrame(this.animate);
  };

  clear() {
    this.particles = [];
    this.running = false;
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  destroy() {
    this.clear();
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }
}
