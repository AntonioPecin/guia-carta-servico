# Roteiro de vídeo — modelo

**Quem preenche:** Antonio. **Quem grava:** a IA, a partir deste roteiro (`npm run jornada -- <ação> [id] --video`).
Copie este arquivo para `docs/roteiros/<perfil>-<ação>.md` e preencha. Não precisa escrever código.

## Como preencher

- **Legenda:** a frase que aparece no pé da tela durante o passo. Curta, no imperativo ("Clique em…", "Escreva…").
- **Onde clicar:** o texto do botão, aba ou campo **exatamente como aparece na tela** (maiúsculas e acentos
  iguais). Se for ícone sem texto, descreva ("ícone ✓ no alto à direita").
- **O que digitar:** o texto fictício. Nunca dado real (nome de pessoa, CPF, e-mail).
- **Onde fica:** o caminho no menu, para conferir a tela certa.
- Um passo = uma ideia. Se um passo tem mais de 3 cliques, divida.
- Regras do CMS que travam o vídeo estão no [`CLAUDE.md`](../CLAUDE.md) (ex.: canal marcado precisa de etapa).

## Cabeçalho

| Campo | Valor |
|---|---|
| Perfil | |
| Ação | |
| Abertura (legenda antes do passo 1) | |
| Dado de teste | Nome: "Teste do guia - não publicar" (sempre esse) |
| O que limpar no fim | |
| Fechamento (legenda do último passo) | |

## Passos

| Passo | Legenda | Onde clicar | O que digitar | Onde fica |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |

---

## Exemplo preenchido: Coordenador · Criar uma carta

Roteiro do vídeo `public/videos/coordenador-criar-carta.webm` (`scripts/jornadas/criar.mjs`).

| Campo | Valor |
|---|---|
| Perfil | Coordenador (SAD) |
| Ação | Criar uma carta |
| Abertura | Criar uma carta de serviço · perfil Coordenador |
| Dado de teste | "Teste do guia - não publicar" |
| O que limpar no fim | A carta de teste (excluída pela API) |
| Fechamento | Carta salva como rascunho. Agora avise o Gerente para enviar para aprovação |

| Passo | Legenda | Onde clicar | O que digitar | Onde fica |
|---|---|---|---|---|
| 1 | Em Serviços, clique em + para começar uma carta | botão + no alto da lista | — | Carta de Serviços › Serviços |
| 2 | Escreva o nome do serviço, começando por um verbo | campo "Nome do serviço" | Teste do guia - não publicar | aba Descrição do Serviço |
| 3 | Marque o público e escolha categoria e subcategoria | "Cidadão"; campos "Categoria", "Subcategoria" e "Órgão" (primeira opção da gaveta) | — | aba Descrição do Serviço |
| 4 | Explique o serviço, os documentos e quem pode usar | "O que é este serviço?", "Documentos Necessários", "Quem pode utilizar esse serviço?" | Serviço de teste criado para o guia do Coordenador. / Documento de identidade. / Qualquer pessoa. | aba Descrição do Serviço |
| 5 | Aba Etapa do Serviço: escolha o canal de prestação | aba "Etapa do Serviço"; "Online"; "Criar novo"; ✓ da gaveta | Acesse o portal e preencha o formulário / Entre com a sua conta gov.br e envie o pedido. | aba Etapa do Serviço |
| 6 | Aba Detalhes do Serviço: prazo e custo | aba "Detalhes do Serviço"; "Tipo de Prazo" (primeira opção); "Prazo de atendimento"; "Tipo de Custo" (primeira opção) | 5 | aba Detalhes do Serviço |
| 7 | Salve no ✓, no alto à direita | ícone ✓ no alto à direita | — | topo da carta |
