// Partes usadas pelos scripts de print e de vídeo.
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

/** endereço do CMS: troque em conteudo/ambiente.json (homologação → produção) */
export const CMS = JSON.parse(readFileSync("conteudo/ambiente.json", "utf8")).url;
export const EDGE = process.env.EDGE_PATH ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
export const PORTA = 9333;
/** some com o que identifica a pessoa logada (o site é público) */
export const ESCONDER = ".avatar-btn, .notifications-badge { visibility: hidden !important; }";
/** padrão de todos os prints: 1440x900 em escala 2 → PNG 2880x1800 */
export const TELA = { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false };

/** conecta ao Edge aberto por `npm run prints:login` */
export async function conectar() {
  try {
    return await chromium.connectOverCDP(`http://127.0.0.1:${PORTA}`);
  } catch {
    console.error("Edge não está aberto. Rode antes: npm run prints:login (e entre no CMS).");
    process.exit(1);
  }
}

/** menu da esquerda sempre aberto: o Directus guarda o recolhido no localStorage. Chamar antes do goto */
export async function abrirMenu(page) {
  await page.addInitScript(() => {
    localStorage.removeItem("nav-bar-collapsed");
    localStorage.removeItem("nav-bar-size");
  });
}

/** contorna o elemento com borda vermelha: mostra no print onde clicar */
export async function destacar(locator) {
  try {
    await locator.first().evaluate(
      (el) => {
        // um destaque por vez: tira o anterior
        document.querySelectorAll("[data-guia-destaque]").forEach((x) => {
          x.style.outline = "";
          x.removeAttribute("data-guia-destaque");
        });
        el.setAttribute("data-guia-destaque", "");
        el.scrollIntoView({ block: "center" });
        // ponytail: cor de alerta fixa; o print é do CMS, fora do Design System
        // borda por dentro: item de menu fica dentro de contêiner que corta o que passa da borda
        el.style.outline = "4px solid #E60000";
        el.style.outlineOffset = "-4px";
        el.style.borderRadius = "6px";
      },
      undefined,
      { timeout: 5000 },
    );
  } catch {
    console.warn("    destaque não encontrado: print sai sem a borda (ajuste o seletor no ROTEIRO)");
  }
}

/** tira o destaque atual (vídeo: depois do clique) */
export const limparDestaque = (page) =>
  page.evaluate(() =>
    document.querySelectorAll("[data-guia-destaque]").forEach((x) => {
      x.style.outline = "";
      x.removeAttribute("data-guia-destaque");
    }),
  );

/** legenda fixa no pé da tela, para o vídeo: "Passo 2 de 6 · Preencha o nome" */
export const legenda = (page, texto) =>
  page.evaluate((texto) => {
    let el = document.getElementById("guia-legenda");
    if (!el) {
      el = document.createElement("div");
      el.id = "guia-legenda";
      el.style.cssText =
        "position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:99999;max-width:80%;" +
        "padding:12px 22px;border-radius:999px;background:rgba(15,23,42,.88);color:#fff;" +
        "font:600 18px/1.3 'Open Sans',Arial,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.25);pointer-events:none";
      document.body.appendChild(el);
    }
    el.textContent = texto;
  }, texto);
