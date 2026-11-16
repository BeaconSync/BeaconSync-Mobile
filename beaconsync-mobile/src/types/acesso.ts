export type PapelCadastro =
  | "RESPONSAVEL"
  | "VOLUNTARIO";

export type CredenciaisLogin = {
  email: string;
  senha: string;
};

export type DadosCadastroUsuario =
  CredenciaisLogin & {
    nome: string;
    telefone: string;
    papel: PapelCadastro;
  };