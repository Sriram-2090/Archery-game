export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    clear() {
        // Explicitly fill background with very dark blue to avoid transparency CSS issues
        this.ctx.fillStyle = '#05070a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw some basic background vignette
        let r = Math.max(this.canvas.width, this.canvas.height);
        if (r <= 0) r = 1;
        const grad = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, r
        );
        grad.addColorStop(0, '#101520');
        grad.addColorStop(1, '#020305');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawEnvironment() {
        // Target Location
        const targetX = this.canvas.width * 0.85;
        const targetY = this.canvas.height / 2;

        this.ctx.save();
        this.ctx.translate(targetX, targetY);
        // Make it look like a vertical slit/target
        this.ctx.scale(0.3, 1);

        const rings = [
            { r: 100, c: '#222' },
            { r: 80, c: '#444' },
            { r: 60, c: '#00d2ff' },
            { r: 40, c: '#ff0055' },
            { r: 20, c: '#ffcc00' }
        ];

        rings.forEach(ring => {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
            this.ctx.fillStyle = ring.c;
            this.ctx.fill();
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });

        this.ctx.restore();
    }

    drawBow(baseX, baseY, pullDx, pullDy, isDragging) {
        this.ctx.save();
        this.ctx.translate(baseX, baseY);

        // Rotate bow based on pull direction
        let angle = 0;
        let pullDist = 0;
        if (isDragging) {
            angle = Math.atan2(pullDy, pullDx);
            pullDist = Math.min(Math.sqrt(pullDx * pullDx + pullDy * pullDy), 120);
        } else {
            // Angle the bow down naturally when idle
            angle = Math.PI / 8;
        }
        this.ctx.rotate(angle);

        // Core Bow Arc (Thick, stylized)
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 90, -Math.PI / 2.2, Math.PI / 2.2);
        this.ctx.strokeStyle = '#2b2d42'; // Dark modern material
        this.ctx.lineWidth = 14;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        // Bow Inner Highlight (Premium look)
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 85, -Math.PI / 2.3, Math.PI / 2.3);
        this.ctx.strokeStyle = '#00d2ff'; // Glowing edge
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        // Glowing String
        const stringDist = isDragging ? -pullDist : 0;
        this.ctx.beginPath();
        this.ctx.moveTo(Math.cos(-Math.PI / 2.2) * 90, Math.sin(-Math.PI / 2.2) * 90);
        this.ctx.lineTo(stringDist, 0);
        this.ctx.lineTo(Math.cos(Math.PI / 2.2) * 90, Math.sin(Math.PI / 2.2) * 90);
        this.ctx.strokeStyle = '#00e5ff';
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00e5ff';
        this.ctx.stroke();
        this.ctx.shadowBlur = 0; // reset shadow

        // Draw Loaded Arrow being pulled back
        if (isDragging || !this.activeArrow) {
            // If dragging, draw arrow on the string. If not dragging and no arrow flying, draw arrow idle on bow.
            const arrowX = isDragging ? stringDist : 0;
            this.ctx.beginPath();
            this.ctx.moveTo(arrowX, 0);
            this.ctx.lineTo(arrowX + 80, 0); // longer arrow
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();

            // Arrowhead
            this.ctx.beginPath();
            this.ctx.moveTo(arrowX + 80, 0);
            this.ctx.lineTo(arrowX + 65, -6);
            this.ctx.lineTo(arrowX + 65, 6);
            this.ctx.fillStyle = '#00e5ff';
            this.ctx.fill();

            // Fletching
            this.ctx.beginPath();
            this.ctx.moveTo(arrowX, 0);
            this.ctx.lineTo(arrowX - 8, -6);
            this.ctx.moveTo(arrowX, 0);
            this.ctx.lineTo(arrowX - 8, 6);
            this.ctx.strokeStyle = '#ff0055';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    drawArrow(arrow) {
        this.ctx.save();
        this.ctx.translate(arrow.x, arrow.y);
        this.ctx.rotate(arrow.angle);

        // Shaft
        this.ctx.beginPath();
        this.ctx.moveTo(-40, 0);
        this.ctx.lineTo(0, 0);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Arrowhead
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(-10, -5);
        this.ctx.lineTo(-10, 5);
        this.ctx.fillStyle = '#ccc';
        this.ctx.fill();

        // Fletching (feathers)
        this.ctx.beginPath();
        this.ctx.moveTo(-40, 0);
        this.ctx.lineTo(-45, -4);
        this.ctx.moveTo(-40, 0);
        this.ctx.lineTo(-45, 4);
        this.ctx.strokeStyle = '#ff0055'; // changed to accent
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawTraps(traps) {
        traps.forEach(t => {
            this.ctx.save();
            this.ctx.translate(t.x, t.y);

            // Trap Body
            this.ctx.beginPath();
            this.ctx.arc(0, 0, t.size, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ff0055'; // accent color
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#ff0055';
            this.ctx.fill();

            // Inner eye/core
            this.ctx.beginPath();
            this.ctx.arc(0, 0, t.size * 0.4, 0, Math.PI * 2);
            this.ctx.fillStyle = '#1a1e30';
            this.ctx.shadowBlur = 0;
            this.ctx.fill();

            // Spikes (rotation based on id/time)
            const time = Date.now() / 200;
            this.ctx.rotate(time * t.rotSpeed);
            for (let i = 0; i < 4; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, -t.size);
                this.ctx.lineTo(5, -t.size - 10);
                this.ctx.lineTo(-5, -t.size - 10);
                this.ctx.fillStyle = '#ff0055';
                this.ctx.fill();
                this.ctx.rotate(Math.PI / 2);
            }

            this.ctx.restore();
        });
    }

    drawParticles(particles) {
        particles.forEach(p => {
            this.ctx.globalAlpha = Math.max(0, p.life);
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0;
    }
}
