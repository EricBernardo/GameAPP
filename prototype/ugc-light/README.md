# Protótipo — Conceito C: Mini-plataforma UGC "light"

Protótipo técnico do **Conceito C** da [auditoria de mercado](../../docs/auditoria-jogo-mobile-jovens.md): uma versão enxuta da lógica do Roblox — um jogo-base simples (plataforma 2D) com um editor de fases que o próprio jogador usa para criar e testar suas criações, sem tentar competir com a escala/infraestrutura de uma plataforma UGC completa.

## O que já está implementado

- **Editor de fases**: paleta com 7 ferramentas (chão, perigo, moeda, mola, **plataforma móvel**, início, fim) sobre uma grade 16x9; pintura por toque/clique e arraste; validação exigindo exatamente um início e um fim antes de salvar/testar.
- **Personagem de plataforma completo**: gravidade, pulo, colisão sólida com o chão, mola (impulso extra), moedas colecionáveis, obstáculos de perigo (respawn no início), **plataforma móvel que carrega o personagem** e bandeira de chegada (conclui a fase).
- **Som e partículas** em toda ação (pulo, moeda, mola, perigo, chegada) — adicionado na Fase 3 da auditoria de qualidade, que apontou a ausência total de "juice" como a lacuna mais grave deste protótipo.
- **6 fases de exemplo** pré-construídas (incluindo duas que usam a plataforma móvel) + fases criadas pelo jogador (salvas via `localStorage`), com opções de jogar, editar e apagar (com confirmação antes de apagar).
- **Personalização simples de avatar** (cor do personagem) — o "customização" citado no conceito original, reduzido ao essencial.
- Controles por toque (D-pad + botão de pulo na tela) e teclado (setas/WASD/espaço).

## Política de moderação de conteúdo (Fase 4 da auditoria de qualidade)

Este é o único protótipo dos sete em que o **risco regulatório real não é monetização — é segurança de conteúdo gerado por um público majoritariamente menor de idade**, como a auditoria de mercado já apontava.

**O que existe hoje** (`src/moderation.js`): um filtro básico client-side que bloqueia uma lista curta de palavras claramente inadequadas no **nome da fase** (o único campo de texto livre do jogo) antes de salvar. Isso é deliberadamente descrito como "primeira linha de defesa", não como solução.

**O que isso NÃO resolve, e é bloqueador antes de qualquer recurso de compartilhamento real:**
- Um filtro de lista bloqueada client-side é trivial de contornar (erros de digitação propositais, símbolos, outros idiomas) — não é proteção de produção.
- Não existe moderação do **conteúdo visual da fase em si** (layout de tiles não passa por nenhuma revisão).
- Sem compartilhamento ainda implementado, o risco de exposição pública hoje é baixo (cada fase só é visível no próprio dispositivo) — mas isso muda completamente no dia em que um backend de publicação for adicionado.

**Decisão de produto travada por esta auditoria:** antes de implementar qualquer forma de outros jogadores acessarem fases de terceiros, é obrigatório ter, no mínimo: (1) filtro de texto server-side (não só client-side), (2) sistema de denúncia pelos próprios jogadores, (3) revisão humana antes de destaque/distribuição ampla, e (4) conformidade com COPPA/Lei Felca para tratamento de dados e conteúdo de menores. Não faz sentido investir em UGC "de verdade" sem essa base — é o motivo pelo qual este protótipo permanece client-only mesmo depois de 3 fases de melhorias.

## O que **não** está implementado (de propósito)

- **Compartilhamento entre jogadores** — hoje as fases ficam só no dispositivo (`localStorage`). Ver seção de moderação acima para o porquê disso ser deliberado, não um esquecimento.
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
2. Se validado, priorizar um backend mínimo de compartilhamento (upload da fase + um feed simples de "fases da comunidade") e o pipeline de moderação completo descrito acima — nessa ordem, não em paralelo.
3. Adicionar mais elementos dinâmicos ao editor (inimigos simples, chão que desaparece) somente depois de validar o loop básico de criar/jogar.
