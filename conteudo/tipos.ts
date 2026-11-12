export type Passo = {
  titulo: string;
  texto: string;
  /** arquivo em public/prints/<perfil>/; vazio enquanto o print não foi capturado */
  print?: string;
  /** caminho no menu do CMS, ex.: "Carta de Serviços › Serviços" */
  onde?: string;
};

export type Acao = {
  id: string;
  titulo: string;
  objetivo: string;
  passos: Passo[];
  /** aviso curto mostrado antes dos passos */
  aviso?: string;
  /** funcionalidade ainda em desenvolvimento no CMS: aparece com selo e sem prints. Tire quando for entregue */
  previsto?: boolean;
  /** vídeo da ação: arquivo em public/ ("/videos/x.webm") ou link do Drive (https://drive.google.com/file/d/<id>/...) */
  video?: string;
};

export type Perfil = {
  id: string;
  nome: string;
  resumo: string;
  /** "pronto" aparece com link; "em-preparacao" só como card informativo */
  situacao: "pronto" | "em-preparacao";
  pode?: string[];
  naoPode?: string[];
  acoes?: Acao[];
};
