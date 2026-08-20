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

export const PALETTE = [
  "#ff5f6d", "#4cc9f0", "#ffd166", "#06d6a0",
  "#c77dff", "#ff9f1c", "#5390d9", "#f15bb5",
  "#80ed99", "#ff8fab", "#48bfe3", "#fb8500",
];
