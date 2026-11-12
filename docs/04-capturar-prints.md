# Capturar prints de um sistema com login (receita reutilizável)

Como este repositório entra no CMS, navega e tira prints padronizados. Serve para guia, manual ou evidência de
qualquer sistema web, inclusive com login gov.br. Script: [`scripts/capturar.mjs`](../scripts/capturar.mjs).

## Resumo em 4 comandos

```bash
npm install --save-dev playwright      # só a biblioteca; o navegador é o Edge do Windows
npm run prints:login                   # abre o Edge com perfil próprio; você entra no sistema e deixa aberto
npm run prints                         # o script se conecta ao Edge e salva os PNG
```

```json
"prints:login": "node scripts/capturar.mjs --login",
"prints": "node scripts/capturar.mjs"
```

## Como funciona

```
1. --login   Edge comum  --remote-debugging-port=9333  --user-data-dir=.auth/edge
             (navegador normal: o gov.br aceita o login; o perfil guarda a sessão)
2. pessoa entra no sistema na janela aberta (a IA nunca digita senha)
3. capturar  chromium.connectOverCDP("http://127.0.0.1:9333")
             para cada tela do ROTEIRO:
               nova aba → escala 1440x900 @2x → abre a URL → esconde dados pessoais
               → ação opcional (clicar aba, abrir menu, digitar busca) → reaplica a escala
               → Page.captureScreenshot (CDP) → public/prints/<perfil>/<arquivo>.png
4. desconecta; o Edge continua aberto e logado para a próxima rodada
```

## Padrão dos prints

| Item | Valor |
|---|---|
| Tela | 1440x900, escala 2 → **PNG 2880x1800**, todas iguais |
| Dados pessoais | Escondidos por CSS antes do print (`ESCONDER`: foto, contador de notificações). Conferir cada sistema |
| Nome do arquivo | `<ação>-<n>-<tela>.png`, o mesmo usado no campo `print` do conteúdo |
| Tela de login | Contexto sem sessão (`semSessao: true`) |

## Para usar em outro projeto

1. Copie `scripts/capturar.mjs` e os dois scripts do `package.json`. Ponha `.auth/` no `.gitignore`.
2. Troque no topo do script:
   - `CMS`: endereço do sistema;
   - `ESCONDER`: seletores do que não pode aparecer (foto, nome, e-mail, CPF);
   - `ROTEIRO`: uma linha por tela.
3. Ache os seletores navegando antes: pelo navegador do Claude (MCP) ou pelo DevTools. Prefira texto visível
   (`page.getByText("Histórico", { exact: true })`) a classe CSS, que muda entre versões.
4. Rode `npm run prints:login`, entre no sistema, e depois `npm run prints`.
5. Abra 2 ou 3 PNG e confira: tamanho, dado pessoal, tela certa.

Linha do roteiro:

```js
{ perfil: "coordenador", arquivo: "historico-1-aba.png", url: "/admin/content/services/1691",
  antes: async (page) => { await page.getByText("Histórico", { exact: true }).first().click(); } }
```

## Navegar antes de capturar (com a IA)

- Logado no navegador do Claude, a IA lê o sistema **sem clicar em nada** quando há API. No Directus:
  `/users/me?fields=role.name` (qual perfil está logado), `/roles` (funções), `/fields/<coleção>` (campos e abas).
- Conferir o perfil antes de capturar: em 12/11/2026 o login estava como Administrador, e o print mostraria um
  menu que o Coordenador não vê.
- O que difere da especificação vira nota de divergência (`docs/02-perfis.md`).

## Problemas já resolvidos

| Problema | Causa | Solução |
|---|---|---|
| gov.br recusa o login | Navegador aberto pelo Playwright é marcado como automação | Abrir o Edge comum com porta de depuração e só conectar depois |
| `browserType.launch: spawn UNKNOWN` | O Chromium baixado pelo Playwright não abre na máquina da SETDIG | Usar o Edge (`msedge.exe`) |
| Print saiu em 1440x900, não 2x | Numa conexão CDP, o `page.screenshot` ignora a escala emulada | `Emulation.setDeviceMetricsOverride` reaplicado + `Page.captureScreenshot` |
| Foto e contador no print | Elementos do usuário logado | CSS em `ESCONDER`; achar a classe pelo texto do elemento |
| "Edge não está aberto" | O script de captura não achou a porta 9333 | Rodar `npm run prints:login` antes |
