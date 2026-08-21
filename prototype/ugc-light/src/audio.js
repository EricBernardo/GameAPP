// Efeitos sonoros sintetizados via WebAudio — sem arquivos externos.
// Adicionado na Fase 3 da auditoria de qualidade (o protótipo não
// tinha nenhum som, apontado como grave para um jogo de plataforma,
// gênero em que o feedback de pulo/queda/coleta é essencial.
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

function beep({ freq = 440, duration = 0.1, type = "sine", gain = 0.14, sweepTo = null }) {
  const c = getCtx();
  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (sweepTo) {
    osc.frequency.exponentialRampToValueAtTime(sweepTo, c.currentTime + duration);
  }
  amp.gain.setValueAtTime(gain, c.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(amp).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration + 0.02);
}

export const sfx = {
  jump: () => beep({ freq: 300, sweepTo: 500, duration: 0.1, type: "square", gain: 0.1 }),
  coin: () => beep({ freq: 700, sweepTo: 1100, duration: 0.12, type: "triangle", gain: 0.14 }),
  spring: () => beep({ freq: 200, sweepTo: 900, duration: 0.22, type: "sawtooth", gain: 0.16 }),
  hazard: () => beep({ freq: 220, sweepTo: 60, duration: 0.3, type: "sawtooth", gain: 0.18 }),
  goal: () => {
    [523, 659, 784, 1046].forEach((f, i) =>
      setTimeout(() => beep({ freq: f, duration: 0.18, type: "triangle", gain: 0.16 }), i * 90)
    );
  },
};
