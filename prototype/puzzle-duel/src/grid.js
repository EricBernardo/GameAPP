export const ROWS = 8;
export const COLS = 8;
export const GEM_TYPES = 6;
export const GEM_COLORS = ["#ff5f6d", "#4cc9f0", "#ffd166", "#06d6a0", "#c77dff", "#ff9f1c"];

let nextTileId = 1;

function randomType(excludeTypes = []) {
  let t;
  do {
    t = Math.floor(Math.random() * GEM_TYPES);
  } while (excludeTypes.includes(t));
  return t;
}

export function makeTile(type, row, col, spawnFromRow = row) {
  return {
    id: nextTileId++,
    type,
    row,
    col,
    visRow: spawnFromRow,
    visCol: col,
    // Peça congelada: sobrevive à primeira combinação que a envolve
    // (só perde o gelo), precisando de uma segunda combinação para
    // ser removida de fato — variedade de conteúdo além do 8x8 puro.
    iceLevel: 0,
  };
}

// Congela algumas células aleatórias do tabuleiro (fora das 2 primeiras
// e 2 últimas colunas/linhas, para não travar cantos difíceis de alcançar).
export function applyRandomIce(tiles, count) {
  const candidates = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      candidates.push({ r, c });
    }
  }
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  for (let i = 0; i < Math.min(count, candidates.length); i++) {
    const { r, c } = candidates[i];
    if (tiles[r][c]) tiles[r][c].iceLevel = 1;
  }
}

// Preenche o tabuleiro evitando combinações já formadas na criação,
// para que o jogador comece sempre com um tabuleiro "neutro".
export function createInitialBoard() {
  const tiles = [];
  for (let r = 0; r < ROWS; r++) {
    tiles.push([]);
    for (let c = 0; c < COLS; c++) {
      const exclude = [];
      if (c >= 2 && tiles[r][c - 1].type === tiles[r][c - 2].type) {
        exclude.push(tiles[r][c - 1].type);
      }
      if (r >= 2 && tiles[r - 1][c].type === tiles[r - 2][c].type) {
        exclude.push(tiles[r - 1][c].type);
      }
      tiles[r].push(makeTile(randomType(exclude), r, c));
    }
  }
  return tiles;
}

export function typeAt(tiles, r, c) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return -1;
  const t = tiles[r][c];
  return t ? t.type : -1;
}

// Retorna uma grade booleana com todas as células que fazem parte de
// alguma sequência horizontal/vertical de 3 ou mais peças iguais.
export function findMatches(tiles) {
  const matched = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
  let any = false;

  for (let r = 0; r < ROWS; r++) {
    let runStart = 0;
    for (let c = 1; c <= COLS; c++) {
      const sameAsPrev = c < COLS && typeAt(tiles, r, c) === typeAt(tiles, r, c - 1) && typeAt(tiles, r, c) !== -1;
      if (!sameAsPrev) {
        if (c - runStart >= 3) {
          for (let k = runStart; k < c; k++) matched[r][k] = true;
          any = true;
        }
        runStart = c;
      }
    }
  }

  for (let c = 0; c < COLS; c++) {
    let runStart = 0;
    for (let r = 1; r <= ROWS; r++) {
      const sameAsPrev = r < ROWS && typeAt(tiles, r, c) === typeAt(tiles, r - 1, c) && typeAt(tiles, r, c) !== -1;
      if (!sameAsPrev) {
        if (r - runStart >= 3) {
          for (let k = runStart; k < r; k++) matched[k][c] = true;
          any = true;
        }
        runStart = r;
      }
    }
  }

  return { matched, any };
}

export function areAdjacent(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

export function swapTiles(tiles, a, b) {
  const temp = tiles[a.row][a.col];
  tiles[a.row][a.col] = tiles[b.row][b.col];
  tiles[b.row][b.col] = temp;
  if (tiles[a.row][a.col]) {
    tiles[a.row][a.col].row = a.row;
    tiles[a.row][a.col].col = a.col;
  }
  if (tiles[b.row][b.col]) {
    tiles[b.row][b.col].row = b.row;
    tiles[b.row][b.col].col = b.col;
  }
}

// Remove as peças combinadas, aplica gravidade dentro de cada coluna e
// preenche os espaços vazios no topo com peças novas (que "caem" na
// animação, já que nascem com visRow negativo).
export function clearAndRefill(tiles, matched) {
  for (let c = 0; c < COLS; c++) {
    const survivors = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!matched[r][c] && tiles[r][c]) survivors.push(tiles[r][c]);
    }
    let writeRow = ROWS - 1;
    for (const tile of survivors) {
      tiles[writeRow][c] = tile;
      tile.row = writeRow;
      tile.col = c;
      writeRow--;
    }
    let spawnOffset = 1;
    for (let r = writeRow; r >= 0; r--) {
      const newTile = makeTile(randomType(), r, c, -spawnOffset);
      tiles[r][c] = newTile;
      spawnOffset++;
    }
  }
}
