# Plano de implementação

## Decisões

| Decisão | Por quê |
|---|---|
| Next 16 + Design System MS 0.14.4, export estático | Padrão dos sites da SETDIG (molde: `pontos-focais-xvia`). Estático publica na Vercel sem token do GitLab |
| Conteúdo em `conteudo/<perfil>.ts` | Um arquivo por perfil; a página só monta. Perfil novo não mexe no código da página |
| Passo a passo com `ds-steps` e print em `ds-image` | Componente do DS feito para "Como fazer" |
| PDF pelo navegador (`window.print()` + `@media print`) | Sem biblioteca. Cada ação numa página |
| Prints por Playwright (PNG 2x) | O print do navegador do Claude não vira arquivo; o script refaz o caminho e mantém a qualidade |
| Publicação na Vercel sem senha | Pedido do Fabio (12/11/2026). Por isso nenhum dado pessoal real nos prints |

## Fases

1. **Estrutura** (feito): repositório, layout com o DS, página por perfil, exportar PDF, docs.
2. **Prints do Coordenador:** navegar no CMS de homologação com o perfil Coordenador
   (`https://cms.app.hom.pgd.ms.gov.br/admin/content/services`), conferir cada passo de `conteudo/coordenador.ts`,
   montar o roteiro em `scripts/capturar.mjs` e capturar. Login: o Fabio. Carta de teste fictícia, excluída no fim.
3. **Validação:** o Fabio e a Ariane leem o guia do Coordenador; ajustes de texto.
4. **Publicação:** `npm run deploy`; link no README e no #1376742.
5. **Outros perfis:** Gerente, Aprovador Central (depois da conversa com a CGE em 17/11) e Administrador.
6. **Ementa:** a partir dos guias, a ementa por perfil (objetivo, conteúdo, pré-requisito, carga) vai para a X-VIA.

## Fora por enquanto

- Tasks no #1376742: dependem da atividade UST que o Fabio escolher.
- Trilha da equipe técnica (Orquestrador, X-Forms, X-Flows).
- Revisão com IA na carta: prevista para fevereiro; entra no guia quando existir.
