export const COLS = 16;
export const ROWS = 9;

export const TILE = {
  EMPTY: 0,
  GROUND: 1,
  HAZARD: 2,
  COIN: 3,
  SPRING: 4,
  START: 5,
  GOAL: 6,
  MOVING_PLATFORM: 7,
};

export const PALETTE = [
  { type: TILE.GROUND, icon: "🟫", label: "Chão" },
  { type: TILE.HAZARD, icon: "🔺", label: "Perigo" },
  { type: TILE.COIN, icon: "🪙", label: "Moeda" },
  { type: TILE.SPRING, icon: "🌀", label: "Mola" },
  { type: TILE.MOVING_PLATFORM, icon: "↔️", label: "Plataforma móvel" },
  { type: TILE.START, icon: "🚩", label: "Início" },
  { type: TILE.GOAL, icon: "🏁", label: "Fim" },
  { type: TILE.EMPTY, icon: "🧹", label: "Apagar" },
];

export const AVATAR_COLORS = [
  "#ffffff", "#ff5f6d", "#4cc9f0", "#ffd166", "#06d6a0", "#c77dff", "#ff9f1c",
];

export function emptyGrid() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(TILE.EMPTY));
}

function buildLevel(rowsOfChars) {
  const grid = emptyGrid();
  const map = {
    ".": TILE.EMPTY, "#": TILE.GROUND, "x": TILE.HAZARD,
    "o": TILE.COIN, "^": TILE.SPRING, "S": TILE.START, "G": TILE.GOAL,
    "M": TILE.MOVING_PLATFORM,
  };
  rowsOfChars.forEach((rowStr, r) => {
    for (let c = 0; c < COLS && c < rowStr.length; c++) {
      grid[r][c] = map[rowStr[c]] ?? TILE.EMPTY;
    }
  });
  return grid;
}

export const BUILTIN_LEVELS = [
  {
    id: "builtin-1",
    name: "Primeiros Pulos",
    builtin: true,
    grid: buildLevel([
      "................",
      "................",
      "................",
      "....o.......o...",
      "................",
      "................",
      "S######.x######G",
      "#######..#######",
      "################",
    ]),
  },
  {
    id: "builtin-2",
    name: "Torre da Mola",
    builtin: true,
    grid: buildLevel([
      "..............G.",
      "..............#.",
      "..............#.",
      "....o..o......#.",
      "................",
      ".........o......",
      "S..xxxx....^..##",
      "#..xxxx....^..##",
      "################",
    ]),
  },
  {
    id: "builtin-3",
    name: "Corrida de Moedas",
    builtin: true,
    grid: buildLevel([
      "................",
      "................",
      ".....o....o.....",
      "................",
      "..o..........o..",
      "................",
      "S####.##.##.###G",
      "#####.##.##.####",
      "################",
    ]),
  },
  {
    id: "builtin-4",
    name: "Vale dos Espinhos",
    builtin: true,
    grid: buildLevel([
      "................",
      "................",
      "................",
      "................",
      "................",
      ".....o....o.....",
      "................",
      "S#.#.#.#.#.#.##G",
      "################",
    ]),
  },
  {
    id: "builtin-5",
    name: "Plataforma Viajante",
    builtin: true,
    grid: buildLevel([
      "................",
      "................",
      ".......o........",
      "................",
      "................",
      "................",
      "................",
      "S..####..M....#G",
      "#######.......##",
    ]),
  },
  {
    id: "builtin-6",
    name: "Desafio Final",
    builtin: true,
    grid: buildLevel([
      "................",
      "................",
      "..............G.",
      "..............#.",
      "....o..........o",
      "................",
      "S..xxxxx..M..^..",
      "#..xxxxx......^#",
      "#########...####",
    ]),
  },
];
