# Auditoria de Oportunidade: Jogo Mobile (Android/iOS) para Público Jovem

> Documento de auditoria estratégica de mercado, produto, tecnologia, monetização e riscos legais para avaliar a viabilidade de um jogo mobile voltado a jovens (Gen Z / Gen Alpha). Dados de mercado referentes a 2025–2026.

## 1. Resumo executivo

O mercado mobile continua sendo a maior plataforma de jogos do mundo, e o público jovem é o mais "gamer" de todos: **94% da Gen Alpha e 92% da Gen Z se identificam como jogadores**, a maioria jogando primariamente no celular. No Brasil, o celular já responde por mais de 50% do consumo de jogos, e **82,8% dos brasileiros com mais de 10 anos jogam algum jogo digital**.

Três conclusões centrais desta auditoria:

1. **Downloads e receita são jogos diferentes.** Gêneros casuais (simulação, puzzle, arcade, party games) dominam instalações e são o caminho mais realista para um novo estúdio conquistar um público jovem e amplo. Gêneros de meio-núcleo (estratégia, RPG) dominam receita, mas exigem times maiores, produção de conteúdo contínua ("live-ops") e ciclos de retenção de longo prazo — não são o ponto de entrada recomendado para um primeiro produto.
2. **O componente social/UGC (conteúdo gerado pelo usuário) é o principal fator de retenção em jogos populares entre jovens** (Roblox, Stumble Guys, Brawl Stars, Free Fire). Um jogo pensado para esse público deve nascer com "multiplayer leve" e mecânicas de compartilhamento, não como recurso posterior.
3. **A regulação para menores mudou significativamente em 2026** e restringe fortemente mecânicas de caixas de recompensa pagas (loot boxes/gacha) para usuários menores de idade — inclusive no Brasil. Isso precisa ser um requisito de design desde o primeiro rascunho, não um ajuste de compliance no final.

**Recomendação geral:** buscar um conceito **hybridcasual** (mecânica casual de fácil entrada + camada leve de progressão/social/competitiva), com monetização baseada majoritariamente em **anúncios recompensados + cosméticos não randômicos**, construído em um motor de baixo custo/risco (Godot ou Unity, dependendo do escopo 2D/3D), com um MVP validável em poucas semanas de prototipagem e teste de mercado pago de baixo custo antes de qualquer investimento maior.

---

## 2. Objetivo e escopo

Avaliar a viabilidade de um jogo mobile (Android + iOS) com potencial de popularidade entre o público jovem, cobrindo:

- Panorama de mercado e comportamento do público-alvo;
- Benchmark de concorrentes de sucesso nesse público;
- Modelos de monetização compatíveis com esse público e com a legislação vigente;
- Opções tecnológicas e estimativa de esforço/custo;
- Riscos (mercado, regulatório, técnico, financeiro) e mitigação;
- Propostas de conceito de jogo com matriz de priorização;
- Roteiro recomendado de validação (MVP → teste → soft launch).

Este documento **não** é uma decisão de produto final, e sim uma base objetiva para escolher (ou descartar) um conceito antes de investir em desenvolvimento.

---

## 3. Panorama de mercado (2025–2026)

### 3.1 Números-chave

- Receita global de compras dentro do app (IAP) em jogos mobile: **~US$ 81,75 bilhões** em 2025, com cerca de **3 bilhões de jogadores** mobile no mundo.
- H1 2026: US$ 40 bilhões em gasto de jogadores mobile globalmente (Google Play + App Store), leve queda (<1%) ano a ano — mercado maduro, não mais em hiper-crescimento.
- **Estratégia** é o gênero que mais fatura globalmente, mas caiu 4% YoY em H1 2026; **RPG** caiu 14% YoY; **Puzzle** cresceu **20% YoY**, tornando-se o gênero de maior "momentum" no período.
- Por **downloads**, Simulação/Arcade/Puzzle dominam (baixa barreira de entrada, apelo massivo). Por **receita**, Estratégia e RPG dominam (economias profundas, monetização de "pagantes" de longo prazo).
- No Brasil: **Free Fire** (battle royale, ~100–150 milhões de usuários ativos mensais, partidas curtas de ~30 min, roda bem em aparelhos de entrada), **Roblox** (~380 milhões de MAU global, plataforma social de criação, forte entre jovens), **Brawl Stars** (crescimento expressivo, comunidade brasileira entre as mais ativas do mundo), além de Stumble Guys, Candy Crush Saga, Royal Match e Call of Duty Mobile.

### 3.2 O que isso significa para um jogo focado em jovens

- **Acessibilidade de hardware é decisiva no Brasil e América Latina**: os maiores sucessos entre jovens (Free Fire, Stumble Guys) são otimizados para aparelhos Android de entrada, não para os iPhones mais recentes.
- **Sessões curtas (5–15 min) e "fáceis de entrar, difíceis de dominar"** são o padrão de jogos que se tornam virais entre adolescentes (battle royale rápido, party games de eliminação, puzzle competitivo).
- **Efeito de "sazonalidade escolar"**: picos de download/receita de jogos populares entre jovens (Roblox, Free Fire, Subway Surfers) coincidem com férias escolares — um dado útil para planejar o timing de lançamento e campanhas de aquisição.
- **Nostalgia e cultura de criador de conteúdo (TikTok/YouTube)** são hoje motores de descoberta tão fortes quanto os rankings das lojas — jogos com momentos "clipáveis" (quedas, eliminações, customização visual) crescem organicamente.

---

## 4. Perfil do público jovem (Gen Z / Gen Alpha)

| Característica | Implicação de design |
|---|---|
| Sessões curtas, jogadas em qualquer lugar (escola, transporte) | Partidas de 1–5 minutos, retomáveis, sem tela de carregamento longa |
| Forte componente social (jogar com amigos, mostrar progresso) | Multiplayer leve, sistemas de convite, replays/clipes compartilháveis |
| Sensibilidade a "pay-to-win" é alta e gera backlash público | Monetização cosmética e conveniência, nunca vantagem competitiva paga |
| Consome conteúdo de criadores (TikTok/YouTube/Twitch) antes de decidir instalar | Mecânicas visuais e "momentos virais" desenhados de propósito (fail moments, big win moments) |
| Parcela relevante do público é menor de 13 anos (ainda que o jogo não seja "infantil") | Compliance de privacidade e monetização para menores é obrigatório, não opcional (ver seção 7) |
| Dispositivos variados, incluindo Android de entrada | Otimização de performance e app leve (poucos MB) é vantagem competitiva real |

---

## 5. Benchmark de concorrentes de referência

| Jogo | Gênero | Por que funciona com jovens | Monetização |
|---|---|---|---|
| **Roblox** | Plataforma UGC | Infinita variedade de conteúdo criado pela comunidade; jogar com amigos; identidade via avatar | Robux (moeda), taxas sobre criadores |
| **Free Fire** | Battle royale | Partidas curtas (~30 min), roda em hardware fraco, eventos/temas frequentes (ex.: crossover Naruto) | Skins, passes de temporada |
| **Brawl Stars / Stumble Guys** | Party / arena casual | Fácil de aprender, sessões muito curtas, alto potencial de "clipe engraçado" para redes sociais | Cosméticos, passe de temporada |
| **Royal Match / Candy Crush** | Puzzle | Progressão viciante, eventos sociais (guildas/times), baixa barreira de entrada | Vidas, boosters, passe |
| **Subway Surfers** | Arcade/runner | Sessão de segundos, extremamente leve, personagens colecionáveis | Cosméticos, moeda, anúncios |

**Padrão comum:** todos combinam (a) barreira de entrada quase zero, (b) camada social/competitiva leve, (c) identidade visual customizável, (d) eventos de conteúdo recorrentes. Nenhum dos maiores sucessos entre jovens depende de mecânicas "pay-to-win" agressivas — a monetização é cosmética ou de conveniência.

---

## 6. Riscos regulatórios e legais (crítico para público jovem)

Esta é a seção mais sensível e mais importante para um jogo pensado para jovens — e onde erros custam caro (multas e banimento de loja).

1. **Lei nº 15.211/2025 ("Lei Felca") — Brasil, em vigor desde 17/03/2026**: proíbe **caixas de recompensa pagas (loot boxes), gacha e qualquer compra com resultado randômico** em jogos acessíveis a menores de 18 anos; exige verificação de idade e controles parentais. Multas de até 10% da receita, limitadas a R$ 50 milhões. **Implicação direta: NÃO desenhar o jogo em torno de gacha/loot box se o público-alvo inclui menores — o que é o caso aqui.**
2. **COPPA (EUA) — regra atualizada, obrigatória a partir de 22/04/2026**: exige consentimento parental verificável separado para publicidade direcionada e compartilhamento de dados com terceiros, minimização e prazo de retenção de dados. Aplica-se sempre que houver "motivo para saber" que há usuários menores de 13 anos — não é possível se eximir apenas por não perguntar a idade.
3. **Apple App Store**: exige política de privacidade, "parental gate" antes de compras/links externos em apps voltados a crianças, e **divulgação obrigatória das probabilidades de qualquer mecanismo de loot box**, para qualquer público.
4. **Google Play / IARC**: classificação de idade automatizada (gratuita) via questionário único, replicada para as lojas participantes — processo simples e sem custo, mas as respostas devem refletir o conteúdo real (inconsistência gera risco de banimento e investigação).
5. **Precedente relevante**: a FTC multou a HoYoverse (Genshin Impact) em US$ 20 milhões e proibiu venda de loot boxes a menores de 16 sem consentimento parental verificável, citando estética "apelativa a crianças" como evidência — mesmo o jogo não sendo comercializado oficialmente como infantil. Isso mostra que a estética/arte do jogo também é considerada evidência de público-alvo pelas autoridades.

**Recomendação de design derivada:** monetizar via (a) anúncios recompensados opcionais, (b) passe de temporada com conteúdo fixo (não randômico), (c) cosméticos com preço fixo e visualização prévia. Evitar qualquer sistema de "caixa surpresa" paga. Isso também reduz risco de reputação e de remoção da loja, que hoje é tão grande quanto o risco financeiro direto.

---

## 7. Escolha tecnológica

| Critério | Godot 4.x | Unity 6 (LTS) |
|---|---|---|
| Custo | Gratuito (MIT), sem royalties em qualquer receita | Gratuito até US$ 200k/ano de receita; acima disso, ~US$ 2.310/assento/ano |
| Melhor para | 2D e 3D estilizado, times pequenos/solo, prototipagem rápida | 3D mais robusto, mobile com monetização/anúncios complexos, mediação de anúncios madura (LevelPlay/IronSource), acesso a console |
| Ecossistema de anúncios/mediação | Requer integrar 3–5 SDKs de terceiros manualmente | Ecossistema maduro e único ponto de integração |
| Curva de aprendizado | Baixa (GDScript), iteração muito rápida | Média (C#), editor mais pesado |
| Risco de política de preço | Nenhum (open source) | Moderado (histórico de mudanças de cobrança em 2023) |

**Recomendação:** para um primeiro conceito casual/hybridcasual 2D ou 3D estilizado, **Godot é a opção de menor risco financeiro para validar a ideia** (zero custo de licença, app leve — importante para o público de aparelhos de entrada). Se o conceito validado exigir forte monetização por anúncios em escala com mediação sofisticada, migrar/reconstruir em Unity é uma decisão de segunda fase, não de MVP.

Alternativas a considerar para prototipagem ainda mais rápida (game jam / teste de conceito antes até do Godot): Flutter + Flame (se a equipe já for de app mobile) ou motor HTML5 (Phaser) para testar a mecânica no navegador antes de investir em build nativo.

---

## 8. Monetização recomendada

Dado o público (jovem, com parcela menor de idade) e a regulação vigente:

1. **Anúncios recompensados (rewarded video)** como base — vidas extra, moeda bônus, revive. Este é hoje o modelo dominante em jogos hipercasuais/casuais e é o mais seguro do ponto de vista regulatório.
2. **Passe de temporada / battle pass com conteúdo fixo e visível antes da compra** (sem randomização).
3. **Loja de cosméticos com preço fixo**, sem "caixas misteriosas".
4. **Sem gacha/loot box** — inviável legalmente para o público-alvo a partir de março/2026 no Brasil e sob crescente escrutínio nos EUA/Europa.
5. **IAP de conveniência não-competitiva** (remover anúncios, acelerar progressão cosmética) — não deve conceder vantagem competitiva.

Referência de mercado: ARPDAU de anúncios em jogos hipercasuais roda em torno de **US$ 0,08–US$ 0,25 por usuário ativo diário**, o que exige retenção sólida em D7/D30 para sustentar o modelo — retenção, não apenas volume de downloads, deve ser a métrica-chave de validação do MVP.

---

## 9. Custo estimado de aquisição de usuários (UA)

| Fase | Investimento sugerido | Objetivo |
|---|---|---|
| Teste de "vendabilidade" (marketability test) | US$ 600–1.200 por região/plataforma | Validar CPI real e retenção inicial com 4–8 criativos, ~300 instalações |
| Validação econômica | US$ 2.000–5.000 | Obter cohort suficiente para estimar LTV com confiança |
| Escala (somente se LTV/CPI ≥ 1,5x) | US$ 3.000–15.000+/dia | Crescimento sustentado |

Benchmarks de CPI (2026, referência global/Tier 1): hipercasual Android US$ 0,30–1,20 / iOS US$ 0,80–2,50; casual/puzzle Android US$ 1,20–3,00 / iOS US$ 2,50–6,00. **Na América Latina (incluindo Brasil), os CPIs tendem a ser 3–5x menores que em mercados Tier 1 (US/Europa)**, o que torna a região um bom mercado de teste antes de qualquer expansão para mercados mais caros.

---

## 10. Conceitos de jogo propostos

Sete conceitos (A–G), todos alinhados aos padrões de sucesso identificados (entrada fácil, sessão curta, social leve, monetização cosmética, baixo custo de produção inicial). Os três primeiros (A–C) foram a proposta inicial; D–G foram adicionados para cobrir públicos e gêneros que A–C não cobrem (ex.: público mais casual/feminino, sessões passivas, cultura de criador de música, jogos para grupos de amigos presencialmente).

### Conceito A — "Party Royale" casual (recomendado como primeira aposta)
Arena de eliminação estilo Stumble Guys/Fall Guys, partidas de 2–3 minutos, até 16–32 jogadores (ou bots preenchendo vagas no início), física exagerada e cômica (alto potencial de "clipe engraçado" para TikTok). Progressão via cosméticos de personagem. Multiplayer leve via servidor simples (ex.: Photon, Nakama ou backend próprio minimalista).
- **Motor sugerido:** Godot (3D estilizado) ou Unity se já houver experiência com netcode.
- **Risco:** exige infraestrutura de servidor/matchmaking desde o início (maior complexidade técnica que os outros dois conceitos).

### Conceito B — Puzzle competitivo social
Puzzle tipo match-3 ou physics-puzzle com "duelos" assíncronos entre amigos (ex.: melhor pontuação da semana, desafios enviados por chat/link). Aproveita o gênero de maior crescimento em 2026 (Puzzle, +20% YoY) e é o mais barato/rápido de prototipar e validar.
- **Motor sugerido:** Godot 2D.
- **Risco:** gênero mais saturado (Royal Match, Candy Crush já dominantes); diferenciação precisa vir do ângulo social/competitivo, não da mecânica em si.

### Conceito C — Mini-plataforma de criação leve (UGC "light")
Um jogo-base simples (ex.: corrida, decoração de espaço, customização de avatar) com um editor simples de níveis/skins que os próprios jogadores podem criar e compartilhar — versão enxuta da lógica do Roblox, sem tentar competir com a escala da plataforma.
- **Motor sugerido:** Unity (ferramentas de editor em runtime são mais maduras) ou motor customizado leve.
- **Risco:** maior complexidade de produto e moderação de conteúdo gerado por usuários (segurança infantil, moderação de texto/imagem) — exige investimento extra em ferramentas de moderação desde o dia 1 por conta da base de usuários jovem.

### Conceito D — Simulação "cozy" de vida/decoração
Jogo de simulação leve e relaxante (decorar uma casa, cuidar de um jardim/loja, gerenciar uma fazenda pequena), no estilo Gossip Harbor/Heartopia/Township. Este é hoje o gênero de **maior crescimento sustentado** identificado nesta auditoria: simulação lidera downloads em ambas as lojas, cresceu 18% em receita de IAP ano a ano (superando ação e estratégia pelo segundo ano consecutivo), e o subgênero "Life Sim" cresceu 76% em receita e 30% em downloads apenas no primeiro semestre de 2026 (referência: Heartopia, lançado em janeiro de 2026, já entrou no top 3 de receita do gênero). É também o gênero mais associado ao público feminino jovem, hoje uma parcela relevante e sub-atendida pelos Conceitos A–C (mais orientados a ação/competição).
- **Motor sugerido:** Godot 2D/3D estilizado (arte de baixo custo, foco em UI/decoração, não em física ou netcode).
- **Monetização:** cosméticos de decoração/roupas com preço fixo, "passe" sazonal com conteúdo visível, sem gacha. CPI historicamente mais baixo que ação/estratégia, com jogadores mais fiéis (menos rotatividade).
- **Risco:** exige produção de conteúdo visual constante (itens de decoração, roupas, eventos temáticos) para sustentar retenção de longo prazo — maior dependência de arte/conteúdo do que os outros conceitos.

### Conceito E — Colecionável "idle" de criaturas fofas
Jogo de progressão passiva (idle/incremental): o jogador coleciona, evolui e organiza criaturas ou personagens fofos que rendem recursos com o tempo, mesmo com o app fechado. Sessões ativas curtas (checar, coletar, comprar upgrade) e recompensa por retorno recorrente. O gênero idle evoluiu de "hipercasual descartável" para modelos híbridos com meta-progressão de longo prazo — os melhores títulos de 2026 medem retenção D30 de 5–10%, bem acima da média do mercado mobile em geral (abaixo de 3%).
- **Motor sugerido:** Godot 2D ou até um app leve (Flutter/Flame), já que a exigência gráfica é baixa.
- **Monetização:** IAP de "compressão de tempo" (acelerar progresso, colecionáveis extras por compra direta e visível — não por caixa aleatória) + anúncios recompensados opcionais para multiplicar recompensas. Modelo bem alinhado à Lei Felca por não depender de randomização paga.
- **Risco:** o gênero é competitivo e às vezes visto como "sem profundidade"; precisa de um tema/arte com identidade forte (mascotes fofos e colecionáveis têm apelo comprovado com Gen Alpha) para se diferenciar.

### Conceito F — Jogo de ritmo musical (sem gacha)
Jogo de ritmo (tocar/tocar em tempo com a música, estilo "piano tiles" evoluído) com trilha voltada a tendências do TikTok e músicas licenciadas/originais. O gênero de ritmo é hoje fortemente ligado à cultura de criadores e fandom (K-pop, VTubers, anime) e gera engajamento por conteúdo de artista exclusivo. **Atenção:** os líderes atuais do gênero (Rhythm Hive, D4DJ, Project Sekai) monetizam majoritariamente via cartas/personagens em sistema gacha — o que **entra em conflito direto com a Lei Felca e a COPPA** para o público jovem (seção 6). A recomendação aqui é uma versão sem gacha: desbloqueio de músicas e personagens por progressão determinística (não randômica), com cosméticos de preço fixo.
- **Motor sugerido:** Unity (melhor precisão de timing de áudio/input em mobile) ou Godot com testes cuidadosos de latência de áudio.
- **Monetização:** desbloqueio de trilhas/personagens por compra direta ou progressão, passe de temporada, sem loot box de personagens.
- **Risco:** maior custo de licenciamento musical se depender de músicas conhecidas; viável com música original/royalty-free e parcerias com criadores emergentes em vez de grandes labels no MVP.

### Conceito G — Festa social de blefe/trivia entre amigos
Jogo de festa (2 a 20 jogadores, cada um no próprio celular) com rodadas curtas (10–15 minutos) de perguntas/trivia onde os jogadores escrevem respostas falsas convincentes para enganar os amigos e pontuam por acertar a real ou por enganar os outros (mecânica de "blefe social", como Zarta!/BLFFD/Jackbox). Pensado para ser jogado presencialmente (em uma sala de aula, festa, viagem) ou remotamente com amigos. É o conceito de **menor complexidade técnica e menor risco regulatório** de todos os sete, pois não depende de física em tempo real nem de progressão monetizável agressiva — o valor está inteiramente na interação social entre amigos reais.
- **Motor sugerido:** qualquer stack simples (Godot, Flutter, ou até web app) — o desafio técnico real é sincronização de sala (ex.: Firebase/Supabase Realtime, ou WebSocket simples), não gráficos.
- **Monetização:** anúncios entre rodadas + pacotes de categorias/temas extras de perguntas (compra direta, sem randomização). Modelo de baixíssimo custo de produção contínua se a comunidade puder sugerir/votar perguntas.
- **Risco:** menor potencial de sessão "sozinho" (depende de ter amigos jogando ao mesmo tempo), o que exige um bom mecanismo de convite/compartilhamento de sala para crescer; potencial viral menor em vídeo curto do que os conceitos de ação (A) ou ritmo (F), mas mais forte em retenção de grupo/boca a boca real.

### Matriz de priorização

| Critério | A — Party Royale | B — Puzzle Social | C — UGC Light | D — Cozy Sim | E — Idle Collector | F — Ritmo Musical | G — Festa/Trivia |
|---|---|---|---|---|---|---|---|
| Alinhamento com tendência de mercado | Alto | Alto | Médio | Muito alto (maior crescimento) | Médio-Alto | Alto (nicho fandom) | Médio |
| Custo/tempo de MVP | Médio | Baixo | Alto | Médio (depende de arte) | Baixo | Médio-Alto (áudio/licenciamento) | Baixo |
| Potencial viral orgânico (TikTok/YouTube) | Alto | Médio | Médio-Alto | Médio | Baixo-Médio | Alto (cultura de fandom) | Médio (boca a boca) |
| Complexidade técnica (rede, moderação) | Média-Alta | Baixa | Alta | Baixa | Baixa | Média (timing de áudio) | Baixa-Média (salas) |
| Risco regulatório | Baixo | Baixo | Médio (moderação de UGC) | Baixo | Baixo | Médio (evitar gacha do gênero) | Baixo |
| Público prioritário | Misto, mais masculino | Misto | Misto | Mais feminino/casual | Misto, sessões passivas | Fãs de música/fandom | Grupos de amigos |
| **Recomendação** | **Validar primeiro (MVP mais barato: modo 1 mapa, bots)** | Alternativa de baixo risco/baixo custo | Ambição de longo prazo, não para MVP | **Forte 2ª aposta** — maior tendência de mercado e público complementar a A | 3ª aposta de baixo custo/risco | Só viável sem gacha; maior risco de execução | Excelente teste de baixíssimo custo, mas depende de efeito de rede social |

---

## 11. SWOT resumido

**Forças:** mercado jovem mobile é enorme e engajado; modelos de monetização não-abusivos são hoje vistos favoravelmente por usuários e reguladores; América Latina é mercado de teste barato.

**Fraquezas:** equipe/orçamento ainda não dimensionados neste documento; ausência de IP ou base de usuários prévia; concorrência com marcas já consolidadas (Free Fire, Roblox, Brawl Stars).

**Oportunidades:** gênero puzzle em alta; hybridcasual crescendo em monetização mais rápido que casual tradicional; janelas de férias escolares para lançamento/campanhas; nicho regional (BR/LatAm) com CPI baixo para testes.

**Ameaças:** saturação de app stores; fadiga de criativos de UA (3–10 dias); mudanças regulatórias rápidas para menores (Lei Felca, COPPA); dependência de plataformas de terceiros (TikTok/redes) para tração orgânica.

---

## 12. Roteiro recomendado

1. **Semana(s) de prototipagem de conceito** — escolher 1 conceito (recomendado: A, com D como forte candidato complementar/alternativo) e construir um protótipo jogável mínimo (1 mapa, sem monetização, sem backend completo) para testar se a mecânica é "divertida em 30 segundos". *(Atualização: o protótipo do Conceito A já foi construído e validado tecnicamente em `prototype/party-royale/` — ver README daquela pasta.)*
2. **Teste com público real** (grupo pequeno de adolescentes reais ou comunidade beta) — medir retenção de sessão e reação emocional, não apenas "funciona tecnicamente".
3. **MVP com anúncio recompensado básico + 1 loop de progressão cosmética.**
4. **Teste de mercado pago de baixo orçamento** (seção 9, fase de "vendabilidade") em 1–2 países de CPI baixo (ex.: Brasil) para validar CPI, D1/D7 de retenção antes de qualquer decisão de escala.
5. **Somente após retenção D7 saudável e LTV/CPI ≥ 1,5x**, considerar soft launch mais amplo e investimento em UA de escala.
6. Implementar compliance de privacidade/idade (parental gate, IARC, política de privacidade, ausência de loot box) **antes** do soft launch, não depois.

---

## 13. Conclusão

Existe uma oportunidade real e bem documentada para um jogo mobile popular entre jovens, mas o caminho de menor risco não é competir diretamente com estratégia/RPG (onde a receita é maior, porém a barreira de entrada, custo e tempo de produção também são muito maiores), e sim um **conceito hybridcasual social, leve, com monetização não-abusiva**, testado com orçamento pequeno primeiro no Brasil/LatAm antes de qualquer escala internacional.

Este documento define uma base de decisão; os próximos passos técnicos (prototipagem dos demais conceitos, definição de arquitetura de backend/matchmaking, estrutura de projeto no motor escolhido) podem ser iniciados como etapas seguintes deste repositório. Com sete conceitos mapeados (A–G) cobrindo ação social, puzzle, UGC, simulação "cozy", idle, ritmo musical e festa/trivia, há hoje opções suficientes para escolher com base em apetite de risco, orçamento e afinidade da equipe, em vez de depender de uma única aposta.

### Fontes consultadas
- Sensor Tower / AppMagic — rankings globais de jogos mobile, julho de 2026 e H1 2026
- Meaning Planet, Bottega del Sarto, gamedevreports (Sensor Tower/AppMagic H1 2026) — tendências de simulação "cozy" e life sim 2026
- Deduenas (Hybrid Insights), Apptrove, Adapty — tendências e benchmarks de jogos idle/incremental 2026
- Marlvel.ai, MMO.Net, Pocket Tactics — panorama de jogos de ritmo musical e monetização gacha 2026
- Zarta!, BLFFD, Trivio.net, Triviarena — panorama de jogos de festa/trivia social multiplayer 2026
- Singular, ASOMobile, Axis Intelligence, PocketGamer.biz — análises de gênero e receita 2025–2026
- Games Data, Pesquisa Game Brasil 2025, Free Fire Mania — panorama do mercado brasileiro
- GameGrowthAdvisor, Promise Legal, GGWP, Apple Developer Guidelines — regulação COPPA/Lei Felca/App Store 2026
- Tech Insider, Shattered.io, Choost Games, Egmatic, RocketBrush — comparativos Unity vs. Godot 2026
- Floods Blog, FoxData, Admiral Media, Digital Applied — benchmarks de CPI/UA 2026
