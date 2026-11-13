# Capturar prints e vídeo de um sistema com login (receita reutilizável)

Como este repositório entra no CMS, navega, tira prints padronizados e grava vídeo. Serve para guia, manual ou
evidência de qualquer sistema web, inclusive com login gov.br.

| Arquivo | Papel |
|---|---|
| [`scripts/comum.mjs`](../scripts/comum.mjs) | Endereço (lido de `conteudo/ambiente.json`), padrão de tela, conexão ao Edge, destaque, legenda, menu aberto |
| [`scripts/capturar.mjs`](../scripts/capturar.mjs) | `--login` abre o Edge; sem flag, percorre o `ROTEIRO` e salva os prints |
| [`scripts/video.mjs`](../scripts/video.mjs) | Grava uma jornada em vídeo, com legenda por passo |

## Resumo em comandos

```bash
npm install --save-dev playwright      # só a biblioteca; o navegador é o Edge do Windows
npm run prints:login                   # abre o Edge com perfil próprio; você entra no sistema e deixa aberto
npm run prints                         # prints (com destaque) e originais (sem destaque)
npm run video                          # vídeo da jornada
```

## Como funciona

```
1. --login   Edge comum  --remote-debugging-port=9333  --user-data-dir=.auth/edge
             (navegador normal: o gov.br aceita o login; o perfil guarda a sessão entre rodadas)
2. a pessoa entra no sistema na janela aberta (a IA nunca digita senha)
3. prints    chromium.connectOverCDP("http://127.0.0.1:9333")
             para cada tela do ROTEIRO:
               nova aba → menu aberto → escala 1440x900 @2x → abre a URL → esconde dados pessoais
               → ação (clicar aba, abrir menu, buscar) → foto ORIGINAL → destaque → foto COM DESTAQUE
4. vídeo     contexto novo com a sessão copiada + recordVideo 1440x900
             para cada passo: legenda no pé → destaque só no que vai ser clicado → clique → tira o destaque
             no fim: devolve os cookies ao Edge (o SSO renova a sessão) e limpa o dado de teste
5. desconecta com process.exit (browser.close() fecharia o Edge e o login)
```

## Padrão

| Item | Valor |
|---|---|
| Tela | 1440x900, escala 2 → **PNG 2880x1800** quando `recorte: "tela"` |
| Enquadramento | `tela` (cheia, default), `elemento` (destaque + 120 px) ou `secao` (contêiner pai + 60 px). Vale no `ROTEIRO` e no passo (`recorte` em `conteudo/<perfil>.ts`) |
| Pastas | `public/prints/<perfil>/` com destaque (site e PDF) · `prints-originais/<perfil>/` sem marcação, **mesmo nome** |
| Nome | `<ação>-<n>-<tela>.png` (ex.: `encontrar-2-busca.png`), o mesmo do campo `print` do conteúdo |
| Vídeo | `.webm` 1440x900, legenda "Passo N de M · …" no pé da tela |
| Dados pessoais | Escondidos por CSS (`ESCONDER`: foto, contador de notificações). Conferir em cada sistema |
| Ambiente | `conteudo/ambiente.json`: trocar `url` muda site, prints e vídeo |

### Destaque: três linguagens visuais

Cada passo escolhe o tipo em `tipo` (no conteúdo e no `ROTEIRO`). Cores do Design System MS,
fixas nos scripts (o print é do CMS, fora do DS):

| `tipo` | Para quê | Visual |
|---|---|---|
| `acao` (default) | Botão, item de menu, link a clicar | Borda azul `#1351B4` + badge circular com o número do passo + sombra escurecendo o fora (spotlight) |
| `area` | Formulário, aba, seção a preencher | Fundo azul claro tracejado, sem sombra |
| `atencao` | Aviso ou restrição | Borda âmbar `#D97706` + badge `!` |

O número da badge casa com o número do passo no `DsSteps` da página — texto e imagem conectam
visualmente. No vídeo, o tipo troca por ação: `clicar()` usa `acao`, `escrever()` e `textoRico()`
usam `area`. Um destaque por vez (o anterior é limpo pela própria função).

## Para usar em outro projeto

1. Copie `scripts/comum.mjs`, `scripts/capturar.mjs` (e `video.mjs`, se precisar) e os scripts do `package.json`.
   Ponha `.auth/` no `.gitignore`.
2. Ajuste `ambiente.json` (endereço), `ESCONDER` (o que não pode aparecer) e o `ROTEIRO` (uma linha por tela).
3. Ache os seletores navegando antes: pelo navegador do Claude (MCP) ou pelo DevTools. Prefira texto visível
   (`page.getByText("Histórico", { exact: true })`) a classe CSS.
4. `npm run prints:login`, entre no sistema, depois `npm run prints`.
5. Abra 2 ou 3 PNG e confira: tamanho, dado pessoal, tela certa, destaque no lugar.

Linha do roteiro:

```js
{ perfil: "coordenador", arquivo: "historico-1-aba.png", url: "/admin/content/services/1691",
  antes: aba("Histórico"),            // ação antes da foto
  destaque: texto("Histórico"),       // elemento marcado no print
  tipo: "area",                       // acao | area | atencao
  numero: 1,                          // número da badge (casa com o passo no DsSteps)
  recorte: "secao" }                  // tela | elemento | secao
```

`npm run prints -- busca` refaz só os arquivos com "busca" no nome.

## Navegar antes de capturar (com a IA)

- Logado no navegador do Claude, a IA lê o sistema **sem clicar em nada** quando há API. No Directus:
  `/users/me?fields=role.name` (perfil logado), `/roles` (funções), `/fields/<coleção>` (campos e abas).
- Conferir o perfil antes: em 12/11/2026 o login estava como Administrador, e o print mostraria um menu que o
  Coordenador não vê.
- O que difere da especificação vira nota de divergência (`docs/02-perfis.md`).

## Problemas já resolvidos

| Problema | Causa | Solução |
|---|---|---|
| gov.br recusa o login | Navegador aberto pelo Playwright é marcado como automação | Edge comum com porta de depuração; conectar depois |
| `spawn UNKNOWN` | O Chromium do Playwright não abre na máquina da SETDIG | Usar o Edge (`msedge.exe`) |
| Print em 1440x900, não 2x | Numa conexão CDP, o `page.screenshot` ignora a escala | `Emulation.setDeviceMetricsOverride` reaplicado + `Page.captureScreenshot` |
| Foto e contador no print | Elementos do usuário logado | CSS em `ESCONDER` |
| Busca "Sem resultados" / lista filtrada | O Directus guarda a busca da lista entre visitas | Limpar a busca antes (`buscar("")`) e depois do print |
| Menu da esquerda sumiu | O Directus guarda o menu recolhido no `localStorage` (`nav-bar-collapsed`) | `addInitScript` que apaga a chave antes de abrir a página |
| Destaque cortado no menu | Contêiner corta o que passa da borda | Borda por dentro (`outline-offset` negativo) e na linha inteira do item (`.v-list-item`) |
| Print "perdido" em A4 | Tela cheia num A4 fica pequena demais | `recorte: "elemento"` ou `"secao"` no passo para captura em close; `max-height: 160mm` no CSS de impressão |
| Destaque parece marcação de teste | Único retângulo vermelho | 3 tipos (acao/area/atencao) com cores do DS MS e badge numerada |
| Edge fecha no fim | `browser.close()` numa conexão CDP fecha o navegador | Terminar com `process.exit(0)` |
| Edge deslogado depois do vídeo | O contexto da gravação passa pelo SSO e renova a sessão | Esperar o formulário depois do SSO e devolver os cookies ao Edge (`addCookies`) |
| Carta não salva no vídeo | Campos obrigatórios e regra do CMS: cada canal marcado precisa de ao menos uma etapa | Preencher tudo, criar a etapa; depois de salvar o CMS volta para a lista |
| Clique no "+" trava o Playwright | Navegação no meio do clique | Destacar o "+" e navegar direto para `/services/+` |
| Dado de teste no ambiente | O vídeo cria uma carta | Excluir pela API no fim, com o mesmo usuário; o script avisa se sobrar |
| "Edge não está aberto" | Porta 9333 sem Edge | `npm run prints:login` |
