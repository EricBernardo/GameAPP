# Protótipo — Conceito A: "Party Royale" casual

Este é o protótipo técnico do **Conceito A** recomendado na [auditoria de mercado](../../docs/auditoria-jogo-mobile-jovens.md): uma arena de eliminação casual, partidas curtas, fácil de aprender — o mesmo padrão de mecânica de Fall Guys/Stumble Guys, mas reduzido ao essencial para responder a uma pergunta só: **a mecânica é divertida em 30–60 segundos?**

## O que já está implementado

- Arena circular que **encolhe com o tempo** (efeito "tempestade"), forçando confrontos no final da partida.
- **Dash/empurrão** com cooldown — o jogador pode empurrar oponentes para fora da arena.
- **Obstáculos giratórios** no centro, que também eliminam quem tocar neles.
- **11 bots com IA simples** (perseguem o oponente mais próximo, evitam a borda, usam dash) para simular uma partida "cheia" sem precisar de servidor multiplayer.
- Controles de **toque (joystick virtual + botão de dash)** para celular e **teclado (WASD/setas + espaço)** para testar no computador.
- "Juice" de jogo (squash/stretch, partículas, câmera shake, som sintetizado) — importante para validar o potencial de gerar "momentos engraçados" compartilháveis, um dos fatores de viral identificados na auditoria.
- Loop de moeda cosmética fictícia (`🪙`) ao final de cada partida, salva em `localStorage`, apenas para simular a sensação de progressão — **não é um sistema de monetização real**.

## O que **não** está implementado (de propósito)

Conforme o roteiro da auditoria (seção 12), esta é a etapa 1 ("protótipo jogável mínimo, sem monetização, sem backend completo"):

- Sem multiplayer real (bots simulam os oponentes).
- Sem contas, backend ou matchmaking.
- Sem loja, anúncios ou qualquer IAP.
- Sem build nativo Android/iOS — é um protótipo web para iterar rápido.

## Por que HTML5/Canvas e não Godot/Unity ainda

A própria auditoria recomenda validar a mecânica no navegador antes de investir em motor nativo. Vantagens neste estágio:

- Zero instalação para playtesters — basta abrir um link (inclusive no celular, na mesma rede).
- Iteração extremamente rápida (editar e recarregar).
- Se a mecânica for validada, o código serve como especificação de comportamento (física, timings, "feel") para reimplementar em Godot (recomendado na auditoria) ou empacotar via Capacitor/WebView para lojas.

## Como rodar

Qualquer servidor estático simples funciona (o módulo ES exige `http://`, não abre direto via `file://`).

```bash
cd prototype/party-royale
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080` no navegador. Para testar no celular, use o IP da máquina na mesma rede (ex.: `http://192.168.0.X:8080`) — os controles de toque são ativados automaticamente em telas sensíveis a toque.

## Controles

- **Celular:** arraste no joystick (canto inferior esquerdo) para mover; toque em **DASH** para empurrar na direção do movimento.
- **Computador:** setas ou WASD para mover; **espaço** para dash.

## Estado atual de balanceamento (checkpoint de validação técnica)

Este protótipo passou por testes automatizados em navegador (via subagente de uso de computador) para validar que a arquitetura técnica está sólida:

- Arena responsiva ao tamanho da tela (não corta em celulares estreitos).
- 8 jogadores (1 humano + 7 bots) espaçados sem sobreposição no spawn.
- Período de "graça" de 4s no início da partida (sem eliminação, sem ataque de bots).
- Janela de 0,35s de imunidade a impacto após qualquer colisão, para evitar que múltiplos acertos em sequência ejetem alguém da arena sem chance de reação (mecânica equivalente ao "hit-stun" de Fall Guys/jogos de luta — foi a correção que teve o maior impacto positivo no teste).
- Sem erros de console; física estável (sem "explosões" de velocidade).
- Em teste ativo (jogador se movendo e evitando perigo), sobrevivência média observada de ~17–37s por partida, sem bugs.

**Importante:** o ajuste fino de dificuldade (quão agressivos os bots devem ser, velocidade de encolhimento da arena, força de dash) foi propositalmente deixado conservador nesta etapa. Automação de teste (IA pressionando teclas) não reflete os reflexos de um jogador humano real, então o balanceamento definitivo depende do próximo passo do roteiro: testes com jogadores reais do público-alvo.

## Próximos passos (conforme roteiro da auditoria)

1. Testar com um grupo pequeno de jogadores reais do público-alvo (adolescentes) e observar reação/retenção, não só perguntar opinião.
2. Ajustar "feel" (velocidade, força do dash, tamanho/velocidade de encolhimento da arena) com base no teste.
3. Se validado: decidir entre (a) evoluir este prototype web com um backend leve de multiplayer real (ex.: WebSocket + salas), ou (b) reconstruir em Godot com netcode para lançar nas lojas.
4. Só então desenhar o sistema de monetização (anúncio recompensado + cosméticos de preço fixo, sem loot box — ver seção 6 e 8 da auditoria) e o pipeline de compliance de idade/privacidade.
