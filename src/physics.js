export class Physics {
  static GRAVITY = 0.15;
  static AIR_RESISTANCE = 0.995;

  constructor() {
    this.wind = { x: 0, y: 0 };
  }

  setWind(speed, angle) {
    this.wind.x = Math.cos(angle) * speed;
    this.wind.y = Math.sin(angle) * speed;
  }

  update(arrow) {
    if (!arrow.isFlying) return;

    // Apply wind influence
    arrow.vx += this.wind.x * 0.01;
    arrow.vy += this.wind.y * 0.01;

    // Apply gravity
    arrow.vy += Physics.GRAVITY;

    // Apply air resistance
    arrow.vx *= Physics.AIR_RESISTANCE;
    arrow.vy *= Physics.AIR_RESISTANCE;

    // Update position
    arrow.x += arrow.vx;
    arrow.y += arrow.vy;

    // Update rotation to follow trajectory
    arrow.rotation = Math.atan2(arrow.vy, arrow.vx);
  }
}
