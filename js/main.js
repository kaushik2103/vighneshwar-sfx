/* ==========================================================================
   VIGHNESHWAR SFX & FIREWORKS - MAIN JAVASCRIPT
   Dynamic interactions, animations, fireworks, modals, forms
   ========================================================================== */

(function() {
  'use strict';

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  
  const throttle = (fn, limit) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  };

  const prefersReducedMotion = () => 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ==========================================================================
  // FIREWORKS CANVAS ANIMATION (with Shooting Stars & Sky Effects)
  // ==========================================================================
  class FireworksCanvas {
    constructor() {
      this.canvas = $('#fireworks-canvas');
      if (!this.canvas) {
        console.log('FireworksCanvas: Canvas element not found!');
        return;
      }
      
      console.log('FireworksCanvas: Initialized');
      
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.fireworks = [];
      this.shootingStars = [];
      this.stars = [];
      this.animationId = null;
      this.lastTime = 0;
      this.autoFireworkTimer = null;
      this.shootingStarTimer = null;
      
      this.colors = [
        '#D4A843', '#E8C56D', '#FFD700', '#FFA500', '#FF6B1A',
        '#E83E1A', '#FF4500', '#FF8C00', '#DAA520', '#B8860B'
      ];
      
      this.init();
    }
    
    init() {
      this.resize();
      window.addEventListener('resize', debounce(() => this.resize(), 250));
      console.log('FireworksCanvas: init called, prefersReducedMotion:', prefersReducedMotion());
      
      if (!prefersReducedMotion()) {
        this.createStars();
        this.startAutoFireworks();
        this.startShootingStars();
        this.animate();
      }
    }
    
    createStars() {
      const starCount = Math.min(150, Math.floor((this.canvas.width * this.canvas.height) / 8000));
      for (let i = 0; i < starCount; i++) {
        this.stars.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height * 0.7,
          size: Math.random() * 1.5 + 0.5,
          brightness: Math.random() * 0.5 + 0.3,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2
        });
      }
    }
    
    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.stars = [];
      this.createStars();
    }
    
    startAutoFireworks() {
      const launch = () => {
        if (this.fireworks.length < 3 && Math.random() < 0.015) {
          this.createFirework(
            Math.random() * this.canvas.width,
            this.canvas.height,
            this.colors[Math.floor(Math.random() * this.colors.length)]
          );
        }
        this.autoFireworkTimer = requestAnimationFrame(launch);
      };
      launch();
    }
    
    startShootingStars() {
      const launch = () => {
        if (this.shootingStars.length < 2 && Math.random() < 0.003) {
          this.createShootingStar();
        }
        this.shootingStarTimer = requestAnimationFrame(launch);
      };
      launch();
    }
    
    createFirework(x, y, color) {
      const particleCount = 60 + Math.floor(Math.random() * 40);
      const particles = [];
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 2 + Math.random() * 6;
        const gravity = 0.02 + Math.random() * 0.03;
        
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity,
          color,
          alpha: 1,
          decay: 0.008 + Math.random() * 0.012,
          size: 2 + Math.random() * 3,
          trail: []
        });
      }
      
      this.fireworks.push({ particles, exploded: false });
    }
    
    createShootingStar() {
      const startX = Math.random() * this.canvas.width;
      const startY = -50;
      const angle = Math.PI / 4 + Math.random() * Math.PI / 4;
      const speed = 15 + Math.random() * 10;
      const length = 100 + Math.random() * 150;
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      
      this.shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        length,
        trail: [],
        width: 2 + Math.random() * 2
      });
    }
    
    update(deltaTime) {
      for (let i = this.fireworks.length - 1; i >= 0; i--) {
        const fw = this.fireworks[i];
        let allDead = true;
        
        fw.particles.forEach(p => {
          if (p.alpha > 0) {
            allDead = false;
            p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
            if (p.trail.length > 8) p.trail.shift();
            
            p.x += p.vx * deltaTime * 0.06;
            p.y += p.vy * deltaTime * 0.06;
            p.vy += p.gravity * deltaTime * 0.06;
            p.alpha -= p.decay;
            p.size *= 0.995;
          }
        });
        
        if (allDead) this.fireworks.splice(i, 1);
      }
      
      for (let i = this.shootingStars.length - 1; i >= 0; i--) {
        const star = this.shootingStars[i];
        if (star.alpha <= 0 || star.y > this.canvas.height + 100 || star.x > this.canvas.width + 100) {
          this.shootingStars.splice(i, 1);
          continue;
        }
        
        star.trail.push({ x: star.x, y: star.y, alpha: star.alpha });
        if (star.trail.length > 30) star.trail.shift();
        
        star.x += star.vx * deltaTime * 0.06;
        star.y += star.vy * deltaTime * 0.06;
        star.alpha -= 0.003;
      }
      
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
        
        p.trail.push({ x: p.x, y: p.y, alpha: p.alpha * 0.5 });
        if (p.trail.length > 6) p.trail.shift();
        
        p.x += p.vx * deltaTime * 0.06;
        p.y += p.vy * deltaTime * 0.06;
        p.vy += p.gravity * deltaTime * 0.06;
        p.alpha -= p.decay;
        p.size *= 0.99;
      }
      
      if (Math.random() < 0.015 && this.particles.length < 80) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: this.canvas.height + 10,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.5 - Math.random() * 1,
          gravity: 0.01,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          alpha: 0.3 + Math.random() * 0.3,
          decay: 0.002,
          size: 1 + Math.random() * 2,
          trail: []
        });
      }
    }
    
    draw() {
      this.ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.drawStars();
      
      this.fireworks.forEach(fw => {
        fw.particles.forEach(p => {
          if (p.alpha <= 0) return;
          
          p.trail.forEach((t, idx) => {
            const trailAlpha = t.alpha * (idx / p.trail.length) * 0.5;
            this.ctx.beginPath();
            this.ctx.arc(t.x, t.y, p.size * (idx / p.trail.length), 0, Math.PI * 2);
            this.ctx.fillStyle = this.hexToRgba(p.color, trailAlpha);
            this.ctx.fill();
          });
          
          const gradient = this.ctx.createRadialGradient(
            p.x, p.y, 0, p.x, p.y, p.size * 3
          );
          gradient.addColorStop(0, this.hexToRgba(p.color, p.alpha));
          gradient.addColorStop(1, this.hexToRgba(p.color, 0));
          
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          this.ctx.fillStyle = gradient;
          this.ctx.fill();
          
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fillStyle = this.hexToRgba(p.color, p.alpha);
          this.ctx.fill();
        });
      });
      
      this.shootingStars.forEach(star => {
        if (star.alpha <= 0) return;
        
        star.trail.forEach((t, idx) => {
          const trailAlpha = t.alpha * (idx / star.trail.length) * 0.8;
          const size = star.width * (idx / star.trail.length);
          this.ctx.beginPath();
          this.ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
          this.ctx.fillStyle = this.hexToRgba(star.color, trailAlpha);
          this.ctx.fill();
        });
        
        const gradient = this.ctx.createLinearGradient(
          star.x, star.y,
          star.x - star.vx * 0.5, star.y - star.vy * 0.5
        );
        gradient.addColorStop(0, this.hexToRgba(star.color, star.alpha));
        gradient.addColorStop(1, this.hexToRgba(star.color, 0));
        
        this.ctx.beginPath();
        this.ctx.moveTo(star.x, star.y);
        this.ctx.lineTo(
          star.x - Math.cos(Math.atan2(star.vy, star.vx)) * star.length,
          star.y - Math.sin(Math.atan2(star.vy, star.vx)) * star.length
        );
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = star.width;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.width * 1.5, 0, Math.PI * 2);
        this.ctx.fillStyle = this.hexToRgba(star.color, star.alpha);
        this.ctx.fill();
      });
      
      this.particles.forEach(p => {
        if (p.alpha <= 0) return;
        
        p.trail.forEach((t, idx) => {
          const trailAlpha = t.alpha * (idx / p.trail.length) * 0.3;
          this.ctx.beginPath();
          this.ctx.arc(t.x, t.y, p.size * (idx / p.trail.length) * 0.5, 0, Math.PI * 2);
          this.ctx.fillStyle = this.hexToRgba(p.color, trailAlpha);
          this.ctx.fill();
        });
        
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = this.hexToRgba(p.color, p.alpha);
        this.ctx.fill();
      });
    }
    
    drawStars() {
      const time = Date.now() * 0.001;
      this.stars.forEach(star => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
        const alpha = star.brightness * twinkle;
        const size = star.size * twinkle;
        
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        this.ctx.fill();
        
        if (star.size > 1.5 && alpha > 0.7) {
          this.ctx.beginPath();
          this.ctx.arc(star.x, star.y, size * 2.5, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(212, 168, 67, ${alpha * 0.15})`;
          this.ctx.fill();
        }
      });
    }
    
    hexToRgba(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    animate(time) {
      const deltaTime = time - this.lastTime;
      this.lastTime = time;
      
      this.update(deltaTime);
      this.draw();
      
      this.animationId = requestAnimationFrame((t) => this.animate(t));
    }
    
    destroy() {
      cancelAnimationFrame(this.animationId);
      cancelAnimationFrame(this.autoFireworkTimer);
      cancelAnimationFrame(this.shootingStarTimer);
    }
  }

  // ==========================================================================
  // CURSOR EFFECTS (Enhanced with dot, ring, and glow)
  // ==========================================================================
  class CursorEffects {
    constructor() {
      this.glow = $('#cursorGlow');
      this.dot = $('#cursorDot');
      this.ring = $('#cursorRing');
      if (!this.glow || !this.dot || !this.ring) return;
      
      this.glowX = 0;
      this.glowY = 0;
      this.glowTargetX = 0;
      this.glowTargetY = 0;
      this.glowActive = false;
      
      this.dotX = 0;
      this.dotY = 0;
      this.dotTargetX = 0;
      this.dotTargetY = 0;
      this.dotActive = false;
      
      this.ringX = 0;
      this.ringY = 0;
      this.ringTargetX = 0;
      this.ringTargetY = 0;
      this.ringActive = false;
      
      this.init();
    }
    
    init() {
      document.addEventListener('mousemove', (e) => {
        this.glowTargetX = e.clientX;
        this.glowTargetY = e.clientY;
        this.dotTargetX = e.clientX;
        this.dotTargetY = e.clientY;
        this.ringTargetX = e.clientX;
        this.ringTargetY = e.clientY;
        
        if (!this.glowActive) {
          this.glowActive = true;
          this.glow.classList.add('active');
          this.glowX = this.glowTargetX;
          this.glowY = this.glowTargetY;
        }
        if (!this.dotActive) {
          this.dotActive = true;
          this.dot.classList.add('active');
          this.dotX = this.dotTargetX;
          this.dotY = this.dotTargetY;
        }
        if (!this.ringActive) {
          this.ringActive = true;
          this.ring.classList.add('active');
          this.ringX = this.ringTargetX;
          this.ringY = this.ringTargetY;
        }
      });
      
      document.addEventListener('mouseleave', () => {
        this.glowActive = false;
        this.glow.classList.remove('active');
        this.dotActive = false;
        this.dot.classList.remove('active');
        this.ringActive = false;
        this.ring.classList.remove('active');
      });
      
      // Magnetic hover detection
      document.addEventListener('mouseover', (e) => {
        const magnetic = e.target.closest('.magnetic, .btn, .nav-link, .social-link, .phone-link, .machine-item, .gallery-item, .event-card, .service-card, .effect-card, .why-card, .contact-card');
        if (magnetic) {
          this.dot.classList.add('hover');
          this.ring.classList.add('hover');
        }
      });
      
      document.addEventListener('mouseout', (e) => {
        const magnetic = e.target.closest('.magnetic, .btn, .nav-link, .social-link, .phone-link, .machine-item, .gallery-item, .event-card, .service-card, .effect-card, .why-card, .contact-card');
        if (magnetic) {
          this.dot.classList.remove('hover');
          this.ring.classList.remove('hover');
        }
      });
      
      if (!prefersReducedMotion()) {
        this.animate();
      }
    }
    
    animate() {
      if (this.glowActive) {
        this.glowX += (this.glowTargetX - this.glowX) * 0.15;
        this.glowY += (this.glowTargetY - this.glowY) * 0.15;
        this.glow.style.transform = `translate(${this.glowX - 200}px, ${this.glowY - 200}px)`;
      }
      
      if (this.dotActive) {
        this.dotX += (this.dotTargetX - this.dotX) * 0.3;
        this.dotY += (this.dotTargetY - this.dotY) * 0.3;
        this.dot.style.transform = `translate(${this.dotX - 4}px, ${this.dotY - 4}px)`;
      }
      
      if (this.ringActive) {
        this.ringX += (this.ringTargetX - this.ringX) * 0.2;
        this.ringY += (this.ringTargetY - this.ringY) * 0.2;
        this.ring.style.transform = `translate(${this.ringX - 16}px, ${this.ringY - 16}px)`;
      }
      
      requestAnimationFrame(() => this.animate());
    }
  }

  // ==========================================================================
  // HERO SHAPES ANIMATION
  // ==========================================================================
  class HeroShapes {
    constructor() {
      this.container = $('#heroShapes');
      if (!this.container) return;
      
      this.shapes = [];
      this.init();
    }
    
    init() {
      if (prefersReducedMotion()) return;
      
      const shapesConfig = [
        { size: 300, color: 'var(--color-gold)', top: '10%', left: '5%', delay: 0 },
        { size: 200, color: 'var(--color-fire-orange)', top: '60%', right: '10%', delay: -5 },
        { size: 150, color: 'var(--color-gold-light)', bottom: '20%', left: '15%', delay: -10 },
        { size: 250, color: 'var(--color-fire-yellow)', top: '30%', right: '20%', delay: -15 }
      ];
      
      shapesConfig.forEach((config, i) => {
        const shape = document.createElement('div');
        shape.className = 'hero-shape hero-shape-' + (i + 1);
        shape.style.cssText = `
          position: absolute;
          width: ${config.size}px;
          height: ${config.size}px;
          border-radius: 50%;
          background: radial-gradient(circle, ${config.color}, transparent);
          opacity: 0.1;
          pointer-events: none;
          ${config.top ? 'top: ' + config.top : ''}
          ${config.bottom ? 'bottom: ' + config.bottom : ''}
          ${config.left ? 'left: ' + config.left : ''}
          ${config.right ? 'right: ' + config.right : ''}
          animation: shapeFloat 20s ease-in-out infinite;
          animation-delay: ${config.delay}s;
        `;
        
        this.container.appendChild(shape);
        this.shapes.push(shape);
      });
    }
  }

  // ==========================================================================
  // MAGNETIC BUTTON EFFECT
  // ==========================================================================
  class MagneticButton {
    constructor() {
      this.elements = $$('.magnetic, .btn, .nav-link, .social-link, .phone-link, .machine-item, .gallery-item, .event-card, .service-card, .effect-card, .why-card, .contact-card');
      this.init();
    }
    
    init() {
      if (prefersReducedMotion()) return;
      
      this.elements.forEach(el => {
        el.addEventListener('mousemove', (e) => this.handleMouseMove(e, el));
        el.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, el));
      });
    }
    
    handleMouseMove(e, el) {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const moveX = x * 0.3;
      const moveY = y * 0.3;
      
      el.style.transform = `translate(${moveX}px, ${moveY}px)`;
      el.style.transition = 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    
    handleMouseLeave(e, el) {
      el.style.transform = 'translate(0, 0)';
      el.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }
  }

  // ==========================================================================
  // SCROLL PROGRESS INDICATOR
  // ==========================================================================
  class ScrollProgress {
    constructor() {
      this.bar = null;
      this.init();
    }
    
    init() {
      this.bar = document.createElement('div');
      this.bar.className = 'scroll-progress';
      document.body.appendChild(this.bar);
      
      window.addEventListener('scroll', throttle(() => this.update(), 10), { passive: true });
    }
    
    update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight;
      
      this.bar.style.transform = `scaleX(${scrollPercent})`;
    }
  }

  // ==========================================================================
  // TEXT REVEAL ANIMATION
  // ==========================================================================
  class TextReveal {
    constructor() {
      this.elements = $$('.text-reveal');
      this.init();
    }
    
    init() {
      if (prefersReducedMotion()) {
        this.elements.forEach(el => {
          el.querySelectorAll('span').forEach(span => {
            span.style.transform = 'translateY(0)';
            span.style.opacity = '1';
          });
        });
        return;
      }
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const spans = entry.target.querySelectorAll('span');
            spans.forEach((span, i) => {
              setTimeout(() => {
                span.style.transform = 'translateY(0)';
                span.style.opacity = '1';
              }, i * 100);
            });
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      
      this.elements.forEach(el => observer.observe(el));
    }
  }

  // ==========================================================================
  // PARALLAX ELEMENTS
  // ==========================================================================
  class ParallaxElements {
    constructor() {
      this.elements = $$('[data-parallax]');
      this.init();
    }
    
    init() {
      if (prefersReducedMotion() || window.innerWidth < 768) return;
      
      window.addEventListener('scroll', throttle(() => this.update(), 16), { passive: true });
    }
    
    update() {
      const scrollY = window.scrollY;
      
      this.elements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        const y = scrollY * speed;
        el.style.transform = `translate3d(0, ${y}px, 0)`;
      });
    }
  }

  // ==========================================================================
  // HERO PARTICLES
  // ==========================================================================
  class HeroParticles {
    constructor() {
      this.container = $('#heroParticles');
      if (!this.container) return;
      
      this.particles = [];
      this.init();
    }
    
    init() {
      if (prefersReducedMotion()) return;
      
      for (let i = 0; i < 30; i++) {
        this.createParticle();
      }
      this.animate();
    }
    
    createParticle() {
      const particle = document.createElement('div');
      const size = Math.random() * 4 + 1;
      const colors = ['#D4A843', '#E8C56D', '#FFD700', '#FFA500', '#FF6B1A'];
      
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.5 + 0.1};
        pointer-events: none;
        box-shadow: 0 0 ${size * 2}px ${colors[Math.floor(Math.random() * colors.length)]};
      `;
      
      this.container.appendChild(particle);
      this.particles.push({
        el: particle,
        x: parseFloat(particle.style.left),
        y: parseFloat(particle.style.top),
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2 - 0.1,
        size
      });
    }
    
    animate() {
      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < -5) p.x = 105;
        if (p.x > 105) p.x = -5;
        if (p.y < -5) p.y = 105;
        if (p.y > 105) p.y = -5;
        
        p.el.style.left = p.x + '%';
        p.el.style.top = p.y + '%';
      });
      
      requestAnimationFrame(() => this.animate());
    }
  }

  // ==========================================================================
  // ABOUT PARTICLES
  // ==========================================================================
  class AboutParticles {
    constructor() {
      this.container = $('#aboutParticles');
      if (!this.container) return;
      
      this.particles = [];
      this.init();
    }
    
    init() {
      if (prefersReducedMotion()) return;
      
      for (let i = 0; i < 20; i++) {
        this.createParticle();
      }
      this.animate();
    }
    
    createParticle() {
      const particle = document.createElement('div');
      const size = Math.random() * 3 + 1;
      const colors = ['#D4A843', '#FFD700', '#FFA500'];
      
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.6 + 0.2};
        pointer-events: none;
        box-shadow: 0 0 ${size * 3}px ${colors[Math.floor(Math.random() * colors.length)]};
      `;
      
      this.container.appendChild(particle);
      this.particles.push({
        el: particle,
        x: parseFloat(particle.style.left),
        y: parseFloat(particle.style.top),
        angle: Math.random() * Math.PI * 2,
        radius: 30 + Math.random() * 40,
        speed: 0.005 + Math.random() * 0.01,
        centerX: 50,
        centerY: 50,
        size
      });
    }
    
    animate() {
      this.particles.forEach(p => {
        p.angle += p.speed;
        p.x = p.centerX + Math.cos(p.angle) * p.radius;
        p.y = p.centerY + Math.sin(p.angle) * p.radius;
        
        p.el.style.left = p.x + '%';
        p.el.style.top = p.y + '%';
      });
      
      requestAnimationFrame(() => this.animate());
    }
  }

  // ==========================================================================
  // GALLERY PARTICLES
  // ==========================================================================
  class GalleryParticles {
    constructor() {
      this.container = $('#galleryParticles');
      if (!this.container) return;
      
      this.particles = [];
      this.init();
    }
    
    init() {
      if (prefersReducedMotion()) return;
      
      for (let i = 0; i < 25; i++) {
        this.createParticle();
      }
      this.animate();
    }
    
    createParticle() {
      const particle = document.createElement('div');
      const size = Math.random() * 3 + 1;
      const colors = ['#D4A843', '#E8C56D', '#FFD700', '#FFA500', '#FF6B1A'];
      
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: 0;
        pointer-events: none;
        box-shadow: 0 0 ${size * 3}px ${colors[Math.floor(Math.random() * colors.length)]};
        animation: galleryParticleFloat ${8000 + Math.random() * 8000}ms ease-in-out infinite;
        animation-delay: ${Math.random() * 5000}ms;
      `;
      
      this.container.appendChild(particle);
      this.particles.push(particle);
    }
    
    animate() {
      // Particles are CSS-animated
requestAnimationFrame(() => this.animate());
    }
  }

  // ==========================================================================
  // GALLERY SCROLL EFFECTS
  // ==========================================================================
  class GalleryScrollEffects {
    constructor() {
      this.categories = $$('.gallery-category');
      this.init();
    }
    init() {
      if (prefersReducedMotion()) return;
      
      window.addEventListener('scroll', throttle(() => this.update(), 16), { passive: true });
      this.update();
    }
    
    update() {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      this.categories.forEach((category, index) => {
        const rect = category.getBoundingClientRect();
        const categoryTop = rect.top + scrollY;
        const categoryHeight = rect.height;
        
        // Calculate progress (0 to 1) as category enters viewport
        const progress = Math.max(0, Math.min(1, 
          (scrollY + viewportHeight * 0.6 - categoryTop) / (categoryHeight + viewportHeight * 0.4)
        ));
        
        // Parallax for category icon
        const icon = category.querySelector('.category-icon');
        if (icon) {
          icon.style.transform = `translateY(${progress * -30}px) rotate(${progress * 5}deg)`;
        }
        
        // Stagger cards based on scroll
        const cards = category.querySelectorAll('.gallery-card');
        cards.forEach((card, i) => {
          const cardDelay = i * 0.1;
          const cardProgress = Math.max(0, Math.min(1, progress - cardDelay) / 0.5);
          
          if (cardProgress > 0) {
            card.style.opacity = cardProgress;
            card.style.transform = `translateY(${30 * (1 - cardProgress)}px) scale(${0.95 + 0.05 * cardProgress})`;
          }
        });
        
        // Divider animation
        const header = category.querySelector('.category-header');
        if (header) {
          header.style.setProperty('--divider-progress', progress);
        }
      });
    }
  }

  // ==========================================================================
  // NAVIGATION
  // ==========================================================================
  class Navigation {
    constructor() {
      this.header = $('#header');
      this.navToggle = $('#navToggle');
      this.navMenu = $('#navMenu');
      this.navLinks = $$('.nav-link');
      this.lastScroll = 0;
      
      this.init();
    }
    
    init() {
      this.handleScroll();
      this.handleToggle();
      this.handleLinks();
      this.handleResize();
      
      window.addEventListener('scroll', throttle(() => this.handleScroll(), 10), { passive: true });
      window.addEventListener('resize', () => this.handleResize());
    }
    
    handleScroll() {
      const scrollY = window.scrollY;
      
      if (scrollY > 50) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }
      
      this.lastScroll = scrollY;
    }
    
    handleToggle() {
      this.navToggle.addEventListener('click', () => {
        const isOpen = this.navMenu.classList.toggle('open');
        this.navToggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
      
      this.navLinks.forEach(link => {
        link.addEventListener('click', () => {
          this.navMenu.classList.remove('open');
          this.navToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
      
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.navMenu.classList.contains('open')) {
          this.navMenu.classList.remove('open');
          this.navToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    }
    
    handleLinks() {
      const sections = $$('section[id]');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            this.navLinks.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
      
      sections.forEach(section => observer.observe(section));
    }
    
    handleResize() {
      if (window.innerWidth > 768) {
        this.navMenu.classList.remove('open');
        this.navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    }
  }

  // ==========================================================================
  // SMOOTH SCROLL
  // ==========================================================================
  class SmoothScroll {
    constructor() {
      this.init();
    }
    
    init() {
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (href === '#') return;
        
        const target = $(href);
        if (!target) return;
        
        e.preventDefault();
        
        const headerHeight = $('#header').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        history.pushState(null, '', href);
      });
    }
  }

  // ==========================================================================
  // IMAGE MODAL / LIGHTBOX
  // ==========================================================================
  class ImageModal {
    constructor() {
      this.modal = null;
      this.currentIndex = 0;
      this.images = [];
      this.init();
    }
    
    init() {
      this.createModal();
      this.bindMachineItems();
      this.bindKeyboard();
    }
    
    createModal() {
      this.modal = document.createElement('div');
      this.modal.className = 'image-modal';
      this.modal.innerHTML = `
        <div class="modal-content">
          <button class="modal-close" aria-label="Close modal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <button class="modal-nav modal-prev" aria-label="Previous image">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <img class="modal-image" src="" alt="" loading="lazy">
          <button class="modal-nav modal-next" aria-label="Next image">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
          <div class="modal-counter"></div>
          <div class="modal-caption"></div>
        </div>
      `;
      
      document.body.appendChild(this.modal);
      
      this.modalImage = this.modal.querySelector('.modal-image');
      this.modalCounter = this.modal.querySelector('.modal-counter');
      this.modalCaption = this.modal.querySelector('.modal-caption');
      this.modalClose = this.modal.querySelector('.modal-close');
      this.modalPrev = this.modal.querySelector('.modal-prev');
      this.modalNext = this.modal.querySelector('.modal-next');
      
      this.modalClose.addEventListener('click', () => this.close());
      this.modalPrev.addEventListener('click', () => this.prev());
      this.modalNext.addEventListener('click', () => this.next());
      
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.close();
      });
      
      // Touch swipe support
      let touchStartX = 0;
      this.modal.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });
      
      this.modal.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? this.next() : this.prev();
        }
      }, { passive: true });
    }
    
    bindMachineItems() {
      const items = $$('.machine-item');
      
      items.forEach((item, index) => {
        item.addEventListener('click', () => {
          this.open(index, items);
        });
        
        // Add click hint
        const placeholder = item.querySelector('.machine-placeholder');
        if (placeholder && !item.querySelector('.click-hint')) {
          const hint = document.createElement('span');
          hint.className = 'click-hint';
          hint.style.cssText = `
            position: absolute;
            bottom: 12px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.75rem;
            color: var(--color-text-dim);
            opacity: 0;
            transition: opacity var(--transition-base);
            pointer-events: none;
            white-space: nowrap;
          `;
          hint.textContent = 'Click to view';
          item.style.position = 'relative';
          item.appendChild(hint);
          
          item.addEventListener('mouseenter', () => hint.style.opacity = '1');
          item.addEventListener('mouseleave', () => hint.style.opacity = '0');
        }
      });
    }
    
    bindKeyboard() {
      document.addEventListener('keydown', (e) => {
        if (!this.modal.classList.contains('open')) return;
        
        switch (e.key) {
          case 'Escape': this.close(); break;
          case 'ArrowLeft': this.prev(); break;
          case 'ArrowRight': this.next(); break;
        }
      });
    }
    
    open(index, items) {
      this.images = Array.from(items).map(item => {
        const img = item.querySelector('.machine-image');
        const placeholder = item.querySelector('.machine-placeholder');
        const machineType = item.dataset.machine;
        
        const titles = {
          'co2-jet': 'CO₂ Jet Machine',
          'sparkular': 'Sparkular (Cold Fireworks) Machine',
          'confetti': 'Confetti Blower Machine',
          'flame': 'Flame Projector Machine',
          'bubble': 'Bubble Machine',
          'fog': 'Smoke/Fog Machine',
          'laser': 'Laser Light System',
          'dmx': 'DMX Controller',
          'moving-head': 'Moving Head Lights',
          'truss': 'Stage Truss & Lighting Setup'
        };
        
        return {
          src: img?.src || '',
          alt: img?.alt || titles[machineType] || 'Equipment',
          title: titles[machineType] || 'Equipment',
          hasImage: item.classList.contains('has-image')
        };
      });
      
      this.currentIndex = index;
      this.updateImage();
      this.modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      
      this.modalClose.focus();
    }
    
    close() {
      this.modal.classList.remove('open');
      document.body.style.overflow = '';
    }
    
    prev() {
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
      this.updateImage();
    }
    
    next() {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      this.updateImage();
    }
    
    updateImage() {
      const image = this.images[this.currentIndex];
      
      if (image.hasImage && image.src) {
        this.modalImage.src = image.src;
        this.modalImage.alt = image.alt;
        this.modalImage.style.display = 'block';
      } else {
        this.modalImage.style.display = 'none';
        this.modalImage.src = '';
      }
      
      this.modalCounter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
      this.modalCaption.textContent = image.title;
    }
  }

// ==========================================================================
// VIDEO MODAL (click to expand)
// ==========================================================================
class VideoModal {
  constructor() {
    this.videoModal = null;
    this.init();
  }
  
  init() {
    this.createVideoModal();
    this.bindGalleryItems();
  }
  
  bindGalleryItems() {
    $$('.gallery-item').forEach(item => {
      item.addEventListener('click', () => this.openVideoModal(item));
    });
  }
  
  createVideoModal() {
    this.videoModal = document.createElement('div');
    this.videoModal.className = 'video-modal';
    this.videoModal.innerHTML = `
      <div class="video-modal-content">
        <button class="video-modal-close" aria-label="Close video">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <video class="video-modal-video" controls></video>
      </div>
    `;
    
    document.body.appendChild(this.videoModal);
    
    this.videoModal.querySelector('.video-modal-close').addEventListener('click', () => this.closeVideoModal());
    this.videoModal.addEventListener('click', (e) => {
      if (e.target === this.videoModal) this.closeVideoModal();
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.videoModal.classList.contains('open')) {
        this.closeVideoModal();
      }
    });
  }
  
  openVideoModal(item) {
    const video = item.querySelector('video');
    const modalVideo = this.videoModal.querySelector('.video-modal-video');
    
    if (video && video.src) {
      modalVideo.src = video.src;
      modalVideo.currentTime = 0;
      this.videoModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      modalVideo.play().catch(() => {});
    }
  }
  
  closeVideoModal() {
    const modalVideo = this.videoModal.querySelector('.video-modal-video');
    this.videoModal.classList.remove('open');
    document.body.style.overflow = '';
    modalVideo.pause();
    modalVideo.src = '';
  }
}

// ==========================================================================
// SCROLL TOP BUTTON
// ==========================================================================
class ScrollTop {
    constructor() {
      this.btn = $('#scrollTop');
      console.log('ScrollTop init, button found:', !!this.btn, 'Protocol:', location.protocol);
      if (!this.btn) return;
      
      // Click handler
      this.btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.scrollToTop();
      });
      
      // For file:// protocol, always show the button
      if (location.protocol === 'file:') {
        this.btn.classList.add('visible');
        console.log('File protocol detected, showing scroll-top button');
        return;
      }
      
      // Scroll visibility handler
      this.handleScroll = throttle(() => {
        if (window.scrollY > 200) {
          this.btn.classList.add('visible');
        } else {
          this.btn.classList.remove('visible');
        }
      }, 50);
      
      window.addEventListener('scroll', this.handleScroll, { passive: true });
      
      // Initial check
      this.handleScroll();
    }
    
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

// ==========================================================================
// SCROLL REVEAL ANIMATIONS
// ==========================================================================
class ScrollReveal {
  constructor() {
    this.elements = $$('.reveal');
    if (this.elements.length === 0) return;
    
    // On file:// protocol, show all immediately (IntersectionObserver unreliable)
    if (window.location.protocol === 'file:') {
      this.elements.forEach(el => el.classList.add('visible'));
      return;
    }
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    this.elements.forEach(el => this.observer.observe(el));
  }
}

// ==========================================================================
// DYNAMIC GALLERY - SPLIT LAYOUT WITH SCROLL EXPANSION
// ==========================================================================
class DynamicGallery {
  constructor() {
    this.categories = $$('.split-gallery-category');
    if (this.categories.length === 0) return;
    
    this.init();
  }
  
  init() {
    // Add scroll listener for split expansion
    window.addEventListener('scroll', throttle(() => this.updateSplit(), 16), { passive: true });
    
    // Initial update
    this.updateSplit();
    
    // Handle click to expand video
    $$('.gallery-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.play-btn')) {
          const video = card.querySelector('.card-media');
          if (video && video.src) {
            this.openFullscreen(video.src);
          }
        }
      });
    });
  }
  
  updateSplit() {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    
    this.categories.forEach(category => {
      const wrapper = category.querySelector('.split-gallery-wrapper');
      if (!wrapper) return;
      
      const categoryRect = category.getBoundingClientRect();
      const categoryTop = categoryRect.top + scrollY;
      const categoryHeight = categoryRect.height;
      
      // Calculate scroll progress through this category (0 to 1)
      const progress = (scrollY + viewportHeight * 0.4 - categoryTop) / (categoryHeight + viewportHeight * 0.6);
      const clampedProgress = Math.max(0, Math.min(1, progress));
      
      // Calculate gap expansion
      const initialGap = 120; // Initial gap in px
      const maxGap = 600; // Max gap in px
      const currentGap = initialGap + (maxGap - initialGap) * clampedProgress * clampedProgress; // Ease out quad
      
      // Calculate side translation (each side moves half the gap expansion)
      const gapExpansion = (currentGap - initialGap) / 2;
      
      // Apply to sides
      const leftSide = wrapper.querySelector('.split-gallery-left');
      const rightSide = wrapper.querySelector('.split-gallery-right');
      
      if (leftSide) {
        leftSide.style.transform = `translateX(${-gapExpansion}px)`;
      }
      if (rightSide) {
        rightSide.style.transform = `translateX(${gapExpansion}px)`;
      }
      
      // Update center glow intensity
      const centerGlow = category.querySelector('.center-glow');
      if (centerGlow) {
        const glowIntensity = 0.3 + 0.7 * clampedProgress;
        centerGlow.style.opacity = glowIntensity;
        centerGlow.style.transform = `translate(-50%, -50%) scale(${1 + clampedProgress * 0.4})`;
      }
    });
  }
  
  openFullscreen(src) {
    // Create fullscreen modal
    const modal = document.createElement('div');
    modal.className = 'video-fullscreen-modal';
    modal.innerHTML = `
      <div class="video-fullscreen-content">
        <button class="video-fullscreen-close" aria-label="Close">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <video class="video-fullscreen-media" controls autoplay playsinline>
          <source src="${src}" type="video/mp4">
        </video>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Animate in
    requestAnimationFrame(() => modal.classList.add('open'));
    
    // Close handlers
    const close = () => {
      modal.classList.remove('open');
      setTimeout(() => {
        modal.remove();
        document.body.style.overflow = '';
      }, 300);
    };
    
    modal.querySelector('.video-fullscreen-close').addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
    
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', escHandler);
      }
    });
  }
}

// ==========================================================================
// WHATSAPP FLOAT HANDLING
// ==========================================================================
class WhatsAppFloat {
    constructor() {
      this.btn = $('#whatsappFloat');
      if (!this.btn) return;
      
      this.init();
    }
    
    init() {
      // Add click tracking
      this.btn.addEventListener('click', () => {
        // Analytics could be added here
        console.log('WhatsApp chat initiated');
      });
      
      // Show/hide based on scroll
      window.addEventListener('scroll', throttle(() => {
        if (window.scrollY > 200) {
          this.btn.style.opacity = '1';
          this.btn.style.visibility = 'visible';
          this.btn.style.transform = 'translateY(0) scale(1)';
        } else {
          this.btn.style.opacity = '0';
          this.btn.style.visibility = 'hidden';
          this.btn.style.transform = 'translateY(20px) scale(0.9)';
        }
      }, 100), { passive: true });
      
      // Initial state
      if (window.scrollY <= 200) {
        this.btn.style.opacity = '0';
        this.btn.style.visibility = 'hidden';
        this.btn.style.transform = 'translateY(20px) scale(0.9)';
      }
    }
  }

  // ==========================================================================
  // INITIALIZE ALL COMPONENTS
  // ==========================================================================
  function init() {
    // Core animations
    new FireworksCanvas();
    new CursorEffects();
    new HeroShapes();
    new HeroParticles();
    new AboutParticles();
    new GalleryParticles();
    new GalleryScrollEffects();
    
    // Interactive effects
    new MagneticButton();
    new ScrollProgress();
    new TextReveal();
    new ParallaxElements();
    
    // Scroll interactions
    addRevealClasses();
    new ScrollReveal();
    new Navigation();
    new SmoothScroll();
    new ScrollTop();
    
    // Interactive components
    new ImageModal();
    new VideoModal();
    new DynamicGallery();
    new WhatsAppFloat();
    
    console.log('%c🎆 Vighneshwar SFX & Fireworks - Website loaded successfully!', 'color: #D4A843; font-size: 16px; font-weight: bold;');
    console.log('%c✨ Igniting Dreams. Creating Legends. ✨', 'color: #FF6B1A; font-size: 12px;');
  }
  
  function addRevealClasses() {
    // Add reveal to sections
    $$('section').forEach((section, i) => {
      if (i > 0) section.classList.add('reveal');
    });
    
    // Add stagger to grids
    $$('.event-grid, .services-grid, .effects-grid, .why-choose-grid, .machines-grid, .about-stats, .contact-card, .footer-links, .gallery-grid').forEach(grid => {
      grid.classList.add('stagger');
    });
    
    // Add reveal to individual cards
    $$('.event-card, .service-card, .effect-card, .why-card, .machine-item, .about-stat, .contact-card, .gallery-item, .gallery-card, .social-link').forEach((card, i) => {
      card.style.transitionDelay = `${Math.min(i * 0.05, 0.3)}s`;
    });
    
    // Auto-show on file:// protocol (no scroll events)
    if (location.protocol === 'file:') {
      $$('.reveal, .stagger').forEach(el => el.classList.add('visible'));
      // Show scroll top button on file protocol
      const scrollBtn = $('#scrollTop');
      if (scrollBtn) scrollBtn.classList.add('visible');
    }
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();