// Prints do CMS em alta resolução (tela 1440x900 em 2x = PNG 2880x1800) para o guia.
//
//   npm run prints:login   abre o SEU Edge (perfil próprio em .auth/edge, fora do git). Entre no CMS normalmente.
//   npm run prints         com esse Edge aberto, refaz o ROTEIRO e salva em public/prints/<perfil>/
//
// Por que assim: o gov.br recusa login em navegador controlado por automação. Aqui o Edge é aberto como um
// navegador comum (você faz o login) e o script só se conecta a ele depois, pela porta de depuração, para fotografar.
// O site é público: antes de cada print o script esconde a foto do usuário e o contador de notificações.
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const CMS = "https://cms.app.hom.pgd.ms.gov.br";
const EDGE = process.env.EDGE_PATH ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PORTA = 9333;
const PERFIL_EDGE = resolve(".auth/edge");
const CARTA = "/admin/content/services/1691"; // "Aderir ao cadastro de fornecedores" (SAD), carta publicada
const ESCONDER = ".avatar-btn, .notifications-badge { visibility: hidden !important; }";
// Padrão de todos os prints: mesma tela e mesma escala → PNG 2880x1800
const TELA = { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false };

const aba = (nome) => async (page) => {
  await page.getByText(nome, { exact: true }).first().click();
  await page.waitForTimeout(800);
};

// { perfil, arquivo, url, antes?, semSessao? } — `antes` clica ou digita antes do print
const ROTEIRO = [
  { perfil: "coordenador", arquivo: "entrar-1-login.png", url: "/admin/login", semSessao: true },
  { perfil: "coordenador", arquivo: "entrar-2-menu.png", url: "/admin/content/services" },
  { perfil: "coordenador", arquivo: "encontrar-1-lista.png", url: "/admin/content/services" },
  {
    perfil: "coordenador",
    arquivo: "encontrar-2-busca.png",
    url: "/admin/content/services",
    antes: async (page) => {
      await page.locator(".search-input").first().click();
      await page.keyboard.type("fornecedores", { delay: 40 });
      await page.waitForTimeout(1500);
    },
  },
  { perfil: "coordenador", arquivo: "encontrar-3-carta.png", url: CARTA },
  { perfil: "coordenador", arquivo: "criar-1-descricao.png", url: "/admin/content/services/+" },
  { perfil: "coordenador", arquivo: "criar-2-etapas.png", url: "/admin/content/services/+", antes: aba("Etapa do Serviço") },
  { perfil: "coordenador", arquivo: "criar-3-detalhes.png", url: "/admin/content/services/+", antes: aba("Detalhes do Serviço") },
  { perfil: "coordenador", arquivo: "mudar-1-aviso.png", url: CARTA },
  {
    perfil: "coordenador",
    arquivo: "mudar-2-versoes.png",
    url: CARTA,
    antes: async (page) => {
      await page.getByText("Main", { exact: true }).first().click();
      await page.waitForTimeout(800);
    },
  },
  { perfil: "coordenador", arquivo: "mudar-3-rascunho.png", url: `${CARTA}?version=draft` },
  { perfil: "coordenador", arquivo: "historico-1-aba.png", url: CARTA, antes: aba("Histórico") },
];

if (process.argv.includes("--login")) {
  mkdirSync(PERFIL_EDGE, { recursive: true });
  spawn(EDGE, [`--remote-debugging-port=${PORTA}`, `--user-data-dir=${PERFIL_EDGE}`, "--no-first-run", `${CMS}/admin/login`], {
    detached: true,
    stdio: "ignore",
  }).unref();
  console.log("Edge aberto. Entre no CMS e deixe a janela aberta. Depois: npm run prints");
  process.exit(0);
}

let browser;
try {
  browser = await chromium.connectOverCDP(`http://127.0.0.1:${PORTA}`);
} catch {
  console.error("Edge não está aberto. Rode antes: npm run prints:login (e entre no CMS).");
  process.exit(1);
}

const logado = browser.contexts()[0];
const anonimo = await browser.newContext(); // sem sessão, só para a tela de login

for (const p of ROTEIRO) {
  const page = await (p.semSessao ? anonimo : logado).newPage();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setDeviceMetricsOverride", TELA);
  mkdirSync(`public/prints/${p.perfil}`, { recursive: true });
  await page.goto(`${CMS}${p.url}`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: ESCONDER });
  await page.waitForTimeout(1000);
  if (p.antes) await p.antes(page);
  await cdp.send("Emulation.setDeviceMetricsOverride", TELA); // reaplica: navegação pode desfazer
  await page.waitForTimeout(300);
  // ponytail: captura pelo CDP; o page.screenshot do Playwright ignora a escala emulada numa conexão CDP
  const { data } = await cdp.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`public/prints/${p.perfil}/${p.arquivo}`, Buffer.from(data, "base64"));
  console.log(`ok  ${p.perfil}/${p.arquivo}`);
  await page.close();
}
await anonimo.close();
await browser.close(); // desconecta; o Edge continua aberto
