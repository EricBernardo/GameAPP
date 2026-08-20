# Protótipo — Conceito D: Simulação "cozy" de vida/decoração

Protótipo técnico do **Conceito D** da [auditoria de mercado](../../docs/auditoria-jogo-mobile-jovens.md): um jogo de decoração relaxante (estilo Gossip Harbor/Animal Crossing), pensado para o público mais casual/feminino que os Conceitos A–C não cobriam — hoje o gênero de maior crescimento sustentado identificado na pesquisa de mercado.

## O que já está implementado

- **Quarto decorável** (grade 5x4) onde você compra e posiciona móveis/plantas/decoração.
- **Loja com 18 itens** em 5 categorias, com preços fixos e desbloqueio progressivo por nível (sem gacha/caixa surpresa).
- **Loop de "pedidos de cliente"**: um cliente pede um tema (ex.: "quero um cantinho tropical"); decorar o quarto com itens que combinem com o tema e entregar o pedido dá moedas e experiência — o principal motor de progressão, além da estética livre.
- **Renda passiva** (moedas ganhas com o tempo, mesmo sem interação) — característica central de jogos "cozy"/idle-friendly.
- **Temas de ambiente** (paredes/piso) desbloqueáveis por nível.
- Progresso salvo em `localStorage` (moedas, itens comprados, decoração do quarto, tema, nível).

## O que **não** está implementado (de propósito)

- Eventos sazonais/conteúdo ao vivo (o maior fator de retenção de longo prazo em jogos cozy reais, mas exige pipeline de conteúdo contínuo, fora de escopo de um protótipo).
- Multiplayer/visitar quartos de amigos.
- Qualquer IAP real (as "moedas" aqui são inteiramente fictícias, via `localStorage`).

## Como rodar

```bash
cd prototype/cozy-decor
python3 -m http.server 8083
```
Acesse `http://localhost:8083`.

## Validação

Testado de ponta a ponta via navegador: compra e posicionamento de itens, remoção de itens do quarto, sistema de pedidos (com e sem sucesso), renda passiva, troca de temas de ambiente (incluindo bloqueio por nível) e persistência completa do progresso após recarregar a página — sem erros de console.

## Próximos passos

1. Testar com jogadoras/jogadores reais se o loop "decorar para atender pedidos" é mais engajador do que decoração livre sem objetivo — a auditoria aponta este gênero como o de maior crescimento, mas a execução (arte, eventos) é o que diferencia os líderes de mercado.
2. Se validado, o maior investimento necessário é produção de conteúdo visual contínuo (mais itens, temas, eventos) — bem mais dependente de arte do que os outros conceitos protótipados.
3. Explorar um "modo social" leve (visitar/curtir o quarto de amigos) antes de qualquer multiplayer completo.
