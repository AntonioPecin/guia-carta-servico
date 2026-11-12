# Guia da carta de serviço

Passo a passo do CMS da carta de serviço, **um guia por perfil**, com prints do sistema e exportação em PDF.
Feito com o [Design System MS](https://designsystem.digital.ms.gov.br).

Piloto: **Coordenador**. Gerente, Aprovador Central (CGE) e Administrador seguem o mesmo molde.

Item no TFS: [#1376742 — Planejar a ementa do treinamento da carta de serviço por perfil](https://tfs.sgi.ms.gov.br/tfs/Global/XVIA/_workitems/edit/1376742).
Contexto completo em [`docs/`](docs/).

## Rodar

Precisa da rede do governo (ou VPN) e do token do GitLab MS no `~/.npmrc` para instalar o Design System.

```bash
npm install
npm run dev        # http://localhost:3000
```

## Onde mexer

| Quero… | Arquivo |
|---|---|
| Mudar o texto de um perfil | `conteudo/<perfil>.ts` (ações e passos) |
| Incluir um perfil | `conteudo/<perfil>.ts` + `conteudo/perfis.ts` (`situacao: "pronto"`) |
| Trocar um print | `public/prints/<perfil>/` e o campo `print` do passo |
| Mudar o visual | `app/app.css` (só tokens `--ds-*`) |

## Prints do CMS

O script entra no CMS de homologação com a sua sessão e salva PNG em 2x.

```bash
npx playwright install chromium   # só na primeira vez
npm run prints:login              # abre o navegador: entre no CMS; a sessão fica em .auth/ (fora do git)
npm run prints                    # refaz o roteiro de scripts/capturar.mjs
```

O site é público: use só carta e usuário de teste, sem dado pessoal real.

## PDF

Na página do perfil, clique em **Exportar PDF** e escolha "Salvar como PDF". O cabeçalho, o rodapé e o índice
somem, e cada ação começa numa página nova.

## Publicar (Vercel, sem senha)

```bash
npm run deploy     # gera o site estático em out/ e envia para a Vercel
```

Na primeira vez, a Vercel pede login no terminal e cria o projeto.
