// Vídeo: Coordenador criando uma carta de serviço (dados fictícios). No fim, a carta de teste é EXCLUÍDA.
//   npm run prints:login   (uma vez; entre no CMS)
//   npm run video          → gravacoes/coordenador-criar-carta.webm (cru, sem som; o site usa o .mp4 narrado em public/videos)
// Grava num contexto novo com a sessão copiada do Edge logado. Cada etapa tem legenda no pé da tela (sobe
// para o alto se for cobrir o campo) e uma moldura por fora só no que vai ser clicado (some depois do clique).
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
// no vídeo a moldura fica por fora do campo (destacarVideo); os prints seguem com o destacar de sempre
import { CMS, ESCONDER, abrirMenu, conectar, destacarVideo as destacar, legenda, limparDestaque } from "./comum.mjs";

const NOME = "Teste do guia - não publicar";
const PASTA = ".auth/video";
const DESTINO = "gravacoes/coordenador-criar-carta.webm";
const pausa = (page, ms = 900) => page.waitForTimeout(ms);

async function clicar(page, locator, ms = 800) {
  await destacar(locator);
  await pausa(page, ms);
  await locator.first().click();
  await limparDestaque(page);
  await pausa(page, 500);
}
async function escrever(page, locator, texto) {
  await destacar(locator);
  await pausa(page, 500);
  await locator.first().click();
  await page.keyboard.type(texto, { delay: 35 });
  await limparDestaque(page);
  await pausa(page, 400);
}
const campo = (page, rotulo) => page.locator(".field").filter({ has: page.getByText(rotulo, { exact: true }) }).first();
/** campo de relação (Categoria, Subcategoria): abre a gaveta e escolhe o primeiro item */
async function relacao(page, rotulo) {
  await clicar(page, campo(page, rotulo).locator(".interface .v-list-item, .interface button").first());
  const gaveta = page.locator(".v-drawer").last();
  await gaveta.waitFor();
  await pausa(page, 800);
  await clicar(page, gaveta.locator("tbody tr, .table-row, .v-list-item").first(), 600);
  if (await gaveta.isVisible()) await clicar(page, gaveta.locator('button:has([data-icon="check"])').first(), 500);
}
/** lista de opções (Tipo de Prazo, Tipo de Custo): abre e escolhe a primeira */
async function opcao(page, rotulo) {
  await clicar(page, campo(page, rotulo).locator(".interface .v-input, .interface .v-select, .interface input").first());
  await clicar(page, page.locator(".v-menu-content .v-list-item").first(), 500);
}
async function textoRico(page, rotulo, texto) {
  const area = campo(page, rotulo);
  await destacar(area.locator(".tox-tinymce").first());
  await pausa(page, 500);
  await area.frameLocator("iframe").locator("body").click();
  await page.keyboard.type(texto, { delay: 25 });
  await limparDestaque(page);
  await pausa(page, 400);
}

const ETAPAS = 7; // passos com legenda; a limpeza do fim não aparece no vídeo
let n = 0;
const etapa = async (page, texto, fn) => {
  n += 1;
  await legenda(page, `Passo ${n} de ${ETAPAS} · ${texto}`);
  try {
    await fn();
    console.log(`ok   ${texto}`);
    if (process.env.DEPURAR) await page.screenshot({ path: `${PASTA}-passo-${n}.png` });
  } catch (e) {
    console.warn(`erro ${texto}: ${e.message.split("\n")[0]}`);
  }
};

rmSync(PASTA, { recursive: true, force: true });
const browser = await conectar();
const ctx = await browser.newContext({
  storageState: await browser.contexts()[0].storageState(),
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: PASTA, size: { width: 1440, height: 900 } },
});
const page = await ctx.newPage();
await abrirMenu(page);
await page.addInitScript((css) => {
  document.addEventListener("DOMContentLoaded", () => {
    const st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
  });
}, ESCONDER);
await page.goto(`${CMS}/admin/content/services`, { waitUntil: "networkidle" });
await page.addStyleTag({ content: ESCONDER });
await legenda(page, "Criar uma carta de serviço · perfil Coordenador");
await pausa(page, 2000);

await etapa(page, "Em Serviços, clique em + para começar uma carta", async () => {
  await destacar(page.locator('a[href$="/services/+"]:visible'));
  await pausa(page, 1500);
  // ponytail: navega direto; o clique no + do Directus trava o Playwright (navegação no meio do clique)
  await page.goto(`${CMS}/admin/content/services/+`, { waitUntil: "networkidle" });
  // a janela de gravação passa pelo SSO (keycloak) antes de mostrar o formulário
  await page.getByText("Nome do serviço", { exact: true }).first().waitFor({ timeout: 60_000 });
  await pausa(page, 1000);
});
await etapa(page, "Escreva o nome do serviço, começando por um verbo", () =>
  escrever(page, campo(page, "Nome do serviço").locator("input"), NOME),
);
await etapa(page, "Marque o público e escolha categoria e subcategoria", async () => {
  await clicar(page, campo(page, "Público Específico").getByText("Cidadão", { exact: true }));
  await relacao(page, "Categoria");
  await relacao(page, "Subcategoria");
  await relacao(page, "Órgão");
});
await etapa(page, "Explique o serviço, os documentos e quem pode usar", async () => {
  await textoRico(page, "O que é este serviço?", "Serviço de teste criado para o guia do Coordenador.");
  await textoRico(page, "Documentos Necessários", "Documento de identidade.");
  await textoRico(page, "Quem pode utilizar esse serviço?", "Qualquer pessoa.");
});
await etapa(page, "Aba Etapa do Serviço: escolha o canal de prestação", async () => {
  await clicar(page, page.getByText("Etapa do Serviço", { exact: true }));
  await clicar(page, campo(page, "Canal de Prestação").getByText("Online", { exact: true }));
  // o CMS exige ao menos uma etapa para cada canal marcado
  await clicar(page, page.getByRole("button", { name: "Criar novo" }).first());
  const gaveta = page.locator(".v-drawer").last();
  await gaveta.waitFor();
  await pausa(page, 800);
  await escrever(page, gaveta.locator("input:visible").first(), "Acesse o portal e preencha o formulário");
  const rico = gaveta.frameLocator("iframe").first();
  if (await gaveta.locator("iframe").count()) {
    await rico.locator("body").click();
    await page.keyboard.type("Entre com a sua conta gov.br e envie o pedido.", { delay: 25 });
  }
  await clicar(page, gaveta.locator('button:has([data-icon="check"])').first(), 600);
});
await etapa(page, "Aba Detalhes do Serviço: prazo e custo", async () => {
  await clicar(page, page.getByText("Detalhes do Serviço", { exact: true }));
  await opcao(page, "Tipo de Prazo");
  await escrever(page, campo(page, "Prazo de atendimento").locator("input"), "5");
  await opcao(page, "Tipo de Custo");
});
await etapa(page, "Salve no ✓, no alto à direita", async () => {
  await clicar(page, page.locator('button:has([data-icon="check"])').first(), 1200);
  // depois de salvar, o CMS volta para a lista de Serviços
  await page.getByText(NOME, { exact: true }).first().waitFor({ timeout: 20_000 }).catch(async (e) => {
    await page.screenshot({ path: ".auth/erro-salvar.png" });
    const avisos = await page.locator(".v-notice, .validation-errors, .notification").allInnerTexts();
    console.warn("avisos do CMS:", avisos.map((t) => t.trim()).filter(Boolean).slice(0, 6));
    throw e;
  });
  await destacar(page.getByText(NOME, { exact: true }));
  await legenda(page, "Carta salva como rascunho. Agora avise o Gerente para enviar para aprovação");
  await pausa(page, 3500);
});

// limpeza (fora do vídeo): exclui a carta de teste pela API, com o mesmo usuário Coordenador
async function excluirTeste(pg) {
  return pg.evaluate(async (nome) => {
    const url = `/items/services?filter[name][_eq]=${encodeURIComponent(nome)}&fields=id`;
    for (const c of (await (await fetch(url)).json()).data ?? []) await fetch(`/items/services/${c.id}`, { method: "DELETE" });
    return ((await (await fetch(url)).json()).data ?? []).length;
  }, NOME);
}
const sobrou = await excluirTeste(page);

const video = page.video();
// o SSO renova a sessão nesta janela e a do Edge expira: devolve os cookies novos ao Edge
await browser.contexts()[0].addCookies(await ctx.cookies());
await ctx.close(); // fecha só o contexto da gravação; o Edge continua aberto e logado
mkdirSync("gravacoes", { recursive: true });
copyFileSync(await video.path(), DESTINO);
console.log(`vídeo: ${DESTINO}`);
console.log(sobrou ? `ATENÇÃO: a carta "${NOME}" ficou no CMS. Exclua em ${CMS}/admin/content/services` : "nenhuma carta de teste ficou no CMS");
process.exit(0); // só desconecta do Edge
