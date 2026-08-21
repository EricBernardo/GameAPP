# Auditoria de Qualidade — Monetização e LiveOps

> Auditoria crítica feita por um subagente especializado atuando como Diretora de Monetização e LiveOps sênior, avaliando exclusivamente viabilidade de negócio dos 7 protótipos: economia de jogo, ganchos de monetização, compliance regulatório e necessidade de conteúdo contínuo. Cruzada com os benchmarks e restrições regulatórias de `docs/auditoria-jogo-mobile-jovens.md`.

## Dado mais importante antes de entrar jogo a jogo

**4 dos 7 protótipos (Party Royale, Puzzle Duel, UGC Light, Party Trivia) não têm loja nenhuma no código.** Em Party Royale e Puzzle Duel a moeda é ganha e nunca gasta; em UGC Light e Party Trivia não existe nem moeda persistente. Isso é esperado pelo estágio de protótipo, mas é o dado mais importante para avaliar prontidão de negócio hoje.

---

## A — Party Royale

**Nota: 6.5/10**

Economia: vitória = +50 🪙; derrota = 5-28 🪙. Sem loja — a moeda não compra nada.

**3 forças:** maior comparável real de faturamento entre jovens (Free Fire, Stumble Guys — skins em arena de eliminação é modelo comprovado); loop de partida entrega o "momento clipável" que impulsiona aquisição orgânica barata; estrutura de entidades limpa, fácil de estender para skins.

**3 melhorias:** criar a loja do zero (requisito mínimo para medir intenção de compra); redesenhar o loop de recompensa para caber anúncio recompensado (tela de derrota → "assistir anúncio e dobrar moedas", ou revive único por anúncio); adicionar passe de temporada com conteúdo fixo antes de qualquer cosmético solto.

**Risco de compliance:** baixo hoje, mas é o **maior risco futuro do lote** — a tentação mais óbvia num battle royale é uma "caixa de vitória" pós-partida com skin aleatória, exatamente o padrão que a Lei Felca proíbe.

---

## B — Puzzle Duel

**Nota: 6/10**

Economia: vitória = +40 🪙; derrota = +15 🪙. Sem loja.

**3 forças:** o "duelo contra pontuação" é diferenciador real num gênero saturado; combo em cadeia já é compatível com booster pago sem reescrever lógica; tabuleiro determinístico é boa base para fases curadas futuras.

**3 melhorias:** criar loja com boosters (trocar peça, +5s, embaralhar — padrão de ouro do gênero); substituir o rival aleatório por metas curadas ou desafios reais de amigos; adicionar vidas/energia com timer (gera pressão de frequência de anúncio recompensado).

**Risco de compliance:** baixo. Atenção futura: "pacotes surpresa" de boosters variados por preço fixo ainda exigiriam divulgação de probabilidade — melhor manter boosters sempre nomeados e com preço individual.

---

## C — UGC Light

**Nota: 4.5/10**

Economia: inexistente. Não há moeda persistente nem preço em lugar nenhum.

**3 forças:** estrutura de dados (`TILE`/`PALETTE`) é a mais extensível dos 7 — custo marginal de conteúdo novo é o mais baixo; modelo de negócio real (Roblox) tem receita comprovadamente maior que todos os outros gêneros combinados; separação editor/física acomoda itens premium futuros sem reescrever a engine.

**3 melhorias:** **não investir em monetização agora — investir em moderação primeiro** (única recomendação de "não fazer" da auditoria); quando o compartilhamento existir, desenhar atribuição de autor no schema de dados desde já; cosméticos de editor são o local certo para monetizar, mas só depois de existir audiência de fases de terceiros.

**Risco de compliance:** o risco real não é gacha — é **moderação de conteúdo gerado por menores**, tão grave quanto compliance financeiro.

---

## D — Cozy Decor

**Nota: 7.5/10**

Economia: renda passiva de 900/h; entrega de pedido = 20+nível×5 🪙, sem cooldown. Catálogo inteiro (18 itens) custa ~506 🪙 — esgotável em 10-20 entregas, ou seja, **uma única sessão de 30-60 minutos**.

**3 forças:** único protótipo com loop econômico completo e funcional de ponta a ponta (renda passiva + missão + progressão + loja); gênero de maior crescimento sustentado do mercado segundo a própria auditoria (Life Sim +76% receita, +30% downloads no H1 2026); estrutura de catálogo é a mais barata de expandir de todo o lote (array plano de objetos).

**3 melhorias:** desacelerar a economia com urgência (cooldown entre pedidos, catálogo 5-10x maior, itens de "prestígio" mais caros); ampliar o teto de progressão (nível 6 é insuficiente para o gênero mais dependente de LiveOps); adicionar gancho de anúncio recompensado (hoje ausente).

**Risco de compliance:** baixo hoje. Risco futuro: pressão comercial para empacotar itens de baixa conversão em "caixas de decoração misteriosas" — recomenda-se travar como regra de produto que pacotes sempre mostrem o conteúdo antes da compra.

---

## E — Idle Creatures

**Nota: 8/10**

Economia: custo de upgrade cresce 1.18^nível, produção só 1.12^nível — custo sobe mais rápido que retorno, criando soft-cap saudável. **Único protótipo com ganchos de monetização já simulados no loop real** (boost 2x por anúncio, dobrar ganhos offline).

**3 forças:** economia numericamente mais sólida dos 7; os dois ganchos de monetização mais comprovados do gênero idle já posicionados corretamente; progressão 100% determinística, mais alinhada à Lei Felca.

**3 melhorias:** o boost está superdimensionado para um anúncio real (disponível ~40% do tempo — nenhuma rede de anúncios sustenta esse volume por usuário/hora); adicionar camada de "prestígio" (sem ela, zerar as 10 criaturas elimina a janela de monetização de retenção); criar camada de cosméticos (hoje a única "coleção" é funcional, sem elemento vaidoso/social).

**Risco de compliance:** o mais explícito sobre o risco (e por isso o mais seguro) — atenção para não transformar o "boost" futuro em algo como "multiplicador aleatório entre 1.5x e 5x", que seria gacha disfarçado.

---

## F — Rhythm Beats

**Nota: 5/10**

Economia: 30-90 🪙 por partida; loja de 4 temas somando 450 🪙 (5-8 partidas para esgotar). Depois disso, **nada mais para perseguir**.

**3 forças:** ligação direta com cultura de fandom (K-pop, VTuber) — motor de aquisição orgânica forte; arquitetura de áudio tecnicamente sólida (requisito de "qualidade percebida" antes de monetizar); estrutura de dados simples e barata de expandir.

**3 melhorias:** **a lacuna mais grave dos 7** — os líderes reais do gênero monetizam via colecionáveis de personagem em gacha, e a versão sem gacha aqui não tem nenhum substituto equivalente (só 4 cores de faixa); catálogo de músicas precisa crescer com muito mais volume que qualquer outro protótipo, mas o custo de produção por música é o mais alto dos 7 (tensão estrutural); reduzir velocidade de acúmulo de moeda ou aumentar catálogo 5-10x antes de testar preço real.

**Risco de compliance:** **maior risco de "recaída" do lote** — a pressão comercial para copiar o modelo de gacha dos concorrentes reais é a mais forte aqui, precisamente porque a alternativa determinística está claramente aquém em potencial de receita. Recomenda-se travar por escrito que personagens/skins serão sempre desbloqueáveis por progressão, nunca por gacha, mesmo sob pressão comercial.

---

## G — Party Trivia

**Nota: 5.5/10**

Economia: inexistente por design (pontuação de partida, não moeda persistente). Banco de 15 perguntas, 5 por partida.

**3 forças:** menor custo de LiveOps por unidade de conteúdo de todo o lote (uma pergunta nova é só uma linha de texto); modelo real (Jackbox, Zarta!) já provou que pacotes de pergunta com preço fixo funcionam; risco regulatório e técnico é o mais baixo dos 7.

**3 melhorias:** o banco de 15 perguntas é criticamente pequeno para qualquer teste de retenção real; adicionar gancho de anúncio entre rodadas (momento social mais engajado da partida); desenhar o campo "pack"/"premium" no schema de perguntas desde já.

**Risco de compliance:** o mais baixo do lote — literalmente não há economia para corromper.

---

## Ranking consolidado

| # | Conceito | Nota | Por quê |
|---|---|---|---|
| 1 | **E — Idle Creatures** | 8/10 | Melhor execução econômica técnica; mercado menor e mais saturado que Cozy/Party Royale. |
| 2 | **D — Cozy Decor** | 7.5/10 | Maior mercado do lote + único loop econômico completo já funcionando de ponta a ponta. |
| 3 | **A — Party Royale** | 6.5/10 | Maior potencial viral e comparável de receita real, mas hoje é uma casca vazia de monetização. |
| 4 | **B — Puzzle Duel** | 6/10 | Boa ideia social, mas sem loja; gênero mais saturado do mercado. |
| 5 | **G — Party Trivia** | 5.5/10 | Risco mínimo e conteúdo baratíssimo de escalar, mas teto de monetização estruturalmente baixo. |
| 6 | **F — Rhythm Beats** | 5/10 | Tensão estrutural sem solução fácil: modelo de receita real do gênero é banido por compliance. |
| 7 | **C — UGC Light** | 4.5/10 | Maior potencial de longo prazo, mas o mais distante de monetização hoje. |

## Recomendação honesta para a reunião de investimento

**Orçamento primeiro para o Conceito D — Cozy Decor**, não o Conceito A (recomendação padrão da auditoria de mercado original).

Razões: (1) tamanho e trajetória de mercado mais forte e mais recente que battle royale casual, gênero maduro competindo com marcas já consolidadas; (2) Cozy Decor é o único protótipo com loop de monetização *inteiro* já implementado — os defeitos encontrados são ajustes de números, não redesenho de arquitetura; (3) Party Royale exige orçamento de infraestrutura técnica (servidor/netcode) antes de qualquer economia real para testar, atrasando o ciclo de validação de negócio; (4) público mais feminino/casual sub-atendido pelos conceitos A-C, com CPI tipicamente mais baixo e jogadores mais fiéis.

**Ressalva:** isso não significa abandonar A — ele tem o maior teto de receita comprovado. Mas hoje está no estágio errado do funil: primeiro precisa de orçamento de **infraestrutura**, não de **monetização**. Se a pergunta for "onde alocar orçamento de LiveOps/monetização", a resposta é D. Se for "onde alocar orçamento de engenharia de plataforma", A continua sendo a aposta certa — não é a mesma pergunta.
