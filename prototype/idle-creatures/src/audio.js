// Efeitos sonoros sintetizados via WebAudio — sem arquivos externos.
// Adicionado na Fase 3 da auditoria de qualidade: cada criatura ganha
// uma nota própria, dando identidade sonora individual ao "toque",
// que antes não tinha nenhum som.
let ctx = null;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return ctx;
}

export function unlockAudio() {
  const c = getCtx();
  if (c.state === "suspended") c.resume();
}

function beep({ freq = 440, duration = 0.12, type = "sine", gain = 0.14 }) {
  const c = getCtx();
  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  amp.gain.setValueAtTime(gain, c.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(amp).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration + 0.02);
}

// Escala pentatônica maior — qualquer combinação de notas soa agradável,
// então cada uma das 10 criaturas pode ter sua própria nota sem risco
// de dissonância ao tocar várias em sequência.
const PENTATONIC = [523, 587, 659, 784, 880, 1046, 1174, 1318, 1568, 1760];

export const sfx = {
  tapGem: () => beep({ freq: 900, duration: 0.08, type: "triangle", gain: 0.1 }),
  creature: (index) => beep({ freq: PENTATONIC[index % PENTATONIC.length], duration: 0.16, type: "triangle", gain: 0.15 }),
  unlock: () => {
    [523, 659, 784].forEach((f, i) => setTimeout(() => beep({ freq: f, duration: 0.14, type: "triangle", gain: 0.15 }), i * 80));
  },
  boost: () => beep({ freq: 300, duration: 0.3, type: "sawtooth", gain: 0.14 }),
};
