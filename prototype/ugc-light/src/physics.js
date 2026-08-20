import { TILE, COLS, ROWS } from "./tiles.js";

export const GRAVITY = 1800;
export const MOVE_SPEED = 260;
export const JUMP_IMPULSE = -640;
export const SPRING_IMPULSE = -920;
export const MAX_FALL_SPEED = 1100;

function isSolid(type) {
  return type === TILE.GROUND || type === TILE.SPRING;
}

export function findStart(grid, cellSize) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === TILE.START) {
        return { x: c * cellSize + cellSize * 0.2, y: r * cellSize + cellSize * 0.1 };
      }
    }
  }
  return { x: cellSize * 0.2, y: cellSize * 0.1 };
}

export class Character {
  constructor(cellSize, spawn) {
    this.cellSize = cellSize;
    this.width = cellSize * 0.6;
    this.height = cellSize * 0.8;
    this.spawn = spawn;
    this.x = spawn.x;
    this.y = spawn.y;
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;
    this.facing = 1;
    this.invulnerable = 0;
  }

  respawn() {
    this.x = this.spawn.x;
    this.y = this.spawn.y;
    this.vx = 0;
    this.vy = 0;
    this.invulnerable = 0.5;
  }

  get bounds() {
    return { left: this.x, top: this.y, right: this.x + this.width, bottom: this.y + this.height };
  }

  tilesOverlapping(left, top, right, bottom) {
    const cs = this.cellSize;
    const c0 = Math.max(0, Math.floor(left / cs));
    const c1 = Math.min(COLS - 1, Math.floor((right - 0.01) / cs));
    const r0 = Math.max(0, Math.floor(top / cs));
    const r1 = Math.min(ROWS - 1, Math.floor((bottom - 0.01) / cs));
    const list = [];
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) list.push({ r, c });
    }
    return list;
  }

  update(dt, grid, input, events) {
    if (this.invulnerable > 0) this.invulnerable -= dt;

    this.vx = input.moveX * MOVE_SPEED;
    if (input.moveX !== 0) this.facing = input.moveX > 0 ? 1 : -1;

    if (input.jumpPressed && this.grounded) {
      this.vy = JUMP_IMPULSE;
      this.grounded = false;
      events.jumped = true;
    }

    this.vy = Math.min(MAX_FALL_SPEED, this.vy + GRAVITY * dt);

    // Movimento horizontal + resolução de colisão com tiles sólidos.
    this.x += this.vx * dt;
    let b = this.bounds;
    for (const { r, c } of this.tilesOverlapping(b.left, b.top, b.right, b.bottom)) {
      if (!isSolid(grid[r][c])) continue;
      const tileLeft = c * this.cellSize;
      const tileRight = tileLeft + this.cellSize;
      if (this.vx > 0) this.x = tileLeft - this.width;
      else if (this.vx < 0) this.x = tileRight;
      this.vx = 0;
      b = this.bounds;
    }

    // Movimento vertical + resolução de colisão (piso/teto), incluindo a mola.
    this.y += this.vy * dt;
    this.grounded = false;
    b = this.bounds;
    for (const { r, c } of this.tilesOverlapping(b.left, b.top, b.right, b.bottom)) {
      const type = grid[r][c];
      if (!isSolid(type)) continue;
      const tileTop = r * this.cellSize;
      const tileBottom = tileTop + this.cellSize;
      if (this.vy > 0) {
        this.y = tileTop - this.height;
        if (type === TILE.SPRING) {
          this.vy = SPRING_IMPULSE;
          events.sprung = true;
        } else {
          this.vy = 0;
          this.grounded = true;
        }
      } else if (this.vy < 0) {
        this.y = tileBottom;
        this.vy = 0;
      }
      b = this.bounds;
    }

    if (this.y > ROWS * this.cellSize + this.height * 2) {
      events.fellOff = true;
    }

    // Tiles não sólidos (moeda, perigo, chegada) usam o centro do
    // personagem para decidir contato, para evitar acertos "de raspão".
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const col = Math.floor(cx / this.cellSize);
    const row = Math.floor(cy / this.cellSize);
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      const type = grid[row][col];
      if (type === TILE.HAZARD && this.invulnerable <= 0) {
        events.hitHazard = true;
      } else if (type === TILE.COIN) {
        events.collectedCoin = { row, col };
      } else if (type === TILE.GOAL) {
        events.reachedGoal = true;
      }
    }
  }
}
