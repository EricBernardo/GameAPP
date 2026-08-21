# Protótipo — Conceito F: Jogo de ritmo musical (sem gacha)

Protótipo técnico do **Conceito F** da [auditoria de mercado](../../docs/auditoria-jogo-mobile-jovens.md): um jogo de ritmo (estilo Piano Tiles/Guitar Hero simplificado) com 4 faixas, sincronizado a um som sintetizado via WebAudio — **sem gacha de personagens/cartas**, ao contrário dos líderes atuais do gênero (Rhythm Hive, D4DJ), que é exatamente o risco de conformidade que a auditoria apontou para este conceito.

## O que já está implementado

- **3 músicas**, cada uma composta por **seções distintas** (introdução mais lenta, clímax com notas de meia batida, final de desaceleração) em vez de um padrão único repetido — adicionado na Fase 3 da auditoria de qualidade, que apontou o conteúdo musical repetitivo como a lacuna mais grave de design deste protótipo.
- **Barra de energia/risco**: cada nota perdida reduz energia; acertos recuperam um pouco. Zerar a energia termina a música antes da hora — o risco real que faltava na primeira versão (a música nunca podia "acabar mal").
- **Áudio sintetizado via WebAudio** (osciladores, sem arquivos de música externos, evitando qualquer questão de licenciamento neste estágio de protótipo) agendado com precisão de amostra, usando o relógio do `AudioContext` como fonte única de verdade tanto para o som quanto para a posição visual das notas (evita desincronia entre áudio e vídeo).
- **Julgamento de precisão em 3 níveis** (Perfeito/Bom/OK — a faixa "quase lá" entre Bom e Faltou, antes inexistente, foi separada em sua própria categoria), combo com multiplicador de pontuação, e tela de resultado com nota (S/A/B/C/D) ou estado de falha.
- **Desbloqueio de músicas 100% determinístico**: completar uma música desbloqueia a próxima, independente da pontuação — sem sorteio.
- **Loja de temas visuais** (cores das faixas) com preço fixo — a mecânica de personalização/coleção do gênero, sem loot box.
- Progresso (moedas, músicas desbloqueadas, tema ativo) salvo via `localStorage`.

## Política de monetização: compromisso formal contra gacha (Fase 4 da auditoria de qualidade)

A auditoria de monetização identificou este como **o protótipo de maior risco de "recaída" para gacha dos sete**: os líderes reais do gênero (Rhythm Hive, D4DJ, Project Sekai) faturam majoritariamente vendendo cartas/personagens por sorteio, e a alternativa atual deste protótipo (4 temas de cor com preço fixo) está claramente aquém desse potencial de receita — exatamente a pressão comercial que tornaria tentador violar o princípio de "sem sorteio" já estabelecido na auditoria de mercado original.

**Compromisso travado por esta auditoria, válido para qualquer evolução futura deste conceito:** personagens, avatares, skins de nota ou qualquer coleção visual adicionada a este jogo serão **sempre desbloqueáveis por progressão ou compra direta com preço visível antes da compra — nunca por gacha, caixa-surpresa, ou qualquer mecanismo de resultado aleatório pago**, independentemente de pressão comercial futura para "converter melhor". Isso não é uma preferência de design — é um requisito de conformidade com a Lei Felca (Brasil) e a atualização da COPPA (EUA) para qualquer produto que alcance o público jovem, documentado na [auditoria de mercado, seção 6](../../docs/auditoria-jogo-mobile-jovens.md).

Se uma futura expansão deste conceito precisar de mais receita do que cosméticos de preço fixo sustentam, os caminhos aceitáveis são: passe de temporada com conteúdo fixo e visível, mais músicas pagas individualmente, ou parcerias de conteúdo exclusivo com artistas — nunca randomização paga.

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
