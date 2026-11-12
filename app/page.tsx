import { DsBadge, DsButton, DsCard, DsPageHeader } from "@plataforma-xvia/ds-react/server";
import { perfis } from "@/conteudo/perfis";

export default function Home() {
  return (
    <>
      <div className="wrap topo">
        <DsPageHeader
          heading="Guia da carta de serviço"
          description="Como usar o CMS da carta de serviço, passo a passo. Escolha o seu perfil."
        />
      </div>
      <section className="wrap section" aria-label="Perfis">
        <ul className="grid">
          {perfis.map((p) => (
            <li key={p.id}>
              <DsCard heading={p.nome} description={p.resumo} headingLevel="2" icon="user">
                <div slot="footer">
                  {p.situacao === "pronto" ? (
                    <DsButton href={`/${p.id}/`} icon="arrow-right" iconPosition="end">
                      Ver o passo a passo
                    </DsButton>
                  ) : (
                    <DsBadge>Em preparação</DsBadge>
                  )}
                </div>
              </DsCard>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
