# Protótipo — Conceito B: Puzzle competitivo social

Protótipo técnico do **Conceito B** da [auditoria de mercado](../../docs/auditoria-jogo-mobile-jovens.md): um puzzle match-3 com um "duelo" contra a pontuação de um rival, para validar se a camada social/competitiva (e não apenas a mecânica de combinar peças, já bem conhecida) é o diferencial que dá tração ao jogo.

## O que já está implementado

- Tabuleiro 8x8 de match-3 completo: troca de peças adjacentes, detecção de combinações (linha/coluna, 3+), gravidade, reabastecimento e **combos em cadeia** (cascatas) com multiplicador de pontos.
- Tabuleiro inicial gerado sem combinações já formadas.
- Animações via interpolação (peças deslizam ao trocar, caem suavemente ao reabastecer) e partículas ao limpar combinações.
- **"Corrida" visual contra um rival simulado**: uma barra mostra o progresso do jogador e de um rival (bot) cuja pontuação avança sozinha durante a partida — a mecânica social central do conceito (o duelo assíncrono contra a pontuação de um amigo, aqui simulado).
- Rodada de 90 segundos, pontuação final comparada com a meta do rival, tela de vitória/derrota, moedas fictícias (`localStorage`) — sem monetização real.

## O que **não** está implementado (de propósito)

- Rival real (é uma simulação local; o próximo passo é permitir desafiar a pontuação real de um amigo via link/backend leve).
- Boosters, vidas ou qualquer IAP.
- Centenas de fases com dificuldade curada — este protótipo usa sempre o mesmo tabuleiro aleatório 8x8, o suficiente para testar se a mecânica central (combinar + correr contra um rival) é divertida.

## Como rodar

```bash
cd prototype/puzzle-duel
python3 -m http.server 8081
```
Acesse `http://localhost:8081`.

## Controles

Toque em uma peça e depois em uma peça vizinha para trocar. Se a troca formar uma combinação de 3+, ela é validada; caso contrário, a troca é desfeita automaticamente.

## Próximos passos

1. Testar com jogadores reais se a "corrida" contra o rival aumenta a motivação em comparação a um match-3 tradicional sem esse elemento social.
2. Se validado, substituir o rival simulado por um sistema real de desafios assíncronos entre amigos (link de convite + backend leve para salvar/comparar pontuações).
3. Curadoria de níveis/dificuldade progressiva antes de qualquer lançamento.
