export type TipoVinculoSolicitado =
  | "Familiar"
  | "Amigo"
  | "Cuidador"
  | "Outro";

export type DadosSolicitacaoVinculo = {
  referenciaCadastro: string;
  vinculo: TipoVinculoSolicitado;
  mensagem: string;
};

export type ResultadoSolicitacaoVinculo = {
  id: string;
  status: "pendente";
};

export type EnviarSolicitacaoVinculo = (
  dados: DadosSolicitacaoVinculo
) => Promise<ResultadoSolicitacaoVinculo>;

export type StatusSolicitacaoRecebida =
  | "pendente"
  | "aprovada"
  | "recusada";

export type DecisaoVinculo = "aprovada" | "recusada";

export type SolicitacaoVinculoRecebida = {
  id: string;
  pessoaId: string;
  pessoaNome: string;
  solicitanteNome: string;
  vinculo: TipoVinculoSolicitado;
  mensagem: string;
  criadaEm: string | null;
  status: StatusSolicitacaoRecebida;
  podeDecidir: boolean;
};

export type EstadoSolicitacoesRecebidas =
  | { status: "indisponivel" }
  | { status: "carregando" }
  | { status: "erro"; mensagem: string }
  | {
      status: "sucesso";
      solicitacoes: SolicitacaoVinculoRecebida[];
    };

export type ResponderSolicitacaoVinculo = (
  solicitacaoId: string,
  decisao: DecisaoVinculo
) => Promise<SolicitacaoVinculoRecebida>;

export type SolicitacaoVinculoEnviada = {
  id: string;
  vinculo: TipoVinculoSolicitado;
  mensagem: string;
  criadaEm: string | null;
  decididaEm: string | null;
  status: StatusSolicitacaoRecebida;
};

export type EstadoSolicitacoesEnviadas =
  | { status: "indisponivel" }
  | { status: "carregando" }
  | { status: "erro"; mensagem: string }
  | {
      status: "sucesso";
      solicitacoes: SolicitacaoVinculoEnviada[];
    };