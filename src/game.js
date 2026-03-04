import { Renderer } from './renderer.js';
import { Physics } from './physics.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.physics = new Physics();

        this.isRunning = false;
        this.score = 0;
        this.arrows = 10;
        this.windX = 0;

        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.currentDragX = 0;
        this.currentDragY = 0;

        this.activeArrow = null;
        this.hitParticles = [];
        this.traps = [];
        this.lastTrapSpawnTime = 0;

        this.bindEvents();
    }

    start() {
        this.score = 0;
        this.arrows = 20; // gave user more arrows
        this.updateWind();
        this.activeArrow = null;
        this.hitParticles = [];
        this.traps = [];
        this.lastTrapSpawnTime = Date.now();
        this.isRunning = true;
        this.updateHUD();
        document.getElementById('power-gauge-container').classList.remove('hidden');
        this.loop();
    }

    updateWind() {
        // Wind always flows in the direction of the arrow (left to right, positive X)
        this.windX = (Math.random() * 8 + 2); // Wind between 2 and 10 mph
        this.physics.setWind(this.windX, 0);
        document.getElementById('wind-val').textContent = this.windX.toFixed(1) + ' →';
    }

    updateHUD() {
        document.getElementById('score-val').textContent = this.score;
        document.getElementById('arrows-val').textContent = this.arrows;
    }

    bindEvents() {
        const handleDown = (e) => {
            if (!this.isRunning || this.activeArrow || this.arrows <= 0) return;
            this.isDragging = true;
            this.dragStartX = e.clientX || (e.touches && e.touches[0].clientX);
            this.dragStartY = e.clientY || (e.touches && e.touches[0].clientY);
            this.currentDragX = this.dragStartX;
            this.currentDragY = this.dragStartY;
        };

        const handleMove = (e) => {
            if (!this.isDragging) return;
            this.currentDragX = e.clientX || (e.touches && e.touches[0].clientX);
            this.currentDragY = e.clientY || (e.touches && e.touches[0].clientY);
            if (e.cancelable) e.preventDefault();
        };

        const handleUp = (e) => {
            if (!this.isDragging) return;
            this.isDragging = false;
            document.getElementById('power-fill').style.width = '0%';

            const pullDx = this.dragStartX - this.currentDragX;
            const pullDy = this.dragStartY - this.currentDragY;

            let power = Math.sqrt(pullDx * pullDx + pullDy * pullDy);
            if (power < 10) return;
            if (power > 300) power = 300;

            const maxVelocity = 40;
            const velocity = (power / 300) * maxVelocity;

            const angle = Math.atan2(pullDy, pullDx);

            this.fireArrow(velocity, angle);
        };

        this.canvas.addEventListener('mousedown', handleDown);
        this.canvas.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);

        this.canvas.addEventListener('touchstart', handleDown, { passive: false });
        this.canvas.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleUp);
    }

    fireArrow(velocity, angle) {
        this.arrows--;
        this.updateHUD();

        const bowX = 150;
        const bowY = this.canvas.height / 2;

        this.activeArrow = this.physics.createArrow(bowX, bowY, velocity, angle);
    }

    checkHit() {
        if (!this.activeArrow) return;

        const targetX = this.canvas.width * 0.85;
        const targetY = this.canvas.height / 2;

        if (this.activeArrow.x >= targetX && this.activeArrow.lastX < targetX) {
            const ratio = (targetX - this.activeArrow.lastX) / (this.activeArrow.x - this.activeArrow.lastX);
            const interceptY = this.activeArrow.lastY + (this.activeArrow.y - this.activeArrow.lastY) * ratio;

            const distFromCenter = Math.abs(interceptY - targetY);
            // Account for target visual scale which is 0.3 on X axis but full on Y.
            // On Y axis, rings are 100, 80, 60, 40, 20
            let points = 0;

            if (distFromCenter < 20) points = 10;
            else if (distFromCenter < 40) points = 6;
            else if (distFromCenter < 60) points = 4;
            else if (distFromCenter < 80) points = 2;
            else if (distFromCenter < 100) points = 1;

            if (points > 0) {
                this.score += points;
                this.updateWind();
                this.updateHUD();
                this.createParticles(targetX, interceptY, '#00d2ff');
            }

            this.activeArrow.vx = 0;
            this.activeArrow.vy = 0;
            this.activeArrow.isStuck = true;
            this.activeArrow.x = targetX;
            this.activeArrow.y = interceptY;

            setTimeout(() => {
                this.activeArrow = null;
                if (this.arrows <= 0) this.endGame();
            }, 1000);
        } else if (this.activeArrow.y > this.canvas.height || this.activeArrow.x > this.canvas.width) {
            this.activeArrow = null;
            if (this.arrows <= 0) this.endGame();
        }
    }

    createParticles(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.hitParticles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color
            });
        }
    }

    endGame() {
        this.isRunning = false;
        document.getElementById('power-gauge-container').classList.add('hidden');
        if (this.onGameOver) this.onGameOver(this.score);
    }

    spawnTrap() {
        const now = Date.now();
        // Spawns faster as score goes up
        const difficultyMulti = 1 + (this.score / 50);
        const spawnInterval = 3000 / difficultyMulti;

        if (now - this.lastTrapSpawnTime > spawnInterval) {
            this.traps.push({
                x: this.canvas.width + 50,
                y: 100 + Math.random() * (this.canvas.height - 200),
                vx: - (3 + Math.random() * 4) * difficultyMulti, // move left
                size: 20 + Math.random() * 20,
                rotSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random()),
                id: now
            });
            this.lastTrapSpawnTime = now;
        }
    }

    loop() {
        if (!this.isRunning) return;

        let dx = 0;
        let dy = 0;
        if (this.isDragging) {
            dx = this.dragStartX - this.currentDragX;
            dy = this.dragStartY - this.currentDragY;

            const dist = Math.sqrt(dx * dx + dy * dy);

            let powerRatio = Math.min(dist / 300, 1.0);
            document.getElementById('power-fill').style.width = `${powerRatio * 100}%`;

            if (dist > 120) {
                const ratio = 120 / dist;
                dx *= ratio;
                dy *= ratio;
            }
        }

        this.spawnTrap();

        // Update Traps and check collision with active arrow
        let arrowDestroyedByTrap = false;
        for (let i = this.traps.length - 1; i >= 0; i--) {
            let t = this.traps[i];
            t.x += t.vx;

            // Check collision with arrow
            if (this.activeArrow && !this.activeArrow.isStuck) {
                const dist = Math.hypot(t.x - this.activeArrow.x, t.y - this.activeArrow.y);
                if (dist < t.size + 10) {
                    // Trap Hit!
                    this.createParticles(this.activeArrow.x, this.activeArrow.y, '#ff0055');
                    this.traps.splice(i, 1);
                    arrowDestroyedByTrap = true;
                    this.score = Math.max(0, this.score - 5);
                    this.updateHUD();
                    continue;
                }
            }

            if (t.x < -100) {
                this.traps.splice(i, 1);
            }
        }

        if (arrowDestroyedByTrap) {
            this.activeArrow = null;
            if (this.arrows <= 0) this.endGame();
        }

        if (this.activeArrow && !this.activeArrow.isStuck) {
            this.activeArrow.lastX = this.activeArrow.x;
            this.activeArrow.lastY = this.activeArrow.y;
            this.physics.updateArrow(this.activeArrow);
            this.checkHit();
        }

        for (let i = this.hitParticles.length - 1; i >= 0; i--) {
            let p = this.hitParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
            if (p.life <= 0) this.hitParticles.splice(i, 1);
        }

        this.renderer.clear();
        this.renderer.drawEnvironment();
        this.renderer.drawTraps(this.traps);
        this.renderer.drawBow(150, this.canvas.height / 2, dx, dy, this.isDragging);
        if (this.activeArrow) {
            this.renderer.drawArrow(this.activeArrow);
        }
        this.renderer.drawParticles(this.hitParticles);

        requestAnimationFrame(() => this.loop());
    }
}
