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

// Uma linha por tela:
//   arquivo   nome do PNG (o mesmo do campo `print` em conteudo/<perfil>.ts)
//   url       caminho no CMS
//   antes     ação antes do print (clicar aba, abrir menu, digitar busca)
//   destaque  o que contornar de vermelho: (page) => locator
//   semSessao true só na tela de login
const ROTEIRO = [
  { perfil: "coordenador", arquivo: "entrar-1-login.png", url: "/admin/login", semSessao: true, destaque: texto("Entrar com SSO") },
  { perfil: "coordenador", arquivo: "entrar-2-menu.png", url: "/admin/content/services", antes: buscar(""), destaque: (p) => p.locator(".content-navigation") },
  { perfil: "coordenador", arquivo: "encontrar-1-lista.png", url: "/admin/content/services", antes: buscar(""), destaque: item("Serviços") },
  {
    perfil: "coordenador",
    arquivo: "encontrar-2-busca.png",
    url: "/admin/content/services",
    antes: async (page) => {
      await buscar("fornecedores")(page);
      await page.getByText("Aderir ao cadastro de fornecedores").first().waitFor({ timeout: 10_000 }); // resultado na tela
    },
    depois: buscar(""), // não deixa a busca salva para as próximas telas
    destaque: (p) => p.locator(".search-input"),
  },
  { perfil: "coordenador", arquivo: "encontrar-3-carta.png", url: CARTA, destaque: texto("Descrição do Serviço") },
  { perfil: "coordenador", arquivo: "criar-1-descricao.png", url: "/admin/content/services/+", destaque: texto("Descrição do Serviço") },
  { perfil: "coordenador", arquivo: "criar-2-etapas.png", url: "/admin/content/services/+", antes: aba("Etapa do Serviço"), destaque: texto("Etapa do Serviço") },
  { perfil: "coordenador", arquivo: "criar-3-detalhes.png", url: "/admin/content/services/+", antes: aba("Detalhes do Serviço"), destaque: texto("Detalhes do Serviço") },
  { perfil: "coordenador", arquivo: "mudar-1-aviso.png", url: CARTA, destaque: (p) => p.getByText("VISÍVEL NO PORTAL").locator("xpath=../..") },
  { perfil: "coordenador", arquivo: "mudar-2-versoes.png", url: CARTA, antes: aba("Main"), destaque: item("Rascunho") },
  { perfil: "coordenador", arquivo: "mudar-3-rascunho.png", url: `${CARTA}?version=draft`, destaque: (p) => p.getByText("Este rascunho está igual").locator("xpath=../..") },
  { perfil: "coordenador", arquivo: "historico-1-aba.png", url: CARTA, antes: aba("Histórico"), destaque: texto("Histórico") },
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

const so = process.argv[2]; // npm run prints -- busca  → refaz só os arquivos com "busca" no nome
const browser = await conectar();
const logado = browser.contexts()[0];
const anonimo = await browser.newContext(); // sem sessão, só para a tela de login

for (const p of ROTEIRO.filter((r) => !so || r.arquivo.includes(so))) {
  const page = await (p.semSessao ? anonimo : logado).newPage();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setDeviceMetricsOverride", TELA);
  mkdirSync(`public/prints/${p.perfil}`, { recursive: true });
  await abrirMenu(page);
  await page.goto(`${CMS}${p.url}`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: ESCONDER });
  await page.waitForTimeout(1000);
  if (p.antes) await p.antes(page);
  await cdp.send("Emulation.setDeviceMetricsOverride", TELA); // reaplica: navegação pode desfazer
  await page.waitForTimeout(300);
  // ponytail: captura pelo CDP; o page.screenshot do Playwright ignora a escala emulada numa conexão CDP
  const foto = async () => Buffer.from((await cdp.send("Page.captureScreenshot", { format: "png" })).data, "base64");
  // original sem marcação, mesmo nome: base para refazer o destaque ou ajustar a imagem
  mkdirSync(`prints-originais/${p.perfil}`, { recursive: true });
  writeFileSync(`prints-originais/${p.perfil}/${p.arquivo}`, await foto());
  if (p.destaque) await destacar(p.destaque(page));
  writeFileSync(`public/prints/${p.perfil}/${p.arquivo}`, await foto());
  console.log(`ok  ${p.perfil}/${p.arquivo}`);
  if (p.depois) await p.depois(page);
  await page.close();
}
await anonimo.close();
process.exit(0); // só desconecta: browser.close() fecharia o Edge e o login
