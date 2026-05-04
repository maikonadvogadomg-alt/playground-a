# Assistente Jurídico IA — Como Compilar o APK

## O que é este projeto
App Android nativo que abre o Assistente Jurídico IA num WebView.
- Funciona como app real instalado no celular
- Botão voltar do Android funciona normalmente
- Salva a URL do servidor no aparelho
- Tela de erro quando o servidor estiver offline

## Conta EAS configurada
- Conta: maikons-individual-orga2
- Projeto: assistente-juridico
- ProjectID: cdf4f804-8f80-4135-8a15-4b60a9f304b0

## Compilar via EAS (recomendado)
Execute no Termux ou terminal:

  pkg install nodejs
  npm install -g eas-cli
  npm install
  eas login
  EAS_NO_VCS=1 eas build --platform android --profile preview

O APK ficará disponível em:
https://expo.dev/accounts/maikons-individual-orga2/projects/assistente-juridico/builds

## Após instalar o APK
Cole a URL do servidor Replit quando o app pedir.
Exemplo: https://assistente-juridico.seuusuario.replit.app
