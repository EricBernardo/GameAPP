# Protótipo — Conceito E: Colecionável idle de criaturas

Protótipo técnico do **Conceito E** da [auditoria de mercado](../../docs/auditoria-jogo-mobile-jovens.md): um jogo idle/incremental de coleta de criaturas fofas, com progressão **inteiramente determinística** — sem gacha, loot box ou qualquer sorteio pago, ponto central da recomendação de compliance da auditoria (Lei Felca/COPPA) para este gênero.

## O que já está implementado

- **10 criaturas** desbloqueadas em ordem fixa (cada uma só pode ser adotada depois da anterior), cada uma com custo e produção de gemas/segundo conhecidos com antecedência.
- **Progressão passiva** (idle) + **toque manual** para coleta ativa (o valor do toque escala com sua produção total, seguindo a prática de mercado descrita na auditoria).
- **Upgrades de nível** por criatura (custo crescente, produção crescente).
- **Simulação de anúncio recompensado**: botão de "boost" 2x por 60s com cooldown, e modal de "ganhos offline" com opção de dobrar a recompensa — os dois pontos exatos onde, em uma versão real, um SDK de anúncios (rewarded video) se encaixaria.
- **Ganhos offline**: ao reabrir o jogo, calcula quanto tempo passou (limitado a 8h) e credita uma fração da produção total como recompensa por ter ficado ausente — mecânica central de retenção em jogos idle.
- Progresso salvo via `localStorage`.

## O que **não** está implementado (de propósito)

- SDK de anúncios real (o "boost" e o "dobrar offline" são simulados via `setTimeout`/estado local).
- Eventos sazonais ou uma segunda camada de "prestígio" (reiniciar com bônus permanente) — mencionados como evolução comum do gênero na pesquisa de mercado, mas fora do escopo deste protótipo mínimo.
- Qualquer forma de compra aleatória. Isso é intencional: qualquer expansão futura de monetização deste conceito **deve manter esse princípio** para permanecer em conformidade com a legislação vigente para o público jovem.

## Como rodar

```bash
cd prototype/idle-creatures
python3 -m http.server 8084
```
Acesse `http://localhost:8084`.

## Validação

Testado de ponta a ponta via navegador: toque manual, produção passiva, adoção e upgrade de criaturas, boost de anúncio simulado (com cooldown), modal de recompensa offline (incluindo a opção de dobrar) e persistência completa do progresso após recarregar/fechar a aba — sem erros de console.

## Próximos passos

1. Testar com jogadores reais qual "ritmo" de desbloqueio de criaturas mantém o engajamento sem frustrar (os valores atuais são um ponto de partida, não um balanceamento final).
2. Se validado, avaliar uma segunda camada de progressão (ex.: "prestígio") para dar profundidade a jogadores que já desbloquearam todas as criaturas.
3. Substituir os anúncios simulados por integração real de SDK de anúncios recompensados ao migrar para build nativo.
