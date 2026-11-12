# Perfis e permissões do CMS da carta

Fonte: documento "Dúvidas do CMS da Carta de Serviços — X-VIA" (seção "CMS · Proposta de perfis e permissões"),
respondido com o Kauã (X-VIA) a partir do pedido do pacote de entrega TO BE. É proposta; o que o sistema faz hoje
se confere na navegação.

## Onde cada função atua

| Função | Onde atua |
|---|---|
| Administrador | Todos os órgãos (sem órgão vinculado) |
| Aprovador Central (CGE) | Todos os órgãos (sem órgão vinculado) |
| Gerente | Só os órgãos dele (pelo menos um) |
| Coordenador | Só os órgãos dele (pelo menos um) |
| Consulta | Só os órgãos dela, só leitura |
| Consulta Geral | Todos os órgãos, só leitura |

Cada usuário tem **uma função**, pode ter **policies** (poderes extras de outra função) e os **órgãos** em que atua.
Nenhuma policy amplia onde a pessoa age.

## O que cada função faz (resumo)

| Ação | Admin | Aprovador | Gerente | Coordenador | Consulta |
|---|---|---|---|---|---|
| Ver e pré-visualizar cartas | ✅ | ✅ | ✅ | ✅ | ✅ |
| Criar carta e editar o rascunho | ✅ | ❌ | ✅ | ✅ | ❌ |
| Editar carta publicada (nova versão) | ✅ | ❌ | ✅ | ❌ | ❌ |
| Excluir rascunho nunca publicado | ✅ | ❌ | ✅ | ✅ | ❌ |
| Enviar para aprovação, cancelar, reenviar | ✅ | ❌ | ✅ | ❌ | ❌ |
| Ver solicitações e motivo da devolução | ✅ | ✅ | ✅ | ❌ (previsto) | ❌ |
| Aprovar ou devolver | ❌* | ✅ | ❌ | ❌ | ❌ |
| Dados do órgão (endereço, contato, logo) | ✅ | ❌ | ✅ | ❌ | ❌ |
| Criar e editar unidade | ✅ | ❌ | ✅ | ❌ | ❌ |
| Categorias e subcategorias | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver histórico de alterações | ✅ | ✅ | ✅ | ✅ | ❌ |
| Usuários e configuração | ✅ | ❌ | ❌ | ❌ | ❌ |

\* O Administrador só aprova com a policy Aprovador Central.

## Assuntos ligados

- **Delegação temporária** de perfil por ausência (consolidado no mesmo documento).
- **Revisão periódica obrigatória** aberta pela CGE (PBI #1368492).
- **Copiar carta:** só o Administrador.
