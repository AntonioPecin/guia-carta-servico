# Processo: fazer o guia de um perfil com a IA

Como fizemos o guia do Coordenador (12/11/2026) e como fazer os próximos (Gerente, Aprovador Central,
Administrador). As regras que já deram problema estão no [`CLAUDE.md`](../CLAUDE.md); leia antes.

## Quem faz o quê

| Quem | Faz |
|---|---|
| **Fabio** | Escolhe o perfil, faz o login no CMS (a IA não digita senha), muda o próprio perfil no CMS de homologação quando precisa, valida o guia e publica |
| **Antonio** | Monta o **roteiro do vídeo** em [`roteiro-video-modelo.md`](roteiro-video-modelo.md): o que a legenda diz, onde clicar, o que digitar. Confere os prints e o PDF |
| **IA (Claude)** | Lê as fontes, navega no CMS, escreve o conteúdo, monta o roteiro dos prints, transforma o roteiro do Antonio em script, captura, grava, gera o PDF e documenta o que mudou |

## Passo a passo

### 1. Preparar
- O perfil de quem vai logar no CMS de homologação precisa ser o perfil do guia (ex.: Gerente da SAD). O Fabio
  troca no CMS, como fez para o Coordenador.
- Abrir o Edge e entrar no CMS uma vez:
  ```bash
  npm run prints:login
  ```

### 2. Entender o perfil (IA)
- Ler [`02-perfis.md`](02-perfis.md) (o que cada perfil faz), [`03-fluxo-da-carta.md`](03-fluxo-da-carta.md) e os
  materiais de [`materiais.md`](materiais.md).
- Navegar no CMS com o perfil certo. Conferir o perfil logado antes de tudo.
- Anotar o que o sistema mostra diferente do TO BE em `02-perfis.md` e na nota do vault
  `10-conhecimento/cms-carta-servico/navegar-no-cms-da-carta.md`.

### 3. Escrever o conteúdo (IA, Fabio revisa)
- Criar `conteudo/<perfil>.ts` copiando o do Coordenador e importar em `conteudo/perfis.ts` com `situacao: "pronto"`.
- Uma ação por coisa que o perfil faz. Cada passo: título no imperativo, texto curto, `onde` e o nome do `print`.
- Função que o CMS ainda não tem: `previsto: true`.

### 4. Prints (IA)
- Uma linha no `ROTEIRO` de `scripts/capturar.mjs` por tela, com o `destaque` do que a pessoa clica.
- `npm run prints` (ou `npm run prints -- <parte-do-nome>` para refazer uma tela).
- Conferir 2 ou 3 PNG: 2880x1800, sem dado pessoal, destaque no lugar. Originais ficam em `prints-originais/`.

### 5. Vídeo (Antonio monta o roteiro, IA grava)
- O Antonio copia o modelo de [`roteiro-video-modelo.md`](roteiro-video-modelo.md) para
  `docs/roteiros/<perfil>-<ação>.md` e preenche. Para descobrir o nome dos botões e campos, ele abre o CMS e
  copia o texto exatamente como aparece na tela.
- A IA transforma o roteiro em script (`scripts/video.mjs` ou um novo `scripts/video-<perfil>-<ação>.mjs`) e grava:
  `npm run video`.
- Antonio e Fabio assistem. Ajuste vai no roteiro, e a IA regrava.
- Conferir que o dado de teste sumiu do CMS (o script avisa).
- Ligar o vídeo na ação: campo `video` em `conteudo/<perfil>.ts`.

### 6. PDF (IA)
```bash
npm run build
npm run pdf
```
Abrir `public/pdf/<perfil>.pdf` e conferir: capa com o link do CMS, passo inteiro por página, vídeo como link.
Perfil novo entra na lista `PERFIS` de `scripts/pdf.mjs`.

### 7. Validar e publicar (Fabio)
```bash
npm run deploy
```

## Para quem vai usar a IA

Pedido que funciona bem, com o contexto deste repositório:

> Leia o CLAUDE.md e o docs/05. Vamos fazer o guia do perfil Gerente. Já estou logado no Edge com o perfil
> Gerente da SAD. Navegue no CMS, escreva o conteúdo, monte o roteiro dos prints e capture. O roteiro do vídeo
> está em docs/roteiros/gerente-enviar-para-aprovacao.md.
