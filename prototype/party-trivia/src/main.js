import { shuffledQuestions } from "./questions.js";

const TOTAL_ROUNDS = 5;
const CORRECT_GUESS_POINTS = 1000;
const FOOL_BONUS_POINTS = 500;

let players = [];
let questionsPool = [];
let roundNumber = 0;
let currentQuestion = null;
let bluffs = [];
let bluffQueue = [];
let currentBluffPlayerIndex = null;
let answers = [];
let voteQueue = [];
let currentVoterIndex = null;
let votes = [];
let roundDeltas = [];
let afterInterstitial = null;

const screens = {};
["setup", "interstitial", "bluff", "vote", "reveal", "scoreboard", "final"].forEach((name) => {
  screens[name] = document.getElementById(`screen-${name}`);
});

function showScreen(name) {
  for (const key of Object.keys(screens)) screens[key].classList.toggle("hidden", key !== name);
}

function toast(text) {
  const el = document.getElementById("toast");
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 1500);
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ---------- Configuração ----------

function renderPlayerInputs() {
  const wrap = document.getElementById("player-inputs");
  wrap.innerHTML = "";
  const names = wrap._names || ["", ""];
  names.forEach((value, i) => {
    const row = document.createElement("div");
    row.className = "player-input-row";
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 16;
    input.placeholder = `Jogador ${i + 1}`;
    input.value = value;
    input.addEventListener("input", () => { names[i] = input.value; });
    row.appendChild(input);
    if (names.length > 2) {
      const del = document.createElement("button");
      del.textContent = "✕";
      del.addEventListener("click", () => {
        names.splice(i, 1);
        renderPlayerInputs();
      });
      row.appendChild(del);
    }
    wrap.appendChild(row);
  });
  wrap._names = names;
}

document.getElementById("btn-add-player").addEventListener("click", () => {
  const wrap = document.getElementById("player-inputs");
  if (wrap._names.length >= 6) {
    toast("Máximo de 6 jogadores neste protótipo.");
    return;
  }
  wrap._names.push("");
  renderPlayerInputs();
});

document.getElementById("btn-start-game").addEventListener("click", () => {
  const names = (document.getElementById("player-inputs")._names || [])
    .map((n) => n.trim())
    .filter((n) => n.length > 0);
  if (names.length < 2) {
    toast("Adicione pelo menos 2 jogadores com nome.");
    return;
  }
  players = names.map((name) => ({ name, score: 0 }));
  questionsPool = shuffledQuestions().slice(0, TOTAL_ROUNDS);
  roundNumber = 0;
  startRound();
});

// ---------- Interstitial (passar o celular) ----------

function goToInterstitial(title, name, hint, next) {
  document.getElementById("interstitial-title").textContent = title;
  document.getElementById("interstitial-name").textContent = name;
  document.getElementById("interstitial-hint").textContent = hint;
  afterInterstitial = next;
  showScreen("interstitial");
}

document.getElementById("btn-interstitial-continue").addEventListener("click", () => {
  if (afterInterstitial) afterInterstitial();
});

// ---------- Fase de blefes ----------

function startRound() {
  currentQuestion = questionsPool[roundNumber];
  bluffs = [];
  bluffQueue = players.map((_, i) => i);
  goToNextBluffWriter();
}

function goToNextBluffWriter() {
  if (bluffQueue.length === 0) {
    buildAnswersAndStartVoting();
    return;
  }
  currentBluffPlayerIndex = bluffQueue.shift();
  const player = players[currentBluffPlayerIndex];
  goToInterstitial("Passe o celular para", player.name, "Não deixe os outros verem sua resposta!", showBluffScreen);
}

function showBluffScreen() {
  document.getElementById("bluff-category").textContent = currentQuestion.category;
  document.getElementById("bluff-question").textContent = currentQuestion.q;
  const input = document.getElementById("bluff-input");
  input.value = "";
  showScreen("bluff");
  setTimeout(() => input.focus(), 50);
}

document.getElementById("btn-bluff-submit").addEventListener("click", () => {
  const input = document.getElementById("bluff-input");
  const text = input.value.trim();
  if (!text) {
    toast("Escreva alguma resposta antes de enviar.");
    return;
  }
  bluffs.push({ authorIndex: currentBluffPlayerIndex, text });
  goToNextBluffWriter();
});

// ---------- Fase de votação ----------

function buildAnswersAndStartVoting() {
  const rawAnswers = [
    { text: currentQuestion.answer, isTrue: true, authorIndex: null },
    ...bluffs.map((b) => ({ text: b.text, isTrue: false, authorIndex: b.authorIndex })),
  ];
  answers = shuffleArray(rawAnswers);
  voteQueue = players.map((_, i) => i);
  votes = [];
  goToNextVoter();
}

function goToNextVoter() {
  if (voteQueue.length === 0) {
    revealRound();
    return;
  }
  currentVoterIndex = voteQueue.shift();
  const player = players[currentVoterIndex];
  goToInterstitial("Passe o celular para", player.name, "Vote em qual resposta é a verdadeira!", showVoteScreen);
}

function showVoteScreen() {
  document.getElementById("vote-category").textContent = currentQuestion.category;
  document.getElementById("vote-question").textContent = currentQuestion.q;
  const wrap = document.getElementById("vote-options");
  wrap.innerHTML = "";
  answers.forEach((answer, idx) => {
    if (answer.authorIndex === currentVoterIndex) return;
    const btn = document.createElement("button");
    btn.className = "vote-option";
    btn.textContent = answer.text;
    btn.addEventListener("click", () => {
      votes.push({ voterIndex: currentVoterIndex, answerIndex: idx });
      goToNextVoter();
    });
    wrap.appendChild(btn);
  });
  showScreen("vote");
}

// ---------- Revelação e pontuação ----------

function revealRound() {
  roundDeltas = players.map(() => 0);

  for (const vote of votes) {
    const answer = answers[vote.answerIndex];
    if (answer.isTrue) {
      players[vote.voterIndex].score += CORRECT_GUESS_POINTS;
      roundDeltas[vote.voterIndex] += CORRECT_GUESS_POINTS;
    } else if (answer.authorIndex !== null) {
      players[answer.authorIndex].score += FOOL_BONUS_POINTS;
      roundDeltas[answer.authorIndex] += FOOL_BONUS_POINTS;
    }
  }

  const list = document.getElementById("reveal-list");
  list.innerHTML = "";
  for (const answer of answers) {
    const voters = votes.filter((v) => v.answerIndex === answers.indexOf(answer)).map((v) => players[v.voterIndex].name);
    const row = document.createElement("div");
    row.className = "reveal-row" + (answer.isTrue ? " is-true" : "");
    const authorLabel = answer.isTrue
      ? "✅ Resposta verdadeira"
      : `Blefe de ${players[answer.authorIndex].name}`;
    row.innerHTML = `
      <div class="reveal-text">${escapeHtml(answer.text)}</div>
      <div class="reveal-meta">${authorLabel}${voters.length ? ` · votaram: ${voters.map(escapeHtml).join(", ")}` : " · ninguém votou"}</div>
    `;
    list.appendChild(row);
  }
  showScreen("reveal");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById("btn-reveal-continue").addEventListener("click", () => {
  showScoreboard();
});

// ---------- Placar ----------

function showScoreboard() {
  const ranked = players
    .map((p, i) => ({ ...p, index: i, delta: roundDeltas[i] }))
    .sort((a, b) => b.score - a.score);

  document.getElementById("scoreboard-title").textContent = `Placar — Pergunta ${roundNumber + 1} de ${TOTAL_ROUNDS}`;
  const list = document.getElementById("scoreboard-list");
  list.innerHTML = "";
  ranked.forEach((p, rank) => {
    const row = document.createElement("div");
    row.className = "score-row" + (rank === 0 ? " leader" : "");
    row.innerHTML = `
      <span>${rank + 1}. ${escapeHtml(p.name)}</span>
      <span>${p.score} pts ${p.delta > 0 ? `<span class="delta">+${p.delta}</span>` : ""}</span>
    `;
    list.appendChild(row);
  });

  const nextBtn = document.getElementById("btn-next-round");
  nextBtn.textContent = roundNumber + 1 >= TOTAL_ROUNDS ? "VER RESULTADO FINAL" : "PRÓXIMA PERGUNTA";
  showScreen("scoreboard");
}

document.getElementById("btn-next-round").addEventListener("click", () => {
  roundNumber++;
  if (roundNumber >= TOTAL_ROUNDS) {
    showFinal();
  } else {
    startRound();
  }
});

// ---------- Tela final ----------

function showFinal() {
  const ranked = [...players].sort((a, b) => b.score - a.score);
  document.getElementById("final-winner").textContent = `${ranked[0].name} venceu com ${ranked[0].score} pontos!`;
  const list = document.getElementById("final-list");
  list.innerHTML = "";
  ranked.forEach((p, rank) => {
    const row = document.createElement("div");
    row.className = "score-row" + (rank === 0 ? " leader" : "");
    row.innerHTML = `<span>${rank + 1}. ${escapeHtml(p.name)}</span><span>${p.score} pts</span>`;
    list.appendChild(row);
  });
  showScreen("final");
}

document.getElementById("btn-play-again").addEventListener("click", () => {
  const wrap = document.getElementById("player-inputs");
  wrap._names = players.map((p) => p.name);
  renderPlayerInputs();
  showScreen("setup");
});

renderPlayerInputs();
showScreen("setup");
