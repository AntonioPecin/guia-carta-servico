# guia-carta-servico — instruções

Guia do CMS da carta de serviço por perfil (Next 16 + Design System MS `@plataforma-xvia/*` 0.14.4, export estático).

- **Conteúdo** mora em `conteudo/*.ts`. Página não tem texto fixo de perfil.
- **Design System:** antes de usar componente, ler a ficha em `https://designsystem.digital.ms.gov.br/llms/<tag>.md`
  (skill `design-system-xvia`). Server Component importa de `@plataforma-xvia/ds-react/server`; o único client é
  `app/imprimir.tsx`. Cor, espaço e raio só por token `--ds-*`.
- **Prints:** só pelo `scripts/capturar.mjs` (PNG 2x). Site público: nada de dado pessoal real. A sessão em `.auth/`
  nunca vai para o git. Login no CMS é o Fabio quem faz.
- **Texto:** linguagem simples (Lei 15.263/2025): frase curta, voz ativa, verbo no imperativo nos passos.
- **Contexto e decisões:** `docs/`. Item no TFS: #1376742 (repo `lancar-demandas-xvia` lança e comenta).
- Rodapé: "Secretaria-Executiva de Transformação Digital — SETDIG".
