const N = 400000;
const WIDTH = 1000;
const HEIGHT = 1000;
const CURSOR_RADIUS = 50 * 50;
const GROW = 10;
const BOUNCE = false;
const WRAP = false;
const GRAVITY = 1e-7;
const FRICTION = 0.95;

class Particle {
  constructor(x, y, vx, vy, wx) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.wx = wx;
    this.lastX = x;
    this.lastY = y;
  }

  update(dt, mx, my, mb, tmb) {
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
      const grow = GROW * (tmb / 1000);
      if (d2 < (CURSOR_RADIUS + grow * grow)) {
        const sign = mb ? -1 : 1;
        this.vx = sign * dx * 0.01;
        this.vy = sign * dy * 0.01;
      }
      this.vx *= FRICTION;
      this.vy *= FRICTION;
      this.x += .1 * this.wx * -dy;
      this.y += .1 * this.wx * dx;
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

  hue() {
    const d = this.vx * this.vx + this.vy * this.vy;
    return 360 * Math.sin(Math.PI * d);
  }

  color() {
    return `hsla(${this.hue()}, 75%, 50%, 0.5)`;
  }
}

class Simulation {
  constructor(canvas, ctx) {
    this.firstUpdate = 0;
    this.lastUpdate = 0;
    this.lastReport = 0;
    this.firstPressed = 0;
    this.lastMouseButton = false;
    this.frames = 0;
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
    //if (this.audioCtx) return;
    return;
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
      const wx = Math.random() * 0.1;
      this.particles[i] = new Particle(x, y, vx, vy, wx);
    }
  }

  frame(now) {
    const dt = this.lastUpdate ? now - this.lastUpdate : 0;
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    let xs = 0;
    let xs2 = 0;
    const imageData = this.ctx.createImageData(this.ctx.canvas.width, this.ctx.canvas.height);
    if (!sim.mouseButton || !this.lastMouseButton) {
      this.firstPressed = now;
    }
    for (let i = 0; i < sim.particles.length; i++) {
      const p = sim.particles[i];
      p.update(dt, sim.mouseX, sim.mouseY, sim.mouseButton, now - this.firstPressed);
      //this.ctx.beginPath();
      //this.ctx.fillStyle = p.color();
      //this.ctx.fillRect(p.x - 0.5, p.y - 0.5, 1, 1);
      if (0 <= p.x && p.x < 1000 && 0 <= p.y && p.y <= 1000) {
        const color = hslToRgb(p.hue()/360, .75, .5);
        const offset = 4 * imageData.width * (~~p.y) + 4 * (~~p.x);
        imageData.data[offset] = color[0];
        imageData.data[offset+1] = color[1];
        imageData.data[offset+2] = color[2];
        imageData.data[offset+3] = 128;
      }
      xs += p.vx * p.vx + p.vy * p.vy;
      xs2 += Math.abs(p.x - sim.mouseX) + Math.abs(p.y - sim.mouseY);
    }
    this.ctx.putImageData(imageData, 0, 0);
    if (this.audioCtx) {
      let freq1 = (xs / sim.particles.length) * 40000;
      this.osc1.frequency.setValueAtTime(freq1, this.audioCtx.currentTime);
      let freq2 = (xs2 / sim.particles.length) * 0.01;
      this.osc2.frequency.setValueAtTime(freq2, this.audioCtx.currentTime);
    }
    this.lastMouseButton = sim.mouseButton;
    this.lastUpdate = now;
    this.frames++;
    if (!this.firstUpdate) {
      this.firstUpdate = now;
    } else if (now - this.lastReport >= 500) {
      document.querySelector('.fps').innerHTML = Math.round(1000 * this.frames / (now - this.firstUpdate));
      this.lastReport = now;
    }
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

// https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1/3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hueToRgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}
