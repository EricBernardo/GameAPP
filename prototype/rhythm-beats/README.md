# Protótipo — Conceito F: Jogo de ritmo musical (sem gacha)

Protótipo técnico do **Conceito F** da [auditoria de mercado](../../docs/auditoria-jogo-mobile-jovens.md): um jogo de ritmo (estilo Piano Tiles/Guitar Hero simplificado) com 4 faixas, sincronizado a um som sintetizado via WebAudio — **sem gacha de personagens/cartas**, ao contrário dos líderes atuais do gênero (Rhythm Hive, D4DJ), que é exatamente o risco de conformidade que a auditoria apontou para este conceito.

## O que já está implementado

- **3 músicas** com "charts" (sequência de notas por faixa) escritos à mão e fixos — nunca mudam entre execuções, como em jogos de ritmo reais.
- **Áudio sintetizado via WebAudio** (osciladores, sem arquivos de música externos, evitando qualquer questão de licenciamento neste estágio de protótipo) agendado com precisão de amostra, usando o relógio do `AudioContext` como fonte única de verdade tanto para o som quanto para a posição visual das notas (evita desincronia entre áudio e vídeo).
- **Julgamento de precisão** (Perfeito/Bom/Faltou), combo com multiplicador de pontuação, e tela de resultado com nota (S/A/B/C/D).
- **Desbloqueio de músicas 100% determinístico**: completar uma música desbloqueia a próxima, independente da pontuação — sem sorteio.
- **Loja de temas visuais** (cores das faixas) com preço fixo — a mecânica de personalização/coleção do gênero, sem loot box.
- Progresso (moedas, músicas desbloqueadas, tema ativo) salvo via `localStorage`.

## O que **não** está implementado (de propósito)

- Música licenciada real (usar apenas tons sintetizados evita custo/risco de licenciamento nesta fase; a auditoria já aponta isso como fator de custo a resolver antes de um lançamento real).
- Qualquer sistema de cartas/personagens coletáveis por sorteio — **intencionalmente ausente**, para não repetir o padrão de monetização dos líderes do gênero que conflita com a Lei Felca/COPPA para o público jovem.
- Multiplayer/duelo entre jogadores.

## Como rodar

```bash
cd prototype/rhythm-beats
python3 -m http.server 8085
```
Acesse `http://localhost:8085`.

## Validação

Testado de ponta a ponta via navegador: fluxo completo (menu → jogar → resultado → desbloqueio da próxima música → loja de temas → aplicação do tema), detecção de notas perdidas ("Faltou", zera combo), acúmulo/gasto de moedas e persistência — sem erros de console. A precisão de timing exata do julgamento "Perfeito"/"Bom" não pôde ser validada por automação (que não replica os reflexos de um jogador humano real com precisão de milissegundos), mas a lógica foi revisada em código e a consistência do agendamento de áudio/vídeo (mesmo relógio do `AudioContext` para ambos) foi confirmada.

## Próximos passos

1. Teste manual com jogadores reais focado especificamente na sensação de "acerto" (se a janela de tolerância de tempo está adequada — nem frustrante nem fácil demais).
2. Se validado, avaliar parcerias com criadores/artistas emergentes para música original licenciada, evitando o custo alto de licenciar catálogos conhecidos.
3. Considerar um modo de "criar seu próprio chart" (aproveitando a lógica do Conceito C de UGC) como diferencial de longo prazo.
