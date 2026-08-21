import {
  ROWS, COLS, GEM_COLORS,
  createInitialBoard, findMatches, areAdjacent, swapTiles, clearAndRefill,
} from "./grid.js";

const ROUND_TIME = 90;
const POINTS_PER_GEM = 30;
const SWAP_ANIM_TIME = 0.16;
const CLEAR_PAUSE = 0.22;
const FALL_ANIM_TIME = 0.3;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const hudTimer = document.getElementById("hud-timer");
const hudScore = document.getElementById("hud-score-value");
const hudCombo = document.getElementById("hud-combo");

const raceYou = document.getElementById("race-you");
const raceRival = document.getElementById("race-rival");

const screenStart = document.getElementById("screen-start");
const screenEnd = document.getElementById("screen-end");
const endTitle = document.getElementById("end-title");
const endSubtitle = document.getElementById("end-subtitle");
const endScore = document.getElementById("end-score");

const RIVAL_NAMES = ["Nino", "Zaza", "Kiko", "Miu", "Tuko", "Vex", "Loro", "Bibi"];
document.getElementById("race-rival-label").textContent = `${RIVAL_NAMES[Math.floor(Math.random() * RIVAL_NAMES.length)]} (rival)`;

let tiles = [];
let cellSize = 40;
let boardPx = 0;
let running = false;
let timeLeft = ROUND_TIME;
let score = 0;
let comboLevel = 0;
let phase = "idle"; // idle | resolving
let resolveTimer = 0;
let nextStep = null;
let pendingSwapCells = null;
let selected = null;
let rivalTarget = 0;
let rivalScore = 0;

function loadCoins(key) {
  try {
    const parsed = Number(localStorage.getItem(key));
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function saveCoins(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // localStorage indisponível (modo privado, storage bloqueado etc.) —
    // o jogo continua funcionando, só sem persistir moedas entre sessões.
  }
}

let totalCoins = loadCoins("pd_coins");

const particles = [];

function resize() {
  const wrap = document.getElementById("board-wrap");
  const available = Math.min(wrap.clientWidth, wrap.clientHeight) - 16;
  boardPx = Math.max(240, Math.min(available, 480));
  cellSize = boardPx / COLS;
  canvas.width = boardPx * devicePixelRatio;
  canvas.height = boardPx * devicePixelRatio;
  canvas.style.width = `${boardPx}px`;
  canvas.style.height = `${boardPx}px`;
}
window.addEventListener("resize", resize);
resize();

function burst(cx, cy, color) {
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
    const speed = 90 + Math.random() * 90;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.35 + Math.random() * 0.15,
      age: 0,
      color,
      size: 4 + Math.random() * 3,
    });
  }
}

function cellCenter(r, c) {
  return { x: (c + 0.5) * cellSize, y: (r + 0.5) * cellSize };
}

function showCombo(level) {
  if (level < 2) {
    hudCombo.classList.remove("show");
    return;
  }
  hudCombo.textContent = `COMBO x${level}!`;
  hudCombo.classList.add("show");
  clearTimeout(hudCombo._t);
  hudCombo._t = setTimeout(() => hudCombo.classList.remove("show"), 900);
}

function startMatch() {
  tiles = createInitialBoard();
  timeLeft = ROUND_TIME;
  score = 0;
  comboLevel = 0;
  phase = "idle";
  selected = null;
  particles.length = 0;
  rivalTarget = 900 + Math.random() * 500;
  rivalScore = 0;
  hudScore.textContent = "0";
  hudCombo.classList.remove("show");
  raceYou.style.left = "0%";
  raceRival.style.left = "0%";
}

function attemptSwap(a, b) {
  if (!areAdjacent(a, b)) {
    selected = b;
    return;
  }
  swapTiles(tiles, a, b);
  pendingSwapCells = { a, b };
  phase = "resolving";
  resolveTimer = SWAP_ANIM_TIME;
  nextStep = "checkSwap";
  selected = null;
}

function processStep() {
  if (nextStep === "checkSwap") {
    const { matched, any } = findMatches(tiles);
    if (any) {
      resolveWave(matched);
    } else {
      swapTiles(tiles, pendingSwapCells.a, pendingSwapCells.b);
      resolveTimer = SWAP_ANIM_TIME;
      nextStep = "backToIdle";
    }
  } else if (nextStep === "backToIdle") {
    phase = "idle";
    comboLevel = 0;
  } else if (nextStep === "checkCascade") {
    const { matched, any } = findMatches(tiles);
    if (any) {
      resolveWave(matched);
    } else {
      comboLevel = 0;
      phase = "idle";
    }
  }
}

function resolveWave(matched) {
  comboLevel += 1;
  let cleared = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (matched[r][c] && tiles[r][c]) {
        const { x, y } = cellCenter(r, c);
        burst(x, y, GEM_COLORS[tiles[r][c].type]);
        cleared++;
      }
    }
  }
  score += cleared * POINTS_PER_GEM * comboLevel;
  hudScore.textContent = String(score);
  showCombo(comboLevel);

  clearAndRefill(tiles, matched);
  resolveTimer = CLEAR_PAUSE + FALL_ANIM_TIME;
  nextStep = "checkCascade";
}

function updateRival() {
  // Curva "ease-out": o rival simulado avança rápido no início e
  // desacelera perto do fim, dando ao jogador uma chance real de
  // alcançá-lo/superá-lo se jogar bem nos últimos segundos.
  const elapsed = ROUND_TIME - timeLeft;
  const eased = 1 - Math.pow(1 - elapsed / ROUND_TIME, 2);
  rivalScore = rivalTarget * eased;
}

function updateRaceBar() {
  const finish = Math.max(rivalTarget * 1.15, score, 1);
  raceYou.style.left = `${Math.min(100, (score / finish) * 100)}%`;
  raceRival.style.left = `${Math.min(100, (rivalScore / finish) * 100)}%`;
}

function endMatch() {
  running = false;
  const won = score >= rivalTarget;
  const earned = won ? 40 : 15;
  totalCoins += earned;
  saveCoins("pd_coins", totalCoins);

  endTitle.textContent = won ? "VITÓRIA!" : "QUASE LÁ!";
  endSubtitle.textContent = won
    ? "Você superou a pontuação do seu rival."
    : `Seu rival fez ${Math.round(rivalTarget)} pontos. Tente de novo!`;
  endScore.textContent = `${score} pontos (+${earned} 🪙)`;
  screenEnd.classList.remove("hidden");
}

function update(dt) {
  timeLeft = Math.max(0, timeLeft - dt);
  hudTimer.textContent = `${Math.ceil(timeLeft)}s`;
  updateRival();
  updateRaceBar();

  for (const row of tiles) {
    for (const tile of row) {
      if (!tile) continue;
      tile.visRow += (tile.row - tile.visRow) * Math.min(1, dt * 10);
      tile.visCol += (tile.col - tile.visCol) * Math.min(1, dt * 10);
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.age += dt;
    if (p.age >= p.life) {
      particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.9;
    p.vy *= 0.9;
  }

  if (phase === "resolving") {
    resolveTimer -= dt;
    if (resolveTimer <= 0) processStep();
  }

  if (timeLeft <= 0) {
    endMatch();
  }
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawGem(tile, isSelected) {
  const x = tile.visCol * cellSize;
  const y = tile.visRow * cellSize;
  const pad = cellSize * 0.09;
  const size = cellSize - pad * 2;
  ctx.save();
  ctx.translate(x + pad, y + pad);

  roundRect(0, 0, size, size, size * 0.28);
  ctx.fillStyle = GEM_COLORS[tile.type];
  ctx.fill();

  if (isSelected) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  const cx = size / 2;
  const cy = size / 2;
  const s = size * 0.24;
  switch (tile.type) {
    case 0:
      ctx.beginPath();
      ctx.arc(cx, cy, s, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 1:
      ctx.fillRect(cx - s, cy - s, s * 2, s * 2);
      break;
    case 2:
      ctx.beginPath();
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx + s, cy);
      ctx.lineTo(cx, cy + s);
      ctx.lineTo(cx - s, cy);
      ctx.closePath();
      ctx.fill();
      break;
    case 3:
      ctx.beginPath();
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx + s, cy + s);
      ctx.lineTo(cx - s, cy + s);
      ctx.closePath();
      ctx.fill();
      break;
    case 4:
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const px = cx + Math.cos(a) * s;
        const py = cy + Math.sin(a) * s;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
    default:
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (Math.PI * 2 * i) / 5;
        const px = cx + Math.cos(a) * s;
        const py = cy + Math.sin(a) * s;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
  }

  ctx.restore();
}

function draw() {
  ctx.save();
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.clearRect(0, 0, boardPx, boardPx);

  roundRect(0, 0, boardPx, boardPx, 16);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fill();

  for (let r = 0; r <= ROWS; r++) {
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath();
    ctx.moveTo(0, r * cellSize);
    ctx.lineTo(boardPx, r * cellSize);
    ctx.stroke();
  }

  for (const row of tiles) {
    for (const tile of row) {
      if (!tile) continue;
      const isSelected = selected && selected.row === tile.row && selected.col === tile.col;
      drawGem(tile, isSelected);
    }
  }

  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

function cellFromPointer(evt) {
  const rect = canvas.getBoundingClientRect();
  const x = evt.clientX - rect.left;
  const y = evt.clientY - rect.top;
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return null;
  return { row, col };
}

canvas.addEventListener("pointerdown", (evt) => {
  if (!running || phase !== "idle") return;
  const cell = cellFromPointer(evt);
  if (!cell) return;

  if (!selected) {
    selected = cell;
  } else if (selected.row === cell.row && selected.col === cell.col) {
    selected = null;
  } else {
    attemptSwap(selected, cell);
  }
});

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  if (running) update(dt);
  draw();
  requestAnimationFrame(loop);
}

document.getElementById("btn-play").addEventListener("click", () => {
  startMatch();
  screenStart.classList.add("hidden");
  running = true;
});

document.getElementById("btn-restart").addEventListener("click", () => {
  startMatch();
  screenEnd.classList.add("hidden");
  running = true;
});

requestAnimationFrame((t) => {
  lastTime = t;
  requestAnimationFrame(loop);
});
