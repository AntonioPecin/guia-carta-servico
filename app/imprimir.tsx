import { DsButton } from "@plataforma-xvia/ds-react/server";

// PDF pronto, gerado por scripts/pdf.mjs (margens certas, sem data nem endereço do navegador)
export function Imprimir({ perfil }: { perfil: string }) {
  return (
    <DsButton href={`/pdf/${perfil}.pdf`} download={`guia-carta-servico-${perfil}.pdf`} icon="download" appearance="outline">
      Baixar PDF
    </DsButton>
  );
}
