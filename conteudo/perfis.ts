import { coordenador } from "./coordenador";
import { gerente } from "./gerente";
import type { Perfil } from "./tipos";

export const perfis: Perfil[] = [
  coordenador,
  gerente,
  {
    id: "aprovador-central",
    nome: "Aprovador Central (CGE)",
    resumo: "Aprova ou devolve a carta com apontamentos. Não cria nem edita cartas.",
    situacao: "em-preparacao",
  },
  {
    id: "administrador",
    nome: "Administrador (SETDIG)",
    resumo: "Cadastra usuários, órgãos e categorias e configura o CMS.",
    situacao: "em-preparacao",
  },
];

export const perfilPorId = (id: string) => perfis.find((p) => p.id === id);
