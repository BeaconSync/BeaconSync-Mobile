export type PapelEditavel = "RESPONSAVEL" | "VOLUNTARIO";

export type DadosPerfil = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  fotoUrl: string | null;
  papel?: string;
};

export type EstadoPerfil =
  | { status: "indisponivel" }
  | { status: "carregando" }
  | { status: "erro"; mensagem: string }
  | { status: "sucesso"; perfil: DadosPerfil };

export type AlteracaoFotoPerfil =
  | { acao: "manter" }
  | { acao: "remover" }
  | {
      acao: "substituir";
      uri: string;
      nomeArquivo: string | null;
      tipoMime: string | null;
    };

export type DadosEdicaoPerfil = Pick<
  DadosPerfil,
  "nome" | "telefone"
> & {
  foto: AlteracaoFotoPerfil;
  papel?: PapelEditavel;
};

export type SalvarPerfil = (
  dados: DadosEdicaoPerfil
) => Promise<DadosPerfil>;