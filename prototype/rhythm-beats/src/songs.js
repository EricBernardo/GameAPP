export const LANE_COUNT = 4;
export const LANE_FREQS = [261.63, 329.63, 392.0, 523.25];
export const LANE_KEYS = ["D", "F", "J", "K"];

// Padrões de fase escritos à mão e fixos — o "chart" nunca muda entre
// execuções, como em jogos de ritmo reais, sem qualquer elemento
// aleatório/gacha. Cada música agora é composta por seções distintas
// (introdução mais lenta, clímax mais denso com notas de meia batida,
// final de desaceleração) em vez de um único padrão repetido, para que
// a música pareça ter estrutura, não um loop de treino.
function section(startBeat, pattern, step = 1) {
  return pattern.map((lane, i) => ({ lane, beat: startBeat + i * step }));
}

export const SONGS = [
  {
    id: "facil",
    name: "Ritmo Fácil",
    bpm: 96,
    notes: [
      ...section(0, [0, 1, 2, 3, 3, 2, 1, 0], 1),
      ...section(8, [0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3], 0.5),
      ...section(16, [3, 2, 1, 0, 0, 1, 2, 3], 1),
    ],
  },
  {
    id: "media",
    name: "Batida Média",
    bpm: 120,
    notes: [
      ...section(0, [0, 2, 1, 3, 0, 3, 1, 2], 1),
      ...section(8, [0, 1, 2, 3, 1, 2, 3, 0, 2, 3, 0, 1, 3, 0, 1, 2], 0.5),
      ...section(16, [2, 0, 3, 1, 2, 0, 3, 1], 1),
    ],
  },
  {
    id: "turbo",
    name: "Turbo Beat",
    bpm: 140,
    notes: [
      ...section(0, [0, 1, 2, 3, 0, 1, 2, 3], 1),
      ...section(8, [0, 2, 1, 3, 2, 0, 3, 1, 0, 2, 1, 3, 2, 0, 3, 1], 0.5),
      ...section(16, [1, 3, 0, 2], 1),
      ...section(20, [3, 1, 2, 0, 1, 3, 0, 2, 3, 1, 2, 0, 1, 3, 0, 2], 0.5),
      ...section(28, [0, 1, 2, 3, 3, 2, 1, 0], 1),
    ],
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
  return song.notes
    .map((n) => ({
      lane: n.lane,
      hitTime: LEAD_IN_SECONDS + n.beat * beatDuration,
      judged: false,
      result: null,
    }))
    .sort((a, b) => a.hitTime - b.hitTime);
}

// Configuração da barra de risco (Fase 3 da auditoria): cada "faltou"
// reduz energia; acertos recuperam um pouco. Zerar a energia termina a
// música antes da hora — o risco real que faltava no protótipo original.
export const ENERGY_MAX = 100;
export const ENERGY_LOSS_PER_MISS = 22;
export const ENERGY_GAIN_PER_HIT = 3;
