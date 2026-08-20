import {
  CREATURES, productionAtLevel, upgradeCost,
  OFFLINE_CAP_SECONDS, OFFLINE_EFFICIENCY,
  BOOST_MULTIPLIER, BOOST_DURATION_SECONDS, BOOST_COOLDOWN_SECONDS,
} from "./creatures.js";

const STORAGE_KEY = "idle_creatures_state";
const MIN_OFFLINE_SECONDS_TO_SHOW = 10;

function defaultState() {
  return {
    gems: 15,
    levels: new Array(CREATURES.length).fill(0),
    lastSeen: Date.now(),
    boostUntil: 0,
    boostCooldownUntil: 0,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

const state = loadState();
let pendingOfflineAmount = 0;

function saveState() {
  state.lastSeen = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatNumber(n) {
  const abs = Math.abs(n);
  if (abs < 1000) return String(Math.floor(n));
  const units = ["K", "M", "B", "T"];
  let value = n;
  let unitIndex = -1;
  while (Math.abs(value) >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex++;
  }
  return `${value.toFixed(value < 10 ? 2 : 1)}${units[unitIndex]}`;
}

function isBoostActive() {
  return Date.now() < state.boostUntil;
}

function totalProduction() {
  let total = 0;
  for (let i = 0; i < CREATURES.length; i++) {
    if (state.levels[i] > 0) total += productionAtLevel(CREATURES[i], state.levels[i]);
  }
  return total;
}

function effectiveProduction() {
  return totalProduction() * (isBoostActive() ? BOOST_MULTIPLIER : 1);
}

function toast(text) {
  const el = document.getElementById("toast");
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 1600);
}

// ---------- Ganhos offline (determinísticos, sem sorteio) ----------

function checkOfflineEarnings() {
  const elapsedSeconds = Math.max(0, (Date.now() - state.lastSeen) / 1000);
  if (elapsedSeconds < MIN_OFFLINE_SECONDS_TO_SHOW) return;
  const cappedSeconds = Math.min(elapsedSeconds, OFFLINE_CAP_SECONDS);
  const amount = Math.round(totalProduction() * cappedSeconds * OFFLINE_EFFICIENCY);
  if (amount <= 0) return;
  pendingOfflineAmount = amount;
  document.getElementById("offline-amount").textContent = `+${formatNumber(amount)} 💎`;
  document.getElementById("offline-modal").classList.remove("hidden");
}

document.getElementById("btn-offline-collect").addEventListener("click", () => {
  state.gems += pendingOfflineAmount;
  pendingOfflineAmount = 0;
  document.getElementById("offline-modal").classList.add("hidden");
  saveState();
  renderAll();
});

document.getElementById("btn-offline-double").addEventListener("click", () => {
  state.gems += pendingOfflineAmount * 2;
  pendingOfflineAmount = 0;
  document.getElementById("offline-modal").classList.add("hidden");
  toast("Anúncio 'assistido' — recompensa dobrada!");
  saveState();
  renderAll();
});

// ---------- Toque manual ----------

document.getElementById("btn-tap").addEventListener("click", (evt) => {
  const tapValue = Math.max(1, Math.round(totalProduction() * 0.5));
  state.gems += tapValue;
  spawnFloatNumber(evt.currentTarget, `+${formatNumber(tapValue)}`);
  saveState();
  renderTopbar();
});

function spawnFloatNumber(anchor, text) {
  const rect = anchor.getBoundingClientRect();
  const el = document.createElement("div");
  el.textContent = text;
  el.style.position = "fixed";
  el.style.left = `${rect.left + rect.width / 2}px`;
  el.style.top = `${rect.top}px`;
  el.style.transform = "translate(-50%, 0)";
  el.style.color = "#ffd166";
  el.style.fontWeight = "800";
  el.style.fontSize = "16px";
  el.style.pointerEvents = "none";
  el.style.transition = "transform 0.6s ease, opacity 0.6s ease";
  el.style.zIndex = "40";
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.transform = "translate(-50%, -40px)";
    el.style.opacity = "0";
  });
  setTimeout(() => el.remove(), 650);
}

// ---------- Anúncio de boost simulado ----------

document.getElementById("btn-boost").addEventListener("click", () => {
  const now = Date.now();
  if (now < state.boostCooldownUntil) return;
  state.boostUntil = now + BOOST_DURATION_SECONDS * 1000;
  state.boostCooldownUntil = state.boostUntil + BOOST_COOLDOWN_SECONDS * 1000;
  toast("Boost de 2x ativado por 60s!");
  saveState();
});

function renderBoostStatus() {
  const now = Date.now();
  const btn = document.getElementById("btn-boost");
  const status = document.getElementById("boost-status");
  if (now < state.boostUntil) {
    btn.disabled = true;
    status.textContent = `Ativo! ${Math.ceil((state.boostUntil - now) / 1000)}s restantes`;
  } else if (now < state.boostCooldownUntil) {
    btn.disabled = true;
    status.textContent = `Recarregando... ${Math.ceil((state.boostCooldownUntil - now) / 1000)}s`;
  } else {
    btn.disabled = false;
    status.textContent = "";
  }
}

// ---------- Lista de criaturas ----------

function renderCreatureList() {
  const container = document.getElementById("creature-list");
  container.innerHTML = "";

  for (let i = 0; i < CREATURES.length; i++) {
    const creature = CREATURES[i];
    const level = state.levels[i];
    const unlocked = level > 0;
    const canUnlockNow = !unlocked && (i === 0 || state.levels[i - 1] > 0);

    const row = document.createElement("div");
    row.className = "creature-row" + (unlocked ? "" : " locked");

    const detail = unlocked
      ? `Nível ${level} · ${formatNumber(productionAtLevel(creature, level))} 💎/s`
      : canUnlockNow
        ? `Bloqueado · custa ${formatNumber(creature.unlockCost)} 💎`
        : "Bloqueado · adote a criatura anterior primeiro";

    row.innerHTML = `
      <div class="creature-icon">${unlocked || canUnlockNow ? creature.icon : "❔"}</div>
      <div class="creature-info">
        <div class="creature-name">${unlocked || canUnlockNow ? creature.name : "???"}</div>
        <div class="creature-detail">${detail}</div>
      </div>
      <div class="creature-action"></div>
    `;

    const actionSlot = row.querySelector(".creature-action");
    const btn = document.createElement("button");
    if (unlocked) {
      const cost = upgradeCost(creature, level);
      btn.textContent = `⬆ ${formatNumber(cost)} 💎`;
      btn.disabled = state.gems < cost;
      btn.addEventListener("click", () => {
        if (state.gems < cost) return;
        state.gems -= cost;
        state.levels[i] += 1;
        saveState();
        renderAll();
      });
    } else if (canUnlockNow) {
      btn.textContent = `Adotar`;
      btn.disabled = state.gems < creature.unlockCost;
      btn.addEventListener("click", () => {
        if (state.gems < creature.unlockCost) return;
        state.gems -= creature.unlockCost;
        state.levels[i] = 1;
        toast(`${creature.name} adotado(a)!`);
        saveState();
        renderAll();
      });
    } else {
      btn.textContent = "🔒";
      btn.disabled = true;
    }
    actionSlot.appendChild(btn);
    container.appendChild(row);
  }
}

function renderTopbar() {
  document.getElementById("gems-value").textContent = formatNumber(state.gems);
  document.getElementById("rate-value").textContent = formatNumber(effectiveProduction());
}

function renderAll() {
  renderTopbar();
  renderCreatureList();
  renderBoostStatus();
}

// ---------- Loop principal ----------

let lastTime = performance.now();
let renderAccumulator = 0;
function loop(now) {
  const dt = Math.min(1, (now - lastTime) / 1000);
  lastTime = now;

  state.gems += effectiveProduction() * dt;

  renderAccumulator += dt;
  if (renderAccumulator >= 0.25) {
    renderAccumulator = 0;
    renderTopbar();
    renderBoostStatus();
  }

  requestAnimationFrame(loop);
}

setInterval(saveState, 5000);
window.addEventListener("beforeunload", saveState);

checkOfflineEarnings();
renderAll();
requestAnimationFrame((t) => {
  lastTime = t;
  requestAnimationFrame(loop);
});
