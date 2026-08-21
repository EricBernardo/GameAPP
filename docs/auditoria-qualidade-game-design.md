# Auditoria de Qualidade — Game Design e Fun Factor

> Auditoria crítica feita por um subagente especializado atuando como Game Designer Lead sênior, avaliando exclusivamente diversão do loop principal, profundidade/variedade de conteúdo, "juice" (feedback sensorial), curva de dificuldade e potencial de retenção dos 7 protótipos em `prototype/`. Metodologia: leitura completa do código-fonte de cada protótipo (não apenas os READMEs).

---

## A — Party Royale

**Nota: 6.5/10**

O loop é genuinamente divertido em rajadas curtas: física de empurrão (`DASH_IMPULSE = 420`), colisões com restituição, obstáculos giratórios e uma arena que encolhe criam momentos de tensão reais. É o único protótipo dos 7 com um sistema de "juice" completo: squash/stretch, partículas por evento, câmera shake escalonado, e 5 efeitos sonoros sintetizados distintos. O hit-stun de 0.35s é um ajuste de feel real, não só matemática.

Mas o conteúdo é raso: existe **apenas 1 layout de arena** (hardcoded), os 7 bots correm todos na mesma IA sem variação de "personalidade", e as moedas coletadas **não têm nenhum destino** — não há loja. Depois de 3-4 partidas, a sessão fica previsível.

**Retenção honesta:** D1 provavelmente ok, mas D7/D30 seriam fracos hoje — não há razão estrutural para voltar no dia 2 além de "jogar de novo o mesmo mapa".

**3 forças:** juice completo e coerente; hit-stun calibrado deliberadamente; loop de partida jogável em <60s com resultado claro.

**3 melhorias:** adicionar pelo menos 3 layouts de arena diferentes; implementar uma loja simples de skins (dá propósito às moedas); diferenciar 2-3 "perfis" de IA de bot.

---

## B — Puzzle Duel

**Nota: 5/10**

O motor de match-3 está tecnicamente correto: cascatas, combo, gravidade e reabastecimento sem bugs. A barra de "corrida" contra o rival com curva ease-out é uma escolha de design deliberada e boa.

O problema é que isso é tudo. **Não existe nenhum arquivo de áudio** neste protótipo. O tabuleiro é sempre 8x8 aleatório, sem fases curadas, sem peças especiais (bomba, listrada — padrão do gênero há mais de uma década), sem obstáculos. A "corrida contra o rival" é a única camada de diferenciação e, sozinha, não sustenta múltiplas sessões num gênero já saturado por concorrentes muito mais profundos.

**Retenção honesta:** fraca já em D1. Sem som e sem variedade, a sessão 3 já parece igual à sessão 1.

**3 forças:** motor de match-3 tecnicamente sólido; gancho social simples e legível; curva do rival pensada deliberadamente.

**3 melhorias:** adicionar som (troca, combinação, combo) — lacuna mais grave e mais barata de corrigir; criar 5-10 tabuleiros com obstáculos fixos; dar destino às moedas (loja).

---

## C — UGC Light

**Nota: 4/10**

A física de plataforma está correta e sem bugs. O editor tem uma regra de validação sensata (exige início e fim) e permite testar a fase sem sair do editor.

Mas este é o protótipo com **menos "juice" dos 7**, particularmente grave por ser um plataformer — gênero em que o feedback de pulo/queda/coleta é historicamente onde a diversão "tátil" mora. Não há som, partículas, squash/stretch nem reação de câmera — nem a mola tem qualquer efeito além do movimento físico puro. O editor tem só 6 ferramentas estáticas, sem nenhum elemento dinâmico (plataforma móvel, inimigo, chão que desaparece) — o que compromete a própria pergunta que o protótipo deveria responder ("criar é divertido?").

**Retenção honesta:** muito fraca. Risco real de "matar" a validação do conceito C por falta de execução, não porque a hipótese seja falsa.

**3 forças:** física de plataforma sólida; editor com validação e ciclo criar→testar imediato; persistência local com CRUD completo.

**3 melhorias:** adicionar som e partículas em toda ação (mola, moeda, chegada); adicionar elementos dinâmicos ao editor (plataforma móvel, inimigo simples); adicionar 4-6 fases de exemplo com dificuldade crescente.

---

## D — Cozy Decor

**Nota: 5/10**

Protótipo com **mais volume de conteúdo bruto**: 18 itens, 5 categorias, 5 temas, 6 níveis. O loop de 3 camadas (renda passiva + pedidos + loja) é coerente com o gênero.

O problema real está em `roomHasTag()`: verifica apenas se existe qualquer item com a tag pedida, **sem avaliar coerência ou combinação**. Depois de comprar uns 5-6 itens "coringa", o jogador nunca mais falha um pedido — isso mata o loop central em poucos minutos. A entrega de pedido, que deveria ser o pico emocional, é só um `toast()` de texto sem partícula/som.

**Retenção honesta:** fraca. O conteúdo existe, mas o loop de progressão se torna trivial rápido demais.

**3 forças:** volume de conteúdo real e coerente; loop de 3 camadas bem estruturado; persistência completa e testada sem bugs.

**3 melhorias:** exigir 2-3 tags simultâneas por pedido (mantém desafio crescendo); adicionar feedback sensorial na entrega de pedido; copiar o mecanismo de ganhos offline do Conceito E.

---

## E — Idle Creatures

**Nota: 5.5/10**

Economia melhor calibrada dos 7: custo cresce a 1.18x por nível e produção a 1.12x — curvas distintas que criam decisão real. O sistema de ganhos offline com cap e "dobrar por anúncio" está implementado corretamente.

O problema é que a economia bem calibrada não tem **nenhuma alma visual**. É literalmente uma lista de linhas com emoji + botão de compra — não há nenhuma representação das criaturas em um habitat. Para um conceito cujo apelo central é "colecionar criaturas fofas", isso é uma lacuna grave. Não há som em nenhuma interação.

**Retenção honesta:** a mecânica de retorno está pronta e correta (base técnica real para D1/D7), mas sem identidade visual/emocional das criaturas, o motivo de *querer* voltar está ausente.

**3 forças:** economia idle matematicamente correta; sistema de ganhos offline implementado corretamente; progressão 100% determinística.

**3 melhorias:** implementar uma área/habitat visual onde as criaturas se movem/animam; adicionar som distinto por criatura; adicionar segunda camada de progressão (prestígio).

---

## F — Rhythm Beats

**Nota: 6/10**

A implementação de áudio é tecnicamente a mais cuidadosa dos 7: usa o relógio do próprio `AudioContext` como única fonte de verdade, evitando o problema clássico de desync entre vídeo e áudio. Julgamento com múltiplos tiers, combo escalonado e nota final dão camada real de "domínio".

O conteúdo, porém, é fino: só há **3 músicas**, cada uma um padrão de 8-16 notas repetido mecanicamente sem variação. Um jogador sente o padrão nos primeiros 8 segundos. Não existe estado de falha real (a música nunca termina antes da hora).

**Retenção honesta:** o "feel" técnico é bom, mas o conteúdo musical raso faz a curiosidade morrer rápido.

**3 forças:** sincronização áudio/vídeo tecnicamente correta; julgamento em múltiplos tiers + combo escalonado; loja de temas coerente com a recomendação regulatória.

**3 melhorias:** reescrever cada chart com pelo menos 3 seções distintas; adicionar uma "barra de energia" que cria risco real de falha; separar a faixa "quase lá" numa 3ª categoria de julgamento.

---

## G — Party Trivia

**Nota: 6.5/10**

Zero juice no sentido tradicional, mas isso é menos grave aqui porque o gancho de diversão não depende de execução técnica, e sim de humor humano real. O loop de blefe está implementado de forma completa e correta: sigilo, ocultação de autoria, impossibilidade de votar na própria resposta, e o caso extremo de blefe coincidente tratado corretamente.

Os problemas reais são de profundidade e ritmo: banco de só 15 perguntas (esgota em 3 partidas), revelação sem tensão dramática (mostra tudo de uma vez), sem limite de tempo em nenhuma fase.

**Retenção honesta:** D1 depende de ter amigos disponíveis — quando isso acontece, a experiência central provavelmente funciona bem. D7/D30 dependem mais de expandir o banco de perguntas do que de correção de mecânica.

**3 forças:** loop de blefe social completo e correto; gancho de diversão não depende de execução técnica; fluxo de "passar o celular" bem cuidado.

**3 melhorias:** expandir para 40-60 perguntas; revelar uma resposta por vez com pausa dramática; adicionar cronômetro de 30-45s por fase.

---

## Ranking geral (melhor → precisa de mais trabalho)

| # | Protótipo | Nota | Resumo do veredito |
|---|---|---|---|
| 1 | **A — Party Royale** | 6.5 | Melhor execução de "juice"; conteúdo raso (1 mapa) mas o núcleo já entrega uma reação real. |
| 1 | **G — Party Trivia** | 6.5 | Zero juice, mas mecânica social completa e correta — menor risco de execução dos 7. |
| 3 | **F — Rhythm Beats** | 6.0 | Tecnicamente o mais cuidadoso (sync áudio/vídeo), mas conteúdo musical raso demais. |
| 4 | **E — Idle Creatures** | 5.5 | Melhor economia matemática, mas sem nenhuma alma visual. |
| 5 | **B — Puzzle Duel** | 5.0 | Motor correto, mas sem som e sem diferenciação num gênero já saturado. |
| 5 | **D — Cozy Decor** | 5.0 | Mais volume de conteúdo, mas o loop central se torna trivial em minutos. |
| 7 | **C — UGC Light** | 4.0 | Física correta, mas zero juice e ferramentas insuficientes para testar a própria hipótese. |

## Recomendação honesta final

**Mais pronto para testar com jogadores reais: Conceito G — Party Trivia.** É o único protótipo cuja pergunta central de design pode ser respondida sem ruído de execução técnica confundindo o resultado — o loop está implementado de ponta a ponta, corretamente, e a diversão do gênero já é comprovada fora deste código.

**Mais longe de estar pronto, apesar do conceito de mercado ser bom: Conceito C — UGC Light.** Com apenas 6 ferramentas estáticas e zero feedback sensorial em qualquer ação, é impossível separar "o ato de criar não é divertido" de "esta implementação específica não é divertida". Testar hoje arriscaria matar por engano um conceito de mercado legítimo por causa de uma execução ainda abaixo do necessário.

**Nota sobre o conjunto:** nenhum dos 7 protótipos tem hoje profundidade/juice suficiente para prever retenção D30 saudável — e isso é esperado para a fase de protótipo em que estão. O sinal mais honesto não é "qual vai ter boa retenção", e sim "qual mecânica central merece receber o próximo investimento de produção" — por esse critério, G e A são as apostas de menor risco de aprendizado contaminado por execução incompleta.
