import { existsSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import {
  DsAlert,
  DsBreadcrumb,
  DsCard,
  DsImage,
  DsPageHeader,
  DsSectionHeading,
  DsSteps,
} from "@plataforma-xvia/ds-react/server";
import { perfilPorId, perfis } from "@/conteudo/perfis";
import { Imprimir } from "../imprimir";

export const generateStaticParams = () =>
  perfis.filter((p) => p.situacao === "pronto").map((p) => ({ perfil: p.id }));

export default async function PaginaPerfil({ params }: { params: Promise<{ perfil: string }> }) {
  const perfil = perfilPorId((await params).perfil);
  if (!perfil?.acoes) notFound();

  const trilha = [{ label: "Início", href: "/" }, { label: perfil.nome }];

  return (
    <>
      <div className="wrap topo">
        <DsPageHeader
          heading={`Perfil ${perfil.nome}`}
          description={perfil.resumo}
          eyebrow="Guia da carta de serviço"
          islands={{ actions: { node: <Imprimir /> } }}
        >
          <DsBreadcrumb slot="breadcrumb" items={JSON.stringify(trilha)} />
        </DsPageHeader>
      </div>

      <div className="wrap section">
        <div className="grid grid--2">
          <DsCard heading="O que você faz" headingLevel="2" icon="check" tone="success">
            <ul className="lista">{perfil.pode?.map((x) => <li key={x}>{x}</li>)}</ul>
          </DsCard>
          <DsCard heading="O que não é com você" headingLevel="2" icon="close" tone="neutral">
            <ul className="lista">{perfil.naoPode?.map((x) => <li key={x}>{x}</li>)}</ul>
          </DsCard>
        </div>

        <nav className="indice" aria-label="Ações deste perfil">
          <h2>Nesta página</h2>
          <ol className="lista">
            {perfil.acoes.map((a) => (
              <li key={a.id}>
                <a href={`#${a.id}`}>{a.titulo}</a>
                {a.previsto && <span className="muted"> (em desenvolvimento)</span>}
              </li>
            ))}
          </ol>
        </nav>

        {perfil.acoes.map((acao, i) => (
          <section key={acao.id} id={acao.id} className="acao" aria-labelledby={`t-${acao.id}`}>
            <DsSectionHeading heading={`${i + 1}. ${acao.titulo}`} headingId={`t-${acao.id}`} description={acao.objetivo} />
            {acao.previsto && (
              <DsAlert tone="info" heading="Em desenvolvimento">
                Esta função ainda está sendo feita no CMS. O passo a passo abaixo é o previsto.
              </DsAlert>
            )}
            {acao.aviso && <DsAlert tone="warning">{acao.aviso}</DsAlert>}
            <DsSteps headingLevel="3" items={JSON.stringify(acao.passos.map((p) => ({ title: p.titulo })))}>
              {acao.passos.map((p, n) => (
                <div key={n} slot={`description-${n + 1}`}>
                  <p>{p.texto}</p>
                  {p.print && existsSync(join(process.cwd(), "public/prints", perfil.id, p.print)) ? (
                    <DsImage
                      src={`/prints/${perfil.id}/${p.print}`}
                      alt={`Tela do CMS: ${p.titulo}`}
                      fit="contain"
                      rounded
                    />
                  ) : acao.previsto ? null : (
                    <p className="sem-print so-tela">Print desta etapa em preparação.</p>
                  )}
                </div>
              ))}
            </DsSteps>
          </section>
        ))}
      </div>
    </>
  );
}
