import type {
  TipoVulnerabilidadeJava,
} from "./cadastroPessoa";

export type DadosEdicaoPessoa = {
  nome: string;
  dataNascimento: string;
  tipoVulnerabilidade: TipoVulnerabilidadeJava | "";
  necessidadesRemocao: string;
};

export type ErrosEdicaoPessoa = Partial<
  Record<keyof DadosEdicaoPessoa, string>
>;

export type SalvarEdicaoPessoa = (
  dados: DadosEdicaoPessoa
) => Promise<void>;