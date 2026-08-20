export const LANE_COUNT = 4;
export const LANE_FREQS = [261.63, 329.63, 392.0, 523.25];
export const LANE_KEYS = ["D", "F", "J", "K"];

// Padrões de fase (sequência de faixa por batida) escritos à mão e fixos —
// o "chart" nunca muda entre execuções, como em jogos de ritmo reais,
// sem qualquer elemento aleatório/gacha.
function repeat(pattern, times) {
  const out = [];
  for (let i = 0; i < times; i++) out.push(...pattern);
  return out;
}

export const SONGS = [
  {
    id: "facil",
    name: "Ritmo Fácil",
    bpm: 96,
    lanes: repeat([0, 1, 2, 3, 3, 2, 1, 0], 4),
  },
  {
    id: "media",
    name: "Batida Média",
    bpm: 120,
    lanes: repeat([0, 2, 1, 3, 0, 3, 1, 2, 2, 0, 3, 1], 3),
  },
  {
    id: "turbo",
    name: "Turbo Beat",
    bpm: 140,
    lanes: repeat([0, 1, 0, 2, 1, 3, 2, 0, 3, 1, 2, 3, 0, 2, 1, 3], 3),
  },
];

export const THEMES = [
  { id: "classico", name: "Clássico", price: 0, colors: ["#ff5f6d", "#4cc9f0", "#ffd166", "#06d6a0"] },
  { id: "sunset", name: "Pôr do Sol", price: 80, colors: ["#ff7b54", "#ffb26b", "#ffd56b", "#f27059"] },
  { id: "neon", name: "Neon", price: 150, colors: ["#f72585", "#7209b7", "#4361ee", "#4cc9f0"] },
  { id: "pastel", name: "Pastel", price: 220, colors: ["#ffc6ff", "#bdb2ff", "#a0c4ff", "#caffbf"] },
];

export const NOTE_TRAVEL_TIME = 1.7;
export const LEAD_IN_SECONDS = 2.2;
export const PERFECT_WINDOW = 0.07;
export const GOOD_WINDOW = 0.14;
export const MISS_WINDOW = 0.2;

export function buildChart(song) {
  const beatDuration = 60 / song.bpm;
  return song.lanes.map((lane, i) => ({
    lane,
    hitTime: LEAD_IN_SECONDS + i * beatDuration,
    judged: false,
    result: null,
  }));
}
