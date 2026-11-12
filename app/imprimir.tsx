"use client";
import { DsButton } from "@plataforma-xvia/ds-react";

// ponytail: PDF pelo "Salvar como PDF" do navegador + CSS de impressão; biblioteca de PDF só se isso não bastar
export function Imprimir() {
  return (
    <DsButton icon="download" appearance="outline" onClick={() => window.print()}>
      Exportar PDF
    </DsButton>
  );
}
