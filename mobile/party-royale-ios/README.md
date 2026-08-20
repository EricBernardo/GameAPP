# Party Royale — Empacotamento nativo iOS (Capacitor)

Projeto iOS gerado a partir do mesmo protótipo web do [`prototype/party-royale`](../../prototype/party-royale) e do app Android em [`mobile/party-royale-android`](../party-royale-android), usando [Capacitor](https://capacitorjs.com/) — o mesmo HTML/CSS/JS do jogo, empacotado como app nativo iOS (WKWebView), sem reescrever nada.

## Por que isso é diferente do Android

No Android, um `.apk` de debug pode ser instalado em qualquer aparelho sem conta nenhuma — foi por isso que já entreguei um `.apk` pronto em [`mobile/party-royale-android/party-royale-debug.apk`](../party-royale-android/party-royale-debug.apk).

**No iOS não existe esse caminho.** A Apple exige que absolutamente todo app rodando em um iPhone físico esteja assinado digitalmente, e essa assinatura só pode ser feita:
- Com o **Xcode rodando em um Mac** (não existe Xcode para Windows/Linux — é uma decisão da própria Apple, não uma limitação deste projeto), e
- Vinculada a um **Apple ID** (gratuito, mas o app expira em 7 dias e precisa reinstalar) ou a uma **conta Apple Developer paga** (US$ 99/ano, permite TestFlight e apps de longa duração).

Por isso, ao contrário do Android, não existe uma forma de gerar um arquivo `.ipa` "pronto para instalar em qualquer iPhone" sem passar por essa etapa em algum momento.

## O que já foi feito aqui (sem precisar de Mac)

- Projeto Xcode completo gerado (`ios/App/App.xcworkspace`, `ios/App/App.xcodeproj`, `AppDelegate.swift`, `Info.plist`, ícone e splash screen já configurados) — pronto para abrir direto no Xcode assim que houver acesso a um Mac.
- Um workflow de CI (`.github/workflows/ios-build.yml`) que usa um runner **macOS real do GitHub Actions** (que já vem com Xcode e CocoaPods instalados) para compilar o app automaticamente a cada mudança — provando que o projeto compila de ponta a ponta, sem que eu (ou você) precise ter um Mac.

## A limitação real desse CI

O build automático gera uma versão para o **Simulador de iOS** (`-sdk iphonesimulator`), **sem assinatura de código** — por isso não precisa de nenhuma conta Apple. Isso é ótimo para confirmar que o app compila corretamente, mas **um build de simulador não roda em um iPhone físico** (são arquiteturas/formatos de binário diferentes; a Apple também bloqueia a instalação de qualquer app sem assinatura em hardware real).

## Como rodar em um iPhone físico de verdade

Alguém precisa, em algum momento, ter acesso a um Mac (próprio, de um amigo, ou um serviço de "Mac na nuvem" como MacStadium/AWS EC2 Mac). A partir daí, as opções são:

1. **Caminho grátis (rápido, mas temporário):** abrir `ios/App/App.xcworkspace` no Xcode, conectar o iPhone por cabo, fazer login com um Apple ID pessoal (de graça) em Xcode → Settings → Accounts, e clicar em "Run". O app instala e funciona por 7 dias, depois precisa reinstalar do mesmo jeito.
2. **Caminho para distribuição real (TestFlight):** com uma conta Apple Developer (US$ 99/ano), gerar um build assinado com certificado de distribuição e enviar para o TestFlight — aí qualquer pessoa com o link consegue instalar e testar sem precisar de Xcode. Isso pode ser automatizado (ex.: Fastlane + GitHub Actions com os certificados como secrets), mas exige as credenciais da conta Apple Developer, que este ambiente não tem e não deveria ter acesso direto.

## Enquanto isso: teste no iPhone hoje mesmo, sem nenhuma dessas etapas

A forma que **já funciona agora**, sem Mac e sem conta Apple, é a versão **PWA** do protótipo: abra `prototype/party-royale` no Safari do iPhone e use "Adicionar à Tela de Início" — ganha ícone próprio, tela cheia, funciona quase como um app nativo. Não é um `.ipa`, mas resolve o objetivo prático de "jogar no iPhone" imediatamente. Veja [`prototype/party-royale/README.md`](../../prototype/party-royale/README.md).

## Rebuild manual (se você tiver um Mac)

```bash
cd mobile/party-royale-ios
npm install
cp -r ../../prototype/party-royale/. www/
npx cap sync ios
open ios/App/App.xcworkspace
# No Xcode: selecione um simulador ou dispositivo e clique em Run.
```
