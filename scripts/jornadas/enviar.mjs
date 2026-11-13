// Jornada: enviar uma carta para aprovação (perfil Gerente).
//   npm run jornada -- enviar 2471              envia a carta 2471
//   npm run jornada -- enviar 2471 --video      grava public/videos/gerente-enviar-para-aprovacao.webm
// Se a carta já estiver aguardando análise, cancela o pedido antes (fora do vídeo), para poder repetir.
// Formato: ver scripts/jornadas/criar.mjs.
import { CMS } from "../comum.mjs";
import cancelar from "./cancelar.mjs";

const JUSTIFICATIVA = "Carta nova do serviço, revisada pelo órgão e pronta para publicar.";
const botao = (a, nome) => a.page.getByRole("button", { name: nome }).first();

export default {
  titulo: "Enviar para aprovação",
  video: "gerente-enviar-para-aprovacao",
  precisaId: true,
  inicio: (id) => `/admin/content/services/${id}`,
  esperar: "Descrição do Serviço",
  abertura: "Enviar uma carta para aprovação · perfil Gerente",
  preparar: async (a, id) => {
    await a.page.goto(`${CMS}/admin/content/services/${id}`, { waitUntil: "networkidle" });
    await a.page.getByText("Descrição do Serviço", { exact: true }).first().waitFor({ timeout: 60_000 });
    if (await botao(a, "Cancelar solicitação").isVisible().catch(() => false)) {
      await cancelar.passos[0].fazer(a, id);
      await cancelar.passos[1].fazer(a, id);
      console.log("pedido aberto cancelado antes de gravar");
    }
  },
  passos: [
    {
      legenda: "Abra a carta. O quadro no alto diz se ela está pronta para enviar",
      fazer: (a) => a.mostrar(botao(a, "Enviar para aprovação").locator("xpath=ancestor::div[.//*[contains(text(),'pronta para enviar')]][1]"), "area", 2500),
    },
    { legenda: "Clique em Enviar para aprovação", fazer: (a) => a.clicar(botao(a, "Enviar para aprovação")) },
    {
      legenda: "Conte em uma frase o que é a carta ou o que mudou",
      fazer: (a) => a.escrever(a.page.locator("textarea").last(), JUSTIFICATIVA),
    },
    { legenda: "Clique em Enviar", fazer: (a) => a.clicar(a.page.getByRole("button", { name: "Enviar", exact: true })) },
    {
      legenda: "Pronto: a carta fica Aguardando análise, com o número do pedido",
      fazer: async (a) => {
        await a.page.getByText("Aguardando análise", { exact: false }).first().waitFor({ timeout: 20_000 });
        await a.mostrar(a.page.getByText("Solicitação", { exact: true }).locator("xpath=../.."), "atencao", 3000);
      },
    },
  ],
  fechamento: "Agora é com o Aprovador Central. Acompanhe em Aprovações",
  resultado: async (a, id) => `carta ${id}: ${(await a.page.getByText(/#\d{5}/).first().innerText().catch(() => "?"))} aguardando análise`,
};
