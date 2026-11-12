// Gera o PDF de cada perfil pronto a partir do site estático (out/), com as margens do CSS e sem data nem endereço
// no cabeçalho. Salva em out/pdf/<perfil>.pdf (vai para a Vercel) e em public/pdf/ (para o npm run dev).
//   npm run build && npm run pdf
import { chromium } from "playwright";
import { createServer } from "node:http";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

const PERFIS = ["coordenador"]; // ponytail: lista à mão; ler de conteudo/perfis.ts quando houver mais perfis prontos
const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".webm": "video/webm", ".woff2": "font/woff2" };

const servidor = createServer((req, res) => {
  let arq = join("out", decodeURIComponent(req.url.split("?")[0]));
  if (!extname(arq)) arq = join(arq, "index.html");
  if (!existsSync(arq)) return res.writeHead(404).end();
  res.writeHead(200, { "Content-Type": TIPOS[extname(arq)] ?? "application/octet-stream" }).end(readFileSync(arq));
}).listen(0);
const base = `http://127.0.0.1:${servidor.address().port}`;

const browser = await chromium.launch({ channel: process.env.PW_CANAL ?? "msedge" });
const page = await browser.newPage();
mkdirSync("out/pdf", { recursive: true });
mkdirSync("public/pdf", { recursive: true });
for (const perfil of PERFIS) {
  await page.goto(`${base}/${perfil}/`, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.pdf({ path: `out/pdf/${perfil}.pdf`, preferCSSPageSize: true, printBackground: true });
  copyFileSync(`out/pdf/${perfil}.pdf`, `public/pdf/${perfil}.pdf`);
  console.log(`ok  pdf/${perfil}.pdf`);
}
await browser.close();
servidor.close();
