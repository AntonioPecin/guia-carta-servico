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

/** contorna o elemento com borda vermelha + escurece o resto (spotlight): o olho vai direto no destaque */
export async function destacar(locator) {
  try {
    await locator.first().evaluate(
      (el) => {
        // um destaque por vez: tira o anterior
        document.querySelectorAll("[data-guia-destaque]").forEach((x) => {
          x.style.cssText = x.dataset.guiaEstiloAnterior ?? "";
          x.removeAttribute("data-guia-destaque");
          x.removeAttribute("data-guia-estilo-anterior");
        });
        el.dataset.guiaEstiloAnterior = el.getAttribute("style") ?? "";
        el.setAttribute("data-guia-destaque", "");
        el.scrollIntoView({ block: "center" });
        // ponytail: cor de alerta fixa; o print é do CMS, fora do Design System.
        // borda por dentro (item de menu fica em contêiner que corta a borda) + box-shadow enorme
        // espalhando pra fora com rgba escuro = spotlight; eleva o elemento acima do overlay.
        const estilo = {
          outline: "6px solid #E60000",
          "outline-offset": "-6px",
          "border-radius": "8px",
          "box-shadow": "0 0 0 9999px rgba(0,0,0,.55)",
          position: getComputedStyle(el).position === "static" ? "relative" : "",
          "z-index": "9998",
        };
        for (const [k, v] of Object.entries(estilo)) if (v) el.style.setProperty(k, v, "important");
      },
      undefined,
      { timeout: 5000 },
    );
  } catch {
    console.warn("    destaque não encontrado: print sai sem a borda (ajuste o seletor no ROTEIRO)");
  }
}

/**
 * destaque do VÍDEO: moldura vermelha POR FORA do campo, numa camada própria (div fixa).
 * Não mexe no estilo do elemento, então nenhum contêiner corta a borda, e ela nunca cobre o texto.
 * Se o locator aponta para algo de dentro do campo (o <input>, o rótulo "Cidadão", o texto da aba),
 * a moldura sobe até a caixa visível do campo. A moldura acompanha rolagem e animação de gaveta.
 */
export async function destacarVideo(locator) {
  try {
    await locator.first().evaluate(
      (el) => {
        // sobe até 4 níveis enquanto o pai for "a mesma caixa, um pouco maior" e guarda o último que tem borda/fundo
        const temCaixa = (n) => {
          const s = getComputedStyle(n);
          const borda = parseFloat(s.borderTopWidth) > 0 && s.borderTopColor !== "transparent" && !/, 0\)$/.test(s.borderTopColor);
          const fundo = s.backgroundColor !== "transparent" && !/, 0\)$/.test(s.backgroundColor);
          return borda || fundo;
        };
        const r0 = el.getBoundingClientRect();
        let alvo = el;
        for (let n = el.parentElement, i = 0; n && i < 4; n = n.parentElement, i++) {
          const r = n.getBoundingClientRect();
          const cresce = [r0.left - r.left, r.right - r0.right, r0.top - r.top, r.bottom - r0.bottom];
          if (cresce.some((d) => d < -1) || cresce[0] > 120 || cresce[1] > 120 || cresce[2] > 24 || cresce[3] > 24) break;
          if (temCaixa(n)) alvo = n;
        }
        alvo.scrollIntoView({ block: "center" });

        document.getElementById("guia-destaque")?.remove();
        const raio = parseFloat(getComputedStyle(alvo).borderTopLeftRadius) || 6;
        const box = document.createElement("div");
        box.id = "guia-destaque";
        // ponytail: cor de alerta fixa; o vídeo é do CMS, fora do Design System.
        // box-shadow enorme com rgba escuro = spotlight; o miolo da moldura fica transparente.
        box.style.cssText =
          "position:fixed;z-index:99998;pointer-events:none;border:3px solid #E60000;" +
          `border-radius:${raio + 5}px;box-shadow:0 0 0 9999px rgba(0,0,0,.55)`;
        document.body.appendChild(box);
        window.__guiaAlvo = alvo;
        const FOLGA = 5; // espaço entre o campo e a moldura
        const seguir = () => {
          if (!box.isConnected) return;
          if (!alvo.isConnected) return box.remove();
          const r = alvo.getBoundingClientRect();
          Object.assign(box.style, {
            left: `${r.left - FOLGA - 3}px`,
            top: `${r.top - FOLGA - 3}px`,
            width: `${r.width + 2 * (FOLGA + 3)}px`,
            height: `${r.height + 2 * (FOLGA + 3)}px`,
          });
          requestAnimationFrame(seguir);
        };
        seguir();
      },
      undefined,
      { timeout: 5000 },
    );
  } catch {
    console.warn("    destaque não encontrado: o vídeo segue sem a moldura (ajuste o seletor)");
  }
}

/** tira o destaque atual (vídeo: depois do clique) */
export const limparDestaque = (page) =>
  page.evaluate(() => {
    document.getElementById("guia-destaque")?.remove();
    window.__guiaAlvo = null;
    document.querySelectorAll("[data-guia-destaque]").forEach((x) => {
      x.setAttribute("style", x.dataset.guiaEstiloAnterior ?? "");
      x.removeAttribute("data-guia-destaque");
      x.removeAttribute("data-guia-estilo-anterior");
    });
  });

/**
 * legenda do vídeo: "Passo 2 de 6 · Preencha o nome". Fica no pé da tela e, se for cobrir o campo
 * destacado, sobe para o alto (logo abaixo do cabeçalho). Assim nunca fica na frente do que vai ser clicado.
 */
export const legenda = (page, texto) =>
  page.evaluate((texto) => {
    let el = document.getElementById("guia-legenda");
    if (!el) {
      el = document.createElement("div");
      el.id = "guia-legenda";
      el.style.cssText =
        "position:fixed;left:50%;transform:translateX(-50%);z-index:99999;max-width:80%;" +
        "padding:12px 22px;border-radius:999px;background:rgba(15,23,42,.88);color:#fff;" +
        "font:600 18px/1.3 'Open Sans',Arial,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.25);pointer-events:none";
      document.body.appendChild(el);
      const MARGEM = 16;
      const sobrepoe = (a, b) =>
        a.left < b.right + MARGEM && b.left < a.right + MARGEM && a.top < b.bottom + MARGEM && b.top < a.bottom + MARGEM;
      const POSICOES = [
        { bottom: "28px", top: "" },
        { top: "76px", bottom: "" },
      ];
      let atual = -1;
      const pos = (i) => {
        if (i === atual) return;
        Object.assign(el.style, POSICOES[i]);
        atual = i;
      };
      pos(0);
      const vigiar = () => {
        const alvo = window.__guiaAlvo;
        if (alvo?.isConnected) {
          const r = alvo.getBoundingClientRect();
          // mede a legenda nas duas posições e escolhe a que não cobre o campo (pé da tela tem preferência)
          const altura = el.offsetHeight, largura = el.offsetWidth, meio = innerWidth / 2;
          const caixa = (i) => {
            const top = i === 0 ? innerHeight - 28 - altura : 76;
            return { left: meio - largura / 2, right: meio + largura / 2, top, bottom: top + altura };
          };
          if (!sobrepoe(caixa(0), r)) pos(0);
          else if (!sobrepoe(caixa(1), r)) pos(1);
          else {
            // campo enorme (ocupa a tela toda): fica onde cobre menos
            const area = (c) =>
              Math.max(0, Math.min(c.right, r.right) - Math.max(c.left, r.left)) *
              Math.max(0, Math.min(c.bottom, r.bottom) - Math.max(c.top, r.top));
            pos(area(caixa(0)) <= area(caixa(1)) ? 0 : 1);
          }
        }
        requestAnimationFrame(vigiar);
      };
      vigiar();
    }
    el.textContent = texto;
  }, texto);
