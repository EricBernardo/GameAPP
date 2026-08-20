import {
  GRID_COLS, GRID_ROWS, CATEGORIES, ITEMS, ITEM_BY_ID,
  REQUEST_TAGS, CUSTOMER_NAMES, LEVEL_XP, levelFromXp,
} from "./items.js";

const STORAGE_KEY = "cozy_decor_state";
const PASSIVE_INCOME_INTERVAL_MS = 4000;
const PASSIVE_INCOME_AMOUNT = 1;

const BACKDROPS = [
  { id: "classico", name: "Clássico", icon: "🏠", floor: "#e8d3b8", wall: "#f7e9d7", unlockLevel: 1 },
  { id: "tropical", name: "Tropical", icon: "🌴", floor: "#cdeac0", wall: "#eaf7dc", unlockLevel: 1 },
  { id: "praia", name: "Praia", icon: "🏖️", floor: "#f4e2b8", wall: "#cfeffa", unlockLevel: 2 },
  { id: "espaco", name: "Espaço", icon: "🌌", floor: "#2b2d42", wall: "#1a1b2e", unlockLevel: 3, dark: true },
  { id: "noturno", name: "Noturno", icon: "🌙", floor: "#3a3548", wall: "#221f30", unlockLevel: 4, dark: true },
];

function defaultState() {
  return {
    coins: 60,
    xp: 0,
    ownedItemIds: ITEMS.filter((i) => i.starter).map((i) => i.id),
    backdropId: "classico",
    roomGrid: new Array(GRID_COLS * GRID_ROWS).fill(null),
    lastCustomerTag: null,
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

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const state = loadState();
let selectedCategory = "Tudo";
let placingItemId = null;
let currentCustomer = null;

const canvas = document.getElementById("room-canvas");
const ctx = canvas.getContext("2d");
let cellSize = 60;

function resizeCanvas() {
  const wrap = document.getElementById("room-wrap");
  const availW = wrap.clientWidth - 16;
  const availH = wrap.clientHeight - 16;
  cellSize = Math.max(36, Math.min(availW / GRID_COLS, availH / GRID_ROWS));
  const w = cellSize * GRID_COLS;
  const h = cellSize * GRID_ROWS;
  canvas.width = w * devicePixelRatio;
  canvas.height = h * devicePixelRatio;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  drawRoom();
}
window.addEventListener("resize", resizeCanvas);

function toast(text) {
  const el = document.getElementById("toast");
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 1600);
}

function currentLevel() {
  return levelFromXp(state.xp);
}

function updateTopbar() {
  document.getElementById("coins-value").textContent = String(state.coins);
  const level = currentLevel();
  document.getElementById("level-label").textContent = `Nível ${level}`;
  const floor = LEVEL_XP[level - 1] ?? 0;
  const next = LEVEL_XP[level] ?? floor + 200;
  const pct = level >= LEVEL_XP.length ? 100 : Math.max(0, Math.min(100, ((state.xp - floor) / (next - floor)) * 100));
  document.getElementById("xp-fill").style.width = `${pct}%`;
}

function currentBackdrop() {
  return BACKDROPS.find((b) => b.id === state.backdropId) || BACKDROPS[0];
}

function drawRoom() {
  const backdrop = currentBackdrop();
  const w = cellSize * GRID_COLS;
  const h = cellSize * GRID_ROWS;
  ctx.save();
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.fillStyle = backdrop.wall;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = backdrop.floor;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);

  ctx.strokeStyle = backdrop.dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  for (let r = 0; r <= GRID_ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * cellSize);
    ctx.lineTo(w, r * cellSize);
    ctx.stroke();
  }
  for (let c = 0; c <= GRID_COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * cellSize, 0);
    ctx.lineTo(c * cellSize, h);
    ctx.stroke();
  }

  ctx.font = `${cellSize * 0.55}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const idx = r * GRID_COLS + c;
      const itemId = state.roomGrid[idx];
      if (itemId && ITEM_BY_ID[itemId]) {
        const cx = c * cellSize + cellSize / 2;
        const cy = r * cellSize + cellSize / 2;
        ctx.fillText(ITEM_BY_ID[itemId].icon, cx, cy);
      } else if (placingItemId) {
        ctx.fillStyle = backdrop.dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
        ctx.beginPath();
        ctx.arc(c * cellSize + cellSize / 2, r * cellSize + cellSize / 2, cellSize * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

canvas.addEventListener("pointerdown", (evt) => {
  const rect = canvas.getBoundingClientRect();
  const x = evt.clientX - rect.left;
  const y = evt.clientY - rect.top;
  const c = Math.floor(x / cellSize);
  const r = Math.floor(y / cellSize);
  if (c < 0 || c >= GRID_COLS || r < 0 || r >= GRID_ROWS) return;
  const idx = r * GRID_COLS + c;

  if (placingItemId) {
    state.roomGrid[idx] = placingItemId;
    placingItemId = null;
    document.getElementById("placing-banner").classList.add("hidden");
    saveState();
    drawRoom();
    renderShop();
    return;
  }

  if (state.roomGrid[idx]) {
    state.roomGrid[idx] = null;
    toast("Item guardado no inventário.");
    saveState();
    drawRoom();
  }
});

function renderBackdrops() {
  const row = document.getElementById("backdrop-row");
  row.innerHTML = "";
  const level = currentLevel();
  for (const bd of BACKDROPS) {
    const locked = bd.unlockLevel > level;
    const btn = document.createElement("button");
    btn.className = "backdrop-swatch" + (bd.id === state.backdropId ? " active" : "") + (locked ? " locked" : "");
    btn.style.background = bd.floor;
    btn.textContent = locked ? "🔒" : bd.icon;
    btn.title = locked ? `Desbloqueia no nível ${bd.unlockLevel}` : bd.name;
    btn.addEventListener("click", () => {
      if (locked) {
        toast(`Desbloqueia no nível ${bd.unlockLevel}.`);
        return;
      }
      state.backdropId = bd.id;
      saveState();
      renderBackdrops();
      drawRoom();
    });
    row.appendChild(btn);
  }
}

function renderCategoryTabs() {
  const wrap = document.getElementById("category-tabs");
  wrap.innerHTML = "";
  const all = ["Tudo", ...CATEGORIES];
  for (const cat of all) {
    const btn = document.createElement("button");
    btn.className = "category-tab" + (cat === selectedCategory ? " active" : "");
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      selectedCategory = cat;
      renderCategoryTabs();
      renderShop();
    });
    wrap.appendChild(btn);
  }
}

function renderShop() {
  const grid = document.getElementById("item-grid");
  grid.innerHTML = "";
  const level = currentLevel();
  const filtered = ITEMS.filter((i) => selectedCategory === "Tudo" || i.category === selectedCategory);

  for (const item of filtered) {
    const owned = state.ownedItemIds.includes(item.id);
    const locked = item.unlockLevel > level;
    const btn = document.createElement("button");
    btn.className = "shop-item" + (owned ? " owned" : "") + (locked ? " locked" : "") + (placingItemId === item.id ? " selected" : "");
    btn.innerHTML = `
      ${locked ? `<span class="lock-badge">🔒 Nv.${item.unlockLevel}</span>` : ""}
      <span class="icon">${item.icon}</span>
      <span class="name">${item.name}</span>
      <span class="price">${owned ? "Você tem" : (item.price === 0 ? "Grátis" : `🪙 ${item.price}`)}</span>
    `;
    btn.addEventListener("click", () => onShopItemClick(item, owned, locked));
    grid.appendChild(btn);
  }
}

function onShopItemClick(item, owned, locked) {
  if (locked) {
    toast(`Este item desbloqueia no nível ${item.unlockLevel}.`);
    return;
  }
  if (!owned) {
    if (state.coins < item.price) {
      toast("Moedas insuficientes.");
      return;
    }
    state.coins -= item.price;
    state.ownedItemIds.push(item.id);
    toast(`${item.name} comprado!`);
  }
  placingItemId = item.id;
  document.getElementById("placing-name").textContent = item.name;
  document.getElementById("placing-banner").classList.remove("hidden");
  saveState();
  updateTopbar();
  renderShop();
  drawRoom();
}

document.getElementById("btn-cancel-placing").addEventListener("click", () => {
  placingItemId = null;
  document.getElementById("placing-banner").classList.add("hidden");
  renderShop();
  drawRoom();
});

// ---------- Cliente / pedidos ----------

function spawnCustomer() {
  let pick;
  do {
    pick = REQUEST_TAGS[Math.floor(Math.random() * REQUEST_TAGS.length)];
  } while (REQUEST_TAGS.length > 1 && pick.tag === state.lastCustomerTag);
  state.lastCustomerTag = pick.tag;
  const name = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
  currentCustomer = { name, tag: pick.tag, text: pick.text };
  document.getElementById("customer-name").textContent = name;
  document.getElementById("customer-text").textContent = pick.text;
  saveState();
}

function roomHasTag(tag) {
  return state.roomGrid.some((itemId) => itemId && ITEM_BY_ID[itemId]?.tags.includes(tag));
}

document.getElementById("btn-deliver").addEventListener("click", () => {
  if (!currentCustomer) return;
  if (roomHasTag(currentCustomer.tag)) {
    const level = currentLevel();
    const coinsEarned = 20 + level * 5;
    const xpEarned = 15;
    state.coins += coinsEarned;
    const prevLevel = currentLevel();
    state.xp += xpEarned;
    const newLevel = currentLevel();
    saveState();
    updateTopbar();
    renderBackdrops();
    renderShop();
    toast(`Pedido entregue! +${coinsEarned} 🪙`);
    if (newLevel > prevLevel) {
      setTimeout(() => toast(`Subiu para o nível ${newLevel}! Novos itens desbloqueados.`), 1200);
    }
    spawnCustomer();
  } else {
    toast("Ainda não atende ao pedido... adicione algo que combine!");
  }
});

// ---------- Renda passiva ----------

setInterval(() => {
  state.coins += PASSIVE_INCOME_AMOUNT;
  saveState();
  updateTopbar();
}, PASSIVE_INCOME_INTERVAL_MS);

// ---------- Inicialização ----------

updateTopbar();
renderBackdrops();
renderCategoryTabs();
renderShop();
spawnCustomer();
requestAnimationFrame(() => {
  resizeCanvas();
});
