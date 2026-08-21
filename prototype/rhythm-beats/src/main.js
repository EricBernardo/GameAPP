import {
  LANE_COUNT, LANE_FREQS, LANE_KEYS, LANE_NOTE_NAMES,
  CAMPAIGN_SONGS, ROCK_SONGS, SHOP_PACKS, THEMES,
  NOTE_TRAVEL_TIME, PERFECT_WINDOW, GOOD_WINDOW, MISS_WINDOW, buildChart,
  ENERGY_MAX, ENERGY_LOSS_PER_MISS, ENERGY_GAIN_PER_HIT,
} from "./songs.js";

const STORAGE_KEY = "rhythm_beats_state";

function defaultState() {
  return {
    coins: 0,
    unlockedSongs: 1,
    ownedThemes: ["classico"],
    activeTheme: "classico",
    ownedRockIds: [],
  };
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
if (!Array.isArray(state.ownedRockIds)) state.ownedRockIds = [];

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

function scheduleNote(freq, when, accent = false) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const harmonic = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = "triangle";
  harmonic.type = "sine";
  osc.frequency.setValueAtTime(freq, when);
  harmonic.frequency.setValueAtTime(freq * 2, when);
  const peak = accent ? 0.22 : 0.16;
  amp.gain.setValueAtTime(0.0001, when);
  amp.gain.exponentialRampToValueAtTime(peak, when + 0.018);
  amp.gain.exponentialRampToValueAtTime(0.0001, when + 0.38);
  osc.connect(amp);
  harmonic.connect(amp);
  amp.connect(ctx.destination);
  osc.start(when);
  harmonic.start(when);
  osc.stop(when + 0.42);
  harmonic.stop(when + 0.42);
}

function laneFreqs() {
  return currentSong?.freqs || LANE_FREQS;
}

function playJudgeSfx(type, lane = 0) {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  if (type === "miss") {
    scheduleNote(160, now, false);
    return;
  }
  const freq = laneFreqs()[lane] || 440;
  scheduleNote(type === "perfect" ? freq * 1.01 : freq, now, type === "perfect");
}

function scheduleKick(when) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, when);
  osc.frequency.exponentialRampToValueAtTime(48, when + 0.11);
  amp.gain.setValueAtTime(0.22, when);
  amp.gain.exponentialRampToValueAtTime(0.0001, when + 0.16);
  osc.connect(amp).connect(ctx.destination);
  osc.start(when);
  osc.stop(when + 0.18);
}

function scheduleRockGroove(startAt, bpm, lastHitTime) {
  const beat = 60 / bpm;
  const end = startAt + lastHitTime + 0.4;
  let t = startAt + 2.2;
  let i = 0;
  while (t < end) {
    scheduleKick(t);
    if (i % 2 === 1) scheduleNote(196, t, false);
    t += beat;
    i++;
  }
}

// ---------- Menu ----------

function isCampaignUnlocked(index) {
  return index < state.unlockedSongs;
}

function packMeta(packId) {
  return SHOP_PACKS.find((p) => p.id === packId) || SHOP_PACKS[0];
}

function isRockOwned(song) {
  return state.ownedRockIds.includes(song.id);
}

function renderMenu() {
  document.getElementById("coins-value").textContent = String(state.coins);
  const list = document.getElementById("song-list");
  list.innerHTML = "";

  const campaignTitle = document.createElement("div");
  campaignTitle.className = "list-heading";
  campaignTitle.textContent = "Progresso";
  list.appendChild(campaignTitle);

  CAMPAIGN_SONGS.forEach((song, i) => {
    const unlocked = isCampaignUnlocked(i);
    const btn = document.createElement("button");
    btn.className = "song-card" + (unlocked ? "" : " locked");
    btn.innerHTML = `
      <span class="song-icon">${unlocked ? "🎵" : "🔒"}</span>
      <span class="song-info">
        <span class="song-name">${unlocked ? song.name : "???"}</span>
        <span class="song-meta">${unlocked ? `${song.bpm} BPM · ${song.notes.length} notas` : "Complete a fase anterior para desbloquear"}</span>
      </span>
    `;
    if (unlocked) btn.addEventListener("click", () => startSong(song));
    else btn.disabled = true;
    list.appendChild(btn);
  });

  const rockTitle = document.createElement("div");
  rockTitle.className = "list-heading";
  rockTitle.textContent = "Compradas";
  list.appendChild(rockTitle);

  const ownedRock = ROCK_SONGS.filter(isRockOwned);
  if (ownedRock.length === 0) {
    const empty = document.createElement("p");
    empty.className = "list-empty";
    empty.textContent = "Compre na loja: estilos Elvis, Sabbath, Metallica e Beatles (originais).";
    list.appendChild(empty);
  } else {
    for (const song of ownedRock) {
      const pack = packMeta(song.pack);
      const btn = document.createElement("button");
      btn.className = "song-card rock";
      btn.innerHTML = `
        <span class="song-icon">${pack.icon}</span>
        <span class="song-info">
          <span class="song-name">${song.name}</span>
          <span class="song-meta">${pack.label} · ${song.bpm} BPM · ${song.notes.length} notas</span>
        </span>
      `;
      btn.addEventListener("click", () => startSong(song));
      list.appendChild(btn);
    }
  }
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
  const rockList = document.getElementById("rock-list");
  rockList.innerHTML = "";
  for (const pack of SHOP_PACKS) {
    const heading = document.createElement("h3");
    heading.className = "shop-section";
    heading.textContent = `${pack.icon} ${pack.label}`;
    rockList.appendChild(heading);
    for (const song of ROCK_SONGS.filter((s) => s.pack === pack.id)) {
    const owned = isRockOwned(song);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "theme-card";
    card.innerHTML = `
      <span class="song-icon">${pack.icon}</span>
      <div class="theme-info">
        <div class="theme-name">${song.name}</div>
        <div class="song-meta">${pack.label} · ${song.bpm} BPM</div>
      </div>
    `;
    const badge = document.createElement("span");
    badge.className = "theme-badge";
    if (owned) {
      badge.textContent = "Jogar";
      badge.classList.add("active-theme");
    } else {
      badge.textContent = `🎵 ${song.price}`;
      if (state.coins < song.price) badge.classList.add("cant-afford");
    }
    card.appendChild(badge);
    card.addEventListener("click", () => {
      if (owned) {
        startSong(song);
        return;
      }
      if (state.coins < song.price) {
        toast(`Faltam ${song.price - state.coins} 🎵 para "${song.name}".`);
        return;
      }
      state.coins -= song.price;
      state.ownedRockIds.push(song.id);
      saveState();
      toast(`"${song.name}" comprada!`);
      renderShop();
    });
    rockList.appendChild(card);
    }
  }

  document.getElementById("shop-coins").textContent = `🎵 ${state.coins}`;
  const list = document.getElementById("theme-list");
  list.innerHTML = "";
  for (const theme of THEMES) {
    const owned = state.ownedThemes.includes(theme.id);
    const active = state.activeTheme === theme.id;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "theme-card";
    card.dataset.themeId = theme.id;
    card.innerHTML = `
      <div class="theme-swatches">${theme.colors.map((c) => `<span style="background:${c}"></span>`).join("")}</div>
      <div class="theme-info">
        <div class="theme-name">${theme.name}</div>
      </div>
    `;
    const badge = document.createElement("span");
    badge.className = "theme-badge";
    if (active) {
      badge.textContent = "Em uso";
      badge.classList.add("active-theme");
    } else if (owned) {
      badge.textContent = "Usar";
    } else {
      badge.textContent = theme.price === 0 ? "Grátis" : `🎵 ${theme.price}`;
      if (state.coins < theme.price) badge.classList.add("cant-afford");
    }
    card.appendChild(badge);
    card.addEventListener("click", () => {
      if (active) {
        toast("Este tema já está em uso.");
        return;
      }
      if (owned) {
        state.activeTheme = theme.id;
        saveState();
        toast(`Tema "${theme.name}" em uso.`);
        renderShop();
        return;
      }
      if (state.coins < theme.price) {
        toast(`Faltam ${theme.price - state.coins} 🎵 para "${theme.name}".`);
        return;
      }
      state.coins -= theme.price;
      if (!state.ownedThemes.includes(theme.id)) state.ownedThemes.push(theme.id);
      state.activeTheme = theme.id;
      saveState();
      toast(`Tema "${theme.name}" desbloqueado!`);
      renderShop();
    });
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
let counts = { perfect: 0, good: 0, ok: 0, miss: 0 };
let energy = ENERGY_MAX;
let failed = false;
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
if (window.visualViewport) window.visualViewport.addEventListener("resize", resizeCanvas);

function buildTapRow() {
  const row = document.getElementById("tap-row");
  row.innerHTML = "";
  for (let i = 0; i < LANE_COUNT; i++) {
    const btn = document.createElement("button");
    btn.className = "tap-btn";
    btn.innerHTML = `<span class="tap-note">♪</span><span class="tap-name">${LANE_NOTE_NAMES[i]}</span><span class="tap-key">${LANE_KEYS[i]}</span>`;
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
  else result = "ok";
  note.result = result;

  const multiplier = 1 + Math.min(4, Math.floor(combo / 10)) * 0.1;
  if (result === "perfect") {
    counts.perfect++;
    score += 100 * multiplier;
  } else if (result === "good") {
    counts.good++;
    score += 50 * multiplier;
  } else {
    counts.ok++;
    score += 20 * multiplier;
  }
  combo++;
  maxCombo = Math.max(maxCombo, combo);
  energy = Math.min(ENERGY_MAX, energy + ENERGY_GAIN_PER_HIT);
  updateEnergyBar();
  playJudgeSfx(result === "perfect" ? "perfect" : result === "good" ? "good" : "ok", lane);
  const labels = { perfect: "PERFEITO!", good: "BOA!", ok: "OK" };
  const colors = { perfect: "#ffd166", good: "#4cc9f0", ok: "#a0a0b0" };
  spawnPopup(lane, labels[result], colors[result]);
}

function updateEnergyBar() {
  const fill = document.getElementById("energy-fill");
  if (!fill) return;
  const pct = Math.max(0, (energy / ENERGY_MAX) * 100);
  fill.style.width = `${pct}%`;
  fill.classList.toggle("low", pct <= 30);
}

function spawnPopup(lane, text, color) {
  popups.push({ lane, text, color, born: performance.now() });
}

function startSong(song) {
  currentSong = song;
  chart = buildChart(currentSong);
  score = 0;
  combo = 0;
  maxCombo = 0;
  counts = { perfect: 0, good: 0, ok: 0, miss: 0 };
  energy = ENERGY_MAX;
  failed = false;
  popups.length = 0;
  showView("play");
  buildTapRow();
  updateEnergyBar();
  requestAnimationFrame(() => {
    resizeCanvas();
    const ctx = getAudioCtx();
    songStartAudioTime = ctx.currentTime;
    const freqs = laneFreqs();
    for (const note of chart) {
      scheduleNote(freqs[note.lane], songStartAudioTime + note.hitTime, note.eighth);
    }
    if (currentSong.style === "rock") {
      const last = chart[chart.length - 1];
      scheduleRockGroove(songStartAudioTime, currentSong.bpm, last ? last.hitTime : 8);
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

function endSong(failedEarly = false) {
  playing = false;
  failed = failedEarly;
  const total = chart.length;
  const accuracy = total > 0 ? (counts.perfect * 100 + counts.good * 60 + counts.ok * 30) / (total * 100) : 0;
  let grade = "D";
  if (accuracy >= 0.95) grade = "S";
  else if (accuracy >= 0.85) grade = "A";
  else if (accuracy >= 0.7) grade = "B";
  else if (accuracy >= 0.5) grade = "C";

  // Participação sempre rende algo, mesmo falhando — mantém o tom
  // casual/não-punitivo do restante do jogo.
  const coinsEarned = failedEarly ? 15 : 30 + Math.round(accuracy * 60);
  state.coins += coinsEarned;
  if (!failedEarly && currentSong.style !== "rock") {
    const songIndex = CAMPAIGN_SONGS.findIndex((s) => s.id === currentSong.id);
    if (songIndex >= 0 && songIndex + 1 >= state.unlockedSongs && songIndex + 1 < CAMPAIGN_SONGS.length) {
      state.unlockedSongs = songIndex + 2;
      toast("Nova música desbloqueada!");
    }
  }
  saveState();

  document.getElementById("result-grade").textContent = failedEarly ? "😵" : grade;
  document.getElementById("result-stats").textContent = failedEarly
    ? `Energia esgotada! ${counts.perfect} perfeitos, ${counts.good} bons, ${counts.ok} OKs, ${counts.miss} perdidos — tente de novo.`
    : `${Math.round(accuracy * 100)}% de acerto · ${counts.perfect} perfeitos, ${counts.good} bons, ${counts.ok} OKs, ${counts.miss} perdidos · combo máx. x${maxCombo}`;
  document.getElementById("result-coins").textContent = `+${coinsEarned} 🎵`;
  showView("result");
}

document.getElementById("btn-result-retry").addEventListener("click", () => {
  startSong(currentSong);
});
document.getElementById("btn-result-menu").addEventListener("click", () => {
  showView("menu");
  renderMenu();
});

function drawMusicNote(ctx, x, y, color, eighth, scale) {
  const s = scale;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.ellipse(0, 0, 11 * s, 8 * s, -0.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = Math.max(2, 2.6 * s);
  ctx.beginPath();
  ctx.moveTo(8.5 * s, -2 * s);
  ctx.lineTo(8.5 * s, -28 * s);
  ctx.stroke();

  if (eighth) {
    ctx.beginPath();
    ctx.moveTo(8.5 * s, -28 * s);
    ctx.bezierCurveTo(22 * s, -26 * s, 24 * s, -12 * s, 18 * s, -6 * s);
    ctx.bezierCurveTo(20 * s, -16 * s, 14 * s, -22 * s, 8.5 * s, -18 * s);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawPlayField() {
  const theme = currentTheme();
  const laneW = canvasW / LANE_COUNT;
  const hitLineY = canvasH * 0.82;
  const t = songTime();

  ctx2d.save();
  ctx2d.scale(devicePixelRatio, devicePixelRatio);
  ctx2d.clearRect(0, 0, canvasW, canvasH);

  for (let i = 0; i < LANE_COUNT; i++) {
    ctx2d.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)";
    ctx2d.fillRect(i * laneW, 0, laneW, canvasH);
  }

  ctx2d.strokeStyle = "rgba(255,255,255,0.12)";
  ctx2d.lineWidth = 1;
  const staffTop = hitLineY - 36;
  for (let line = 0; line < 5; line++) {
    const y = staffTop + line * 9;
    ctx2d.beginPath();
    ctx2d.moveTo(8, y);
    ctx2d.lineTo(canvasW - 8, y);
    ctx2d.stroke();
  }

  ctx2d.strokeStyle = "rgba(255,255,255,0.45)";
  ctx2d.lineWidth = 3;
  ctx2d.beginPath();
  ctx2d.moveTo(0, hitLineY);
  ctx2d.lineTo(canvasW, hitLineY);
  ctx2d.stroke();

  ctx2d.font = "bold 11px sans-serif";
  ctx2d.textAlign = "center";
  ctx2d.textBaseline = "top";
  for (let i = 0; i < LANE_COUNT; i++) {
    ctx2d.fillStyle = theme.colors[i];
    ctx2d.globalAlpha = 0.7;
    ctx2d.fillText(LANE_NOTE_NAMES[i], i * laneW + laneW / 2, 8);
  }
  ctx2d.globalAlpha = 1;

  const noteScale = Math.min(1.15, Math.max(0.75, laneW / 78));
  for (const note of chart) {
    if (note.judged) continue;
    const spawnTime = note.hitTime - NOTE_TRAVEL_TIME;
    const progress = (t - spawnTime) / NOTE_TRAVEL_TIME;
    if (progress < -0.05 || progress > 1.25) continue;
    const y = progress * hitLineY;
    const x = note.lane * laneW + laneW / 2;
    drawMusicNote(ctx2d, x, y, theme.colors[note.lane], note.eighth, noteScale);
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
        energy = Math.max(0, energy - ENERGY_LOSS_PER_MISS);
        updateEnergyBar();
        spawnPopup(note.lane, "FALTOU", "#ff5f6d");
      }
    }
    updateHud();

    if (energy <= 0 && playing) {
      endSong(true);
    }

    const lastNote = chart[chart.length - 1];
    if (!failed && lastNote && t > lastNote.hitTime + NOTE_TRAVEL_TIME + 0.5) {
      endSong();
    }
  }

  if (!views.play.classList.contains("hidden")) drawPlayField();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

renderMenu();
