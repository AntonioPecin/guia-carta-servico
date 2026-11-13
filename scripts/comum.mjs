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

/** Três linguagens visuais de destaque — cores do Design System de Governo de MS:
 *   acao    → azul primário, badge numerada, spotlight escuro fora: botão/menu/link para clicar
 *   area    → fundo azul translúcido + borda azul tracejada, sem spotlight: formulário/aba/seção
 *   atencao → âmbar com ícone ⚠: aviso/restrição
 * Quando o ROTEIRO informa `numero`, aparece a badge do passo colada no elemento (conecta com DsSteps). */
const ESTILOS = {
  acao: {
    outline: "6px solid #1351B4",
    "outline-offset": "-6px",
    "border-radius": "8px",
    "box-shadow": "0 0 0 9999px rgba(10,20,40,.55)",
    "background-color": "",
    badgeBg: "#1351B4",
    badgeFg: "#FFFFFF",
  },
  area: {
    outline: "3px dashed #1351B4",
    "outline-offset": "-3px",
    "border-radius": "8px",
    "background-color": "rgba(19,81,180,.08)",
    "box-shadow": "",
    badgeBg: "#1351B4",
    badgeFg: "#FFFFFF",
  },
  atencao: {
    outline: "5px solid #D97706",
    "outline-offset": "-5px",
    "border-radius": "8px",
    "box-shadow": "0 0 0 9999px rgba(40,25,10,.45)",
    "background-color": "",
    badgeBg: "#D97706",
    badgeFg: "#FFFFFF",
  },
};

export async function destacar(locator, { tipo = "acao", numero } = {}) {
  const config = ESTILOS[tipo] ?? ESTILOS.acao;
  const textoBadge =
    tipo === "atencao" ? "!" : numero != null ? String(numero) : "";
  try {
    await locator.first().evaluate(
      (el, { config, textoBadge }) => {
        document.querySelectorAll("[data-guia-destaque]").forEach((x) => {
          x.setAttribute("style", x.dataset.guiaEstiloAnterior ?? "");
          x.removeAttribute("data-guia-destaque");
          x.removeAttribute("data-guia-estilo-anterior");
        });
        document.querySelectorAll("[data-guia-badge]").forEach((x) => x.remove());
        el.dataset.guiaEstiloAnterior = el.getAttribute("style") ?? "";
        el.setAttribute("data-guia-destaque", "");
        el.scrollIntoView({ block: "center" });
        const aplicar = {
          outline: config.outline,
          "outline-offset": config["outline-offset"],
          "border-radius": config["border-radius"],
          "box-shadow": config["box-shadow"],
          "background-color": config["background-color"],
          position: getComputedStyle(el).position === "static" ? "relative" : "",
          "z-index": "9998",
        };
        for (const [k, v] of Object.entries(aplicar)) if (v) el.style.setProperty(k, v, "important");

        if (textoBadge) {
          const badge = document.createElement("div");
          badge.setAttribute("data-guia-badge", "");
          const r = el.getBoundingClientRect();
          Object.assign(badge.style, {
            position: "fixed",
            left: `${Math.max(8, r.left - 20)}px`,
            top: `${Math.max(8, r.top - 20)}px`,
            width: "44px",
            height: "44px",
            "border-radius": "50%",
            background: config.badgeBg,
            color: config.badgeFg,
            font: "700 22px/44px 'Open Sans',Arial,sans-serif",
            "text-align": "center",
            "box-shadow": "0 4px 14px rgba(0,0,0,.45)",
            "z-index": "9999",
            "pointer-events": "none",
          });
          badge.textContent = textoBadge;
          document.body.appendChild(badge);
        }
      },
      { config, textoBadge },
      { timeout: 5000 },
    );
  } catch (e) {
    console.warn(`    destaque não encontrado: ${e.message.split("\n")[0]} (ajuste o seletor no ROTEIRO)`);
  }
}

/** tira o destaque atual e a badge numerada (vídeo: depois do clique) */
export const limparDestaque = (page) =>
  page.evaluate(() => {
    document.querySelectorAll("[data-guia-destaque]").forEach((x) => {
      x.setAttribute("style", x.dataset.guiaEstiloAnterior ?? "");
      x.removeAttribute("data-guia-destaque");
      x.removeAttribute("data-guia-estilo-anterior");
    });
    document.querySelectorAll("[data-guia-badge]").forEach((x) => x.remove());
  });

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
