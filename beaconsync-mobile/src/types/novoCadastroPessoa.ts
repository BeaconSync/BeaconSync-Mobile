import type {
  TipoVulnerabilidadeJava,
} from "./cadastroPessoa";

export type NovoCadastroPessoa = {
  nome: string;
  cpf: string;
  dataNascimento: string;
  vinculo: string;

  tipoVulnerabilidade: TipoVulnerabilidadeJava | "";
  necessidadesRemocao: string;

  nomeLocal: string;
  rua: string;
  numero: string;
  complemento: string;
  cep: string;
  distritoId: number | null;

  autorizado: boolean;
};

export type ErrosNovoCadastro = Partial<
  Record<keyof NovoCadastroPessoa, string>
>;

export type ResultadoNovoCadastro =
  | {
      status: "criado";
      pessoaId: string;
    }
  | {
      status: "existente";
      pessoaId: string;
    };