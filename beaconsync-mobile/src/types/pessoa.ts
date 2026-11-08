export type PessoaResumo = {
  id: string;
  nome: string;
  necessidadeApoio: string | null;
  localAtual: string | null;
};

export type EstadoPessoas =
  | { status: "indisponivel" }
  | { status: "carregando" }
  | { status: "erro"; mensagem: string }
  | { status: "sucesso"; pessoas: PessoaResumo[] };