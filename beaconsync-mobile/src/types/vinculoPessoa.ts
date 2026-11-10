export type VinculoPessoa = {
  id: string;
  nome: string;
  vinculo: string;
  desde: string | null;
  usuarioAtual: boolean;
};

export type EstadoVinculosPessoa =
  | { status: "indisponivel" }
  | { status: "carregando" }
  | { status: "erro"; mensagem: string }
  | { status: "sucesso"; vinculos: VinculoPessoa[] };