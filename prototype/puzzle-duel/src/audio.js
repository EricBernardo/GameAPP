// Efeitos sonoros sintetizados via WebAudio — sem arquivos externos.
// Adicionado na Fase 3 da auditoria de qualidade (o protótipo não
// tinha nenhum som, apontado como a lacuna mais grave e mais barata
// de corrigir pela auditoria de game design).
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

function beep({ freq = 440, duration = 0.1, type = "sine", gain = 0.14, sweepTo = null, delay = 0 }) {
  const c = getCtx();
  const when = c.currentTime + delay;
  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  if (sweepTo) {
    osc.frequency.exponentialRampToValueAtTime(sweepTo, when + duration);
  }
  amp.gain.setValueAtTime(gain, when);
  amp.gain.exponentialRampToValueAtTime(0.001, when + duration);
  osc.connect(amp).connect(c.destination);
  osc.start(when);
  osc.stop(when + duration + 0.02);
}

export const sfx = {
  swap: () => beep({ freq: 320, sweepTo: 420, duration: 0.07, type: "sine", gain: 0.1 }),
  noMatch: () => beep({ freq: 220, sweepTo: 160, duration: 0.09, type: "sine", gain: 0.08 }),
  match: (comboLevel = 1) => {
    const base = 440 + Math.min(comboLevel, 6) * 60;
    beep({ freq: base, duration: 0.14, type: "triangle", gain: 0.16 });
  },
  combo: (comboLevel) => {
    [0, 1, 2].forEach((i) =>
      beep({ freq: 523 + comboLevel * 40 + i * 80, duration: 0.1, type: "triangle", gain: 0.13, delay: i * 0.05 })
    );
  },
  booster: () => beep({ freq: 200, sweepTo: 700, duration: 0.25, type: "sawtooth", gain: 0.14 }),
  win: () => {
    [523, 659, 784, 1046].forEach((f, i) =>
      setTimeout(() => beep({ freq: f, duration: 0.18, type: "triangle", gain: 0.16 }), i * 90)
    );
  },
  lose: () => beep({ freq: 300, sweepTo: 80, duration: 0.5, type: "sawtooth", gain: 0.15 }),
};
