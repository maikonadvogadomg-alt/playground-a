# 📋 Plano do Projeto: Assistente Jurídico IA

**Gerado em:** 02/05/2026 06:59:47

---

## 📊 Visão Geral

| Item | Valor |
|------|-------|
| Total de arquivos | 134 |
| Total de linhas | 37.206 |
| Linguagens | 8 |
| Rotas de API | 20 |

---

## 🌳 Árvore de Arquivos

```
📋 app.json
🔷 App.tsx
🟡 babel.config.js
📄 .env
🔷 api.ts
🟠 index.html
🔷 index.ts
🟠 auditoria.html
📄 codigo-formatacao.txt
🟠 comparador.html
📄 favicon.png
📄 icon-192.png
📄 icon-384.png
📄 icon-512.png
📄 icon-96.png
📋 manifest.json
🟡 sw.js
🟡 audio-playback-worklet.js
🔷 audio-utils.ts
🔷 index.ts
🔷 useAudioPlayback.ts
🔷 useVoiceRecorder.ts
🔷 useVoiceStream.ts
🔷 App.tsx
🔷 pwa-install.tsx
🔷 theme-provider.tsx
🔷 theme-toggle.tsx
🔷 tiptap-editor.tsx
🔷 accordion.tsx
🔷 alert-dialog.tsx
🔷 alert.tsx
🔷 aspect-ratio.tsx
🔷 avatar.tsx
🔷 badge.tsx
🔷 breadcrumb.tsx
🔷 button.tsx
🔷 calendar.tsx
🔷 card.tsx
🔷 carousel.tsx
🔷 chart.tsx
🔷 checkbox.tsx
🔷 collapsible.tsx
🔷 command.tsx
🔷 context-menu.tsx
🔷 dialog.tsx
🔷 drawer.tsx
🔷 dropdown-menu.tsx
🔷 form.tsx
🔷 hover-card.tsx
🔷 input-otp.tsx
🔷 input.tsx
🔷 label.tsx
🔷 menubar.tsx
🔷 navigation-menu.tsx
🔷 pagination.tsx
🔷 popover.tsx
🔷 progress.tsx
🔷 radio-group.tsx
🔷 resizable.tsx
🔷 scroll-area.tsx
🔷 select.tsx
🔷 separator.tsx
🔷 sheet.tsx
🔷 sidebar.tsx
🔷 skeleton.tsx
🔷 slider.tsx
🔷 switch.tsx
🔷 table.tsx
🔷 tabs.tsx
🔷 textarea.tsx
🔷 toast.tsx
🔷 toaster.tsx
🔷 toggle-group.tsx
🔷 toggle.tsx
🔷 tooltip.tsx
🔷 use-mobile.tsx
🔷 use-toast.ts
💜 index.css
🔷 queryClient.ts
🔷 utils.ts
🔷 main.tsx
🔷 auditoria-financeira.tsx
🔷 code-assistant.tsx
🔷 comparador-juridico.tsx
🔷 comunicacoes-cnj.tsx
🔷 configuracoes.tsx
🔷 consulta-corporativo.tsx
🔷 consulta-pdpj.tsx
🔷 consulta-processual.tsx
🔷 filtrador.tsx
🔷 jurisprudencia.tsx
🔷 legal-assistant.tsx
🔷 login.tsx
🔷 not-found.tsx
🔷 painel-processos.tsx
🔷 playground.tsx
🔷 previdenciario.tsx
🔷 robo-djen.tsx
🔷 token-generator.tsx
🔷 tramitacao.tsx
📝 COMO_COMPILAR.md
📋 components.json
🔷 drizzle.config.ts
📋 eas.json
🟠 index.html
🗄️ 0000_init.sql
📋 _journal.json
📋 0000_snapshot.json
📋 package.json
🟡 postcss.config.js
🔷 db.ts
🔷 djen.ts
🔷 index.ts
🔷 local-config.ts
🔷 client.ts
🔷 index.ts
🔷 routes.ts
🔷 index.ts
🔷 utils.ts
🔷 index.ts
🔷 routes.ts
🔷 storage.ts
🔷 client.ts
🔷 index.ts
🔷 routes.ts
🔷 routes.ts
🔷 static.ts
🔷 storage.ts
🔷 vite.ts
🔷 chat.ts
🔷 schema.ts
🔷 tailwind.config.ts
📋 tsconfig.json
🔷 vite.config.ts
```

---

## 🗣️ Linguagens

🔷 typescript: 108 arquivos
📋 json: 8 arquivos
📄 plaintext: 7 arquivos
🟡 javascript: 4 arquivos
🟠 html: 4 arquivos
📝 markdown: 1 arquivo
💜 css: 1 arquivo
🗄️ sql: 1 arquivo

---

## 🚀 Pontos de Entrada

  • index.ts
  • index.html

---

## 🔌 Rotas de API Detectadas

  `/API/TTS /api/tts` — code-assistant.tsx
  `/API/CODE-ASSISTANT /api/code-assistant` — code-assistant.tsx
  `/API/CODE-ASSISTANT /api/code-assistant` — code-assistant.tsx
  `/API/CNJ/COMUNICACOES /api/cnj/comunicacoes` — comunicacoes-cnj.tsx
  `/API/SETTINGS/AI-CONFIG /api/settings/ai-config` — configuracoes.tsx
  `/API/SETTINGS/SYSTEM-STATUS /api/settings/system-status` — configuracoes.tsx
  `/API/SETTINGS/TEST-AI-KEY /api/settings/test-ai-key` — configuracoes.tsx
  `/API/SETTINGS/AI-CONFIG /api/settings/ai-config` — configuracoes.tsx
  `/API/SETTINGS/DATABASE-RECONNECT /api/settings/database-reconnect` — configuracoes.tsx
  `/API/SETTINGS/APP-PASSWORD /api/settings/app-password` — configuracoes.tsx
  `/API/CORPORATIVO/ADVOGADO/CPF/${CPFCLEAN} /api/corporativo/advogado/cpf/${cpfClean}` — consulta-corporativo.tsx
  `/API/CORPORATIVO/ADVOGADO/OAB/${OABUF}/${NUM} /api/corporativo/advogado/oab/${oabUf}/${num}` — consulta-corporativo.tsx
  `/API/CORPORATIVO/MAGISTRADOS/${MAGTRIBUNAL} /api/corporativo/magistrados/${magTribunal}` — consulta-corporativo.tsx
  `/API/PDPJ/STATUS /api/pdpj/status` — consulta-pdpj.tsx
  `/API/PDPJ/TEST-CONNECTION /api/pdpj/test-connection` — consulta-pdpj.tsx
  `/API/PDPJ/COMUNICACOES /api/pdpj/comunicacoes` — consulta-pdpj.tsx
  `/API/PDPJ/REPRESENTADOS /api/pdpj/representados` — consulta-pdpj.tsx
  `/API/PDPJ/HABILITACAO /api/pdpj/habilitacao` — consulta-pdpj.tsx
  `/API/PDPJ/PESSOA /api/pdpj/pessoa` — consulta-pdpj.tsx
  `/API/DATAJUD/CONSULTA /api/datajud/consulta` — consulta-processual.tsx

---

## 💡 Sugestões de Melhoria

  📝 Adicionar README.md com instruções do projeto
  🚫 Adicionar .gitignore para evitar commits desnecessários
  🧪 Criar testes automatizados para as funcionalidades principais
  📖 Documentar as rotas de API com exemplos de uso
  📁 Organizar arquivos em subpastas por funcionalidade
  🔷 Migrar arquivos .js para TypeScript para maior segurança de tipos

---

## 📖 Descrição

App nativo Android para Maikon Caldeira OAB/MG 183712. Abre o Assistente Jurídico IA em WebView nativo. EAS já configurado.

---

*Gerado pelo DevMobile IDE*
