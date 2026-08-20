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
};

export const PALETTE = [
  { type: TILE.GROUND, icon: "🟫", label: "Chão" },
  { type: TILE.HAZARD, icon: "🔺", label: "Perigo" },
  { type: TILE.COIN, icon: "🪙", label: "Moeda" },
  { type: TILE.SPRING, icon: "🌀", label: "Mola" },
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
      "..........o.....",
      "..........#.....",
      "...o..o.........",
      "................",
      "S#####..xx..###G",
      "######..xx..####",
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
      "S..xxxx....^...##",
      "#..xxxx....^...##",
      "################",
    ]),
  },
];
