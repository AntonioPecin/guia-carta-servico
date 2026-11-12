import type { Metadata } from "next";
import { DS_FALLBACK_CSS } from "@plataforma-xvia/ds-core/fallback-css";
import { DS_THEMES_CSS, DS_TOKENS_CSS } from "@plataforma-xvia/ds-tokens/css-text";
import { DsFooter, DsHeader } from "@plataforma-xvia/ds-react/server";
import "./app.css";

const CRITICAL_CSS = `${DS_TOKENS_CSS}\n${DS_THEMES_CSS}\n${DS_FALLBACK_CSS}`;

export const metadata: Metadata = {
  title: "Guia da carta de serviço · SETDIG",
  description: "Passo a passo do CMS da carta de serviço, por perfil.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
      </head>
      <body>
        <header className="so-tela">
          <DsHeader homeHref="/" homeLabel="Início — Guia da carta de serviço">
            <span slot="brand" className="brand">
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático no export */}
              <img className="logo" src="/brand/ms-gov-br.svg" alt="Governo de Mato Grosso do Sul" />
              <span className="brand__divisor" aria-hidden="true" />
              <span>
                <strong>Guia da carta de serviço</strong>
                <small>CMS · passo a passo por perfil</small>
              </span>
            </span>
          </DsHeader>
        </header>

        <main id="conteudo">{children}</main>

        <DsFooter className="so-tela">
          <div slot="address">
            <strong>Secretaria-Executiva de Transformação Digital — SETDIG</strong>
            <br />
            Superintendência de Governo Digital (SGD)
          </div>
          <span slot="brand">
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático no export */}
            <img className="logo logo--rodape" src="/brand/estado-de-mato-grosso-do-sul.svg" alt="Estado de Mato Grosso do Sul" />
          </span>
          <span slot="bottom-start">SETDIG | Secretaria-Executiva de Transformação Digital</span>
        </DsFooter>
      </body>
    </html>
  );
}
