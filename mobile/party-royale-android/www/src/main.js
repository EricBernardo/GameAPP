import { InputController } from "./input.js";
import { unlockAudio, sfx } from "./audio.js";
import {
  Player, Obstacle, ParticleSystem, resolvePlayerCollision,
  MOVE_ACCEL, MAX_SPEED, FRICTION,
} from "./entities.js";
import { clamp, distance, randRange, choice, shuffle, PALETTE } from "./utils.js";
import { SKINS, DEFAULT_SKIN_ID, skinById } from "./skins.js";

const BOT_NAMES = [
  "Nino", "Zaza", "Kiko", "Miu", "Tuko", "Vex", "Loro", "Bibi",
  "Yumi", "Rex", "Pipa", "Doka", "Fofo", "Zumi", "Kaz", "Wex",
];

// Variedade de conteúdo (Fase 3 da auditoria de qualidade): mais de um
// layout de arena, sorteado a cada partida, para que a sessão 4 não
// pareça idêntica à sessão 1.
const ARENA_LAYOUTS = [
  {
    name: "Clássica",
    obstacles: [
      { lengthFactor: 0.42, speed: 0.9, phase: 0 },
      { lengthFactor: 0.3, speed: -1.4, phase: Math.PI / 2 },
    ],
  },
  {
    name: "Caos Triplo",
    obstacles: [
      { lengthFactor: 0.36, speed: 1.3, phase: 0 },
      { lengthFactor: 0.36, speed: -1.3, phase: (2 * Math.PI) / 3 },
      { lengthFactor: 0.36, speed: 1.6, phase: (4 * Math.PI) / 3 },
    ],
  },
  {
    name: "Campo Aberto",
    obstacles: [],
  },
];

const TOTAL_PLAYERS = 8;
const ROUND_TIME = 60;
const STORM_START = 12;
const ARENA_MIN_RADIUS = 55;
const SPAWN_RADIUS_FACTOR = 0.42;
// Janela inicial sem eliminações e sem ataques de bots, para o jogador
// se orientar antes do combate começar (corrige eliminação quase instantânea).
const GRACE_PERIOD = 4;

// Raio máximo da arena em função da menor dimensão da tela, para garantir
// que ela sempre caiba por completo (sem cortar nas bordas em celulares
// estreitos, que são o hardware predominante do público-alvo).
let ARENA_MAX = 260;
function computeArenaMax() {
  const minSide = Math.min(window.innerWidth, window.innerHeight);
  return clamp(minSide * 0.46, 150, 420);
}

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hudTimer = document.getElementById("hud-timer");
const hudAlive = document.getElementById("hud-alive");
const hudCoins = document.getElementById("hud-coins");
const toast = document.getElementById("toast");

const screenStart = document.getElementById("screen-start");
const screenEnd = document.getElementById("screen-end");
const endTitle = document.getElementById("end-title");
const endSubtitle = document.getElementById("end-subtitle");
const endCoins = document.getElementById("end-coins");

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

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage indisponível — segue sem persistir.
  }
}

let totalCoins = loadCoins("pr_coins");
let ownedSkins = loadJson("pr_skins", [DEFAULT_SKIN_ID]);
if (!Array.isArray(ownedSkins) || !ownedSkins.includes(DEFAULT_SKIN_ID)) {
  ownedSkins = [DEFAULT_SKIN_ID];
}
let equippedSkinId = loadJson("pr_equipped_skin", DEFAULT_SKIN_ID);
if (!ownedSkins.includes(equippedSkinId)) equippedSkinId = DEFAULT_SKIN_ID;

function refreshCoinDisplays() {
  hudCoins.textContent = `🪙 ${totalCoins}`;
  document.getElementById("start-coins-value").textContent = String(totalCoins);
  document.getElementById("shop-coins-value").textContent = String(totalCoins);
}
refreshCoinDisplays();

const input = new InputController();
const particles = new ParticleSystem();

let arena = { x: 0, y: 0, radius: ARENA_MAX, targetRadius: ARENA_MAX };
let players = [];
let obstacles = [];
let human = null;
let timeLeft = ROUND_TIME;
let matchTime = 0;
let graceEndAnnounced = false;
let running = false;
let shakeTime = 0;
let shakeMag = 0;
let currentLayoutName = "";

function resize() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  arena.x = window.innerWidth / 2;
  arena.y = window.innerHeight / 2;
  ARENA_MAX = computeArenaMax();
}
window.addEventListener("resize", resize);
resize();

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 1400);
}

function shake(magnitude, duration) {
  shakeMag = Math.max(shakeMag, magnitude);
  shakeTime = Math.max(shakeTime, duration);
}

function spawnMatch() {
  players = [];
  obstacles = [];
  ARENA_MAX = computeArenaMax();
  arena.radius = ARENA_MAX;
  arena.targetRadius = ARENA_MAX;
  timeLeft = ROUND_TIME;
  matchTime = 0;
  graceEndAnnounced = false;

  const shuffledNames = shuffle(BOT_NAMES);
  const shuffledColors = shuffle(PALETTE);

  for (let i = 0; i < TOTAL_PLAYERS; i++) {
    const angle = (Math.PI * 2 * i) / TOTAL_PLAYERS;
    const r = ARENA_MAX * SPAWN_RADIUS_FACTOR;
    const isBot = i !== 0;
    const p = new Player({
      id: i,
      x: arena.x + Math.cos(angle) * r,
      y: arena.y + Math.sin(angle) * r,
      color: isBot ? shuffledColors[i % shuffledColors.length] : skinById(equippedSkinId).color,
      name: isBot ? shuffledNames[i % shuffledNames.length] : "Você",
      isBot,
    });
    players.push(p);
    if (!isBot) human = p;
  }

  const layout = choice(ARENA_LAYOUTS);
  currentLayoutName = layout.name;
  for (const spec of layout.obstacles) {
    obstacles.push(new Obstacle({
      x: arena.x, y: arena.y,
      length: ARENA_MAX * spec.lengthFactor,
      speed: spec.speed,
      phase: spec.phase,
    }));
  }
}

function updateBot(p, dt) {
  const state = p.botState;
  state.retarget -= dt;

  const distFromCenter = distance(p.x, p.y, arena.x, arena.y);
  const dangerZone = arena.radius - 40;

  let targetX;
  let targetY;

  if (distFromCenter > dangerZone) {
    targetX = arena.x;
    targetY = arena.y;
  } else {
    let nearest = null;
    let nearestDist = Infinity;
    for (const other of players) {
      if (other === p || !other.alive) continue;
      const d = distance(p.x, p.y, other.x, other.y);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = other;
      }
    }

    const canAttack = matchTime >= GRACE_PERIOD;
    if (canAttack && nearest && nearestDist < 150 && p.canDash() && Math.random() < 0.03) {
      const dx = nearest.x - p.x;
      const dy = nearest.y - p.y;
      p.dash(dx, dy);
      particles.burst(p.x, p.y, p.color, 8, 120);
    }

    if (canAttack && nearest && nearestDist < 220) {
      targetX = nearest.x;
      targetY = nearest.y;
    } else {
      if (state.retarget <= 0) {
        state.targetAngle = randRange(0, Math.PI * 2);
        state.retarget = randRange(1.2, 2.5);
      }
      targetX = p.x + Math.cos(state.targetAngle) * 100;
      targetY = p.y + Math.sin(state.targetAngle) * 100;
    }
  }

  const dx = targetX - p.x;
  const dy = targetY - p.y;
  const len = Math.hypot(dx, dy) || 1;
  p.vx += (dx / len) * MOVE_ACCEL * dt;
  p.vy += (dy / len) * MOVE_ACCEL * dt;
}

function updateHuman(p, dt) {
  input.update();
  p.vx += input.moveX * MOVE_ACCEL * dt;
  p.vy += input.moveY * MOVE_ACCEL * dt;
  if (input.moveX !== 0 || input.moveY !== 0) {
    p.facing = Math.atan2(input.moveY, input.moveX);
  }

  if (input.consumeDash()) {
    let dx = input.moveX;
    let dy = input.moveY;
    if (dx === 0 && dy === 0) {
      dx = Math.cos(p.facing);
      dy = Math.sin(p.facing);
    }
    if (p.dash(dx, dy)) {
      sfx.dash();
      particles.burst(p.x, p.y, p.color, 10, 140);
      shake(6, 0.15);
    }
  }
}

function eliminate(p) {
  p.alive = false;
  particles.burst(p.x, p.y, p.color, 22, 260);
  sfx.fall();
  shake(8, 0.2);
  if (p === human) {
    showToast("Você caiu da arena!");
  } else {
    showToast(`${p.name} caiu!`);
  }
}

function update(dt) {
  timeLeft = Math.max(0, timeLeft - dt);
  matchTime += dt;
  hudTimer.textContent = Math.ceil(timeLeft);

  if (!graceEndAnnounced && matchTime >= GRACE_PERIOD) {
    graceEndAnnounced = true;
    showToast("VAI!");
  }

  if (timeLeft > STORM_START) {
    const shrinkStart = ROUND_TIME - STORM_START;
    const progress = clamp((shrinkStart - timeLeft) / shrinkStart, 0, 1);
    arena.targetRadius = ARENA_MAX - (ARENA_MAX - ARENA_MAX * 0.55) * progress;
  } else {
    const progress = clamp(1 - timeLeft / STORM_START, 0, 1);
    arena.targetRadius = ARENA_MAX * 0.55 - (ARENA_MAX * 0.55 - ARENA_MIN_RADIUS) * progress;
  }
  arena.radius += (arena.targetRadius - arena.radius) * clamp(dt * 2, 0, 1);

  for (const obstacle of obstacles) obstacle.update(dt);

  for (const p of players) {
    if (!p.alive) continue;
    if (p.isBot) updateBot(p, dt);
    else updateHuman(p, dt);
  }

  for (const p of players) {
    if (!p.alive) continue;
    p.dashCooldown = Math.max(0, p.dashCooldown - dt);
    p.hitCooldown = Math.max(0, p.hitCooldown - dt);
    p.dashFlash = Math.max(0, p.dashFlash - dt);
    p.squash = 1 + (p.squash - 1) * Math.max(0, 1 - dt * 8);

    const speed = Math.hypot(p.vx, p.vy);
    if (speed > MAX_SPEED) {
      const scale = MAX_SPEED / speed;
      p.vx *= scale;
      p.vy *= scale;
    }
    p.vx -= p.vx * Math.min(1, FRICTION * dt);
    p.vy -= p.vy * Math.min(1, FRICTION * dt);
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    for (const obstacle of obstacles) {
      if (obstacle.resolvePlayer(p)) {
        if (p === human) shake(4, 0.1);
      }
    }
  }

  const alivePlayers = players.filter((p) => p.alive);
  for (let i = 0; i < alivePlayers.length; i++) {
    for (let j = i + 1; j < alivePlayers.length; j++) {
      const hit = resolvePlayerCollision(alivePlayers[i], alivePlayers[j]);
      if (hit && (alivePlayers[i] === human || alivePlayers[j] === human)) {
        sfx.hit();
        shake(3, 0.08);
      }
    }
  }

  if (matchTime >= GRACE_PERIOD) {
    for (const p of alivePlayers) {
      const d = distance(p.x, p.y, arena.x, arena.y);
      if (d > arena.radius + p.radius * 0.3) {
        eliminate(p);
      }
    }
  }

  particles.update(dt);
  shakeTime = Math.max(0, shakeTime - dt);

  const stillAlive = players.filter((p) => p.alive);
  hudAlive.textContent = `Vivos: ${stillAlive.length}`;

  if (!human.alive) {
    endMatch(false, stillAlive.length);
    return;
  }
  if (stillAlive.length <= 1) {
    endMatch(stillAlive.length === 1 && stillAlive[0] === human, 0);
  }
}

function endMatch(won, remaining) {
  running = false;
  const earned = won ? 50 : Math.max(5, 30 - remaining * 2);
  totalCoins += earned;
  saveCoins("pr_coins", totalCoins);
  refreshCoinDisplays();

  endTitle.textContent = won ? "VITÓRIA!" : "ELIMINADO";
  endSubtitle.textContent = won
    ? "Você foi o último a sobreviver na arena."
    : "Continue tentando — quase lá!";
  if (won) sfx.win();
  else sfx.lose();
  endCoins.textContent = `+${earned} 🪙`;
  screenEnd.classList.remove("hidden");
}

function drawArena() {
  ctx.save();
  ctx.scale(devicePixelRatio, devicePixelRatio);

  if (shakeTime > 0) {
    const dx = randRange(-shakeMag, shakeMag);
    const dy = randRange(-shakeMag, shakeMag);
    ctx.translate(dx, dy);
  } else {
    shakeMag = 0;
  }

  ctx.fillStyle = "#0d0f1a";
  ctx.fillRect(-20, -20, window.innerWidth + 40, window.innerHeight + 40);

  ctx.save();
  ctx.beginPath();
  ctx.arc(arena.x, arena.y, arena.radius, 0, Math.PI * 2);
  ctx.clip();
  const grad = ctx.createRadialGradient(arena.x, arena.y, 0, arena.x, arena.y, arena.radius);
  grad.addColorStop(0, "#2a2f55");
  grad.addColorStop(1, "#181b30");
  ctx.fillStyle = grad;
  ctx.fillRect(arena.x - arena.radius, arena.y - arena.radius, arena.radius * 2, arena.radius * 2);

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 2;
  for (let r = 40; r < arena.radius; r += 40) {
    ctx.beginPath();
    ctx.arc(arena.x, arena.y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.beginPath();
  ctx.arc(arena.x, arena.y, arena.radius, 0, Math.PI * 2);
  ctx.strokeStyle = "#ff5f6d";
  ctx.lineWidth = 6;
  ctx.shadowColor = "#ff5f6d";
  ctx.shadowBlur = 18;
  ctx.stroke();
  ctx.shadowBlur = 0;

  for (const obstacle of obstacles) {
    const { x1, y1, x2, y2 } = obstacle.endpoints();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = obstacle.thickness;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  particles.draw(ctx);

  for (const p of players) {
    if (!p.alive) continue;
    ctx.save();
    ctx.translate(p.x, p.y);
    const sx = p.squash;
    const sy = 1 / p.squash;
    ctx.scale(sx, sy);

    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    if (p.dashFlash > 0) {
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    if (!p.isBot) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();

    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    const nameWidth = ctx.measureText(p.name).width;
    const labelY = p.y - p.radius - 14;
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(p.x - nameWidth / 2 - 5, labelY - 11, nameWidth + 10, 16);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillText(p.name, p.x, labelY);
  }

  ctx.restore();
}

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  if (running) update(dt);
  drawArena();
  requestAnimationFrame(loop);
}

// ---------- Loja de skins ----------

const screenShop = document.getElementById("screen-shop");
let shopReturnScreen = screenStart;

function renderShop() {
  refreshCoinDisplays();
  const list = document.getElementById("skin-list");
  list.innerHTML = "";
  for (const skin of SKINS) {
    const owned = ownedSkins.includes(skin.id);
    const equipped = equippedSkinId === skin.id;
    const card = document.createElement("button");
    card.className = "skin-card" + (equipped ? " equipped" : "");
    card.innerHTML = `
      <span class="swatch" style="background:${skin.color}"></span>
      <span class="skin-name">${skin.name}</span>
      <span class="${equipped ? "skin-status" : "skin-price"}">${equipped ? "Equipada" : owned ? "Toque p/ equipar" : `🪙 ${skin.price}`}</span>
    `;
    card.addEventListener("click", () => {
      if (equipped) return;
      if (!owned) {
        if (totalCoins < skin.price) {
          showToast("Moedas insuficientes.");
          return;
        }
        totalCoins -= skin.price;
        ownedSkins.push(skin.id);
        saveCoins("pr_coins", totalCoins);
        saveJson("pr_skins", ownedSkins);
        showToast(`Skin "${skin.name}" comprada!`);
      }
      equippedSkinId = skin.id;
      saveJson("pr_equipped_skin", equippedSkinId);
      if (human) human.color = skin.color;
      renderShop();
    });
    list.appendChild(card);
  }
}

function openShop(fromScreen) {
  shopReturnScreen = fromScreen;
  fromScreen.classList.add("hidden");
  renderShop();
  screenShop.classList.remove("hidden");
}

document.getElementById("btn-shop").addEventListener("click", () => openShop(screenStart));
document.getElementById("btn-shop-from-end").addEventListener("click", () => openShop(screenEnd));
document.getElementById("btn-shop-back").addEventListener("click", () => {
  screenShop.classList.add("hidden");
  shopReturnScreen.classList.remove("hidden");
});

document.getElementById("btn-play").addEventListener("click", () => {
  unlockAudio();
  spawnMatch();
  screenStart.classList.add("hidden");
  running = true;
  showToast(`Prepare-se! Arena: ${currentLayoutName}`);
});

document.getElementById("btn-restart").addEventListener("click", () => {
  spawnMatch();
  screenEnd.classList.add("hidden");
  running = true;
  showToast(`Prepare-se! Arena: ${currentLayoutName}`);
});

requestAnimationFrame((t) => {
  lastTime = t;
  requestAnimationFrame(loop);
});
