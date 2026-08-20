# Party Royale — Empacotamento nativo Android (Capacitor)

Este é o **primeiro build Android real** (`.apk` instalável) gerado a partir do protótipo web [`prototype/party-royale`](../../prototype/party-royale), usando [Capacitor](https://capacitorjs.com/) para empacotar o mesmo código HTML/CSS/JS dentro de um app Android nativo (WebView), sem reescrever nada do jogo.

## Baixar e instalar agora

Um APK de debug já compilado está neste diretório: [`party-royale-debug.apk`](./party-royale-debug.apk) (~4 MB).

**Como instalar no seu Android:**
1. Baixe o arquivo `party-royale-debug.apk` no celular (ex.: baixando direto do GitHub, ou transferindo por cabo/Drive/WhatsApp).
2. Toque no arquivo baixado. Se aparecer um aviso de "instalar apps desconhecidos", permita para o app usado para abrir o arquivo (Chrome, Arquivos, etc.) — isso é esperado para um APK de teste que não veio da Google Play.
3. Toque em "Instalar". O ícone "Party Royale" aparecerá na tela de apps.

> É um build de **debug**, assinado com uma chave de desenvolvimento (não a chave de produção da Google Play) — perfeito para testes internos, mas não deve ser distribuído como release final.

## Rebuild automático (CI)

Um workflow do GitHub Actions (`.github/workflows/android-apk.yml`) recompila este app a cada mudança em `mobile/party-royale-android/` (ou manualmente via "Run workflow" na aba Actions do GitHub) e disponibiliza o `.apk` mais recente como artefato de build, baixável direto da aba **Actions** do repositório — sem precisar de nenhum ambiente local.

## Rebuild manual (local)

Requer Node.js, JDK 17+ e o Android SDK (`cmdline-tools`, `platform-tools`, `platforms;android-34`, `build-tools;34.0.0`).

```bash
cd mobile/party-royale-android
npm install
npx cap sync android
cd android
./gradlew assembleDebug
# APK gerado em android/app/build/outputs/apk/debug/app-debug.apk
```

Se o código do jogo em `prototype/party-royale` mudar, copie os arquivos atualizados para `www/` antes de sincronizar:

```bash
cp -r ../../prototype/party-royale/. www/
npx cap sync android
```

## E o iOS?

Compilar e testar um app iOS de verdade **exige um Mac com Xcode** — não é possível fazer isso neste ambiente Linux. O código web é o mesmo para as duas plataformas, então gerar o projeto iOS do Capacitor (`npx cap add ios`) é trivial tecnicamente, mas a compilação/assinatura/teste em iPhone real (ou envio para TestFlight) precisa acontecer em uma máquina com macOS — seja um Mac físico, seja um serviço de CI em nuvem com runner macOS (ex.: GitHub Actions com `runs-on: macos-latest`, Codemagic, Bitrise). Enquanto isso, a forma real de testar no iPhone é a versão PWA do protótipo (ver [`prototype/party-royale/README.md`](../../prototype/party-royale/README.md)) direto no Safari, com "Adicionar à Tela de Início".

## Próximos passos

1. Testar a instalação em pelo menos um Android real (o mais importante: confirmar que os controles de toque e o áudio funcionam dentro do WebView nativo, que pode se comportar sutilmente diferente do navegador).
2. Se aprovado, gerar um build de **release** assinado com uma keystore própria (não incluída aqui por segurança) antes de qualquer distribuição além de testes internos.
3. Repetir o mesmo processo de empacotamento para os outros 6 protótipos, se algum deles avançar para essa fase.
