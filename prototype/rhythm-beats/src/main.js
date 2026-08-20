import {
  LANE_COUNT, LANE_FREQS, LANE_KEYS, SONGS, THEMES,
  NOTE_TRAVEL_TIME, PERFECT_WINDOW, GOOD_WINDOW, MISS_WINDOW, buildChart,
} from "./songs.js";

const STORAGE_KEY = "rhythm_beats_state";

function defaultState() {
  return { coins: 0, unlockedSongs: 1, ownedThemes: ["classico"], activeTheme: "classico" };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

const state = loadState();
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function toast(text) {
  const el = document.getElementById("toast");
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 1500);
}

const views = {
  menu: document.getElementById("view-menu"),
  play: document.getElementById("view-play"),
  result: document.getElementById("view-result"),
  shop: document.getElementById("view-shop"),
};
function showView(name) {
  for (const key of Object.keys(views)) views[key].classList.toggle("hidden", key !== name);
}

function currentTheme() {
  return THEMES.find((t) => t.id === state.activeTheme) || THEMES[0];
}

// ---------- Áudio ----------

let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function scheduleBlip(freq, when, accent = false) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = accent ? "square" : "sine";
  osc.frequency.setValueAtTime(freq, when);
  amp.gain.setValueAtTime(0.001, when);
  amp.gain.linearRampToValueAtTime(0.22, when + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.001, when + 0.14);
  osc.connect(amp).connect(ctx.destination);
  osc.start(when);
  osc.stop(when + 0.16);
}

function playJudgeSfx(type) {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  if (type === "perfect") scheduleBlip(880, now, true);
  else if (type === "good") scheduleBlip(660, now);
  else scheduleBlip(160, now);
}

// ---------- Menu ----------

function renderMenu() {
  document.getElementById("coins-value").textContent = String(state.coins);
  const list = document.getElementById("song-list");
  list.innerHTML = "";
  SONGS.forEach((song, i) => {
    const unlocked = i < state.unlockedSongs;
    const btn = document.createElement("button");
    btn.className = "song-card" + (unlocked ? "" : " locked");
    btn.innerHTML = `
      <span class="song-icon">${unlocked ? "🎵" : "🔒"}</span>
      <span class="song-info">
        <span class="song-name">${unlocked ? song.name : "???"}</span>
        <span class="song-meta">${unlocked ? `${song.bpm} BPM · ${song.lanes.length} notas` : "Complete a fase anterior para desbloquear"}</span>
      </span>
    `;
    if (unlocked) btn.addEventListener("click", () => startSong(i));
    else btn.disabled = true;
    list.appendChild(btn);
  });
}

document.getElementById("btn-shop").addEventListener("click", () => {
  showView("shop");
  renderShop();
});
document.getElementById("btn-shop-back").addEventListener("click", () => {
  showView("menu");
  renderMenu();
});

// ---------- Loja de temas ----------

function renderShop() {
  document.getElementById("shop-coins").textContent = `🎵 ${state.coins}`;
  const list = document.getElementById("theme-list");
  list.innerHTML = "";
  for (const theme of THEMES) {
    const owned = state.ownedThemes.includes(theme.id);
    const active = state.activeTheme === theme.id;
    const card = document.createElement("div");
    card.className = "theme-card";
    card.innerHTML = `
      <div class="theme-swatches">${theme.colors.map((c) => `<span style="background:${c}"></span>`).join("")}</div>
      <div class="theme-info">
        <div class="theme-name">${theme.name}</div>
      </div>
    `;
    const btn = document.createElement("button");
    if (active) {
      btn.textContent = "Em uso";
      btn.className = "active-theme";
      btn.disabled = true;
    } else if (owned) {
      btn.textContent = "Usar";
      btn.addEventListener("click", () => {
        state.activeTheme = theme.id;
        saveState();
        renderShop();
      });
    } else {
      btn.textContent = theme.price === 0 ? "Grátis" : `🎵 ${theme.price}`;
      btn.disabled = state.coins < theme.price;
      btn.addEventListener("click", () => {
        if (state.coins < theme.price) return;
        state.coins -= theme.price;
        state.ownedThemes.push(theme.id);
        state.activeTheme = theme.id;
        saveState();
        toast(`Tema "${theme.name}" desbloqueado!`);
        renderShop();
      });
    }
    card.appendChild(btn);
    list.appendChild(card);
  }
}

// ---------- Jogo (play) ----------

let chart = [];
let songStartAudioTime = 0;
let currentSong = null;
let playing = false;
let score = 0;
let combo = 0;
let maxCombo = 0;
let counts = { perfect: 0, good: 0, miss: 0 };
const popups = [];
let canvasW = 0;
let canvasH = 0;

const canvas = document.getElementById("lanes-canvas");
const ctx2d = canvas.getContext("2d");

function resizeCanvas() {
  const wrap = document.getElementById("lanes-wrap");
  const availW = Math.min(wrap.clientWidth - 8, 420);
  const availH = wrap.clientHeight - 8;
  canvasW = availW;
  canvasH = availH;
  canvas.width = canvasW * devicePixelRatio;
  canvas.height = canvasH * devicePixelRatio;
  canvas.style.width = `${canvasW}px`;
  canvas.style.height = `${canvasH}px`;
}
window.addEventListener("resize", resizeCanvas);

function buildTapRow() {
  const row = document.getElementById("tap-row");
  row.innerHTML = "";
  for (let i = 0; i < LANE_COUNT; i++) {
    const btn = document.createElement("button");
    btn.className = "tap-btn";
    btn.textContent = LANE_KEYS[i];
    btn.style.background = currentTheme().colors[i] + "33";
    btn.style.color = currentTheme().colors[i];
    const press = (e) => {
      e.preventDefault();
      hitLane(i);
      btn.classList.add("pressed");
      setTimeout(() => btn.classList.remove("pressed"), 90);
    };
    btn.addEventListener("pointerdown", press);
    row.appendChild(btn);
  }
}

const KEY_TO_LANE = { KeyD: 0, KeyF: 1, KeyJ: 2, KeyK: 3 };
window.addEventListener("keydown", (e) => {
  if (!playing) return;
  const lane = KEY_TO_LANE[e.code];
  if (lane !== undefined) hitLane(lane);
});

function songTime() {
  return getAudioCtx().currentTime - songStartAudioTime;
}

function hitLane(lane) {
  const t = songTime();
  let best = null;
  for (const note of chart) {
    if (note.judged || note.lane !== lane) continue;
    const diff = Math.abs(t - note.hitTime);
    if (diff <= MISS_WINDOW && (!best || diff < best.diff)) best = { note, diff };
  }
  if (!best) return;

  const { note, diff } = best;
  note.judged = true;
  let result;
  if (diff <= PERFECT_WINDOW) result = "perfect";
  else if (diff <= GOOD_WINDOW) result = "good";
  else result = "good";
  note.result = result;

  if (result === "perfect") {
    counts.perfect++;
    combo++;
    score += 100 * (1 + Math.min(4, Math.floor(combo / 10)) * 0.1);
  } else {
    counts.good++;
    combo++;
    score += 50 * (1 + Math.min(4, Math.floor(combo / 10)) * 0.1);
  }
  maxCombo = Math.max(maxCombo, combo);
  playJudgeSfx(result);
  spawnPopup(lane, result === "perfect" ? "PERFEITO!" : "BOA!", result === "perfect" ? "#ffd166" : "#4cc9f0");
}

function spawnPopup(lane, text, color) {
  popups.push({ lane, text, color, born: performance.now() });
}

function startSong(index) {
  currentSong = SONGS[index];
  chart = buildChart(currentSong);
  score = 0;
  combo = 0;
  maxCombo = 0;
  counts = { perfect: 0, good: 0, miss: 0 };
  popups.length = 0;
  showView("play");
  buildTapRow();
  requestAnimationFrame(() => {
    resizeCanvas();
    const ctx = getAudioCtx();
    songStartAudioTime = ctx.currentTime;
    for (const note of chart) {
      scheduleBlip(LANE_FREQS[note.lane], songStartAudioTime + note.hitTime);
    }
    playing = true;
    updateHud();
  });
}

document.getElementById("btn-play-quit").addEventListener("click", () => {
  playing = false;
  showView("menu");
  renderMenu();
});

function updateHud() {
  document.getElementById("hud-score").textContent = String(Math.floor(score));
  document.getElementById("hud-combo").textContent = combo > 1 ? `combo x${combo}` : "";
}

function endSong() {
  playing = false;
  const total = chart.length;
  const accuracy = total > 0 ? (counts.perfect * 100 + counts.good * 60) / (total * 100) : 0;
  let grade = "D";
  if (accuracy >= 0.95) grade = "S";
  else if (accuracy >= 0.85) grade = "A";
  else if (accuracy >= 0.7) grade = "B";
  else if (accuracy >= 0.5) grade = "C";

  const coinsEarned = 30 + Math.round(accuracy * 60);
  state.coins += coinsEarned;
  const songIndex = SONGS.indexOf(currentSong);
  if (songIndex + 1 >= state.unlockedSongs && songIndex + 1 < SONGS.length) {
    state.unlockedSongs = songIndex + 2;
    toast("Nova música desbloqueada!");
  }
  saveState();

  document.getElementById("result-grade").textContent = grade;
  document.getElementById("result-stats").textContent =
    `${Math.round(accuracy * 100)}% de acerto · ${counts.perfect} perfeitos, ${counts.good} bons, ${counts.miss} perdidos · combo máx. x${maxCombo}`;
  document.getElementById("result-coins").textContent = `+${coinsEarned} 🎵`;
  showView("result");
}

document.getElementById("btn-result-retry").addEventListener("click", () => {
  startSong(SONGS.indexOf(currentSong));
});
document.getElementById("btn-result-menu").addEventListener("click", () => {
  showView("menu");
  renderMenu();
});

function drawPlayField() {
  const theme = currentTheme();
  const laneW = canvasW / LANE_COUNT;
  const hitLineY = canvasH * 0.82;
  const t = songTime();

  ctx2d.save();
  ctx2d.scale(devicePixelRatio, devicePixelRatio);
  ctx2d.clearRect(0, 0, canvasW, canvasH);

  for (let i = 0; i < LANE_COUNT; i++) {
    ctx2d.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)";
    ctx2d.fillRect(i * laneW, 0, laneW, canvasH);
  }

  ctx2d.strokeStyle = "rgba(255,255,255,0.35)";
  ctx2d.lineWidth = 3;
  ctx2d.beginPath();
  ctx2d.moveTo(0, hitLineY);
  ctx2d.lineTo(canvasW, hitLineY);
  ctx2d.stroke();

  for (const note of chart) {
    if (note.judged) continue;
    const spawnTime = note.hitTime - NOTE_TRAVEL_TIME;
    const progress = (t - spawnTime) / NOTE_TRAVEL_TIME;
    if (progress < -0.05 || progress > 1.25) continue;
    const y = progress * hitLineY;
    const x = note.lane * laneW + laneW / 2;
    ctx2d.fillStyle = theme.colors[note.lane];
    ctx2d.beginPath();
    const r = laneW * 0.22;
    ctx2d.roundRect ? ctx2d.roundRect(x - r, y - r * 0.6, r * 2, r * 1.2, 8) : ctx2d.rect(x - r, y - r * 0.6, r * 2, r * 1.2);
    ctx2d.fill();
  }

  const now = performance.now();
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    const age = (now - p.born) / 1000;
    if (age > 0.6) {
      popups.splice(i, 1);
      continue;
    }
    const x = p.lane * laneW + laneW / 2;
    const y = hitLineY - 20 - age * 40;
    ctx2d.globalAlpha = Math.max(0, 1 - age / 0.6);
    ctx2d.fillStyle = p.color;
    ctx2d.font = "bold 13px sans-serif";
    ctx2d.textAlign = "center";
    ctx2d.fillText(p.text, x, y);
  }
  ctx2d.globalAlpha = 1;

  ctx2d.restore();
}

function loop() {
  if (playing) {
    const t = songTime();
    for (const note of chart) {
      if (!note.judged && t - note.hitTime > MISS_WINDOW) {
        note.judged = true;
        note.result = "miss";
        counts.miss++;
        combo = 0;
        spawnPopup(note.lane, "FALTOU", "#ff5f6d");
      }
    }
    updateHud();

    const lastNote = chart[chart.length - 1];
    if (lastNote && t > lastNote.hitTime + NOTE_TRAVEL_TIME + 0.5) {
      endSong();
    }
  }

  if (!views.play.classList.contains("hidden")) drawPlayField();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

renderMenu();
