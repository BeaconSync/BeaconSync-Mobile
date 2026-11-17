import type { StatusInformado } from "./informarSituacao";

export type PessoaRelacionadaAlerta = {
  id: string;
  nome: string;
  localReferencia: string | null;
  situacao: StatusInformado | "Resgatada" | null;
  dataResposta: string | null;
};

export type EstadoPessoasRelacionadas =
  | {
      status: "indisponivel";
      mensagem?: string;
    }
  | { status: "carregando" }
  | {
      status: "erro";
      mensagem: string;
    }
  | {
      status: "sucesso";
      pessoas: PessoaRelacionadaAlerta[];
    };

export type Alerta = {
  id: string;
  titulo: string;
  descricao: string;
  status: "ativo" | "encerrado";
  area: string | null;
  nivel: string | null;
  fonte: string | null;
  emitidoEm: string | null;
  orientacoes: string[];
  pessoasRelacionadas?: EstadoPessoasRelacionadas;
};

export type EstadoAlertas =
  | { status: "indisponivel" }
  | { status: "carregando" }
  | { status: "erro"; mensagem: string }
  | { status: "sucesso"; alertas: Alerta[] };

export type FiltroAlertas =
  | "ativos"
  | "encerrados"
  | "todos";