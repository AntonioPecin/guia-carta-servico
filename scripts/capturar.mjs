// Prints do CMS em alta qualidade (PNG 2x) para o guia.
//   node scripts/capturar.mjs --login   abre o navegador; você entra no CMS e fecha a janela. A sessão fica em .auth/
//   node scripts/capturar.mjs           refaz o roteiro abaixo e salva em public/prints/<perfil>/
// O roteiro nasce da navegação feita antes (docs/01-plano.md, fase 2). Não use dado pessoal real: o site é público.
import { chromium } from "playwright";
import { mkdirSync, existsSync } from "node:fs";

const CMS = "https://cms.app.hom.pgd.ms.gov.br";
const SESSAO = ".auth/cms.json";

// { perfil, arquivo, url, antes?: async (page) => {} }  — `antes` clica ou preenche antes do print
const ROTEIRO = [
  { perfil: "coordenador", arquivo: "entrar-3-tela-inicial.png", url: "/admin/content" },
  { perfil: "coordenador", arquivo: "encontrar-1-lista.png", url: "/admin/content/services" },
];

if (process.argv.includes("--login")) {
  mkdirSync(".auth", { recursive: true });
  const browser = await chromium.launch({ headless: false });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(`${CMS}/admin/login`);
  console.log("Entre no CMS. Quando a lista de conteúdo aparecer, a sessão é salva.");
  await page.waitForURL(/\/admin\/content/, { timeout: 5 * 60_000 });
  await ctx.storageState({ path: SESSAO });
  await browser.close();
  console.log(`Sessão salva em ${SESSAO}.`);
  process.exit(0);
}

if (!existsSync(SESSAO)) {
  console.error("Sem sessão. Rode primeiro: npm run prints:login");
  process.exit(1);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({
  storageState: SESSAO,
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
for (const p of ROTEIRO) {
  mkdirSync(`public/prints/${p.perfil}`, { recursive: true });
  await page.goto(`${CMS}${p.url}`, { waitUntil: "networkidle" });
  if (p.antes) await p.antes(page);
  await page.screenshot({ path: `public/prints/${p.perfil}/${p.arquivo}` });
  console.log(`ok  ${p.perfil}/${p.arquivo}`);
}
await browser.close();
