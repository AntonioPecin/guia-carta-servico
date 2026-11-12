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
