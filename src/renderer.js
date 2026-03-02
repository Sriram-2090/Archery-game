export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width * 0.8; // Target on the right
        this.centerY = this.canvas.height * 0.5;
        this.bowX = 150; // Bow on the left
        this.bowY = this.canvas.height * 0.5;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawTarget() {
        const isLight = document.body.classList.contains('light-mode');
        const rings = [
            { radius: 100, color: isLight ? '#e0e0e0' : '#222', score: 1 },
            { radius: 80, color: isLight ? '#f0f0f0' : '#333', score: 2 },
            { radius: 60, color: '#00d2ff', score: 4 },
            { radius: 40, color: '#ff0055', score: 6 },
            { radius: 20, color: '#ffcc00', score: 10 }
        ];

        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        
        // Shadow for target
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = 'rgba(0,0,0,0.3)';

        // Add perspective (slightly oval)
        this.ctx.scale(0.3, 1);

        rings.forEach(ring => {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = ring.color;
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });

        this.ctx.restore();
    }

    drawBow(pullX, pullY, power, shakeX = 0, shakeY = 0) {
        const bowWidth = 100;
        const bowHeight = 200;

        this.ctx.save();
        // Apply shaking offset to the whole bow
        this.ctx.translate(this.bowX + shakeX, this.bowY + shakeY);

        // Calculate bow rotation based on aim
        const angle = Math.atan2(pullY, pullX);
        this.ctx.rotate(angle);

        // Draw bow limbs
        this.ctx.beginPath();
        this.ctx.moveTo(0, -bowHeight / 2);
        this.ctx.quadraticCurveTo(bowWidth / 2, 0, 0, bowHeight / 2);
        
        const isLight = document.body.classList.contains('light-mode');
        this.ctx.strokeStyle = isLight ? '#00d2ff' : '#fff';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        // Draw bow string
        this.ctx.beginPath();
        this.ctx.moveTo(0, -bowHeight / 2);
        // The pull affects the middle point of the string
        const pullDist = Math.min(power * 60, 80);
        this.ctx.lineTo(-pullDist, 0);
        this.ctx.lineTo(0, bowHeight / 2);
        this.ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawArrow(arrow) {
        this.ctx.save();
        this.ctx.translate(arrow.x, arrow.y);
        this.ctx.rotate(arrow.rotation);

        // Shadow/Glow
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = 'rgba(0, 132, 255, 0.5)';

        // Shaft
        this.ctx.beginPath();
        this.ctx.moveTo(-40, 0);
        this.ctx.lineTo(0, 0);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Fletching (feathers)
        this.ctx.beginPath();
        this.ctx.moveTo(-40, 0);
        this.ctx.lineTo(-45, -5);
        this.ctx.lineTo(-35, 0);
        this.ctx.lineTo(-45, 5);
        this.ctx.closePath();
        this.ctx.fillStyle = '#0084ff';
        this.ctx.fill();

        // Arrow head
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(-5, -3);
        this.ctx.lineTo(-5, 3);
        this.ctx.closePath();
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();

        this.ctx.restore();
    }

    createCelebration(x, y) {
        const colors = ['#00d2ff', '#9d00ff', '#ff0055', '#ffcc00', '#00ff88'];
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 4 + 2
            });
        }
    }

    drawParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // gravity
            p.life -= 0.02;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    drawWindLabel(wind) {
        // Handled by UI layer
    }
}
