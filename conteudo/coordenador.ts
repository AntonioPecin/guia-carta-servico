import type { Perfil } from "./tipos";

// Rascunho a partir do quadro de perfis do pacote TO BE da carta (docs/02-perfis.md).
// Os passos e os prints são conferidos navegando no CMS de homologação (docs/01-plano.md, fase 2).
export const coordenador: Perfil = {
  id: "coordenador",
  nome: "Coordenador",
  resumo: "Escreve e corrige as cartas de serviço do órgão. Quem envia para aprovação é o Gerente.",
  situacao: "pronto",
  pode: [
    "Ver e pré-visualizar as cartas do órgão",
    "Criar uma carta e editar o rascunho",
    "Excluir um rascunho que nunca foi publicado",
    "Ver o histórico de alterações das cartas",
  ],
  naoPode: [
    "Enviar a carta para aprovação (é o Gerente)",
    "Editar uma carta já publicada (é o Gerente, abrindo uma nova versão)",
    "Aprovar ou devolver uma carta (é o Aprovador Central, da CGE)",
    "Cadastrar unidades, órgãos ou categorias",
  ],
  acoes: [
    {
      id: "entrar",
      titulo: "Entrar no CMS",
      objetivo: "Abrir o gerenciador de cartas com o seu usuário.",
      passos: [
        { titulo: "Abra o endereço do CMS", texto: "No navegador, acesse o endereço do CMS que a SETDIG enviou.", print: "" },
        { titulo: "Entre com o seu usuário", texto: "Informe o seu acesso. Na primeira vez, a SETDIG libera o seu perfil.", print: "" },
        { titulo: "Confira a tela inicial", texto: "Depois de entrar, o menu à esquerda mostra as áreas que o seu perfil pode usar.", print: "" },
      ],
    },
    {
      id: "encontrar",
      titulo: "Encontrar uma carta",
      objetivo: "Achar a carta do seu órgão na lista.",
      passos: [
        { titulo: "Abra a lista de cartas", texto: "No menu, clique em Serviços. Aparecem as cartas dos órgãos em que você atua.", print: "" },
        { titulo: "Busque pelo nome", texto: "Digite parte do nome do serviço na busca.", print: "" },
        { titulo: "Abra a carta", texto: "Clique na linha da carta para ver os campos.", print: "" },
      ],
    },
    {
      id: "criar",
      titulo: "Criar uma carta",
      objetivo: "Cadastrar um serviço novo e deixá-lo salvo como rascunho.",
      passos: [
        { titulo: "Comece uma carta nova", texto: "Em Serviços, clique no botão de criar (+).", print: "" },
        {
          titulo: "Aba Descrição do Serviço",
          texto: "Preencha nome do serviço (3 a 5 palavras, começando por verbo), categoria e subcategoria, órgão, o que é o serviço, documentos necessários e quem pode utilizar. Saiba mais, nome popular e palavras-chave são opcionais.",
          print: "",
        },
        {
          titulo: "Aba Etapa do Serviço",
          texto: "Escolha o canal de prestação (presencial, online ou os dois) e escreva cada etapa na ordem em que a pessoa faz.",
          print: "",
        },
        {
          titulo: "Aba Detalhes do Serviço",
          texto: "Informe o prazo de atendimento, o tipo de custo (gratuito ou pago), os locais de atendimento e o link do serviço, se houver.",
          print: "",
        },
        { titulo: "Salve o rascunho", texto: "Clique em salvar. A carta fica como rascunho até o Gerente enviar para aprovação. Os campos com asterisco são obrigatórios.", print: "" },
      ],
    },
    {
      id: "editar",
      titulo: "Editar o rascunho",
      objetivo: "Corrigir uma carta que ainda não foi publicada.",
      passos: [
        { titulo: "Abra o rascunho", texto: "Encontre a carta e abra. Só existe um rascunho por carta: todos editam o mesmo.", print: "" },
        { titulo: "Altere os campos", texto: "Mude o que precisar. Use frases curtas e palavras do dia a dia.", print: "" },
        { titulo: "Salve", texto: "Clique em salvar. A mudança fica registrada no histórico.", print: "" },
      ],
    },
    {
      id: "pre-visualizar",
      titulo: "Pré-visualizar a carta",
      objetivo: "Ver a carta como o cidadão vai ver no portal, antes de pedir o envio.",
      passos: [
        { titulo: "Abra a carta", texto: "Abra o rascunho que você quer conferir.", print: "" },
        { titulo: "Pré-visualize", texto: "Clique em pré-visualizar e confira o texto como aparece no portal.", print: "" },
      ],
    },
    {
      id: "pedir-envio",
      titulo: "Pedir o envio ao Gerente",
      objetivo: "Fazer a carta seguir para aprovação.",
      aviso: "O Coordenador não envia a carta. Avise o Gerente do seu órgão quando o rascunho estiver pronto.",
      passos: [
        { titulo: "Confira o rascunho", texto: "Pré-visualize e corrija o que faltar.", print: "" },
        { titulo: "Avise o Gerente", texto: "Diga ao Gerente qual carta está pronta. Ele envia para o Aprovador Central.", print: "" },
      ],
    },
    {
      id: "corrigir-devolvida",
      titulo: "Corrigir uma carta devolvida",
      objetivo: "Ajustar a carta que o Aprovador Central devolveu com apontamentos.",
      aviso: "Ver o motivo da devolução direto na carta está previsto, mas ainda não está no sistema. Hoje o Gerente repassa os apontamentos.",
      passos: [
        { titulo: "Abra a carta devolvida", texto: "A carta aparece como Pendente de correção.", print: "" },
        { titulo: "Corrija os campos apontados", texto: "Mude só o que foi pedido e salve.", print: "" },
        { titulo: "Avise o Gerente", texto: "O Gerente reenvia a carta para aprovação.", print: "" },
      ],
    },
    {
      id: "excluir-rascunho",
      titulo: "Excluir um rascunho",
      objetivo: "Apagar uma carta que nunca foi publicada.",
      aviso: "Carta já publicada não é excluída pelo Coordenador.",
      passos: [
        { titulo: "Abra o rascunho", texto: "Encontre a carta que nunca foi publicada.", print: "" },
        { titulo: "Exclua", texto: "Use a opção de excluir e confirme.", print: "" },
      ],
    },
    {
      id: "historico",
      titulo: "Ver o histórico",
      objetivo: "Saber quem mudou o quê e quando.",
      passos: [
        { titulo: "Abra a carta", texto: "Encontre a carta e abra.", print: "" },
        { titulo: "Abra a aba Histórico", texto: "Veja as aprovações e quem criou e atualizou a carta, com data e hora.", print: "" },
      ],
    },
  ],
};
