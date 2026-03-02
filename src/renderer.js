export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
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
        const rings = [
            { radius: 100, color: '#ffffff', score: 1 },
            { radius: 80, color: '#ffffff', score: 2 },
            { radius: 60, color: '#0084ff', score: 4 },
            { radius: 40, color: '#ff0055', score: 6 },
            { radius: 20, color: '#ffcc00', score: 10 }
        ];

        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        
        // Add perspective (slightly oval)
        this.ctx.scale(0.3, 1);

        rings.forEach(ring => {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = ring.color;
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });

        this.ctx.restore();
    }

    drawBow(pullX, pullY, power) {
        const bowWidth = 100;
        const bowHeight = 200;

        this.ctx.save();
        this.ctx.translate(this.bowX, this.bowY);

        // Calculate bow rotation based on aim
        const angle = Math.atan2(pullY, pullX);
        this.ctx.rotate(angle);

        // Draw bow limbs
        this.ctx.beginPath();
        this.ctx.moveTo(0, -bowHeight / 2);
        this.ctx.quadraticCurveTo(bowWidth / 2, 0, 0, bowHeight / 2);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();

        // Draw bow string
        this.ctx.beginPath();
        this.ctx.moveTo(0, -bowHeight / 2);
        // The pull affects the middle point of the string
        const pullDist = Math.min(power * 50, 60);
        this.ctx.lineTo(-pullDist, 0);
        this.ctx.lineTo(0, bowHeight / 2);
        this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
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

    drawWindLabel(wind) {
        // Handled by UI layer now, but could add visual particles later
    }
}
