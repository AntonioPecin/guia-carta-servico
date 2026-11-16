# guia-carta-servico — instruções

Guia do CMS da carta de serviço **por perfil**: passo a passo com prints, vídeo e PDF. Next 16 + Design System MS
(`@plataforma-xvia/*` 0.14.4), export estático publicado na Vercel. Item no TFS: #1376742.

**Antes de começar um perfil ou uma ação nova, leia [`docs/05-processo-guia-com-ia.md`](docs/05-processo-guia-com-ia.md).**
O roteiro do vídeo é montado pelo Antonio em [`docs/roteiro-video-modelo.md`](docs/roteiro-video-modelo.md); a IA
transforma o roteiro em `scripts/video.mjs`. Referência técnica dos scripts: [`docs/04-capturar-prints.md`](docs/04-capturar-prints.md).

## O processo (7 passos)

| # | Passo | Onde |
|---|---|---|
| 1 | Ler as fontes (TO BE, quadro de perfis, guia antigo) | `docs/materiais.md`, `docs/02-perfis.md` |
| 2 | Navegar no CMS com a IA, com o perfil certo, e anotar divergências | navegador do Claude; `docs/02-perfis.md` |
| 3 | Escrever as ações e os passos | `conteudo/<perfil>.ts` |
| 4 | Roteiro dos prints e captura | `ROTEIRO` em `scripts/capturar.mjs`; `npm run prints` |
| 5 | Roteiro do vídeo (Antonio) e gravação | `docs/roteiro-video-modelo.md` → `scripts/video.mjs`; `npm run video` |
| 6 | PDF e conferência | `npm run build` e `npm run pdf` |
| 7 | Validação do Fabio e publicação | `npm run deploy` |

## Regras aprendidas (12/11/2026)

**Acesso e segurança**
- A IA não digita senha. O login é da pessoa, no Edge aberto por `npm run prints:login` (perfil em `.auth/`, fora do git).
- Antes de capturar, conferir o perfil logado (`/users/me?fields=role.name`). Admin vê menu que o Coordenador não vê.
- O site é público: nada de dado pessoal real. Foto e contador de notificações são escondidos (`ESCONDER`).
- Dado de teste se chama sempre **"Teste do guia - não publicar"** e é excluído no fim do mesmo script.

**CMS da carta (Directus, homologação)**
- A busca da lista fica salva entre visitas: limpar antes e depois (`buscar("")`).
- O menu recolhido fica no `localStorage` (`nav-bar-collapsed`): apagar antes de abrir a página (`abrirMenu`).
- Carta publicada não se edita direto: a mudança é feita na versão **Rascunho** (menu de versões no topo).
- Salvar volta para a lista de Serviços, não abre a carta.
- Obrigatórios: nome, categoria, órgão, o que é, documentos, quem pode utilizar, canal, tipo de prazo e prazo,
  tipo de custo. **Cada canal marcado precisa de ao menos uma etapa**, senão o CMS recusa.
- Categoria, subcategoria e órgão abrem uma gaveta de seleção.
- O "+" trava o Playwright: destacar o "+" e navegar direto para `/services/+`.
- A janela de gravação passa pelo SSO (keycloak) antes do formulário: esperar o formulário aparecer.
- O Coordenador não tem pré-visualizar (o Kauã vai fazer): ação com `previsto: true`.

**Prints**
- Padrão único: tela 1440x900 em 2x → **PNG 2880x1800**.
- Cada tela sai duas vezes, com o mesmo nome `<ação>-<n>-<tela>.png`: `prints-originais/<perfil>/` (sem
  marcação) e `public/prints/<perfil>/` (com destaque).
- Destaque vermelho por dentro do elemento, **um por vez**, na linha inteira do item de menu.
- Captura pelo CDP (`Page.captureScreenshot`); o `page.screenshot` ignora a escala nessa conexão.

**Vídeo**
- Legenda no pé da tela por passo ("Passo N de M · …"); destaque só no que vai ser clicado e some depois.
- Destaque do vídeo é `destacarVideo`: moldura **por fora** do campo, numa camada própria, que sobe do
  `<input>`/rótulo até a caixa visível (o contorno por dentro cortava o texto). Os prints seguem com `destacar`.
- A legenda nunca fica na frente do campo destacado: se for cobrir, sobe para o alto da tela.
- `npm run video` grava cru, sem som, em `gravacoes/` (fora do git). Em `public/videos/` fica só o `.mp4` final,
  com a narração (texto em `docs/roteiros/<perfil>-<ação>-narracao.md`, voz gerada na Fish Audio).
- Grava num contexto novo com a sessão copiada; no fim devolve os cookies ao Edge (o SSO renova a sessão).
- Limpeza pela API, com o mesmo usuário; o script avisa se o dado de teste sobrar.

**Scripts**
- Terminar com `process.exit(0)`: `browser.close()` numa conexão CDP fecha o Edge e o login.
- O Chromium do Playwright não abre nesta máquina (`spawn UNKNOWN`): usar o Edge.
- O gov.br recusa navegador automatizado: o Edge é aberto como navegador comum e o script só se conecta depois.

**Conteúdo**
- Endereço do CMS só em `conteudo/ambiente.json` (homologação → produção: trocar e refazer prints e vídeo).
- No texto, `{cms}` vira o endereço; `onde` mostra o caminho no menu; `video` aceita arquivo local ou link do Drive.
- Linguagem simples (Lei 15.263/2025): frase curta, voz ativa, imperativo nos passos.
- O que o sistema mostra e difere do TO BE vai para `docs/02-perfis.md` e para a nota do vault.

**Design System, PDF e publicação**
- Componente do DS antes de markup próprio; ler a ficha em `https://designsystem.digital.ms.gov.br/llms/<tag>.md`.
  Server Component importa de `@plataforma-xvia/ds-react/server`. Cor, espaço e raio só por token `--ds-*`.
- PDF por `npm run pdf` (capa, sem data nem endereço do navegador, passo inteiro por página).
- A Vercel não instala o DS (registry do GitLab MS): o deploy envia o `out/` pronto. `fetch failed` é rede do terminal.
- Rodapé: "Secretaria-Executiva de Transformação Digital — SETDIG".

## Base de conhecimento no vault
`60-padroes/time/guia-de-sistema-com-ia.md` (processo e papéis), `60-padroes/time/capturar-prints-de-sistema-logado.md`
(receita), `10-conhecimento/cms-carta-servico/navegar-no-cms-da-carta.md` (o CMS) e
`20-projeto/guia-carta-servico/00-guia-carta-servico.md` (o projeto).
