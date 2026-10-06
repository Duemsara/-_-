/**
 * confetti.js - HTML5 Canvas Particle Confetti System
 * Pure Vanilla JavaScript particle physics engine
 * Created for: ទាញព្រ័ត្រ គណិតវិទ្យា (Tug of War Mathematics)
 */

class ConfettiEngine {
  constructor(canvasId = 'confetti-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = canvasId;
      this.canvas.className = 'confetti-canvas';
      document.body.appendChild(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.isRunning = false;

    this.colors = [
      '#f43f5e', '#ec4899', '#d946ef', '#a855f7',
      '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4',
      '#10b981', '#84cc16', '#eab308', '#f97316'
    ];

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  createParticle(x, y, isBurst = false) {
    const angle = isBurst ? Math.random() * Math.PI * 2 : Math.random() * Math.PI - Math.PI / 2;
    const speed = isBurst ? Math.random() * 12 + 6 : Math.random() * 4 + 2;

    return {
      x: x !== undefined ? x : Math.random() * this.width,
      y: y !== undefined ? y : -10,
      size: Math.random() * 10 + 6,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      vx: Math.cos(angle) * speed,
      vy: isBurst ? Math.sin(angle) * speed - 5 : Math.sin(angle) * speed + 2,
      gravity: 0.22,
      drag: 0.96,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      tilt: Math.random() * 10,
      tiltSpeed: Math.random() * 0.1 + 0.05,
      shape: Math.random() > 0.4 ? 'rect' : (Math.random() > 0.5 ? 'circle' : 'ribbon'),
      opacity: 1,
      fade: Math.random() * 0.005 + 0.002
    };
  }

  burst(count = 120) {
    const centerX = this.width / 2;
    const centerY = this.height * 0.4;

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(centerX + (Math.random() - 0.5) * 200, centerY, true));
    }

    if (!this.isRunning) {
      this.start();
    }
  }

  start() {
    this.isRunning = true;
    this.canvas.style.display = 'block';

    const loop = () => {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Add gentle ongoing shower if running
      if (this.isRunning && this.particles.length < 160) {
        this.particles.push(this.createParticle());
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];

        // Physics
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.tilt += p.tiltSpeed;
        p.opacity -= p.fade;

        // Render
        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);

        this.ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          const w = p.size;
          const h = p.size * 0.6 * Math.sin(p.tilt);
          this.ctx.fillRect(-w / 2, -h / 2, w, h);
        } else if (p.shape === 'circle') {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
        } else {
          // Ribbon / streamer
          const w = p.size * 1.5;
          const h = p.size * 0.35 * Math.sin(p.tilt);
          this.ctx.beginPath();
          this.ctx.moveTo(-w / 2, -h / 2);
          this.ctx.lineTo(w / 2, h / 2);
          this.ctx.lineTo(w / 2 - 2, h / 2 + 4);
          this.ctx.lineTo(-w / 2 - 2, -h / 2 + 4);
          this.ctx.closePath();
          this.ctx.fill();
        }

        this.ctx.restore();

        // Remove if offscreen or faded
        if (p.y > this.height + 20 || p.opacity <= 0) {
          this.particles.splice(i, 1);
        }
      }

      if (this.isRunning || this.particles.length > 0) {
        this.animationId = requestAnimationFrame(loop);
      } else {
        this.canvas.style.display = 'none';
        this.ctx.clearRect(0, 0, this.width, this.height);
      }
    };

    if (!this.animationId) {
      this.animationId = requestAnimationFrame(loop);
    }
  }

  stop() {
    this.isRunning = false;
  }

  clear() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.particles = [];
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
    if (this.canvas) {
      this.canvas.style.display = 'none';
    }
  }
}

// Global Confetti Instance
window.confettiEngine = new ConfettiEngine();
