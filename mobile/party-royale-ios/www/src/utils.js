export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function distance(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

export function randRange(min, max) {
  return min + Math.random() * (max - min);
}

export function choice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Fisher-Yates — embaralhamento sem viés (diferente de
// `sort(() => Math.random() - 0.5)`, que distribui posições de forma
// desigual e não é uma permutação uniforme de verdade).
export function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const PALETTE = [
  "#ff5f6d", "#4cc9f0", "#ffd166", "#06d6a0",
  "#c77dff", "#ff9f1c", "#5390d9", "#f15bb5",
  "#80ed99", "#ff8fab", "#48bfe3", "#fb8500",
];
