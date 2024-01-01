const N = 50000;
const WIDTH = 1000;
const HEIGHT = 1000;
const CURSOR_RADIUS = 50 * 50;
const BOUNCE = false;
const WRAP = false;
const GRAVITY = 1e-7;
const FRICTION = 0.95;

class Particle {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.lastX = x;
    this.lastY = y;
  }

  update(dt, mx, my, mb) {
    this.lastX = this.x;
    this.lastY = this.y;
    const dx = this.x - mx;
    const dy = this.y - my;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (mx != -1) {
      this.vx += -dx * dt * GRAVITY;
      this.vy += -dy * dt * GRAVITY;
      const d2 = dx * dx + dy * dy;
      if (d2 < CURSOR_RADIUS) {
        const sign = mb ? -1 : 1;
        this.vx = sign * dx * 0.01;
        this.vy = sign * dy * 0.01;
      }
      this.vx *= FRICTION;
      this.vy *= FRICTION;
    }
    if (Math.random() > 0.8) {
      this.vx += .1 * (0.1 - Math.random() * 0.2);
      this.vy += .1 * (0.1 - Math.random() * 0.2);
    }
    if (BOUNCE) {
      if (this.x < 0 || this.x > WIDTH) {
        this.vx = -this.vx * .99;
      }
      if (this.y < 0 || this.y > HEIGHT) {
        this.vy = -this.vy * .99;
      }
    }
    if (WRAP) {
      if (this.x < 0) this.x += WIDTH;
      if (this.y < 0) this.y += HEIGHT;
      if (this.x > WIDTH) this.x -= WIDTH;
      if (this.y > HEIGHT) this.y -= HEIGHT;
    }
  }

  color() {
    const d = this.vx * this.vx + this.vy * this.vy;
    const hue = 360 * Math.sin(Math.PI * d);
    return `hsla(${hue}, 75%, 50%, 0.5)`;
  }
}

class Simulation {
  constructor(canvas, ctx) {
    this.particles = [];
    this.generateRandom();
    this.ctx = ctx;
    this.mouseX = -1;
    this.mouseY = -1;
    this.mouseButton = false;
    canvas.addEventListener('mousemove', (e) => {
      this.mouseX = (e.clientX / window.innerWidth) * WIDTH;
      this.mouseY = (e.clientY / window.innerHeight) * HEIGHT;
    });
    canvas.addEventListener('mousedown', () => {
      this.mouseButton = true;
    });
    canvas.addEventListener('mouseup', () => {
      this.mouseButton = false;
    });
  }

  startAudio() {
    if (this.audioCtx) return;
    this.audioCtx = new AudioContext();
    this.osc1 = this.audioCtx.createOscillator();
    this.osc1.type = 'sine';
    this.osc1.frequency.setValueAtTime(0, this.audioCtx.currentTime);
    this.osc1.connect(this.audioCtx.destination);
    this.osc1.start();
    this.osc2 = this.audioCtx.createOscillator();
    this.osc2.type = 'sine';
    this.osc2.frequency.setValueAtTime(0, this.audioCtx.currentTime);
    this.osc2.connect(this.audioCtx.destination);
    this.osc2.start();
  }

  generateRandom() {
    for (let i = 0; i < N; i++) {
      const r = Math.random() * WIDTH;
      const theta = 2 * Math.PI * Math.random();
      const x = (WIDTH / 2) + r * Math.cos(theta);
      const y = (HEIGHT / 2) + r * Math.sin(theta);
      const vx = 0.1 - Math.random() * 0.2;
      const vy = 0.1 - Math.random() * 0.2;
      this.particles[i] = new Particle(x, y, vx, vy);
    }
  }

  frame(now) {
    const dt = this.lastUpdate ? now - this.lastUpdate : 0;
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    let xs = 0;
    let xs2 = 0;
    for (let i = 0; i < sim.particles.length; i++) {
      const p = sim.particles[i];
      p.update(dt, sim.mouseX, sim.mouseY, sim.mouseButton);
      this.ctx.beginPath();
      this.ctx.fillStyle = p.color();
      this.ctx.fillRect(p.x - 0.5, p.y - 0.5, 1, 1);
      xs += p.vx * p.vx + p.vy * p.vy;
      xs2 += Math.abs(p.x - sim.mouseX) + Math.abs(p.y - sim.mouseY);
    }
    if (this.audioCtx) {
      let freq1 = (xs / sim.particles.length) * 40000;
      this.osc1.frequency.setValueAtTime(freq1, this.audioCtx.currentTime);
      let freq2 = (xs2 / sim.particles.length) * 0.01;
      this.osc2.frequency.setValueAtTime(freq2, this.audioCtx.currentTime);
    }
    this.lastUpdate = now;
    requestAnimationFrame((now) => this.frame(now));
  }
}

let sim = null;

window.addEventListener('click', () => {
  if (sim) {
    sim.startAudio();
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  sim = new Simulation(canvas, ctx);
  requestAnimationFrame((now) => sim.frame(now));
});
