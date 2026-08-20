# Protótipo — Conceito C: Mini-plataforma UGC "light"

Protótipo técnico do **Conceito C** da [auditoria de mercado](../../docs/auditoria-jogo-mobile-jovens.md): uma versão enxuta da lógica do Roblox — um jogo-base simples (plataforma 2D) com um editor de fases que o próprio jogador usa para criar e testar suas criações, sem tentar competir com a escala/infraestrutura de uma plataforma UGC completa.

## O que já está implementado

- **Editor de fases**: paleta com 6 ferramentas (chão, perigo, moeda, mola, início, fim) sobre uma grade 16x9; pintura por toque/clique e arraste; validação exigindo exatamente um início e um fim antes de salvar/testar.
- **Personagem de plataforma completo**: gravidade, pulo, colisão sólida com o chão, mola (impulso extra), moedas colecionáveis, obstáculos de perigo (respawn no início) e bandeira de chegada (conclui a fase).
- **Lista de fases**: 2 fases de exemplo pré-construídas + fases criadas pelo jogador (salvas via `localStorage`), com opções de jogar, editar e apagar.
- **Personalização simples de avatar** (cor do personagem) — o "customização" citado no conceito original, reduzido ao essencial.
- Controles por toque (D-pad + botão de pulo na tela) e teclado (setas/WASD/espaço).

## O que **não** está implementado (de propósito)

- **Compartilhamento entre jogadores** — hoje as fases ficam só no dispositivo (`localStorage`). O próximo passo real de UGC (outros jogadores acessarem e jogarem sua fase) exige um backend com armazenamento e, criticamente, **moderação de conteúdo** — apontado na auditoria como o maior risco/custo deste conceito, por causa da base de usuários jovem.
- Qualquer monetização.
- Curadoria de dificuldade ou sistema de avaliação/curtidas de fases.

## Como rodar

```bash
cd prototype/ugc-light
python3 -m http.server 8082
```
Acesse `http://localhost:8082`.

## Notas de teste

Durante a validação técnica, um bug real foi identificado e corrigido no editor (uso de `Object.values` desnecessário já havia sido evitado desde o design, mas um problema de **cache do navegador no script do jogo** mascarou inicialmente um falso positivo de "personagem não se move" — resolvido confirmando com cache desabilitado que a física, o movimento, a coleta de moedas, os obstáculos de perigo e a chegada na meta funcionam corretamente). Ponto de atenção para testes futuros com usuários reais: garantir que o dispositivo de teste não esteja servindo uma versão em cache do jogo após atualizações.

## Próximos passos

1. Testar com jovens reais se o ato de **criar** a fase é tão engajador quanto jogar fases prontas (a hipótese central do conceito).
2. Se validado, priorizar um backend mínimo de compartilhamento (upload da fase + um feed simples de "fases da comunidade") e um pipeline de moderação de conteúdo antes de abrir para múltiplos usuários.
3. Adicionar mais ferramentas ao editor (plataformas móveis, inimigos simples) somente depois de validar o loop básico de criar/jogar.
