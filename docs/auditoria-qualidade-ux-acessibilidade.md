# Auditoria de UX Mobile e Acessibilidade — 7 Protótipos Jogáveis

> Auditoria crítica de **usabilidade, ergonomia e acessibilidade** (não de diversão ou de negócio) dos 7 protótipos HTML5 em `prototype/`, do ponto de vista de uma pessoa jovem jogando em navegador mobile, em uma mão, em uma tela pequena. Avaliação feita por leitura completa de `README.md`, `index.html`, `style.css` e `src/*.js` de cada protótipo — sem execução em dispositivo físico.

## Sumário executivo

Os 7 protótipos compartilham uma base técnica consistente (canvas responsivo recalculado em `resize()`, `env(safe-area-inset-*)` em todos, saves em `localStorage`, PWA com `manifest.json`/`sw.js`), o que é um ponto forte estrutural. Mas, do ponto de vista de usabilidade/acessibilidade especificamente, há **um problema sistêmico crítico repetido nos 7 (zoom bloqueado)**, um **padrão recorrente de alvos de toque abaixo de 44×44px** em pelo menos 6 dos 7, e **dois casos de ação destrutiva sem confirmação**. Nenhum dos sete depende de cor pura para informação crítica de forma grave — a maioria usa forma/ícone/texto além de cor, o que é o ponto mais forte do conjunto.

**Notas gerais (0–10):**

| Ranking | Protótipo | Nota |
|---|---|---|
| 1º | Puzzle Duel (Conceito B) | **8,5** |
| 2º | Cozy Decor (Conceito D) | **8,0** |
| 3º | Party Trivia (Conceito G) | **7,5** |
| 3º | Party Royale (Conceito A) | **7,5** |
| 5º | Rhythm Beats (Conceito F) | **7,0** |
| 6º | Idle Creatures (Conceito E) | **6,5** |
| 7º | UGC Light (Conceito C) | **6,0** |

---

## 1. Party Royale (Conceito A) — Nota: 7,5/10

**Arquivos revisados:** `src/main.js`, `src/input.js`, `src/entities.js`, `src/utils.js`, `style.css`, `index.html`.

### Pontos fortes
- Joystick (`#joystick-zone`, 130×130px) e botão de DASH (`#dash-btn`, 92×92px) são grandes, bem posicionados nos cantos inferiores para uso com dois polegares, e já passaram por correção real de responsividade: `computeArenaMax()` (`src/main.js:27-30`) calcula o raio da arena a partir de `Math.min(innerWidth, innerHeight)`, evitando o corte em celulares estreitos citado no briefing.
- Onboarding tem instrução textual explícita na tela inicial ("arraste no joystick... toque em DASH") — não é 100% "auto-evidente" só de olhar, mas o joystick redondo e o botão vermelho grande com o texto "DASH" já comunicam bastante por afordância visual.
- Bots diferenciados por cor **e** por nome (`p.name` desenhado acima de cada jogador) — não depende só de cor.

### Os 3 maiores problemas
1. **Nome do jogador em 11px sobre um ponto de 30px de diâmetro** (`ctx.font = "11px sans-serif"`, `entities.js:PLAYER_RADIUS = 15`) — com até 8 jogadores se movendo rápido, ler quem é quem em tempo real é difícil em tela pequena, especialmente para o público-alvo (crianças/adolescentes, possivelmente com visão em desenvolvimento).
2. **Câmera-shake acumulável sem opção de desativar** (`shake()`, até magnitude 8 em dash e colisões, `main.js:82-85, 191, 200, 256, 267`) — mesmo sendo breve (0,08–0,2s), múltiplos hits em sequência (comum na fase final da partida) podem encadear tremores, o que é desconfortável para jogadores sensíveis a movimento na tela, sem qualquer configuração de "reduzir efeitos".
3. **`user-scalable=no` no viewport** (ver seção de problemas sistêmicos) bloqueia o zoom de acessibilidade justamente no jogo com os elementos visuais mais pequenos (nome, moedas, timer secundário).

### As 3 correções mais importantes
1. Aumentar a fonte do nome para pelo menos 13–14px com um fundo semitransparente atrás do texto (hoje é só `text-shadow`), ou mostrar nome apenas para o jogador humano e para quem está mais próximo dele.
2. Adicionar um toggle de "reduzir efeitos de câmera" nas configurações (mesmo como stub) e, enquanto isso, reduzir a magnitude default do shake em ~30-40%.
3. Permitir zoom (remover `user-scalable=no`) ou compensar com um modo "HUD grande".

---

## 2. Puzzle Duel (Conceito B) — Nota: 8,5/10

**Arquivos revisados:** `src/main.js`, `src/grid.js`, `style.css`, `index.html`.

### Pontos fortes
- **Melhor prática de acessibilidade de cor do conjunto**: cada tipo de gema tem forma própria além da cor (`drawGem()`, `main.js:244-317` — círculo, quadrado, losango, triângulo, hexágono, estrela). Isso resolve diretamente o requisito de não depender só de cor, algo que nenhum outro protótipo com múltiplos elementos coloridos fez tão bem.
- Onboarding muito claro: grade visual óbvia + instrução curta ("Toque em uma peça e depois em uma vizinha"), mecânica reconhecível (match-3 é um padrão universal).
- Marcadores da "corrida" (você/rival) são diferenciados por cor **e** por rótulo textual fixo ao lado (`#race-you-label`, `#race-rival-label`), não só cor.

### Os 3 maiores problemas
1. **Tamanho de célula do tabuleiro pode cair para ~30–38px em telas pequenas**: `boardPx = Math.max(240, Math.min(available, 480))` e `cellSize = boardPx / COLS` com `COLS = 8` (`main.js:32, 52-58`, `grid.js:1-2`). Em um celular de 320–360px de largura útil, isso fica abaixo do mínimo recomendado de 44×44px — toque impreciso, sobretudo para dedos menores do público-alvo.
2. Textos de HUD muito pequenos (`#hud-score-label` a 10px, `style.css:51`) — legibilidade baixa.
3. `user-scalable=no` no viewport (sistêmico).

### As 3 correções mais importantes
1. Reduzir a grade para 6×6 ou 7×7 em telas com largura útil menor (ex.: `< 360px`), ou aumentar o mínimo de `boardPx` além de 240 quando possível.
2. Elevar a fonte mínima de qualquer label de HUD para ≥ 12px.
3. Permitir zoom.

---

## 3. UGC Light (Conceito C) — Nota: 6,0/10

**Arquivos revisados:** `src/main.js`, `src/tiles.js`, `src/physics.js`, `style.css`, `index.html`.

### Pontos fortes
- Paleta do editor usa ícones/emoji distintos por ferramenta (🟫🔺🪙🌀🚩🏁🧹) e os tiles desenhados no jogo usam forma própria (espinhos para perigo, moeda circular, mola, bandeiras) — não depende de cor isoladamente.
- Estados bloqueados (fases, itens) sempre combinam ícone + texto (🔒, "???"), nunca só opacidade/cor.
- Fluxo de criação (lista → editor → testar → salvar) é simples e com nomes de tela óbvios.

### Os 3 maiores problemas
1. **Excluir uma fase é uma ação de um toque, sem confirmação** (`delBtn.addEventListener("click", () => { ...saveUserLevels(updated)... })`, `src/main.js:77-85`) — não há modal "tem certeza?" nem "desfazer". O botão de excluir (🗑) fica ao lado dos botões "Jogar"/"Editar" no mesmo card pequeno, aumentando o risco de toque acidental que apaga permanentemente uma criação do jogador — especialmente grave para um público jovem que investiu tempo criando a fase.
2. **Múltiplos alvos de toque abaixo de 44px**: `.icon-btn` (voltar/avatar) é 40×40px (`style.css:57-68`); os botões de ação do card de fase (`.level-card button`, padding `8px 10px`, fonte 12px) resultam em altura estimada de ~28–30px — bem abaixo do recomendado, e são justamente os botões usados para navegar entre listar/editar/jogar/apagar.
3. **Grade do editor pode chegar a células de ~14–22px em telas pequenas** (`editorCellSize = Math.max(14, Math.min(availW / COLS, availH / ROWS))` com `COLS=16, ROWS=9`, `src/main.js:163-175`) — pintar com precisão nessa grade em um celular pequeno é difícil para qualquer usuário, e mais ainda para crianças/adolescentes, sem nenhuma ajuda visual (zoom, realce da célula sob o dedo antes de confirmar).

### As 3 correções mais importantes
1. Adicionar confirmação explícita antes de excluir uma fase ("Apagar '[nome]'? Esta ação não pode ser desfeita." com botões Cancelar/Apagar bem diferenciados).
2. Aumentar todos os botões de ação (voltar, avatar, jogar/editar/apagar do card) para no mínimo 44×44px de área de toque.
3. Permitir zoom/pan no editor (ou reduzir a grade em telas pequenas) e adicionar um destaque visual claro da célula que será pintada antes de soltar o dedo.

---

## 4. Cozy Decor (Conceito D) — Nota: 8,0/10

**Arquivos revisados:** `src/main.js`, `src/items.js`, `style.css`, `index.html`.

### Pontos fortes
- Onboarding excelente: a primeira coisa visível é o balão do cliente pedindo um tema (ex.: "Quero um cantinho tropical! 🌴") e um botão "ENTREGAR" — o objetivo do jogo fica claro nos primeiros segundos só de olhar, sem precisar ler nenhuma instrução separada.
- Itens bloqueados por nível sempre mostram ícone de cadeado + texto do nível necessário (`lock-badge`, `renderShop()`), nunca dependem só de opacidade/cor.
- Grade do quarto (5×4) tem `cellSize` mínimo de 36px (`resizeCanvas()`, `src/main.js:53-58`) — próximo do recomendado e adequado para colocar móveis (não é um alvo de precisão crítica como um match-3).

### Os 3 maiores problemas
1. **Textos muito pequenos na loja** (`.shop-item .name` e `.shop-item .price` a 10px, `.level-tag`/`#level-label` também a 10-11px, `style.css:50, 218, 225`) — para o público jovem e em tela pequena, isso é abaixo do confortável para leitura rápida durante compras.
2. **Swatches de fundo (`backdrop-swatch`, 40×40px) e abas de categoria (~28-30px de altura)** abaixo do mínimo de 44px recomendado.
3. Toast de feedback fixo em `top: 70px` (`#toast`, `style.css:281-296`) pode se sobrepor visualmente ao card do cliente em telas mais baixas/estreitas — não há verificação dinâmica de colisão entre elementos de UI.

### As 3 correções mais importantes
1. Subir a fonte mínima da loja para 12–13px.
2. Aumentar a área de toque dos swatches/abas para 44px (mantendo o visual atual, mas com padding invisível extra).
3. Reposicionar o toast para a parte inferior da tela (região com menos elementos concorrentes) ou testar/ajustar sua posição em telas pequenas reais.

---

## 5. Idle Creatures (Conceito E) — Nota: 6,5/10

**Arquivos revisados:** `src/main.js`, `src/creatures.js`, `style.css`, `index.html`.

### Pontos fortes
- O botão principal de tap (`#btn-tap`) é grande (padding `18px 30px` + ícone de 34px + label) — corretamente dimensionado, já que é o elemento mais repetidamente tocado do jogo.
- Criaturas bloqueadas mostram "❔"/"???" (ícone + texto), nunca dependem só de cor/opacidade.
- Sem nenhum efeito de flash ou câmera-shake — o gênero idle é o mais "calmo" sensorialmente dos 7, o que é positivo para sensibilidade a movimento.

### Os 3 maiores problemas
1. **Botões de "Adotar"/upgrade das criaturas são pequenos** (`.creature-action button`, padding `9px 12px`, fonte 11px, `style.css:152-165`) — e são justamente o **alvo de toque mais repetido no loop central de progressão** do jogo (upar cada uma das 10 criaturas repetidamente). Um alvo pequeno em uma ação repetida centenas de vezes por sessão é um problema de ergonomia maior do que em um botão usado uma vez.
2. Botão "Assistir anúncio (boost)" também abaixo de 44px, e o único feedback de cooldown é texto (`renderBoostStatus()`) — sem barra de progresso visual, o que dificulta perceber "quanto falta" de um só olhar.
3. Grande diferença de affordance entre o botão de tap (visualmente "premível", com sombra/gradiente 3D) e os pequenos botões de lista (achatados) — pode gerar confusão sobre o que é interativo, especialmente pra quem já não tem muita familiaridade com convenções de UI de jogos.

### As 3 correções mais importantes
1. Aumentar os botões de upgrade/adoção da lista de criaturas para pelo menos 44px de altura — é a correção de maior impacto prático deste protótipo, dado o volume de toques que esse elemento recebe.
2. Adicionar uma barra de progresso visual ao cooldown do boost, além do texto.
3. Padronizar a linguagem visual dos CTAs (mesmo peso de sombra/gradiente) para deixar claro o que é tocável em toda a tela.

---

## 6. Rhythm Beats (Conceito F) — Nota: 7,0/10

**Arquivos revisados:** `src/main.js`, `src/songs.js`, `style.css`, `index.html`.

### Pontos fortes
- **Excelente independência de cor**: as notas são diferenciadas pela posição da faixa (coluna) e pela letra fixa no botão (D/F/J/K) — a cor é só reforço visual, nunca a única informação (`buildTapRow()`, `drawPlayField()`). Mesmo um jogador daltônico joga sem prejuízo.
- Botões de toque das faixas (`.tap-btn`) têm 64px de altura — bem acima do mínimo recomendado, apropriado para o ritmo de toques rápidos e repetidos do gênero.
- Sem elementos de flash/strobe; a única "pulsação" visual é o próprio feedback de acerto (texto "PERFEITO!"/"BOA!"), que é sutil e de baixo risco.

### Os 3 maiores problemas
1. **Risco real de bug de rolagem por toque**: `html, body { touch-action: none }` (`style.css:1-15`) está definido globalmente, mas `.view { overflow-y: auto }` (usada pelo menu de músicas e pela loja de temas) não redefine `touch-action` para permitir rolagem. Em navegadores mobile, um ancestral com `touch-action: none` pode impedir o gesto de arrastar para rolar dentro de um container descendente que não reabilita explicitamente essa permissão — ou seja, se a lista de músicas/temas não couber inteiramente na tela (comum em celulares pequenos com 3+ músicas e o botão da loja), o conteúdo abaixo da dobra pode ficar inacessível por toque.
2. Botões de navegação (`.icon-btn`, voltar) em 40×40px, abaixo do mínimo recomendado.
3. Onboarding depende do subtítulo textual para explicar a mecânica; nada na primeira música orienta visualmente o ritmo antes da primeira nota cair (sem uma contagem "3-2-1" ou nota de tutorial), o que pode causar um "miss" imediato e frustração nos primeiros segundos.

### As 3 correções mais importantes
1. Adicionar `touch-action: auto` (ou `pan-y`) explicitamente em `.view`/`#song-list`/`#theme-list`, ou restringir o `touch-action: none` apenas ao canvas de faixas (`#lanes-canvas`) em vez de `html, body` inteiro. Esta é a correção de maior risco silencioso do protótipo — validar especificamente em dispositivo físico com poucas músicas na tela.
2. Aumentar os botões de navegação para 44px.
3. Adicionar uma contagem visual antes da primeira nota da primeira música (ou de qualquer música, na primeira vez que é jogada).

---

## 7. Party Trivia (Conceito G) — Nota: 7,5/10

**Arquivos revisados:** `src/main.js`, `src/questions.js`, `style.css`, `index.html`.

### Pontos fortes
- Fluxo "passa e joga" com tela de transição explícita ("Passe o celular para [Nome]... Não deixe os outros verem a tela!") antes de cada etapa sensível — cuidado de UX bem pensado para o contexto social real do jogo.
- Nenhuma informação depende de cor: resposta verdadeira é marcada com ícone + texto ("✅ Resposta verdadeira"), não só cor de fundo.
- Botões de voto (`.vote-option`) têm padding generoso (`14px 16px`) resultando em altura confortável (~48px), adequados ao toque.
- Auto-foco do campo de blefe (`input.focus()`, `src/main.js:140`) acelera a digitação sem exigir um toque extra no campo.

### Os 3 maiores problemas
1. **Botão de remover jogador (✕) é pequeno (34×34px) e destrutivo sem confirmação** (`.player-input-row button`, `style.css:99-107`, `src/main.js:63-71`) — fica ao lado do campo de nome, e um toque acidental (bem possível em uma tela de configuração usada rapidamente entre amigos, em grupo, talvez rindo/andando) apaga a linha do jogador sem aviso.
2. Nenhuma validação contra nomes duplicados/vazios além de espaços em branco — dois jogadores com o mesmo nome geram um placar ambíguo.
3. Textos secundários com opacidade reduzida (`.reveal-meta` a 0,75 de opacidade, `.customer-name`-like padrões em outros jogos) sobre fundo escuro — legível, mas no limite para leitura rápida em ambientes de festa com iluminação variável, exatamente o contexto de uso pretendido deste jogo.

### As 3 correções mais importantes
1. Aumentar o botão de remover jogador para 44px e/ou exigir confirmação (ou usar um gesto menos "acidental", como manter pressionado).
2. Impedir/avisar sobre nomes duplicados antes de iniciar a partida.
3. Aumentar o contraste/opacidade mínima dos textos secundários (meta de rodada, placar).

---

## Ranking final

| # | Protótipo | Nota | Resumo em uma frase |
|---|---|---|---|
| 1 | **Puzzle Duel** | 8,5 | Único com forma+cor consistente nas peças; principal falha é o tamanho de célula em telas pequenas. |
| 2 | **Cozy Decor** | 8,0 | Onboarding pelo contexto (pedido do cliente) é o melhor do conjunto; perde pontos em tipografia pequena. |
| 3 | **Party Trivia** | 7,5 | Fluxo social bem cuidado; falha pontual no botão de remover jogador. |
| 3 | **Party Royale** | 7,5 | Controles principais bem dimensionados e responsividade já validada; nomes pequenos e câmera-shake sem opção de desativar. |
| 5 | **Rhythm Beats** | 7,0 | Melhor independência de cor do conjunto (posição+letra); risco real de bug de rolagem por CSS. |
| 6 | **Idle Creatures** | 6,5 | Botão principal bem dimensionado, mas o loop de progressão (upgrade) usa botões pequenos demais. |
| 7 | **UGC Light** | 6,0 | Ação destrutiva (excluir fase) sem confirmação é o problema mais grave encontrado em qualquer dos 7; editor com células muito pequenas. |

---

## Problemas repetidos (padrões sistêmicos — corrigir uma vez, aplicar aos 7)

1. **`user-scalable=no` no viewport de todos os 7 protótipos** (`<meta name="viewport" content="...maximum-scale=1, user-scalable=no...">` idêntico em todos os `index.html`). Isso bloqueia o pinch-to-zoom em todos os jogos, o que prejudica diretamente jogadores com baixa visão e é uma prática que a WCAG recomenda evitar (o ideal é permitir zoom e resolver "zoom acidental" com `touch-action` nos elementos de jogo, não bloqueando o zoom globalmente). **Correção única:** remover `user-scalable=no` e `maximum-scale=1` de todos os 7 `index.html`, e usar `touch-action: none` apenas nos elementos de jogo (canvas/controles) que já fazem isso corretamente hoje.
2. **Alvos de toque abaixo de 44×44px em praticamente todos os 7.** O padrão `.icon-btn` de 40×40px aparece identicamente em pelo menos 3 arquivos CSS (`ugc-light`, `rhythm-beats`, e o padrão de swatch de `cozy-decor`), e botões de ação secundária (~28-38px) aparecem em `ugc-light` (cards de fase), `idle-creatures` (upgrade de criatura), `party-trivia` (remover jogador), `cozy-decor` (abas de categoria). **Correção única:** criar uma classe utilitária `.icon-btn` compartilhada com `min-width: 44px; min-height: 44px` e aplicá-la de forma consistente nos 7 projetos (hoje cada jogo tem seu próprio CSS duplicado, o que facilitou a inconsistência).
3. **Texto abaixo de 12px usado para informação relevante** (não apenas decorativa) em pelo menos 4 protótipos: `party-royale` (nome do jogador, 11px), `puzzle-duel` (label de pontos, 10px), `cozy-decor` (nome/preço de item, nível, 10-11px), `idle-creatures` (detalhe de criatura, 11px). **Correção única:** estabelecer uma escala tipográfica mínima de 12px para qualquer texto que comunique estado/valor (preço, pontuação, nome), reservando tamanhos menores só para elementos puramente decorativos.
4. **Nenhuma ação destrutiva tem confirmação** — excluir fase (`ugc-light`) e remover jogador (`party-trivia`) apagam dados imediatamente ao toque, sem modal de confirmação nem "desfazer". **Correção única:** um componente de confirmação simples reutilizável (`confirm(mensagem)` estilizado, já que os 7 têm modais parecidos) para qualquer ação irreversível.
5. **Nenhum dos 7 oferece configurações de acessibilidade próprias** (reduzir movimento/câmera-shake, aumentar fonte, alto contraste, remapear controles) — todos dependem inteiramente das configurações do sistema operacional/navegador, que no caso do zoom estão bloqueadas pelo item 1. **Correção única:** um menu de acessibilidade mínimo compartilhado (mesmo que só 2-3 toggles) reutilizável entre os protótipos.
6. **(Nota positiva, não um problema)** — diferente do que se poderia esperar após o bug de arena cortada no protótipo A, os outros 6 protótipos **já usam o mesmo padrão correto** de recalcular dimensões de canvas em `resize()`/na abertura de cada tela e já usam `env(safe-area-inset-*)` de forma consistente. O bug do protótipo A parece ter sido corrigido e o padrão de correção (`Math.min(innerWidth, innerHeight)` como base de cálculo) foi replicado com sucesso nos demais — o risco remanescente não é "cortar a tela", e sim **alvos de toque pequenos demais em telas pequenas** (itens 2 e 3 acima), que é um problema diferente do bug original.

---

## Conclusão

Os 7 protótipos têm uma base de responsividade tecnicamente sólida e, na maioria dos casos, uma boa prática de não depender só de cor para informação importante (destaque para Puzzle Duel e Rhythm Beats). Os problemas identificados são majoritariamente de **ergonomia de toque** (alvos pequenos, ação destrutiva sem confirmação) e de uma **decisão de plataforma repetida nos 7** (bloquear zoom), não de falhas conceituais de design de interação. Nenhum dos sete tem um problema que impeça o uso, mas **UGC Light** (exclusão sem confirmação + editor de células muito pequenas) e **Idle Creatures** (botões do loop principal de progressão pequenos) são os que precisam de correção mais urgente antes de qualquer teste com usuários jovens reais, já que os problemas encontrados atingem diretamente a ação mais repetida de cada um desses dois jogos.

**Prioridade de correção recomendada (maior impacto por menor esforço):**
1. Remover `user-scalable=no` dos 7 `index.html` (1 linha, 7 arquivos, impacto imediato em acessibilidade visual).
2. Adicionar confirmação antes de excluir fase (UGC Light) e remover jogador (Party Trivia).
3. Corrigir o possível bug de rolagem por toque em Rhythm Beats (`touch-action`).
4. Padronizar `.icon-btn` e botões de ação para 44×44px mínimo nos 7 projetos.
