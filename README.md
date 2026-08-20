# GameAPP

Repositório de exploração de um jogo mobile (Android/iOS) com potencial de popularidade entre o público jovem: uma auditoria de mercado seguida de protótipos jogáveis (web) de cada conceito avaliado.

## Auditoria

- [`docs/auditoria-jogo-mobile-jovens.md`](docs/auditoria-jogo-mobile-jovens.md) — panorama de mercado 2025–2026, benchmark de concorrentes, riscos regulatórios (Lei Felca/COPPA), escolha de motor, monetização, e 7 conceitos de jogo propostos (A–G) com matriz de priorização.

## Protótipos jogáveis

Cada protótipo é um app web autocontido (HTML5/Canvas ou DOM, sem dependências externas), pensado para validar rapidamente a mecânica central de cada conceito antes de investir em motor nativo, backend ou monetização real. Todos rodam com um servidor estático simples:

```bash
cd prototype/<pasta-do-protótipo>
python3 -m http.server 8080
```

| Conceito | Pasta | Descrição |
|---|---|---|
| A — Party Royale casual | [`prototype/party-royale`](prototype/party-royale) | Arena de eliminação estilo Fall Guys/Stumble Guys, com bots simulando oponentes |
| B — Puzzle competitivo social | [`prototype/puzzle-duel`](prototype/puzzle-duel) | Match-3 com "corrida" de pontuação contra um rival simulado |
| C — Mini-plataforma UGC light | [`prototype/ugc-light`](prototype/ugc-light) | Jogo de plataforma 2D com editor de fases embutido |
| D — Simulação cozy de decoração | [`prototype/cozy-decor`](prototype/cozy-decor) | Decoração de quarto com pedidos temáticos de clientes e renda passiva |
| E — Colecionável idle de criaturas | [`prototype/idle-creatures`](prototype/idle-creatures) | Idle/incremental com desbloqueio 100% determinístico (sem gacha) |
| F — Ritmo musical sem gacha | [`prototype/rhythm-beats`](prototype/rhythm-beats) | Jogo de ritmo de 4 faixas com áudio sintetizado via WebAudio |
| G — Festa social de blefe/trivia | [`prototype/party-trivia`](prototype/party-trivia) | Jogo "passa e joga" estilo Fibbage para grupos de amigos |

Cada pasta de protótipo tem seu próprio `README.md` detalhando o que foi implementado, o que foi deixado de propósito fora do escopo, e os próximos passos recomendados.
