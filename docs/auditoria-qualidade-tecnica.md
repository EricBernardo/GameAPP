# Auditoria de Qualidade — Arquitetura Técnica e Prontidão para Produção

> Auditoria crítica feita por um subagente especializado atuando como Arquiteto Técnico/Engenheiro de Jogos sênior, avaliando exclusivamente qualidade de código, arquitetura e prontidão técnica dos 7 protótipos — não diversão nem negócio. Metodologia: leitura integral de todos os arquivos `.js`/`.html`/`.css` de cada protótipo, do empacotamento nativo Android/iOS e dos workflows de CI.

## Achados transversais (valem para os 7 protótipos)

- **Zero testes automatizados e zero lint/CI para o código de jogo.** Só existe CI para os builds nativos Android/iOS de Party Royale; os outros 6 protótipos e a lógica de jogo em si não têm nenhuma verificação automatizada.
- **CSS duplicado, não compartilhado.** Cada protótipo reimplementa do zero padrões idênticos (toast, safe-area-inset, telas show/hide) — não existe um design system comum, apesar de ~1.900 linhas de CSS combinadas com sobreposição alta.
- **Padrão de estado consistente e, no geral, bom**: quase todos usam `localStorage` + JSON, uma função `toast()`, e um loop `requestAnimationFrame` com `dt` clampado — boa prática comum que evita "explosão" de física em frames longos.
- **Nenhum protótipo tem tratamento de erro no nível de app** (try/catch global, fallback se `canvas.getContext` retornar null, mensagem amigável se WebAudio falhar).
- **Nenhum é multiplayer real** — todos os "oponentes" são bots/simulações locais. Declarado explicitamente nos READMEs como decisão de escopo, mas é o maior gap técnico para produção em todos os 7.

---

## 1. Party Royale — Nota: 7.5/10

Código mais maduro do lote: boa separação `entities.js`/`input.js`/`audio.js`/`utils.js`/`main.js`.

**Top 3 problemas:**
1. **Bug real de resize a meio da partida**: `arena.x/y` são recalculados no novo centro, mas as posições absolutas dos jogadores não são realocadas proporcionalmente — girar a tela durante uma partida pode eliminar o jogador humano instantaneamente por estar "fora" da arena reposicionada.
2. `localStorage` sem `try/catch`: valor corrompido gera `NaN` permanente na HUD, ou exceção síncrona que trava o carregamento inteiro em ambientes com storage bloqueado (modo privado/Capacitor restritivo).
3. Duplicação de lógica de input entre touch e mouse (não usa Pointer Events unificado, diferente dos outros protótipos).

**Top 3 correções:** coordenadas relativas ao raio da arena + `try/catch`/`Number.isFinite` em toda leitura de `localStorage`; unificar input em Pointer Events; trocar shuffle viesado (`sort(() => Math.random()-0.5)`) por Fisher-Yates.

**O que falta para produto real:** servidor autoritativo/netcode para multiplayer real, anti-cheat server-side (física 100% no cliente hoje), contas + save em nuvem. **Esforço: alto.**

**Reusabilidade para engine nativa:** baixa-média — constantes de física/timings servem como especificação de design, não como código; classes precisam ser reescritas.

---

## 2. Puzzle Duel — Nota: 7/10

Melhor separação "lógica pura vs. apresentação" do lote (`grid.js` sem nenhuma dependência de DOM/Canvas).

**Top 3 problemas:**
1. **Sem detecção de tabuleiro "sem jogadas possíveis"** — requisito básico em qualquer match-3 de produção; é matematicamente possível o jogador ficar travado pelo resto da partida.
2. Mesmo padrão de `localStorage` sem proteção que Party Royale.
3. Máquina de estados por strings mágicas sem enum, sem contador de segurança contra loop infinito de resolução de cascata.

**Top 3 correções:** função `hasAnyValidMove()` + reembaralhar se necessário; `try/catch`/validação em moedas; substituir strings por constantes + limite de iterações de segurança.

**O que falta para produto real:** o "rival" é uma curva fake, não jogador real — para PvP de verdade precisaria sincronizar estado via servidor (hoje pontuação é 100% cliente, fácil de falsificar via DevTools). **Esforço: médio.**

**Reusabilidade para engine nativa:** alta para a lógica (`grid.js` é praticamente pseudocódigo puro), baixa para o rendering.

---

## 3. UGC Light — Nota: 6/10

Fisicamente o mais completo dos 7, mas `main.js` tem 565 linhas misturando 4 responsabilidades (views, editor, HUD, game loop) sem separação.

**Top 3 problemas:**
1. Arquivo único de 565 linhas com responsabilidades misturadas — qualquer alteração no editor arrisca efeito colateral na tela de jogo.
2. Fases salvas sem validação de esquema/dimensão — mudanças futuras em `COLS`/`ROWS` quebrariam níveis salvos silenciosamente.
3. Bug de nomenclatura entre `input.jumpPressed` (declarado) e `input.jumpHeld` (usado de fato) — funciona por acidente, sinal de integração colada sem revisão.

**Top 3 correções:** dividir em `views.js`/`editor.js`/`play.js`; `isValidLevel()` com fallback para descartar níveis inválidos; unificar o objeto de input.

**O que falta para produto real:** a peça mais cara de todas as 7 — backend de publicação/moderação de UGC compartilhado. Hoje "criar fase" só grava localmente; sem isso, o "UGC" do nome não existe como produto. **Esforço: muito alto** (categoria de infraestrutura inteira, tipo Roblox/Mario Maker).

**Reusabilidade para engine nativa:** alta para física, média para o editor.

---

## 4. Cozy Decor — Nota: 7/10

Segundo melhor em robustez de persistência; único a desenhar só sob demanda (sem RAF contínuo) — escolha certeira de eficiência de bateria.

**Top 3 problemas:**
1. Merge raso de estado não valida tipo/forma dos campos aninhados — `roomGrid` corrompido quebra o app na primeira entrega de pedido com `TypeError`.
2. `setInterval` de renda passiva nunca é limpo e roda mesmo em segundo plano, sem `visibilitychange`.
3. Fórmula de progresso de XP pode gerar `NaN`/`Infinity` silenciosamente se dois níveis tiverem o mesmo valor (não quebra hoje, mas é fragilidade real).

**Top 3 correções:** validar tipo/forma pós-`JSON.parse`; pausar renda passiva com `visibilitychange` + creditar ao voltar (mesmo padrão do Conceito E); guarda de divisão por zero na fórmula de XP.

**O que falta para produto real:** backend de contas/save em nuvem, sistema de eventos/temporadas rotativos (hoje estático). **Esforço: médio.**

**Reusabilidade para engine nativa:** média — lógica de negócio portável, mas a "arte" atual (emojis como sprite via `ctx.fillText`) não sobrevive de forma alguma.

---

## 5. Idle Creatures — Nota: 8/10 (mais robusto tecnicamente dos 7)

Único com sistema de "ganhos offline" implementado corretamente e com otimização deliberada: lógica roda a 60fps, mas DOM só é tocado 4×/segundo.

**Top 3 problemas:**
1. Cap de 8h de ganhos offline não é comunicado na UI — jogador pode achar que perdeu progresso por bug onde não há.
2. Nenhuma validação explícita (`Array.isArray`/`.length`) após deserializar `state.levels` — sobrevive por acidente de comportamento do JS, não por garantia deliberada.
3. `beforeunload` não é confiável em mobile (Capacitor/WebView/iOS Safari) quando o app é fechado via gesto do sistema.

**Top 3 correções:** adicionar `visibilitychange`/`pagehide` como camadas extras de persistência; validar explicitamente forma de `state.levels`; comunicar o cap de 8h na UI quando aplicável.

**O que falta para produto real:** anti-cheat/validação server-side de progresso (100% editável via `localStorage` hoje), sincronização de save entre dispositivos. **Esforço: baixo-médio** — o mais próximo de "só precisar de sync de conta".

**Reusabilidade para engine nativa:** média-alta para a lógica, mas UI 100% HTML/CSS não sobrevive.

---

## 6. Rhythm Beats — Nota: 6.5/10

Uso correto e sofisticado da WebAudio API (agendamento por `AudioContext.currentTime`, evitando o *drift* clássico de `setTimeout`).

**Top 3 problemas:**
1. Agenda todas as notas da música de uma vez no início (até 144 nós de áudio simultâneos na música mais longa) — pico de alocação evitável; padrão recomendado é *look-ahead scheduling*.
2. Loop de RAF nunca para mesmo fora da tela de jogo, consumindo ciclos de CPU/GPU sem necessidade.
3. `AudioContext` não lida com suspensão automática em segundo plano — pode desincronizar sons se o usuário alternar de app durante uma música.

**Top 3 correções:** implementar look-ahead scheduling (agendar só ~2s por vez); pausar RAF fora da tela de jogo; escutar `visibilitychange` para pausar a partida em segundo plano.

**O que falta para produto real:** pipeline real de "charts" (hoje hardcoded em arrays) e faixas de áudio reais (hoje só blips sintetizados) — introduzir música real exige lidar com licenciamento e adaptar o motor de sincronização. **Esforço: alto** (o gargalo é o pipeline de conteúdo musical, não o código).

**Reusabilidade para engine nativa:** baixa para a mecânica de áudio (APIs completamente diferentes), média para a lógica de julgamento.

---

## 7. Party Trivia — Nota: 6.5/10

Único sem canvas e sem RAF — 100% orientado a eventos DOM, o melhor perfil de bateria dos 7 neste aspecto específico.

**Top 3 problemas:**
1. Busca `indexOf` redundante dentro de loop (O(n²) evitável).
2. Nenhuma validação contra nomes duplicados ou blefes idênticos à resposta verdadeira — a votação fica com opções visualmente idênticas sem tratamento.
3. Estado de negócio (lista de nomes) anexado como propriedade customizada em elemento DOM (`wrap._names`) em vez de variável de módulo — frágil a refactors futuros.

**Top 3 correções:** trocar `for...of` + `indexOf` por `forEach(_, idx)`; deduplicação de texto de blefe no envio; substituir `wrap._names` por variável de módulo dedicada.

**O que falta para produto real:** banco de apenas 15 perguntas fixas — repetição quase garantida em duas partidas; nenhuma forma de multiplayer remoto real (hoje só presencial). **Esforço: médio-alto** (o gap é conteúdo + decisão de arquitetura de rede).

**Reusabilidade para engine nativa:** média — máquina de estados de rodada é lógica pura e portável; apresentação é 100% HTML dinâmico.

---

## Ranking final por qualidade técnica

| # | Protótipo | Nota | Por quê |
|---|---|---|---|
| 1 | **Idle Creatures** | 8.0 | Único com ganhos offline corretos, throttle de renderização deliberado, `try/catch` consistente. |
| 2 | **Party Royale** | 7.5 | Melhor separação de arquivos e física mais sofisticada, mas tem o bug de resize mais sério do lote. |
| 3 | **Puzzle Duel** | 7.0 | `grid.js` é o código mais portável de todos, mas falta detecção de deadlock. |
| 3 | **Cozy Decor** | 7.0 | Bom uso de redraw sob demanda, mas validação de esquema pós-parse insuficiente. |
| 5 | **Rhythm Beats** | 6.5 | Sincronização de áudio correta, mas agendamento de notas e loop de RAF ineficientes para escalar. |
| 5 | **Party Trivia** | 6.5 | Melhor perfil de bateria, mas padrão de estado mais frágil e conteúdo raso. |
| 7 | **UGC Light** | 6.0 | Mecânica mais completa tecnicamente, mas organização de código pior e o gap mais caro para produto real. |

## Tabela resumo — esforço para virar produto real

| Protótipo | Esforço estimado | Peças tecnológicas que faltam (as mais caras) |
|---|---|---|
| Party Royale | **Alto** | Servidor autoritativo/netcode, anti-cheat server-side, contas + save em nuvem |
| Puzzle Duel | **Médio** | Sincronização PvP real, detecção/correção de deadlock, contas + save em nuvem |
| UGC Light | **Muito alto** | Backend de publicação/hospedagem/moderação de UGC (peça central do conceito, não existe) |
| Cozy Decor | **Médio** | Backend de contas/save em nuvem, sistema de eventos/conteúdo rotativo |
| Idle Creatures | **Baixo-médio** | Sincronização de save entre dispositivos, anti-cheat de progresso |
| Rhythm Beats | **Alto** | Pipeline de conteúdo musical real (faixas licenciadas + editor de charts), scheduler look-ahead |
| Party Trivia | **Médio-alto** | Banco de perguntas em escala, decisão de arquitetura para multiplayer remoto |

**Nota final sobre reusabilidade para Godot/Unity:** em todos os 7 casos, o que sobrevive de forma consistente é a lógica de regras/estado pura (arquivos como `grid.js`, `physics.js`, `creatures.js`, `entities.js`), que funciona como especificação executável. O que **não** sobrevive em nenhum caso é a camada de apresentação (Canvas 2D, emojis como sprite, UI em HTML/CSS) — tem que ser reescrita do zero em qualquer motor nativo.
