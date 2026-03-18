/**
 * SOS FIRST - Premium Experience
 * JavaScript de Nível AAA
 * 
 * Funcionalidades:
 * - Loading Screen Cinematográfico
 * - Sistema de Partículas Interativas
 * - Cursor Customizado com Glow
 * - Animações de Entrada Sequenciais
 * - Microinterações e Efeitos Visuais
 */

// ============================================
// CONFIGURAÇÕES GLOBAIS
// ============================================

const CONFIG = {
    // Configurações de Partículas
    particles: {
        count: window.innerWidth < 768 ? 30 : 60,
        connectionDistance: 150,
        mouseDistance: 200,
        speed: 0.5,
        size: { min: 1, max: 3 },
        colors: ['#ef4444', '#dc2626', '#f87171', '#ffffff']
    },
    
    // Configurações de Performance
    performance: {
        throttleMouse: 16, // ~60fps
        throttleResize: 100,
        throttleScroll: 16
    },
    
    // Configurações de Animação
    animation: {
        loadingDuration: 2500,
        staggerDelay: 150,
        wordDelay: 100
    }
};

// ============================================
// UTILITÁRIOS
// ============================================

const utils = {
    // Throttle para otimização de performance
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Random entre min e max
    random: (min, max) => Math.random() * (max - min) + min,
    
    // Distância entre dois pontos
    distance: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
    
    // Easing functions
    easing: {
        easeOutCubic: t => 1 - Math.pow(1 - t, 3),
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }
};

// ============================================
// LOADING SCREEN CINEMATOGRÁFICO
// ============================================

class LoadingScreen {
    constructor() {
        this.element = document.getElementById('loading-screen');
        this.progressBar = document.querySelector('.loading-progress');
        this.percentage = document.querySelector('.loading-percentage');
        this.statusText = document.querySelector('.status-text');
        
        this.messages = [
            'Inicializando sistema...',
            'Carregando módulos...',
            'Configurando ambiente...',
            'Otimizando performance...',
            'Preparando experiência...',
            'Quase pronto...'
        ];
        
        this.init();
    }
    
    init() {
        this.animateLoading();
    }
    
    animateLoading() {
        const duration = CONFIG.animation.loadingDuration;
        const startTime = Date.now();
        let lastMessageIndex = -1;
        
        const update = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / duration) * 100, 100);
            
            // Atualiza barra de progresso
            this.progressBar.style.width = `${progress}%`;
            this.percentage.textContent = `${Math.floor(progress)}%`;
            
            // Atualiza mensagem baseada no progresso
            const messageIndex = Math.floor((progress / 100) * this.messages.length);
            if (messageIndex !== lastMessageIndex && messageIndex < this.messages.length) {
                this.statusText.textContent = this.messages[messageIndex];
                this.statusText.style.animation = 'none';
                setTimeout(() => {
                    this.statusText.style.animation = 'fadeInUp 0.3s ease';
                }, 10);
                lastMessageIndex = messageIndex;
            }
            
            if (progress < 100) {
                requestAnimationFrame(update);
            } else {
                this.complete();
            }
        };
        
        requestAnimationFrame(update);
    }
    
    complete() {
        // Pequeno delay antes de esconder
        setTimeout(() => {
            this.element.classList.add('hidden');
            
            // Dispara evento de carregamento completo
            document.dispatchEvent(new CustomEvent('loadingComplete'));
            
            // Remove do DOM após a transição
            setTimeout(() => {
                this.element.style.display = 'none';
            }, 800);
        }, 300);
    }
}

// ============================================
// SISTEMA DE PARTÍCULAS INTERATIVAS
// ============================================

class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null };
        this.isActive = true;
        
        this.init();
    }
    
    init() {
        this.resize();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        
        for (let i = 0; i < CONFIG.particles.count; i++) {
            this.particles.push(new Particle(this.canvas));
        }
    }
    
    bindEvents() {
        // Mouse move com throttle
        window.addEventListener('mousemove', utils.throttle((e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        }, CONFIG.performance.throttleMouse));
        
        // Reset mouse quando sai da tela
        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
        
        // Resize com throttle
        window.addEventListener('resize', utils.throttle(() => {
            this.resize();
            this.createParticles();
        }, CONFIG.performance.throttleResize));
        
        // Pausa quando tab não está visível (performance)
        document.addEventListener('visibilitychange', () => {
            this.isActive = document.visibilityState === 'visible';
        });
    }
    
    animate() {
        if (!this.isActive) {
            requestAnimationFrame(() => this.animate());
            return;
        }
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Atualiza e desenha partículas
        this.particles.forEach(particle => {
            particle.update(this.mouse, this.canvas);
            particle.draw(this.ctx);
        });
        
        // Desenha conexões entre partículas próximas
        this.drawConnections();
        
        requestAnimationFrame(() => this.animate());
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < CONFIG.particles.connectionDistance) {
                    const opacity = (1 - distance / CONFIG.particles.connectionDistance) * 0.2;
                    
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(239, 68, 68, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
}

// Classe Individual de Partícula
class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.size = utils.random(CONFIG.particles.size.min, CONFIG.particles.size.max);
        this.speedX = utils.random(-CONFIG.particles.speed, CONFIG.particles.speed);
        this.speedY = utils.random(-CONFIG.particles.speed, CONFIG.particles.speed);
        this.color = CONFIG.particles.colors[Math.floor(Math.random() * CONFIG.particles.colors.length)];
        this.opacity = utils.random(0.3, 0.8);
    }
    
    update(mouse, canvas) {
        // Movimento base
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Interação com mouse
        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < CONFIG.particles.mouseDistance) {
                const force = (CONFIG.particles.mouseDistance - distance) / CONFIG.particles.mouseDistance;
                const angle = Math.atan2(dy, dx);
                
                this.x -= Math.cos(angle) * force * 2;
                this.y -= Math.sin(angle) * force * 2;
            }
        }
        
        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// ============================================
// CURSOR CUSTOMIZADO PREMIUM
// ============================================

class CustomCursor {
    constructor() {
        // Verifica se é dispositivo touch
        if (window.matchMedia('(pointer: coarse)').matches) {
            return;
        }
        
        this.cursorMain = document.querySelector('.cursor-main');
        this.cursorTrail = document.querySelector('.cursor-trail');
        this.cursorGlow = document.querySelector('.cursor-glow');
        
        this.mouseX = 0;
        this.mouseY = 0;
        this.cursorX = 0;
        this.cursorY = 0;
        this.trailX = 0;
        this.trailY = 0;
        this.glowX = 0;
        this.glowY = 0;
        
        this.isActive = true;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.animate();
    }
    
    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // Efeito hover em elementos interativos
        const interactiveElements = document.querySelectorAll('a, button, .glass-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });
        
        // Esconde cursor quando sai da janela
        document.addEventListener('mouseleave', () => {
            this.isActive = false;
        });
        
        document.addEventListener('mouseenter', () => {
            this.isActive = true;
        });
    }
    
    animate() {
        if (!this.isActive) {
            requestAnimationFrame(() => this.animate());
            return;
        }
        
        // Suavização do cursor principal
        this.cursorX += (this.mouseX - this.cursorX) * 0.2;
        this.cursorY += (this.mouseY - this.cursorY) * 0.2;
        
        // Suavização do trail (mais lento)
        this.trailX += (this.mouseX - this.trailX) * 0.1;
        this.trailY += (this.mouseY - this.trailY) * 0.1;
        
        // Suavização do glow (mais lento ainda)
        this.glowX += (this.mouseX - this.glowX) * 0.05;
        this.glowY += (this.mouseY - this.glowY) * 0.05;
        
        // Aplica posições
        this.cursorMain.style.left = `${this.cursorX}px`;
        this.cursorMain.style.top = `${this.cursorY}px`;
        
        this.cursorTrail.style.left = `${this.trailX}px`;
        this.cursorTrail.style.top = `${this.trailY}px`;
        
        this.cursorGlow.style.left = `${this.glowX}px`;
        this.cursorGlow.style.top = `${this.glowY}px`;
        
        requestAnimationFrame(() => this.animate());
    }
}

// ============================================
// ANIMAÇÕES DE ENTRADA SEQUENCIAIS
// ============================================

class EntranceAnimations {
    constructor() {
        this.elements = document.querySelectorAll('[data-animate]');
        this.taglineWords = document.querySelectorAll('.tagline-word');
        
        this.init();
    }
    
    init() {
        // Aguarda o loading completar
        document.addEventListener('loadingComplete', () => {
            this.animateElements();
            this.animateTagline();
        });
    }
    
    animateElements() {
        this.elements.forEach((el, index) => {
            const delay = parseFloat(el.dataset.delay) || 0;
            
            setTimeout(() => {
                el.classList.add('animate');
            }, delay * 1000 + (index * CONFIG.animation.staggerDelay));
        });
    }
    
    animateTagline() {
        this.taglineWords.forEach((word, index) => {
            setTimeout(() => {
                word.classList.add('animate');
            }, 800 + (index * CONFIG.animation.wordDelay));
        });
    }
}

// ============================================
// MICROINTERAÇÕES
// ============================================

class MicroInteractions {
    constructor() {
        this.init();
    }
    
    init() {
        this.initTiltEffect();
        this.initGlowEffect();
        this.initParallax();
    }
    
    // Efeito 3D Tilt no glass card
    initTiltEffect() {
        const cards = document.querySelectorAll('.glass-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', utils.throttle((e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            }, 16));
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }
    
    // Efeito de glow que segue o mouse no card
    initGlowEffect() {
        const cards = document.querySelectorAll('.glass-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', utils.throttle((e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                card.style.background = `
                    radial-gradient(circle at ${x}% ${y}%, 
                    rgba(239, 68, 68, 0.1) 0%, 
                    rgba(255, 255, 255, 0.03) 50%)
                `;
            }, 16));
            
            card.addEventListener('mouseleave', () => {
                card.style.background = 'var(--glass-bg)';
            });
        });
    }
    
    // Efeito Parallax sutil nos orbs
    initParallax() {
        const orbs = document.querySelectorAll('.gradient-orb');
        
        window.addEventListener('mousemove', utils.throttle((e) => {
            const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
            
            orbs.forEach((orb, index) => {
                const speed = (index + 1) * 10;
                const x = mouseX * speed;
                const y = mouseY * speed;
                
                orb.style.transform = `translate(${x}px, ${y}px)`;
            });
        }, 16));
    }
}

// ============================================
// SISTEMA DE PARTÍCULAS DE LOADING
// ============================================

class LoadingParticles {
    constructor() {
        this.container = document.querySelector('.loading-particles');
        if (!this.container) return;
        
        this.particles = [];
        this.particleCount = 20;
        
        this.init();
    }
    
    init() {
        this.createParticles();
        this.animate();
    }
    
    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'loading-particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: ${CONFIG.particles.colors[Math.floor(Math.random() * CONFIG.particles.colors.length)]};
                border-radius: 50%;
                opacity: ${Math.random() * 0.5 + 0.2};
                left: 50%;
                top: 50%;
                box-shadow: 0 0 10px currentColor;
            `;
            
            this.container.appendChild(particle);
            
            this.particles.push({
                element: particle,
                angle: (Math.PI * 2 / this.particleCount) * i,
                radius: Math.random() * 100 + 50,
                speed: Math.random() * 0.02 + 0.01,
                yOffset: Math.random() * 100
            });
        }
    }
    
    animate() {
        this.particles.forEach(p => {
            p.angle += p.speed;
            const x = Math.cos(p.angle) * p.radius;
            const y = Math.sin(p.angle) * p.radius * 0.5 + Math.sin(Date.now() * 0.001 + p.yOffset) * 20;
            
            p.element.style.transform = `translate(${x}px, ${y}px)`;
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicia loading screen
    const loadingScreen = new LoadingScreen();
    
    // Inicia partículas de loading
    const loadingParticles = new LoadingParticles();
    
    // Inicia sistema de partículas do background
    const particleSystem = new ParticleSystem();
    
    // Inicia cursor customizado
    const customCursor = new CustomCursor();
    
    // Inicia animações de entrada
    const entranceAnimations = new EntranceAnimations();
    
    // Inicia microinterações
    const microInteractions = new MicroInteractions();
    
    // Log de inicialização
    console.log('%c🚀 SOS First Premium Experience', 'color: #00d4ff; font-size: 20px; font-weight: bold;');
    console.log('%cInicializado com sucesso!', 'color: #a855f7; font-size: 14px;');
});

// ============================================
// SERVICE WORKER (Para PWA e Cache)
// ============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Registro básico de service worker para cache
        navigator.serviceWorker.register('data:text/javascript,' + encodeURIComponent(`
            self.addEventListener('install', e => e.waitUntil(self.skipWaiting()));
            self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
            self.addEventListener('fetch', e => {
                e.respondWith(
                    caches.match(e.request).then(response => {
                        return response || fetch(e.request);
                    })
                );
            });
        `)).catch(() => {
            // Silenciosamente falha - não é crítico
        });
    });
}
