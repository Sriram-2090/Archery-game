import { Physics } from './physics.js';
import { Renderer } from './renderer.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.renderer = new Renderer(this.canvas, this.ctx);
        this.physics = new Physics();
        
        this.score = 0;
        this.arrowsLeft = 10;
        this.isGameOver = false;
        this.isDragging = false;
        this.currentArrow = null;
        this.pastArrows = [];
        this.power = 0;
        this.aimAngle = 0;

        this.windSpeed = 0;
        this.windAngle = 0;
        this.maxWindSpeed = 5;

        this.shakeX = 0;
        this.shakeY = 0;

        try {
            this.theme = localStorage.getItem('theme') || 'dark';
        } catch (e) {
            this.theme = 'dark';
        }
        document.body.classList.toggle('light-mode', this.theme === 'light');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateWind();
        this.updateUI();
        this.gameLoop();
    }

    generateWind() {
        // Difficulty scaling: wind gets stronger as arrows decrease
        const difficultyMulti = 1 + (10 - this.arrowsLeft) * 0.5;
        this.windSpeed = Math.random() * this.maxWindSpeed * difficultyMulti;
        this.windAngle = Math.random() * Math.PI * 2;
        this.physics.setWind(this.windSpeed, this.windAngle);
        
        // Update UI
        const windArrow = document.getElementById('wind-arrow');
        const windLabel = document.getElementById('wind-speed');
        if (windArrow) windArrow.style.transform = `rotate(${this.windAngle}rad)`;
        if (windLabel) windLabel.textContent = `${this.windSpeed.toFixed(1)} mph`;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.renderer.resize());

        this.canvas.addEventListener('mousedown', (e) => this.onStartDrag(e.clientX, e.clientY));
        this.canvas.addEventListener('mousemove', (e) => this.onDrag(e.clientX, e.clientY));
        window.addEventListener('mouseup', () => this.onEndDrag());

        this.canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.onStartDrag(touch.clientX, touch.clientY);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            this.onDrag(touch.clientX, touch.clientY);
        });
        window.addEventListener('touchend', () => this.onEndDrag());

        document.getElementById('start-btn').addEventListener('click', () => {
            document.getElementById('menu').classList.remove('active');
            this.resetGame();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            document.getElementById('game-over').classList.remove('active');
            this.resetGame();
        });

        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.theme = this.theme === 'dark' ? 'light' : 'dark';
            document.body.classList.toggle('light-mode', this.theme === 'light');
            localStorage.setItem('theme', this.theme);
        });
    }

    onStartDrag(x, y) {
        if (this.isGameOver || this.currentArrow) return;
        this.isDragging = true;
        this.startX = x;
        this.startY = y;
    }

    onDrag(x, y) {
        if (!this.isDragging) return;
        
        const dx = this.startX - x;
        const dy = this.startY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        this.power = Math.min(dist / 200, 1);
        this.aimAngle = Math.atan2(dy, dx);

        // Add "shaking" effect when aiming with high power
        if (this.power > 0.5) {
            const jitter = (this.power - 0.5) * 10;
            this.shakeX = (Math.random() - 0.5) * jitter;
            this.shakeY = (Math.random() - 0.5) * jitter;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }

        const powerFill = document.getElementById('power-fill');
        if (powerFill) powerFill.style.height = `${this.power * 100}%`;
    }

    onEndDrag() {
        if (!this.isDragging) return;
        this.isDragging = false;
        
        if (this.power > 0.1) {
            this.shoot();
        }
        
        this.power = 0;
        this.shakeX = 0;
        this.shakeY = 0;
        const powerFill = document.getElementById('power-fill');
        if (powerFill) powerFill.style.height = '0%';
    }

    shoot() {
        if (this.arrowsLeft <= 0) return;

        this.arrowsLeft--;
        this.updateUI();

        const shootPower = this.power * 15;
        this.currentArrow = {
            x: this.renderer.bowX,
            y: this.renderer.bowY,
            vx: Math.cos(this.aimAngle) * shootPower,
            vy: Math.sin(this.aimAngle) * shootPower,
            rotation: this.aimAngle,
            isFlying: true
        };
    }

    updateUI() {
        const scoreEl = document.getElementById('score-val');
        const arrowsContainer = document.getElementById('arrows-container');
        
        if (scoreEl) scoreEl.textContent = this.score;
        if (arrowsContainer) {
            arrowsContainer.innerHTML = '';
            for (let i = 0; i < this.arrowsLeft; i++) {
                const icon = document.createElement('div');
                icon.className = 'arrow-icon';
                arrowsContainer.appendChild(icon);
            }
        }
    }

    checkCollision(arrow) {
        // Simple collision with the plane of the target
        if (arrow.x >= this.renderer.centerX) {
            arrow.isFlying = false;
            
            // Calculate distance from center on the target face
            const dy = arrow.y - this.renderer.centerY;
            // The target is represented as a circle in 2D, but we should consider the Y offset
            const dist = Math.abs(dy);
            
            let hitScore = 0;
            if (dist < 20) hitScore = 10;
            else if (dist < 40) hitScore = 6;
            else if (dist < 60) hitScore = 4;
            else if (dist < 80) hitScore = 2;
            else if (dist < 100) hitScore = 1;

            if (hitScore > 0) {
                this.score += hitScore;
                this.updateUI();
                this.pastArrows.push({...arrow, x: this.renderer.centerX});
                
                // Celebration trigger
                if (hitScore >= 6) {
                    this.renderer.createCelebration(arrow.x, arrow.y);
                    if (hitScore === 10) {
                        const celebText = document.getElementById('celebration-text');
                        celebText.classList.remove('active');
                        void celebText.offsetWidth; // Trigger reflow
                        celebText.classList.add('active');
                    }
                }
            } else {
                // Missed the target
            }

            this.currentArrow = null;
            this.generateWind();

            if (this.arrowsLeft === 0) {
                setTimeout(() => this.endGame(), 1000);
            }
        }
    }

    resetGame() {
        this.score = 0;
        this.arrowsLeft = 10;
        this.isGameOver = false;
        this.currentArrow = null;
        this.pastArrows = [];
        this.updateUI();
        this.generateWind();
    }

    endGame() {
        this.isGameOver = true;
        document.getElementById('game-over').classList.add('active');
        document.getElementById('final-score-val').textContent = this.score;
    }

    gameLoop() {
        this.renderer.clear();
        this.renderer.drawTarget();

        this.pastArrows.forEach(arrow => this.renderer.drawArrow(arrow));
        this.renderer.drawParticles();

        if (this.currentArrow) {
            this.physics.update(this.currentArrow);
            this.renderer.drawArrow(this.currentArrow);
            this.checkCollision(this.currentArrow);

            // Out of bounds
            if (this.currentArrow && (this.currentArrow.y > this.canvas.height || this.currentArrow.x < 0)) {
                this.currentArrow = null;
                this.generateWind();
                if (this.arrowsLeft === 0) this.endGame();
            }
        }

        if (this.isDragging) {
            // Draw a preview line or just the bow being pulled
            const dx = Math.cos(this.aimAngle) * 50;
            const dy = Math.sin(this.aimAngle) * 50;
            this.renderer.drawBow(dx, dy, this.power, this.shakeX, this.shakeY);
        } else {
            this.renderer.drawBow(50, 0, 0, 0, 0);
        }

        requestAnimationFrame(() => this.gameLoop());
    }
}
