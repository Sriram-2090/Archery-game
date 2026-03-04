export class Physics {
    constructor() {
        this.gravity = 0.5;
        this.windX = 0;
        this.windY = 0;
        this.airResistance = 0.99;
    }

    setWind(x, y) {
        // Wind is given in mph, convert to pixel force 
        this.windX = x * 0.05;
        this.windY = y * 0.05;
    }

    createArrow(x, y, velocity, angle) {
        return {
            x: x,
            y: y,
            lastX: x,
            lastY: y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            angle: angle,
            isStuck: false
        };
    }

    updateArrow(arrow) {
        arrow.vy += this.gravity;
        arrow.vx += this.windX;
        arrow.vy += this.windY;

        arrow.vx *= this.airResistance;
        arrow.vy *= this.airResistance;

        arrow.x += arrow.vx;
        arrow.y += arrow.vy;

        arrow.angle = Math.atan2(arrow.vy, arrow.vx);
    }
}
