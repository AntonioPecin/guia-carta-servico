export type Passo = {
  titulo: string;
  texto: string;
  /** arquivo em public/prints/<perfil>/; vazio enquanto o print não foi capturado */
  print?: string;
};

export type Acao = {
  id: string;
  titulo: string;
  objetivo: string;
  passos: Passo[];
  /** aviso curto mostrado antes dos passos (ex.: funcionalidade prevista) */
  aviso?: string;
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
