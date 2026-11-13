// Prints do CMS em alta resolução (tela 1440x900 em 2x = PNG 2880x1800) para o guia.
//
//   npm run prints:login   abre o SEU Edge (perfil próprio em .auth/edge, fora do git). Entre no CMS normalmente.
//   npm run prints         com esse Edge aberto, refaz o ROTEIRO e salva em public/prints/<perfil>/
//
// Por que assim: o gov.br recusa login em navegador controlado por automação. Aqui o Edge é aberto como um
// navegador comum (você faz o login) e o script só se conecta a ele depois, pela porta de depuração, para fotografar.
// Endereço do CMS: conteudo/ambiente.json. Passo a passo: docs/04-capturar-prints.md
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { CMS, EDGE, ESCONDER, PORTA, TELA, abrirMenu, conectar, destacar } from "./comum.mjs";

const CARTA = "/admin/content/services/1691"; // "Aderir ao cadastro de fornecedores" (SAD), carta publicada
const texto = (t) => (page) => page.getByText(t, { exact: true });
// linha inteira do item de menu (Directus: .v-list-item)
const item = (t) => (page) => page.locator(".v-list-item").filter({ has: page.getByText(t, { exact: true }) });
// o Directus guarda a busca da lista entre as visitas: sem limpar, os prints saem filtrados
const buscar = (termo) => async (page) => {
  const campo = page.locator(".search-input input").first();
  if (!(await campo.isVisible()) && !termo) return;
  if (!(await campo.isVisible())) await page.locator(".search-input").first().click();
  await campo.fill(termo);
  await page.waitForTimeout(2000);
};
const aba = (nome) => async (page) => {
  await page.getByText(nome, { exact: true }).first().click();
  await page.waitForTimeout(800);
};
// o site é público: troca o nome de quem está logado (ex.: coluna Solicitante) por um rótulo genérico
const semNome = async (page) => {
  await page.evaluate(async () => {
    const eu = (await (await fetch("/users/me?fields=first_name,last_name")).json()).data;
    const nome = `${eu.first_name} ${eu.last_name ?? ""}`.trim();
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) if (w.currentNode.nodeValue.includes(eu.first_name)) w.currentNode.nodeValue = w.currentNode.nodeValue.replace(nome, "Nome do Gerente").replace(eu.first_name, "Nome do Gerente");
  });
};
// Gerente: envio e cancelamento de verdade na carta de teste (fica igual no fim da sequência)
const CARTA_TESTE = "/admin/content/services/2471"; // "Teste Fabio Homolog" (SAD), carta de teste
const abrirEnvio = async (page) => {
  await page.getByRole("button", { name: "Enviar para aprovação" }).first().click();
  await page.waitForTimeout(1200);
  await page.locator("textarea").last().fill("Carta nova do serviço de teste do guia.");
};
const enviarTeste = async (page) => {
  await abrirEnvio(page);
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await page.getByText("Aguardando análise", { exact: false }).first().waitFor({ timeout: 15_000 });
};
const abrirCancelar = async (page) => {
  await page.getByRole("button", { name: "Cancelar solicitação" }).first().click();
  await page.waitForTimeout(1200);
  await page.locator("textarea").last().fill("Envio de teste do guia, cancelado.");
};
const confirmarCancelar = async (page) => {
  await page.getByRole("button", { name: "Cancelar solicitação" }).last().click();
  await page.getByText("Carta pronta para enviar para aprovação").first().waitFor({ timeout: 15_000 });
};

// Uma linha por tela:
//   arquivo   nome do PNG (o mesmo do campo `print` em conteudo/<perfil>.ts)
//   url       caminho no CMS
//   antes     ação antes do print (clicar aba, abrir menu, digitar busca)
//   destaque  o elemento a marcar: (page) => locator
//   tipo      "acao" (azul, default), "area" (fundo azul claro) ou "atencao" (âmbar). Casa com `tipo` do passo em conteudo/<perfil>.ts.
//   numero    número do passo a mostrar na badge do destaque (casa com DsSteps na página)
//   recorte   "tela" (default), "elemento" (só o destaque + margem) ou "secao" (contêiner pai + margem).
//             Recorte: (page) => locator; se omitido com "secao", usa o pai do destaque
//   semSessao true só na tela de login
const ROTEIRO = [
  { perfil: "coordenador", arquivo: "entrar-1-login.png", url: "/admin/login", semSessao: true, destaque: texto("Entrar com SSO"), tipo: "acao", numero: 2, recorte: "elemento" },
  { perfil: "coordenador", arquivo: "entrar-2-menu.png", url: "/admin/content/services", antes: buscar(""), destaque: (p) => p.locator(".content-navigation"), tipo: "area", numero: 3, recorte: "secao" },
  { perfil: "coordenador", arquivo: "encontrar-1-lista.png", url: "/admin/content/services", antes: buscar(""), destaque: item("Serviços"), tipo: "acao", numero: 1, recorte: "secao" },
  {
    perfil: "coordenador",
    arquivo: "encontrar-2-busca.png",
    url: "/admin/content/services",
    antes: async (page) => {
      await buscar("fornecedores")(page);
      await page.getByText("Aderir ao cadastro de fornecedores").first().waitFor({ timeout: 10_000 });
    },
    depois: buscar(""),
    destaque: (p) => p.locator(".search-input"),
    tipo: "acao",
    numero: 2,
    recorte: "elemento",
  },
  { perfil: "coordenador", arquivo: "encontrar-3-carta.png", url: CARTA, destaque: texto("Descrição do Serviço"), tipo: "area", numero: 3, recorte: "tela" },
  // botão + (criar): apontar sem clicar — clicar trava o Playwright (ver CLAUDE.md)
  { perfil: "coordenador", arquivo: "criar-0-novo.png", url: "/admin/content/services", antes: buscar(""), destaque: (p) => p.locator(".action-create, [data-test='create-item']").first(), tipo: "acao", numero: 1, recorte: "elemento" },
  { perfil: "coordenador", arquivo: "criar-1-descricao.png", url: "/admin/content/services/+", destaque: (p) => p.locator(".v-form, .content-form, form").first(), tipo: "area", numero: 2, recorte: "secao" },
  { perfil: "coordenador", arquivo: "criar-2-etapas.png", url: "/admin/content/services/+", antes: aba("Etapa do Serviço"), destaque: (p) => p.locator(".v-form, .content-form, form").first(), tipo: "area", numero: 3, recorte: "secao" },
  { perfil: "coordenador", arquivo: "criar-3-detalhes.png", url: "/admin/content/services/+", antes: aba("Detalhes do Serviço"), destaque: (p) => p.locator(".v-form, .content-form, form").first(), tipo: "area", numero: 4, recorte: "secao" },
  { perfil: "coordenador", arquivo: "criar-4-salvar.png", url: "/admin/content/services/+", destaque: (p) => p.locator(".action-save, button[aria-label*='Salvar' i], button[data-test='save-button']").first(), tipo: "acao", numero: 5, recorte: "elemento" },
  { perfil: "coordenador", arquivo: "mudar-1-aviso.png", url: CARTA, destaque: (p) => p.getByText("VISÍVEL NO PORTAL").locator("xpath=../.."), tipo: "atencao", numero: 1, recorte: "elemento" },
  { perfil: "coordenador", arquivo: "mudar-2-versoes.png", url: CARTA, antes: aba("Main"), destaque: item("Rascunho"), tipo: "acao", numero: 2, recorte: "elemento" },
  { perfil: "coordenador", arquivo: "mudar-3-rascunho.png", url: `${CARTA}?version=draft`, destaque: (p) => p.getByText("Este rascunho está igual").locator("xpath=../.."), tipo: "atencao", numero: 3, recorte: "elemento" },
  { perfil: "coordenador", arquivo: "historico-1-aba.png", url: CARTA, antes: aba("Histórico"), destaque: texto("Histórico"), tipo: "area", numero: 1, recorte: "secao" },
  // Gerente (13/11/2026): logar com perfil Gerente. A sequência envia a carta de teste 2471 e cancela no fim (pode repetir)
  { perfil: "gerente", arquivo: "enviar-1-carta.png", url: CARTA_TESTE, destaque: (p) => p.getByRole("button", { name: "Enviar para aprovação" }).first().locator("xpath=ancestor::div[.//*[contains(text(),'pronta para enviar')]][1]"), tipo: "area", numero: 1, recorte: "tela" },
  { perfil: "gerente", arquivo: "enviar-2-botao.png", url: CARTA_TESTE, destaque: (p) => p.getByRole("button", { name: "Enviar para aprovação" }), tipo: "acao", numero: 2, recorte: "elemento" },
  { perfil: "gerente", arquivo: "enviar-3-justificativa.png", url: CARTA_TESTE, antes: abrirEnvio, destaque: (p) => p.locator("textarea").last(), tipo: "area", numero: 3, recorte: "tela" },
  { perfil: "gerente", arquivo: "enviar-4-aguardando.png", url: CARTA_TESTE, antes: enviarTeste, destaque: (p) => p.getByText("Solicitação", { exact: true }).locator("xpath=../.."), tipo: "atencao", numero: 4, recorte: "elemento" },
  { perfil: "gerente", arquivo: "acompanhar-1-fila.png", url: "/admin/aprovacoes", antes: semNome, destaque: (p) => p.locator("table").first(), tipo: "area", numero: 1, recorte: "tela" },
  { perfil: "gerente", arquivo: "cancelar-1-botao.png", url: CARTA_TESTE, destaque: (p) => p.getByRole("button", { name: "Cancelar solicitação" }), tipo: "acao", numero: 1, recorte: "elemento" },
  { perfil: "gerente", arquivo: "cancelar-2-motivo.png", url: CARTA_TESTE, antes: abrirCancelar, depois: confirmarCancelar, destaque: (p) => p.locator("textarea").last(), tipo: "area", numero: 2, recorte: "tela" },
  { perfil: "gerente", arquivo: "mudar-1-versoes.png", url: CARTA, antes: aba("Main"), destaque: item("Rascunho"), tipo: "acao", numero: 1, recorte: "elemento" },
  { perfil: "gerente", arquivo: "mudar-2-enviar.png", url: `${CARTA}?version=draft`, destaque: (p) => p.getByRole("button", { name: "Enviar para aprovação" }), tipo: "acao", numero: 2, recorte: "elemento" },
  { perfil: "gerente", arquivo: "unidades-1-lista.png", url: "/admin/content/locations", destaque: item("Unidades"), tipo: "acao", numero: 1, recorte: "secao" },
  { perfil: "gerente", arquivo: "unidades-2-abas.png", url: "/admin/content/locations/1745", destaque: texto("Identificação"), tipo: "area", numero: 2, recorte: "tela" },
  { perfil: "gerente", arquivo: "unidades-3-orgao.png", url: "/admin/content/organizations/79", destaque: texto("Vínculos"), tipo: "area", numero: 3, recorte: "tela" },
];

if (process.argv.includes("--login")) {
  const perfilEdge = resolve(".auth/edge");
  mkdirSync(perfilEdge, { recursive: true });
  spawn(EDGE, [`--remote-debugging-port=${PORTA}`, `--user-data-dir=${perfilEdge}`, "--no-first-run", `${CMS}/admin/login`], {
    detached: true,
    stdio: "ignore",
  }).unref();
  console.log("Edge aberto. Entre no CMS e deixe a janela aberta. Depois: npm run prints");
  process.exit(0);
}

const so = process.argv[2]; // npm run prints -- busca  → só os que têm "busca" no nome; -- gerente/ → só o perfil
const browser = await conectar();
const logado = browser.contexts()[0];
const anonimo = await browser.newContext(); // sem sessão, só para a tela de login

// bbox do elemento (ou do pai de uma seção) + margem para recorte; devolve clip do CDP (scale=1,
// pois o deviceScaleFactor da emulação já dobra o PNG). Null = tela cheia (seletor não achado
// ou recorte "tela" explícito).
async function calcularClip(locator, modo) {
  if (modo !== "elemento" && modo !== "secao") return null;
  try {
    const base = locator.first();
    const bb = modo === "secao"
      ? await base.locator("xpath=ancestor::*[self::section or self::form or contains(@class,'v-form') or contains(@class,'content-form') or contains(@class,'v-list') or contains(@class,'content-navigation')][1]").first().boundingBox({ timeout: 3000 }).catch(() => null)
      : await base.boundingBox({ timeout: 3000 });
    if (!bb) return null;
    const pad = modo === "elemento" ? 120 : 60;
    const x = Math.max(0, bb.x - pad);
    const y = Math.max(0, bb.y - pad);
    const width = Math.min(TELA.width - x, bb.width + pad * 2);
    const height = Math.min(TELA.height - y, bb.height + pad * 2);
    return { x, y, width, height, scale: 1 };
  } catch {
    console.warn("    recorte não calculado: usa tela cheia");
    return null;
  }
}

for (const p of ROTEIRO.filter((r) => !so || `${r.perfil}/${r.arquivo}`.includes(so))) {
  const page = await (p.semSessao ? anonimo : logado).newPage();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setDeviceMetricsOverride", TELA);
  mkdirSync(`public/prints/${p.perfil}`, { recursive: true });
  await abrirMenu(page);
  await page.goto(`${CMS}${p.url}`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: ESCONDER });
  await page.waitForTimeout(1000);
  if (p.antes) await p.antes(page);
  await cdp.send("Emulation.setDeviceMetricsOverride", TELA);
  await page.waitForTimeout(300);
  const clip = p.destaque ? await calcularClip(p.destaque(page), p.recorte) : null;
  // ponytail: captura pelo CDP; o page.screenshot do Playwright ignora a escala emulada numa conexão CDP
  const foto = async () =>
    Buffer.from(
      (await cdp.send("Page.captureScreenshot", { format: "png", ...(clip && { clip }) })).data,
      "base64",
    );
  mkdirSync(`prints-originais/${p.perfil}`, { recursive: true });
  writeFileSync(`prints-originais/${p.perfil}/${p.arquivo}`, await foto());
  if (p.destaque) await destacar(p.destaque(page), { tipo: p.tipo, numero: p.numero });
  writeFileSync(`public/prints/${p.perfil}/${p.arquivo}`, await foto());
  console.log(`ok  ${p.perfil}/${p.arquivo}`);
  if (p.depois) await p.depois(page);
  await page.close();
}
await anonimo.close();
process.exit(0); // só desconecta: browser.close() fecharia o Edge e o login
