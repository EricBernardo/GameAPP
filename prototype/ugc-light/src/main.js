import { TILE, PALETTE, AVATAR_COLORS, COLS, ROWS, emptyGrid, BUILTIN_LEVELS } from "./tiles.js";
import { Character, findStart } from "./physics.js";
import { unlockAudio, sfx } from "./audio.js";
import { validateLevelName } from "./moderation.js";

const STORAGE_KEY = "ugc_levels";
const AVATAR_KEY = "ugc_avatar_color";

const views = {
  list: document.getElementById("view-list"),
  editor: document.getElementById("view-editor"),
  play: document.getElementById("view-play"),
  win: document.getElementById("view-win"),
};

function showView(name) {
  for (const key of Object.keys(views)) views[key].classList.toggle("hidden", key !== name);
}

function toast(text) {
  const el = document.getElementById("toast");
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 1500);
}

function loadUserLevels() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUserLevels(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function loadAvatarColor() {
  return localStorage.getItem(AVATAR_KEY) || AVATAR_COLORS[0];
}

function saveAvatarColor(color) {
  localStorage.setItem(AVATAR_KEY, color);
}

let avatarColor = loadAvatarColor();

// ---------- Lista de fases ----------

function renderLevelList() {
  const container = document.getElementById("level-list");
  container.innerHTML = "";
  const userLevels = loadUserLevels();
  const all = [...BUILTIN_LEVELS, ...userLevels];

  if (all.length === 0) {
    container.innerHTML = `<p class="subtitle">Nenhuma fase ainda. Crie a primeira!</p>`;
    return;
  }

  for (const level of all) {
    const card = document.createElement("div");
    card.className = "level-card";
    card.innerHTML = `
      <div class="level-info">
        <span class="level-name">${escapeHtml(level.name)}</span>
        <span class="level-tag">${level.builtin ? "Fase de exemplo" : "Criada por você"}</span>
      </div>
      <div class="level-actions">
        <button class="play">▶ Jogar</button>
        <button class="edit">✎ Editar</button>
        ${level.builtin ? "" : '<button class="danger">🗑</button>'}
      </div>
    `;
    card.querySelector(".play").addEventListener("click", () => openPlay(level));
    card.querySelector(".edit").addEventListener("click", () => openEditor(level));
    const delBtn = card.querySelector(".danger");
    if (delBtn) {
      delBtn.addEventListener("click", () => {
        const confirmed = window.confirm(`Apagar a fase "${level.name}"? Esta ação não pode ser desfeita.`);
        if (!confirmed) return;
        const updated = loadUserLevels().filter((l) => l.id !== level.id);
        saveUserLevels(updated);
        toast("Fase apagada.");
        renderLevelList();
      });
    }
    container.appendChild(card);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById("btn-new-level").addEventListener("click", () => {
  openEditor(null);
});

// ---------- Avatar ----------

function renderAvatarModal() {
  const wrap = document.getElementById("avatar-colors");
  wrap.innerHTML = "";
  for (const color of AVATAR_COLORS) {
    const sw = document.createElement("button");
    sw.className = "avatar-swatch" + (color === avatarColor ? " active" : "");
    sw.style.background = color;
    sw.addEventListener("click", () => {
      avatarColor = color;
      saveAvatarColor(color);
      renderAvatarModal();
    });
    wrap.appendChild(sw);
  }
}

document.getElementById("btn-avatar").addEventListener("click", () => {
  renderAvatarModal();
  document.getElementById("modal-avatar").classList.remove("hidden");
});
document.getElementById("btn-avatar-close").addEventListener("click", () => {
  document.getElementById("modal-avatar").classList.add("hidden");
});

// ---------- Editor ----------

let editorGrid = emptyGrid();
let editingLevelId = null;
let editingLevelName = null;
let currentTool = TILE.GROUND;
let editorCellSize = 32;

function buildPalette() {
  const wrap = document.getElementById("palette");
  wrap.innerHTML = "";
  for (const item of PALETTE) {
    const btn = document.createElement("button");
    btn.className = "palette-btn" + (item.type === currentTool ? " active" : "");
    btn.textContent = item.icon;
    btn.title = item.label;
    btn.addEventListener("click", () => {
      currentTool = item.type;
      buildPalette();
    });
    wrap.appendChild(btn);
  }
}

function openEditor(level) {
  editorGrid = level ? level.grid.map((row) => row.slice()) : emptyGrid();
  editingLevelId = level && !level.builtin ? level.id : null;
  editingLevelName = level ? level.name : null;
  currentTool = TILE.GROUND;
  buildPalette();
  showView("editor");
  requestAnimationFrame(() => {
    resizeEditorCanvas();
    drawEditor();
  });
}

function resizeEditorCanvas() {
  const wrap = document.getElementById("canvas-wrap");
  const canvas = document.getElementById("editor-canvas");
  const availW = wrap.clientWidth - 8;
  const availH = wrap.clientHeight - 8;
  editorCellSize = Math.max(14, Math.min(availW / COLS, availH / ROWS));
  const w = editorCellSize * COLS;
  const h = editorCellSize * ROWS;
  canvas.width = w * devicePixelRatio;
  canvas.height = h * devicePixelRatio;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
}
window.addEventListener("resize", () => {
  if (!views.editor.classList.contains("hidden")) {
    resizeEditorCanvas();
    drawEditor();
  }
  if (!views.play.classList.contains("hidden")) resizePlayCanvas();
});
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    if (!views.editor.classList.contains("hidden")) {
      resizeEditorCanvas();
      drawEditor();
    }
    if (!views.play.classList.contains("hidden")) resizePlayCanvas();
  });
}

function drawTile(ctx, type, x, y, size) {
  const pad = size * 0.06;
  switch (type) {
    case TILE.GROUND:
      ctx.fillStyle = "#8a5a3b";
      ctx.fillRect(x, y, size, size);
      ctx.fillStyle = "#6d4429";
      ctx.fillRect(x, y, size, size * 0.18);
      break;
    case TILE.HAZARD: {
      ctx.fillStyle = "#e63946";
      const spikes = 3;
      const w = size / spikes;
      for (let i = 0; i < spikes; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * w, y + size);
        ctx.lineTo(x + i * w + w / 2, y + size * 0.35);
        ctx.lineTo(x + (i + 1) * w, y + size);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case TILE.COIN:
      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#c98a00";
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    case TILE.SPRING:
      ctx.fillStyle = "#ff9f1c";
      ctx.fillRect(x + pad, y + size * 0.5, size - pad * 2, size * 0.5 - pad);
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(x + pad, y + size * 0.4, size - pad * 2, size * 0.14);
      break;
    case TILE.START:
      ctx.fillStyle = "rgba(6,214,160,0.18)";
      ctx.fillRect(x, y, size, size);
      ctx.strokeStyle = "#06d6a0";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
      ctx.fillStyle = "#06d6a0";
      ctx.beginPath();
      ctx.moveTo(x + size * 0.3, y + size * 0.2);
      ctx.lineTo(x + size * 0.75, y + size * 0.35);
      ctx.lineTo(x + size * 0.3, y + size * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(x + size * 0.28, y + size * 0.2, size * 0.05, size * 0.6);
      break;
    case TILE.GOAL:
      ctx.fillStyle = "rgba(76,201,240,0.18)";
      ctx.fillRect(x, y, size, size);
      ctx.strokeStyle = "#4cc9f0";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
      ctx.fillStyle = "#4cc9f0";
      ctx.fillRect(x + size * 0.3, y + size * 0.2, size * 0.05, size * 0.6);
      ctx.fillRect(x + size * 0.35, y + size * 0.2, size * 0.35, size * 0.2);
      break;
    case TILE.MOVING_PLATFORM:
      ctx.fillStyle = "#9d4edd";
      ctx.fillRect(x + pad, y + size * 0.4, size - pad * 2, size * 0.22);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.moveTo(x + size * 0.18, y + size * 0.5);
      ctx.lineTo(x + size * 0.3, y + size * 0.38);
      ctx.lineTo(x + size * 0.3, y + size * 0.62);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + size * 0.82, y + size * 0.5);
      ctx.lineTo(x + size * 0.7, y + size * 0.38);
      ctx.lineTo(x + size * 0.7, y + size * 0.62);
      ctx.closePath();
      ctx.fill();
      break;
    default:
      break;
  }
}

function drawGridLines(ctx, w, h, cellSize) {
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * cellSize, 0);
    ctx.lineTo(c * cellSize, h);
    ctx.stroke();
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * cellSize);
    ctx.lineTo(w, r * cellSize);
    ctx.stroke();
  }
}

function drawEditor() {
  const canvas = document.getElementById("editor-canvas");
  const ctx = canvas.getContext("2d");
  const w = editorCellSize * COLS;
  const h = editorCellSize * ROWS;
  ctx.save();
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.fillStyle = "#0f1720";
  ctx.fillRect(0, 0, w, h);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (editorGrid[r][c] !== TILE.EMPTY) {
        drawTile(ctx, editorGrid[r][c], c * editorCellSize, r * editorCellSize, editorCellSize);
      }
    }
  }
  drawGridLines(ctx, w, h, editorCellSize);
  ctx.restore();
}

function paintCell(r, c, tool) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
  if (tool === TILE.START || tool === TILE.GOAL) {
    for (let rr = 0; rr < ROWS; rr++) {
      for (let cc = 0; cc < COLS; cc++) {
        if (editorGrid[rr][cc] === tool) editorGrid[rr][cc] = TILE.EMPTY;
      }
    }
  }
  editorGrid[r][c] = tool;
}

function cellFromEvent(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  const x = evt.clientX - rect.left;
  const y = evt.clientY - rect.top;
  return { c: Math.floor(x / editorCellSize), r: Math.floor(y / editorCellSize) };
}

(function setupEditorInput() {
  const canvas = document.getElementById("editor-canvas");
  let painting = false;
  const paint = (evt) => {
    const { r, c } = cellFromEvent(canvas, evt);
    paintCell(r, c, currentTool);
    drawEditor();
  };
  canvas.addEventListener("pointerdown", (evt) => {
    painting = true;
    paint(evt);
  });
  canvas.addEventListener("pointermove", (evt) => {
    if (painting) paint(evt);
  });
  window.addEventListener("pointerup", () => {
    painting = false;
  });
})();

document.getElementById("btn-editor-back").addEventListener("click", () => {
  showView("list");
  renderLevelList();
});

document.getElementById("btn-editor-clear").addEventListener("click", () => {
  editorGrid = emptyGrid();
  drawEditor();
});

function hasStartAndGoal(grid) {
  let hasStart = false;
  let hasGoal = false;
  for (const row of grid) {
    for (const cell of row) {
      if (cell === TILE.START) hasStart = true;
      if (cell === TILE.GOAL) hasGoal = true;
    }
  }
  return hasStart && hasGoal;
}

document.getElementById("btn-editor-save").addEventListener("click", () => {
  if (!hasStartAndGoal(editorGrid)) {
    toast("Adicione um Início 🚩 e um Fim 🏁 antes de salvar.");
    return;
  }
  if (editingLevelId) {
    const levels = loadUserLevels();
    const idx = levels.findIndex((l) => l.id === editingLevelId);
    if (idx >= 0) {
      levels[idx].grid = editorGrid.map((row) => row.slice());
      saveUserLevels(levels);
      toast("Fase atualizada!");
      return;
    }
  }
  document.getElementById("input-level-name").value = editingLevelName || "";
  document.getElementById("modal-name").classList.remove("hidden");
});

document.getElementById("btn-name-cancel").addEventListener("click", () => {
  document.getElementById("modal-name").classList.add("hidden");
});

document.getElementById("btn-name-confirm").addEventListener("click", () => {
  if (!hasStartAndGoal(editorGrid)) {
    toast("Adicione um Início 🚩 e um Fim 🏁 antes de salvar.");
    return;
  }
  const rawName = document.getElementById("input-level-name").value;
  const validation = validateLevelName(rawName);
  if (!validation.valid) {
    toast(validation.reason);
    return;
  }
  const name = validation.name;
  const levels = loadUserLevels();
  const newLevel = { id: `user-${Date.now()}`, name, builtin: false, grid: editorGrid.map((row) => row.slice()) };
  levels.push(newLevel);
  saveUserLevels(levels);
  editingLevelId = newLevel.id;
  editingLevelName = newLevel.name;
  document.getElementById("modal-name").classList.add("hidden");
  toast("Fase salva!");
});

document.getElementById("btn-editor-test").addEventListener("click", () => {
  if (!hasStartAndGoal(editorGrid)) {
    toast("Adicione um Início 🚩 e um Fim 🏁 antes de testar.");
    return;
  }
  openPlay({ name: editingLevelName || "Teste", grid: editorGrid, __fromEditor: true });
  toast("Depois de testar, toque em Salvar para guardar na lista.");
});

// ---------- Jogo (play) ----------

let playGrid = null;
let playCellSize = 32;
let character = null;
let coinsCollected = 0;
let deaths = 0;
let currentPlayLevel = null;
const input = { moveX: 0, jumpPressed: false };
let playRunning = false;
let platforms = [];
let matchElapsed = 0;
const particles = [];

function burstParticles(cx, cy, color, count = 12) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const speed = 90 + Math.random() * 100;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.3 + Math.random() * 0.2,
      age: 0,
      color,
      size: 3 + Math.random() * 3,
    });
  }
}

function extractPlatforms(grid) {
  const found = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === TILE.MOVING_PLATFORM) {
        grid[r][c] = TILE.EMPTY;
        const rangeCells = Math.min(3, COLS - 1 - c, c);
        found.push({
          homeX: c * playCellSize,
          y: r * playCellSize + playCellSize * 0.4,
          width: playCellSize,
          height: playCellSize * 0.22,
          rangeCells: Math.max(1, rangeCells),
          phase: Math.random() * Math.PI * 2,
          speed: 1.1,
          x: c * playCellSize,
          vx: 0,
        });
      }
    }
  }
  return found;
}

function resizePlayCanvas() {
  const wrap = document.getElementById("canvas-wrap-play");
  const canvas = document.getElementById("play-canvas");
  const availW = wrap.clientWidth - 8;
  const availH = wrap.clientHeight - 8;
  playCellSize = Math.max(14, Math.min(availW / COLS, availH / ROWS));
  const w = playCellSize * COLS;
  const h = playCellSize * ROWS;
  canvas.width = w * devicePixelRatio;
  canvas.height = h * devicePixelRatio;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  if (character) character.cellSize = playCellSize;
}

function openPlay(level) {
  unlockAudio();
  currentPlayLevel = level;
  playGrid = level.grid.map((row) => row.slice());
  coinsCollected = 0;
  deaths = 0;
  matchElapsed = 0;
  particles.length = 0;
  document.getElementById("play-coins").textContent = "0";
  document.getElementById("play-deaths").textContent = "0";
  showView("play");
  requestAnimationFrame(() => {
    resizePlayCanvas();
    platforms = extractPlatforms(playGrid);
    const spawn = findStart(playGrid, playCellSize);
    character = new Character(playCellSize, spawn);
    playRunning = true;
  });
}

document.getElementById("btn-play-back").addEventListener("click", () => {
  goBackFromPlay();
});

function setupTouchControls() {
  const left = document.getElementById("btn-left");
  const right = document.getElementById("btn-right");
  const jump = document.getElementById("btn-jump");

  const bind = (el, onDown, onUp) => {
    el.addEventListener("pointerdown", (e) => { e.preventDefault(); onDown(); });
    el.addEventListener("pointerup", (e) => { e.preventDefault(); onUp(); });
    el.addEventListener("pointerleave", () => onUp());
  };
  bind(left, () => { input.moveX = -1; }, () => { if (input.moveX < 0) input.moveX = 0; });
  bind(right, () => { input.moveX = 1; }, () => { if (input.moveX > 0) input.moveX = 0; });
  bind(jump, () => { input.jumpHeld = true; }, () => { input.jumpHeld = false; });
}
setupTouchControls();

const keys = new Set();
window.addEventListener("keydown", (e) => keys.add(e.code));
window.addEventListener("keyup", (e) => keys.delete(e.code));

function readInput() {
  let moveX = input.moveX || 0;
  if (keys.has("ArrowLeft") || keys.has("KeyA")) moveX = -1;
  if (keys.has("ArrowRight") || keys.has("KeyD")) moveX = 1;
  const jumpHeld = input.jumpHeld || keys.has("ArrowUp") || keys.has("KeyW") || keys.has("Space");
  const jumpPressed = jumpHeld && !input._jumpWasHeld;
  input._jumpWasHeld = jumpHeld;
  return { moveX, jumpPressed };
}

function drawPlay() {
  const canvas = document.getElementById("play-canvas");
  const ctx = canvas.getContext("2d");
  const w = playCellSize * COLS;
  const h = playCellSize * ROWS;
  ctx.save();
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.fillStyle = "#0f1720";
  ctx.fillRect(0, 0, w, h);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (playGrid[r][c] !== TILE.EMPTY) {
        drawTile(ctx, playGrid[r][c], c * playCellSize, r * playCellSize, playCellSize);
      }
    }
  }

  for (const platform of platforms) {
    ctx.fillStyle = "#9d4edd";
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height * 0.35);
  }

  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  if (character) {
    ctx.save();
    if (character.invulnerable > 0 && Math.floor(character.invulnerable * 20) % 2 === 0) {
      ctx.globalAlpha = 0.3;
    }
    ctx.fillStyle = avatarColor;
    const r = character.height * 0.22;
    ctx.beginPath();
    ctx.moveTo(character.x + r, character.y);
    ctx.arcTo(character.x + character.width, character.y, character.x + character.width, character.y + character.height, r);
    ctx.arcTo(character.x + character.width, character.y + character.height, character.x, character.y + character.height, r);
    ctx.arcTo(character.x, character.y + character.height, character.x, character.y, r);
    ctx.arcTo(character.x, character.y, character.x + character.width, character.y, r);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

function allPlayableLevels() {
  return [...BUILTIN_LEVELS, ...loadUserLevels()];
}

function goBackFromPlay() {
  playRunning = false;
  if (currentPlayLevel?.__fromEditor) {
    showView("editor");
    toast("Salve a fase para ela aparecer na lista.");
    requestAnimationFrame(() => {
      resizeEditorCanvas();
      drawEditor();
    });
    return;
  }
  showView("list");
  renderLevelList();
}

function completeLevel() {
  playRunning = false;
  document.getElementById("win-stats").textContent = `${coinsCollected} moedas coletadas · ${deaths} quedas`;
  const nextBtn = document.getElementById("btn-win-next");
  const backBtn = document.getElementById("btn-win-back");
  if (currentPlayLevel?.__fromEditor) {
    nextBtn.classList.add("hidden");
    backBtn.textContent = "VOLTAR AO EDITOR";
  } else {
    backBtn.textContent = "VOLTAR À LISTA";
    const all = allPlayableLevels();
    const idx = all.findIndex((l) => l.id === currentPlayLevel?.id);
    const next = idx >= 0 ? all[idx + 1] : null;
    nextBtn.classList.toggle("hidden", !next);
    nextBtn.onclick = next ? () => openPlay(next) : null;
  }
  showView("win");
}

document.getElementById("btn-win-retry").addEventListener("click", () => {
  openPlay(currentPlayLevel);
});
document.getElementById("btn-win-back").addEventListener("click", () => {
  goBackFromPlay();
});

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;

  if (playRunning && character) {
    matchElapsed += dt;
    for (const platform of platforms) {
      const prevX = platform.x;
      platform.x = platform.homeX + Math.sin(matchElapsed * platform.speed + platform.phase) * (platform.rangeCells * playCellSize);
      platform.vx = (platform.x - prevX) / dt;
    }

    const currentInput = readInput();
    const events = {};
    character.update(dt, playGrid, currentInput, events, platforms);

    if (events.jumped) sfx.jump();
    if (events.collectedCoin) {
      const { row, col } = events.collectedCoin;
      playGrid[row][col] = TILE.EMPTY;
      coinsCollected++;
      document.getElementById("play-coins").textContent = String(coinsCollected);
      sfx.coin();
      burstParticles(col * playCellSize + playCellSize / 2, row * playCellSize + playCellSize / 2, "#ffd166", 10);
    }
    if (events.sprung) {
      sfx.spring();
      burstParticles(character.x + character.width / 2, character.y + character.height, "#ff9f1c", 10);
    }
    if (events.hitHazard || events.fellOff) {
      deaths++;
      document.getElementById("play-deaths").textContent = String(deaths);
      sfx.hazard();
      burstParticles(character.x + character.width / 2, character.y + character.height / 2, "#e63946", 16);
      character.respawn();
    }
    if (events.reachedGoal) {
      sfx.goal();
      burstParticles(character.x + character.width / 2, character.y + character.height / 2, "#4cc9f0", 24);
      completeLevel();
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
    p.vx *= 0.92;
    p.vy *= 0.92;
  }

  if (!views.play.classList.contains("hidden")) drawPlay();
  requestAnimationFrame(loop);
}
requestAnimationFrame((t) => {
  lastTime = t;
  requestAnimationFrame(loop);
});

renderLevelList();
