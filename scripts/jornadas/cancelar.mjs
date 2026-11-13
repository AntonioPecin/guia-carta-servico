// Jornada: cancelar o envio de uma carta que está aguardando análise (perfil Gerente).
//   npm run jornada -- cancelar 2471
// Formato: ver scripts/jornadas/criar.mjs.
const MOTIVO = "Envio cancelado para ajustar a carta antes da análise.";

export default {
  titulo: "Cancelar o envio",
  video: "gerente-cancelar-envio",
  precisaId: true,
  inicio: (id) => `/admin/content/services/${id}`,
  esperar: "Descrição do Serviço",
  abertura: "Cancelar o envio de uma carta · perfil Gerente",
  passos: [
    {
      legenda: "Na carta Aguardando análise, clique em Cancelar solicitação",
      fazer: (a) => a.clicar(a.page.getByRole("button", { name: "Cancelar solicitação" }).first()),
    },
    {
      legenda: "Escreva o motivo e confirme",
      fazer: async (a) => {
        await a.escrever(a.page.locator("textarea").last(), MOTIVO);
        await a.clicar(a.page.getByRole("button", { name: "Cancelar solicitação" }).last());
        await a.page.getByText("Enviar para aprovação", { exact: false }).first().waitFor({ timeout: 20_000 });
      },
    },
  ],
  fechamento: "Pedido cancelado. A carta voltou a ser rascunho e pode ser enviada de novo",
};
