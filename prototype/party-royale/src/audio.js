// Efeitos sonoros sintetizados via WebAudio — sem arquivos externos,
// o suficiente para validar se o "feedback" das colisões ajuda a diversão.
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

function beep({ freq = 440, duration = 0.12, type = "sine", gain = 0.15, sweepTo = null }) {
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
  dash: () => beep({ freq: 220, sweepTo: 440, duration: 0.12, type: "square", gain: 0.12 }),
  hit: () => beep({ freq: 180, sweepTo: 60, duration: 0.15, type: "sawtooth", gain: 0.18 }),
  fall: () => beep({ freq: 500, sweepTo: 60, duration: 0.35, type: "sine", gain: 0.2 }),
  win: () => {
    [523, 659, 784, 1046].forEach((f, i) =>
      setTimeout(() => beep({ freq: f, duration: 0.18, type: "triangle", gain: 0.16 }), i * 90)
    );
  },
  lose: () => beep({ freq: 300, sweepTo: 80, duration: 0.5, type: "sawtooth", gain: 0.15 }),
};
