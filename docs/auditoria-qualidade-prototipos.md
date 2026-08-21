# Auditoria de Qualidade dos 7 Protótipos — Síntese

> Complemento à [auditoria de mercado](auditoria-jogo-mobile-jovens.md): uma auditoria de **qualidade da execução** dos 7 protótipos já construídos (`prototype/`), feita por 4 subagentes especializados atuando de forma independente, cada um revisando os 7 jogos por uma lente diferente: **game design/fun factor**, **monetização/LiveOps**, **UX mobile/acessibilidade**, e **arquitetura técnica**. Cada auditoria completa está em seu próprio documento; este arquivo consolida os resultados e prioriza o que fazer a seguir.

- [Auditoria de Game Design e Fun Factor](auditoria-qualidade-game-design.md)
- [Auditoria de Monetização e LiveOps](auditoria-qualidade-monetizacao.md)
- [Auditoria de UX Mobile e Acessibilidade](auditoria-qualidade-ux-acessibilidade.md)
- [Auditoria de Arquitetura Técnica](auditoria-qualidade-tecnica.md)

---

## Tabela consolidada (0–10 em cada dimensão)

| Protótipo | Design/Diversão | Monetização | UX/Acessibilidade | Técnica | **Média** |
|---|---|---|---|---|---|
| A — Party Royale | 6.5 | 6.5 | 7.5 | 7.5 | **7.0** |
| B — Puzzle Duel | 5.0 | 6.0 | 8.5 | 7.0 | **6.6** |
| C — UGC Light | 4.0 | 4.5 | 6.0 | 6.0 | **5.1** |
| D — Cozy Decor | 5.0 | 7.5 | 8.0 | 7.0 | **6.9** |
| E — Idle Creatures | 5.5 | 8.0 | 6.5 | 8.0 | **7.0** |
| F — Rhythm Beats | 6.0 | 5.0 | 7.0 | 6.5 | **6.1** |
| G — Party Trivia | 6.5 | 5.5 | 7.5 | 6.5 | **6.5** |

**Leitura importante da tabela:** nenhuma dimensão sozinha conta a história completa. Os dois protótipos com a maior média (A e E) chegam lá por caminhos opostos — A vence em juice/viral e perde em monetização vazia; E vence em economia/técnica e perde em "alma" de design. C (UGC Light) é o único que fica atrás em todas as 4 dimensões simultaneamente — é o sinal mais claro do conjunto: não é que o conceito de mercado seja ruim (a própria auditoria de mercado aponta Roblox como maior receita do público jovem), é que **esta execução específica** ainda não consegue nem começar a testar essa hipótese.

---

## Problemas sistêmicos (aparecem em vários jogos — corrigir uma vez, aplicar a todos)

1. **`localStorage` sem proteção contra corrupção** em Party Royale e Puzzle Duel (auditoria técnica) — valor corrompido gera `NaN` permanente ou trava o carregamento. Os outros 5 já fazem isso corretamente; é só replicar o padrão.
2. **Moeda sem destino** (nenhuma loja) em Party Royale e Puzzle Duel — apontado de forma independente tanto pela auditoria de design quanto pela de monetização. É o problema mais citado de todo o exercício.
3. **`user-scalable=no` bloqueando zoom** nos 7 protótipos (auditoria de UX) — decisão de plataforma repetida, não um erro pontual; prejudica diretamente jogadores com baixa visão.
4. **Alvos de toque abaixo de 44×44px** em pelo menos 6 dos 7 (auditoria de UX) — botões de ação secundária (excluir, voltar, upgrade) consistentemente pequenos demais.
5. **Ações destrutivas sem confirmação**: excluir fase (UGC Light) e remover jogador (Party Trivia) apagam dados no primeiro toque, sem "tem certeza?".
6. **Falta de "juice" (som/partículas)** em Puzzle Duel, UGC Light e Idle Creatures — apontado pela auditoria de design como lacuna barata de corrigir e de alto impacto em diversão percebida.
7. **Zero testes automatizados e zero lint** em todos os 7 (auditoria técnica) — só existe CI para os builds nativos Android/iOS de Party Royale, não para a lógica de jogo em si.
8. **CSS duplicado sem design system compartilhado** — cada protótipo reimplementa os mesmos padrões (toast, safe-area, telas show/hide) do zero.

---

## Risco de compliance mais importante identificado nesta rodada

A auditoria de monetização aponta o **Conceito F (Rhythm Beats)** como o de **maior risco de "recaída"** para gacha: os líderes reais do gênero (Rhythm Hive, D4DJ) monetizam via cartas de personagem aleatórias, e a alternativa determinística atual (4 cores de faixa) está claramente aquém em potencial de receita — exatamente a pressão comercial que tornaria tentador violar o princípio de "sem sorteio" já estabelecido na auditoria de mercado original. Recomenda-se travar por escrito, antes de qualquer expansão deste conceito, que personagens/skins futuros serão sempre desbloqueáveis por progressão ou compra direta nomeada.

O **Conceito E (Idle Creatures)** tem um risco menor mas real: o "boost" hoje é um multiplicador fixo (2x) — a tentação futura de "abrir um baú com multiplicador aleatório entre 1,5x e 5x" seria gacha disfarçado de mecânica de anúncio.

---

## Onde investir a seguir, por critério

Cada auditoria, olhando por sua própria lente, chegou a uma recomendação diferente — o que é esperado e útil, não uma contradição:

| Se o critério é... | A resposta é... | Segundo qual auditoria |
|---|---|---|
| Menor risco de aprendizado contaminado por execução incompleta (testar com usuários reais primeiro) | **G — Party Trivia** (ou A como segundo) | Design/Fun Factor |
| Maior retorno esperado do próximo orçamento de monetização/LiveOps | **D — Cozy Decor** | Monetização |
| Menor esforço de engenharia para chegar a produto real | **E — Idle Creatures** | Técnica |
| Maior teto de receita comprovado no mercado real (mas exige infraestrutura primeiro) | **A — Party Royale** | Monetização + auditoria de mercado original |
| Maior risco de execução atual vs. potencial de mercado (cuidado antes de descartar o conceito) | **C — UGC Light** | Design + Monetização + Técnica (as 3 concordam) |

**Leitura prática:** não existe uma resposta única de "qual é o melhor jogo" — depende de qual pergunta se está fazendo. O padrão mais forte que emerge de cruzar as 4 auditorias é que **D (Cozy Decor) e E (Idle Creatures) são os dois protótipos mais "prontos para receber investimento incremental"** (ajustes de números/conteúdo, não redesenho), enquanto **C (UGC Light) é o único que precisa de um salto de investimento (backend de UGC + moderação) antes que qualquer uma das outras 3 lentes consiga avaliar o conceito de forma justa**.

---

## Roteiro de correções recomendado

**Fase 1 — Correções sistêmicas de baixo custo/alto impacto (aplicáveis aos 7 de uma vez):**
1. Remover `user-scalable=no` dos 7 `index.html`.
2. Padronizar `.icon-btn`/botões de ação para 44×44px mínimo.
3. Adicionar `try/catch`/validação em toda leitura de `localStorage` (Party Royale e Puzzle Duel).
4. Adicionar confirmação antes de ações destrutivas (excluir fase, remover jogador).

**Fase 2 — Fechar o "loop vazio" de moeda em A e B:**
5. Criar loja simples de skins/boosters em Party Royale e Puzzle Duel — o problema mais citado nesta auditoria e o de maior retorno relativo por esforço.

**Fase 3 — Aprofundar conteúdo e juice nos protótipos com menor nota de design:**
6. Som e partículas em Puzzle Duel, UGC Light e Idle Creatures.
7. Mais variedade de conteúdo (arenas em A, tabuleiros em B, fases em C, músicas em F, perguntas em G).

**Fase 4 — Decisão estratégica antes de continuar investindo em C e F:**
8. UGC Light: decidir se vale investir em backend de UGC/moderação agora, ou pausar o conceito até haver orçamento para essa peça específica.
9. Rhythm Beats: decidir formalmente (por escrito) que a lacuna de monetização será resolvida com coleção determinística, nunca gacha — antes que a pressão comercial torne isso uma decisão apressada.

---

## Conclusão

As 4 lentes, trabalhando de forma independente, convergiram fortemente em pontos específicos (moeda sem destino em A/B, falta de juice em C, força técnica/econômica de E, risco de compliance concentrado em F) — essa convergência entre avaliadores independentes, sem coordenação entre si, é o sinal mais confiável desta auditoria de que os problemas apontados são reais, não ruído de uma única perspectiva. Nenhum dos 7 protótipos está "pronto" hoje para prever retenção de produção — e isso é esperado e correto para o estágio de protótipo em que estão. O valor real desta auditoria não é uma nota final, é a lista de **correções concretas e priorizadas** acima, que transforma "protótipo que prova a mecânica" em "protótipo pronto para um teste de mercado que realmente responde a pergunta certa".
