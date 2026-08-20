# Protótipo — Conceito G: Festa social de blefe/trivia

Protótipo técnico do **Conceito G** da [auditoria de mercado](../../docs/auditoria-jogo-mobile-jovens.md): um jogo de festa "passa e joga" (estilo Fibbage/Zarta!/BLFFD) para grupos de amigos em um único celular — o conceito de **menor complexidade técnica e menor risco regulatório** dos sete mapeados na auditoria, já que todo o valor está na interação social entre pessoas reais, não em mecânicas monetizáveis.

## O que já está implementado

- **Configuração de 2 a 6 jogadores** (nomes editáveis).
- **Fluxo completo "passa e joga"**: tela de transição explícita ("Passe o celular para [Nome]") antes de cada entrada de blefe e de cada voto, para preservar o sigilo entre jogadores no mesmo dispositivo.
- **Fase de blefe**: cada jogador escreve uma resposta falsa e convincente para uma pergunta de trivia (banco fixo de 15 perguntas, sem geração aleatória de conteúdo).
- **Fase de votação**: a resposta verdadeira é misturada com os blefes de todos; cada jogador vota em qual acha que é a verdadeira, sem ver nem poder votar na própria resposta.
- **Revelação e pontuação**: 1000 pontos por acertar a resposta verdadeira, 500 pontos por cada pessoa enganada pelo seu blefe (mecânica clássica do gênero).
- **Placar entre rodadas** e **tela final** com ranking, após 5 perguntas.

## O que **não** está implementado (de propósito)

- Multiplayer remoto (cada jogador em seu próprio celular) — hoje é só "passa e joga" em um único dispositivo, o MVP mais simples possível do conceito.
- Banco de perguntas maior/editável pela comunidade.
- Qualquer monetização (o conceito, por natureza, tem o menor apelo a compras dentre os sete — seu valor é a interação social).

## Como rodar

```bash
cd prototype/party-trivia
python3 -m http.server 8086
```
Acesse `http://localhost:8086`. Melhor testado com 2+ pessoas reais passando o celular entre si, mas também é possível validar sozinho simulando cada jogador em sequência.

## Validação

Testado de ponta a ponta simulando 3 jogadores em 2 rodadas completas: fluxo de "passar o celular" em todas as fases, bloqueio correto de ver/votar na própria resposta, cálculo de pontuação (incluindo um caso extremo em que um blefe coincidiu por acaso com a resposta verdadeira, tratado corretamente) — sem erros de console.

## Próximos passos

1. Testar com grupos reais de jovens (ex.: em uma sala de aula ou reunião de amigos) se o formato "passa e joga" funciona bem na prática ou se a fricção de passar o celular prejudica o ritmo — a auditoria já aponta este como um risco de design do conceito.
2. Se validado, avaliar a evolução para multiplayer remoto real (cada jogador no próprio celular, sincronizado por um backend leve de salas), permitindo jogar sem estar fisicamente no mesmo lugar.
3. Expandir o banco de perguntas e considerar categorias sugeridas/votadas pela própria comunidade de jogadores.
