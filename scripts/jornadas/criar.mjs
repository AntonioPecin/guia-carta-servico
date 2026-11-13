// Jornada: criar uma carta de serviço (perfil Coordenador ou Gerente), com dados fictícios.
//   npm run jornada -- criar            cria e mostra o id (use depois: npm run jornada -- enviar <id>)
//   npm run video                       grava o vídeo do Coordenador e exclui a carta no fim (--limpar)
// Formato de toda jornada: titulo, video (nome do arquivo), inicio(id) (caminho no CMS), esperar (texto que mostra
// que a tela carregou), abertura, passos [{ legenda, fazer(a, id) }], fechamento e, se precisar, precisaId,
// preparar(a, id) (antes de gravar), resultado(a, id) e limpar(a, id). `a` são as ações de scripts/comum.mjs.
import { CMS } from "../comum.mjs";

const NOME = "Teste do guia - não publicar";
const buscar = (a) => a.api(`/items/services?filter[name][_eq]=${encodeURIComponent(NOME)}&fields=id&sort=-id`);

export default {
  titulo: "Criar uma carta",
  video: "coordenador-criar-carta",
  inicio: () => "/admin/content/services",
  abertura: "Criar uma carta de serviço · perfil Coordenador",
  passos: [
    {
      legenda: "Em Serviços, clique em + para começar uma carta",
      fazer: async (a) => {
        await a.mostrar(a.page.locator('a[href$="/services/+"]:visible'), "acao", 1500);
        // ponytail: navega direto; o clique no + do Directus trava o Playwright (navegação no meio do clique)
        await a.page.goto(`${CMS}/admin/content/services/+`, { waitUntil: "networkidle" });
        await a.page.getByText("Nome do serviço", { exact: true }).first().waitFor({ timeout: 60_000 });
        await a.pausa(1000);
      },
    },
    { legenda: "Escreva o nome do serviço, começando por um verbo", fazer: (a) => a.escrever(a.campo("Nome do serviço").locator("input"), NOME) },
    {
      legenda: "Marque o público e escolha categoria e subcategoria",
      fazer: async (a) => {
        await a.clicar(a.campo("Público Específico").getByText("Cidadão", { exact: true }));
        await a.relacao("Categoria");
        await a.relacao("Subcategoria");
        await a.relacao("Órgão");
      },
    },
    {
      legenda: "Explique o serviço, os documentos e quem pode usar",
      fazer: async (a) => {
        await a.textoRico("O que é este serviço?", "Serviço de teste criado para o guia.");
        await a.textoRico("Documentos Necessários", "Documento de identidade.");
        await a.textoRico("Quem pode utilizar esse serviço?", "Qualquer pessoa.");
      },
    },
    {
      legenda: "Aba Etapa do Serviço: escolha o canal de prestação",
      fazer: async (a) => {
        await a.clicar(a.page.getByText("Etapa do Serviço", { exact: true }));
        await a.clicar(a.campo("Canal de Prestação").getByText("Online", { exact: true }));
        // o CMS exige ao menos uma etapa para cada canal marcado
        await a.clicar(a.page.getByRole("button", { name: "Criar novo" }).first());
        const gaveta = a.page.locator(".v-drawer").last();
        await gaveta.waitFor();
        await a.pausa(800);
        await a.escrever(gaveta.locator("input:visible").first(), "Acesse o portal e preencha o formulário");
        if (await gaveta.locator("iframe").count()) {
          await gaveta.frameLocator("iframe").first().locator("body").click();
          await a.page.keyboard.type("Entre com a sua conta gov.br e envie o pedido.", { delay: 25 });
        }
        await a.clicar(gaveta.locator('button:has([data-icon="check"])').first(), 600);
      },
    },
    {
      legenda: "Aba Detalhes do Serviço: prazo e custo",
      fazer: async (a) => {
        await a.clicar(a.page.getByText("Detalhes do Serviço", { exact: true }));
        await a.opcao("Tipo de Prazo");
        await a.escrever(a.campo("Prazo de atendimento").locator("input"), "5");
        await a.opcao("Tipo de Custo");
      },
    },
    {
      legenda: "Salve no ✓, no alto à direita",
      fazer: async (a) => {
        await a.clicar(a.page.locator('button:has([data-icon="check"])').first(), 1200);
        // depois de salvar, o CMS volta para a lista de Serviços
        await a.page.getByText(NOME, { exact: true }).first().waitFor({ timeout: 20_000 });
        await a.mostrar(a.page.getByText(NOME, { exact: true }), "area", 1000);
      },
    },
  ],
  fechamento: "Carta salva como rascunho. Agora o Gerente envia para aprovação",
  resultado: async (a) => {
    const id = (await buscar(a)).data?.[0]?.id;
    return id ? `carta criada: id ${id} → ${CMS}/admin/content/services/${id}\nenviar: npm run jornada -- enviar ${id}` : "carta não encontrada";
  },
  limpar: async (a) => {
    for (const c of (await buscar(a)).data ?? []) await a.api(`/items/services/${c.id}`, "DELETE");
    const sobrou = (await buscar(a)).data?.length;
    return sobrou ? `ATENÇÃO: a carta "${NOME}" ficou no CMS. Exclua em ${CMS}/admin/content/services` : "carta de teste excluída";
  },
};
