import { distance, clamp, randRange } from "./utils.js";

export const PLAYER_RADIUS = 15;
export const DASH_COOLDOWN = 1.15;
export const DASH_IMPULSE = 560;
export const MOVE_ACCEL = 900;
export const MAX_SPEED = 260;
export const FRICTION = 3.8;
export const COLLISION_RESTITUTION = 1.05;
// Imunidade curta o bastante para um dash ainda ejetar, sem combo infinito.
export const HIT_COOLDOWN = 0.2;

export class Player {
  constructor({ id, x, y, color, name, isBot }) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = PLAYER_RADIUS;
    this.color = color;
    this.name = name;
    this.isBot = isBot;
    this.alive = true;
    this.dashCooldown = 0;
    this.hitCooldown = 0;
    this.dashFlash = 0;
    this.squash = 1;
    this.facing = 0;
    this.fallProgress = 0;
    this.botState = { targetAngle: randRange(0, Math.PI * 2), retarget: 0 };
  }

  get speed() {
    return Math.hypot(this.vx, this.vy);
  }

  canDash() {
    return this.dashCooldown <= 0;
  }

  dash(dirX, dirY) {
    if (!this.canDash()) return false;
    const len = Math.hypot(dirX, dirY) || 1;
    this.vx += (dirX / len) * DASH_IMPULSE;
    this.vy += (dirY / len) * DASH_IMPULSE;
    this.dashCooldown = DASH_COOLDOWN;
    this.dashFlash = 0.25;
    this.squash = 1.35;
    return true;
  }
}

export class Obstacle {
  constructor({ x, y, length, speed, phase = 0 }) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.speed = speed;
    this.angle = phase;
    this.thickness = 16;
  }

  update(dt) {
    this.angle += this.speed * dt;
  }

  endpoints() {
    const dx = Math.cos(this.angle) * this.length;
    const dy = Math.sin(this.angle) * this.length;
    return {
      x1: this.x - dx,
      y1: this.y - dy,
      x2: this.x + dx,
      y2: this.y + dy,
    };
  }

  // Empurra o jogador para fora se ele estiver perto do segmento rotativo,
  // simulando o "braço giratório" clássico de arenas de eliminação.
  resolvePlayer(player) {
    const { x1, y1, x2, y2 } = this.endpoints();
    const closest = closestPointOnSegment(player.x, player.y, x1, y1, x2, y2);
    const d = distance(player.x, player.y, closest.x, closest.y);
    const minDist = this.thickness / 2 + player.radius;
    if (d < minDist) {
      const overlap = minDist - d;
      const nx = (player.x - closest.x) / (d || 1);
      const ny = (player.y - closest.y) / (d || 1);
      player.x += nx * overlap;
      player.y += ny * overlap;
      if (player.hitCooldown <= 0) {
        const kick = 110;
        player.vx += nx * kick;
        player.vy += ny * kick;
        player.hitCooldown = HIT_COOLDOWN;
      }
      return true;
    }
    return false;
  }
}

function closestPointOnSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy || 1;
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = clamp(t, 0, 1);
  return { x: x1 + dx * t, y: y1 + dy * t };
}

export function resolvePlayerCollision(a, b) {
  const d = distance(a.x, a.y, b.x, b.y);
  const minDist = a.radius + b.radius;
  if (d === 0 || d >= minDist) return false;

  const overlap = minDist - d;
  const nx = (b.x - a.x) / d;
  const ny = (b.y - a.y) / d;

  a.x -= nx * overlap * 0.5;
  a.y -= ny * overlap * 0.5;
  b.x += nx * overlap * 0.5;
  b.y += ny * overlap * 0.5;

  if (a.hitCooldown > 0 || b.hitCooldown > 0) return true;

  const relVx = b.vx - a.vx;
  const relVy = b.vy - a.vy;
  const relSpeed = relVx * nx + relVy * ny;
  if (relSpeed > 0) return false;

  const impulse = -(1 + COLLISION_RESTITUTION) * relSpeed * 0.5;
  a.vx -= impulse * nx;
  a.vy -= impulse * ny;
  b.vx += impulse * nx;
  b.vy += impulse * ny;
  a.hitCooldown = HIT_COOLDOWN;
  b.hitCooldown = HIT_COOLDOWN;

  return true;
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  burst(x, y, color, count = 14, speed = 220) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + randRange(-0.2, 0.2);
      const s = speed * randRange(0.4, 1);
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * s,
        vy: Math.sin(angle) * s,
        life: randRange(0.3, 0.6),
        age: 0,
        color,
        size: randRange(3, 6),
      });
    }
  }

  update(dt) {
    this.particles = this.particles.filter((p) => {
      p.age += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.92;
      p.vy *= 0.92;
      return p.age < p.life;
    });
  }

  draw(ctx) {
    for (const p of this.particles) {
      const t = 1 - p.age / p.life;
      ctx.globalAlpha = t;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
