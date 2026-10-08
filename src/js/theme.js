import seasonsData from '../data/seasons.json';

export class SeasonThemeManager {
  constructor() {
    this.currentSeason = 'autumn';
    this.canvas = document.getElementById('season-particles-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animationFrameId = null;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isDocumentHidden = false;
  }

  init() {
    this.detectCurrentSeason();
    this.initCanvas();
    this.bindEvents();
    this.applySeason(this.currentSeason, false);
  }

  detectCurrentSeason() {
    const currentMonth = new Date().getMonth(); // 0-indexed
    for (const [seasonKey, seasonConfig] of Object.entries(seasonsData)) {
      if (seasonConfig.months.includes(currentMonth)) {
        this.currentSeason = seasonKey;
        break;
      }
    }
  }

  initCanvas() {
    if (!this.canvas) return;
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  bindEvents() {
    const switcherBtns = document.querySelectorAll('.season-btn');
    switcherBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const season = e.currentTarget.dataset.season;
        if (season && season !== this.currentSeason) {
          this.applySeason(season, true);
        }
      });
    });

    // Pause particles when tab is hidden to save GPU/CPU cycles
    document.addEventListener('visibilitychange', () => {
      this.isDocumentHidden = document.hidden;
      if (this.isDocumentHidden) {
        this.stopParticles();
      } else if (!this.reducedMotion) {
        this.createParticles();
        this.animateParticles();
      }
    });

    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
      if (this.reducedMotion) {
        this.stopParticles();
      } else {
        this.createParticles();
        this.animateParticles();
      }
    });
  }

  applySeason(seasonKey, notifyUser = true) {
    const seasonConfig = seasonsData[seasonKey];
    if (!seasonConfig) return;

    this.currentSeason = seasonKey;

    // Apply CSS Variables to root
    const root = document.documentElement;
    Object.entries(seasonConfig.vars).forEach(([prop, val]) => {
      root.style.setProperty(prop, val);
    });

    // Update active pill button
    document.querySelectorAll('.season-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.season === seasonKey);
    });

    // Reset particles
    if (!this.reducedMotion && !this.isDocumentHidden) {
      this.createParticles();
      if (!this.animationFrameId) {
        this.animateParticles();
      }
    }

    if (notifyUser && window.showToast) {
      window.showToast(`Theme switched to ${seasonConfig.name} (${seasonConfig.subtitle})`);
    }
  }

  createParticles() {
    if (!this.canvas || this.reducedMotion) return;
    const config = seasonsData[this.currentSeason].particles;
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? config.mobileCount : config.count;

    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: config.size.min + Math.random() * (config.size.max - config.size.min),
        speedY: (0.3 + Math.random() * 0.5) * config.speed, // Slower graceful drift
        speedX: (Math.random() - 0.5) * 0.4 * config.speed,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        opacity: 0.25 + Math.random() * 0.5,
        type: config.type,
      });
    }
  }

  stopParticles() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  animateParticles() {
    if (this.reducedMotion || this.isDocumentHidden || !this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let p of this.particles) {
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.y * 0.008) * 0.3;
      p.rotation += p.rotSpeed;

      // Wrap around edges
      if (p.y > this.canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * this.canvas.width;
      }
      if (p.x > this.canvas.width + 20) p.x = -20;
      if (p.x < -20) p.x = this.canvas.width + 20;

      this.ctx.save();
      this.ctx.translate(Math.round(p.x), Math.round(p.y));
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;

      if (p.type === 'petals') {
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.type === 'sunglow') {
        const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.type === 'leaves') {
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size);
        this.ctx.quadraticCurveTo(p.size * 0.8, 0, 0, p.size);
        this.ctx.quadraticCurveTo(-p.size * 0.8, 0, 0, -p.size);
        this.ctx.fill();
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    this.animationFrameId = requestAnimationFrame(() => this.animateParticles());
  }
}
