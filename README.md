# Guia da carta de serviço

Passo a passo do CMS da carta de serviço, **um guia por perfil**, com prints do sistema, vídeo e PDF.
Feito com o [Design System MS](https://designsystem.digital.ms.gov.br).

Prontos: **Coordenador** e **Gerente**. Aprovador Central (CGE) e Administrador seguem o mesmo molde.

Item no TFS: [#1376742 — Planejar a ementa do treinamento da carta de serviço por perfil](https://tfs.sgi.ms.gov.br/tfs/Global/XVIA/_workitems/edit/1376742).
Contexto completo em [`docs/`](docs/). **Para fazer o próximo perfil:** [`docs/05-processo-guia-com-ia.md`](docs/05-processo-guia-com-ia.md)
(processo, quem faz o quê) e [`docs/roteiro-video-modelo.md`](docs/roteiro-video-modelo.md) (roteiro do vídeo).

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000
```

Os pacotes do Design System MS (`@plataforma-xvia/ds-*`) ficam **vendorados** em `vendor/*.tgz` e o
`package.json` instala direto desses arquivos. Antonio (ou qualquer pessoa fora da rede do
governo) clona o repo e roda `npm install` — sem token, sem VPN.

**Atualizar o DS** (só Fabio, dentro da rede): `cd vendor && npm pack @plataforma-xvia/ds-core@<ver>
@plataforma-xvia/ds-icons@<ver> @plataforma-xvia/ds-react@<ver> @plataforma-xvia/ds-tokens@<ver>`,
troca as versões em `package.json` (dependencies e overrides) e `rm -rf node_modules package-lock.json
&& npm install`.

## Comandos

| Comando | Faz |
|---|---|
| `npm run dev` | Site local |
| `npm run prints:login` | Abre o Edge com perfil próprio (`.auth/edge`, fora do git); você entra no CMS e deixa aberto |
| `npm run prints` | Refaz todos os prints (`npm run prints -- busca` refaz só os que têm "busca" no nome) |
| `npm run jornada -- <nome> [id]` | Roda uma jornada pronta no CMS (ver **Jornadas**); `--video` grava, `--limpar` desfaz no fim |
| `npm run video` | Grava o vídeo "Criar uma carta" do Coordenador (`jornada criar --video --limpar`) |
| `npm run build` e `npm run pdf` | Site estático em `out/` e PDF de cada perfil em `out/pdf/` e `public/pdf/` |
| `npm run deploy` | Build, PDF e envio para a Vercel |

## Onde mexer

| Quero… | Arquivo |
|---|---|
| Trocar homologação por produção | `conteudo/ambiente.json` (`nome` e `url`); depois `npm run prints` e `npm run video` |
| Mudar o texto de um perfil | `conteudo/<perfil>.ts` (ações e passos) |
| Incluir um perfil | `conteudo/<perfil>.ts` + `conteudo/perfis.ts` (`situacao: "pronto"`) + telas no `ROTEIRO` |
| Mudar uma tela ou o destaque do print | `ROTEIRO` em `scripts/capturar.mjs` |
| Mudar um vídeo ou jornada | `scripts/jornadas/<nome>.mjs` |
| Mudar o visual | `app/app.css` (só tokens `--ds-*`) |

## Como editar e ampliar

Tudo o que o guia mostra vem de `conteudo/<perfil>.ts`. Cada ação é um bloco:

```ts
{
  id: "criar",                               // vira a âncora #criar
  titulo: "Criar uma carta",
  objetivo: "Cadastrar um serviço novo.",
  video: "/videos/coordenador-criar-carta.webm", // ou link do Drive: https://drive.google.com/file/d/<id>/view
  previsto: true,                            // função ainda em desenvolvimento no CMS: selo, sem prints
  aviso: "Texto de atenção opcional.",
  passos: [
    {
      titulo: "Abra Serviços",
      texto: "No navegador, acesse {cms}.",  // {cms} vira o endereço de conteudo/ambiente.json
      onde: "Carta de Serviços › Serviços",  // caminho no menu, mostrado acima do print
      print: "encontrar-1-lista.png",        // arquivo em public/prints/<perfil>/
    },
  ],
}
```

| Situação | O que fazer |
|---|---|
| A X-VIA entregou uma função prevista | Tire `previsto: true`, ponha o `print` nos passos, inclua a tela no `ROTEIRO` e rode `npm run prints` |
| A tela do CMS mudou | `npm run prints` (e `npm run video`, se mudou a criação) |
| Vídeo no Drive | Suba o `.webm`, compartilhe "qualquer pessoa com o link" e ponha o link em `video` |
| Ação nova | Copie um bloco, mude `id`, textos e prints |

Print que ainda não existe aparece como "Print desta etapa em preparação" (só na tela, não no PDF).

## Jornadas

Jornada é um caminho pronto no CMS, com legenda por passo e destaque no que vai ser clicado. Serve para
homologar, para gravar vídeo e para preparar dado de teste. Antes: `npm run prints:login` com o perfil certo.

| Jornada | Perfil | Comando | Faz |
|---|---|---|---|
| `criar` | Coordenador ou Gerente | `npm run jornada -- criar` | Cria a carta "Teste do guia - não publicar" e mostra o id |
| `enviar` | Gerente | `npm run jornada -- enviar 2471` | Envia a carta para aprovação (se já houver pedido aberto, cancela antes) |
| `cancelar` | Gerente | `npm run jornada -- cancelar 2471` | Cancela o pedido aberto; a carta volta a rascunho |

Encadear: `criar` mostra o id, e `enviar <id>` manda para aprovação. Com `--video`, a gravação vai para
`public/videos/<perfil>-<jornada>.webm`. **Jornada nova:** copie um arquivo de `scripts/jornadas/` (o formato
está no topo de `criar.mjs`) e use as ações de `acoes()` em `scripts/comum.mjs` (clicar, escrever, relacao,
opcao, textoRico, mostrar, api).

## Prints

- `public/prints/<perfil>/` — print com destaque, usado no site e no PDF.
- `prints-originais/<perfil>/` — **mesmo nome, sem marcação**: base para refazer o destaque ou ajustar a imagem.
- Nome: `<ação>-<n>-<tela>.png` (ex.: `encontrar-2-busca.png`), igual ao campo `print` do conteúdo.
- O site é público: só carta e usuário de teste, sem dado pessoal real.

**Linguagem visual do destaque** (3 tipos, cores do DS MS):

| `tipo` | Uso | Visual |
|---|---|---|
| `acao` (default) | Botão, menu, link a clicar | Borda azul `#1351B4` + badge circular com o número do passo + sombra escurecendo o fora |
| `area` | Formulário, aba, seção a preencher | Fundo azul claro tracejado, sem sombra |
| `atencao` | Aviso ou restrição | Borda âmbar `#D97706` + ícone `!` |

**Enquadramento** (`recorte` no passo): `tela` (default, 2880x1800), `elemento` (recorte do
destaque + 120 px) ou `secao` (recorte do contêiner pai + 60 px). Botão específico vai bem com
`elemento`; aba de formulário com `secao`; visão geral com `tela`.

Passo a passo completo, problemas já resolvidos e como reaproveitar em outro projeto:
[`docs/04-capturar-prints.md`](docs/04-capturar-prints.md).

## PDF

O botão **Baixar PDF** entrega o PDF gerado por `npm run pdf`: capa com o link do CMS, sem data nem endereço do
navegador, cada ação numa página e cada passo inteiro (texto e print juntos). O vídeo aparece como link.

## Publicar (Vercel, sem senha)

```bash
npm run deploy
```

A Vercel não instala o Design System (registry do GitLab MS), por isso o site vai **pronto** (`out/`) e a Vercel
não faz build. Se der `fetch failed`, é rede do terminal: teste
`node -e "fetch('https://api.vercel.com/v2/user').then(r=>console.log(r.status)).catch(e=>console.log(e.cause))"`.
